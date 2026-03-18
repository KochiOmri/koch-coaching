import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { isSupabaseConfigured, getDb } from "@/lib/supabase/db";

const DATA_DIR = path.join(process.cwd(), "data");
const CLIENT_PACKAGES_FILE = path.join(DATA_DIR, "client-packages.json");

interface ClientPackage {
  id: string;
  clientId: string;
  packageId: string;
  sessionsUsed: number;
  sessionsTotal: number;
  startDate: string;
  expiryDate: string;
  status: "active" | "expired" | "completed";
  createdAt: string;
}

function ensureFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(CLIENT_PACKAGES_FILE)) {
    fs.writeFileSync(CLIENT_PACKAGES_FILE, JSON.stringify([], null, 2));
  }
}

function readClientPackages(): ClientPackage[] {
  ensureFile();
  return JSON.parse(fs.readFileSync(CLIENT_PACKAGES_FILE, "utf-8"));
}

function writeClientPackages(data: ClientPackage[]): void {
  fs.writeFileSync(CLIENT_PACKAGES_FILE, JSON.stringify(data, null, 2));
}

function mapRowToClientPackage(row: Record<string, unknown>): ClientPackage {
  let status = row.status as string;
  if (row.sessions_used !== undefined && row.sessions_total !== undefined) {
    if (Number(row.sessions_used) >= Number(row.sessions_total)) {
      status = "completed";
    }
  }
  return {
    id: String(row.id),
    clientId: String(row.client_id),
    packageId: String(row.package_id),
    sessionsUsed: Number(row.sessions_used ?? 0),
    sessionsTotal: Number(row.sessions_total ?? 0),
    startDate: String(row.start_date ?? ""),
    expiryDate: String(row.expiry_date ?? ""),
    status: (status as ClientPackage["status"]) || "active",
    createdAt: String(row.created_at ?? ""),
  };
}

export async function GET(request: NextRequest) {
  try {
    if (isSupabaseConfigured()) {
      const db = await getDb();
      if (db) {
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get("clientId");
        let query = db.from("client_packages").select("*");
        if (clientId) query = query.eq("client_id", clientId);
        const { data, error } = await query;
        if (error) {
          console.error("Client packages GET Supabase error:", error);
          return NextResponse.json({ error: "Failed to load client packages" }, { status: 500 });
        }
        const clientPackages = (data ?? []).map((r) => mapRowToClientPackage(r as Record<string, unknown>));
        return NextResponse.json(clientPackages);
      }
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    let clientPackages = readClientPackages();

    if (clientId) {
      clientPackages = clientPackages.filter((cp) => cp.clientId === clientId);
    }

    return NextResponse.json(clientPackages);
  } catch (error) {
    console.error("Client packages GET error:", error);
    return NextResponse.json({ error: "Failed to load client packages" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, packageId, sessionsTotal, startDate, expiryDate } = body;

    if (!clientId || !packageId || !sessionsTotal) {
      return NextResponse.json(
        { error: "clientId, packageId, and sessionsTotal are required" },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured()) {
      const db = await getDb();
      if (db) {
        const row = {
          id: crypto.randomUUID(),
          client_id: clientId,
          package_id: packageId,
          sessions_used: 0,
          sessions_total: sessionsTotal,
          start_date: startDate || new Date().toISOString().split("T")[0],
          expiry_date: expiryDate || "",
          status: "active",
          created_at: new Date().toISOString(),
        };
        const { data, error } = await db.from("client_packages").insert(row).select().single();
        if (error) {
          console.error("Client packages POST Supabase error:", error);
          return NextResponse.json({ error: "Failed to assign package" }, { status: 500 });
        }
        const newAssignment = mapRowToClientPackage(data as Record<string, unknown>);
        return NextResponse.json(newAssignment, { status: 201 });
      }
    }

    const clientPackages = readClientPackages();
    const newAssignment: ClientPackage = {
      id: crypto.randomUUID(),
      clientId,
      packageId,
      sessionsUsed: 0,
      sessionsTotal,
      startDate: startDate || new Date().toISOString().split("T")[0],
      expiryDate: expiryDate || "",
      status: "active",
      createdAt: new Date().toISOString(),
    };

    clientPackages.push(newAssignment);
    writeClientPackages(clientPackages);

    return NextResponse.json(newAssignment, { status: 201 });
  } catch (error) {
    console.error("Client packages POST error:", error);
    return NextResponse.json({ error: "Failed to assign package" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Assignment ID is required" }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const db = await getDb();
      if (db) {
        const dbUpdates: Record<string, unknown> = {};
        if (updates.clientId !== undefined) dbUpdates.client_id = updates.clientId;
        if (updates.packageId !== undefined) dbUpdates.package_id = updates.packageId;
        if (updates.sessionsUsed !== undefined) dbUpdates.sessions_used = updates.sessionsUsed;
        if (updates.sessionsTotal !== undefined) dbUpdates.sessions_total = updates.sessionsTotal;
        if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
        if (updates.expiryDate !== undefined) dbUpdates.expiry_date = updates.expiryDate;
        if (updates.status !== undefined) dbUpdates.status = updates.status;

        if (updates.sessionsUsed !== undefined && updates.sessionsTotal !== undefined) {
          if (updates.sessionsUsed >= updates.sessionsTotal) {
            dbUpdates.status = "completed";
          }
        }

        const { data: existing } = await db.from("client_packages").select("*").eq("id", id).single();
        if (!existing) return NextResponse.json({ error: "Assignment not found" }, { status: 404 });

        if (Object.keys(dbUpdates).length > 0) {
          const { data, error } = await db.from("client_packages").update(dbUpdates).eq("id", id).select().single();
          if (error) {
            console.error("Client packages PATCH Supabase error:", error);
            return NextResponse.json({ error: "Failed to update assignment" }, { status: 500 });
          }
          return NextResponse.json(mapRowToClientPackage((data ?? existing) as Record<string, unknown>));
        }
        return NextResponse.json(mapRowToClientPackage(existing as Record<string, unknown>));
      }
    }

    const clientPackages = readClientPackages();
    const idx = clientPackages.findIndex((cp) => cp.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    clientPackages[idx] = { ...clientPackages[idx], ...updates, id };

    if (clientPackages[idx].sessionsUsed >= clientPackages[idx].sessionsTotal) {
      clientPackages[idx].status = "completed";
    }

    writeClientPackages(clientPackages);

    return NextResponse.json(clientPackages[idx]);
  } catch (error) {
    console.error("Client packages PATCH error:", error);
    return NextResponse.json({ error: "Failed to update assignment" }, { status: 500 });
  }
}
