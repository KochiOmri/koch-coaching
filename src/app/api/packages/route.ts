import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { isSupabaseConfigured, getDb } from "@/lib/supabase/db";

const DATA_DIR = path.join(process.cwd(), "data");
const PACKAGES_FILE = path.join(DATA_DIR, "packages.json");

interface Package {
  id: string;
  name: string;
  description: string;
  sessionCount: number;
  price: number;
  duration: string;
  features: string[];
  isActive: boolean;
  createdAt: string;
}

function ensureFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PACKAGES_FILE)) {
    fs.writeFileSync(PACKAGES_FILE, JSON.stringify([], null, 2));
  }
}

function readPackages(): Package[] {
  ensureFile();
  return JSON.parse(fs.readFileSync(PACKAGES_FILE, "utf-8"));
}

function writePackages(data: Package[]): void {
  fs.writeFileSync(PACKAGES_FILE, JSON.stringify(data, null, 2));
}

function mapRowToPackage(row: Record<string, unknown>): Package {
  return {
    id: String(row.id),
    name: String(row.name),
    description: String(row.description ?? ""),
    sessionCount: Number(row.session_count ?? 0),
    price: Number(row.price ?? 0),
    duration: String(row.duration ?? ""),
    features: Array.isArray(row.features) ? (row.features as string[]) : [],
    isActive: row.is_active !== false,
    createdAt: String(row.created_at ?? ""),
  };
}

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const db = await getDb();
      if (db) {
        const { data, error } = await db.from("packages").select("*");
        if (error) {
          console.error("Packages GET Supabase error:", error);
          return NextResponse.json({ error: "Failed to load packages" }, { status: 500 });
        }
        const packages = (data ?? []).map((r) => mapRowToPackage(r as Record<string, unknown>));
        return NextResponse.json(packages);
      }
    }

    const packages = readPackages();
    return NextResponse.json(packages);
  } catch (error) {
    console.error("Packages GET error:", error);
    return NextResponse.json({ error: "Failed to load packages" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, sessionCount, price, duration, features, isActive } = body;

    if (!name || !sessionCount) {
      return NextResponse.json(
        { error: "Name and session count are required" },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured()) {
      const db = await getDb();
      if (db) {
        const row = {
          id: crypto.randomUUID(),
          name,
          description: description || "",
          session_count: sessionCount,
          price: price || 0,
          duration: duration || "",
          features: features || [],
          is_active: isActive !== false,
          created_at: new Date().toISOString(),
        };
        const { data, error } = await db.from("packages").insert(row).select().single();
        if (error) {
          console.error("Packages POST Supabase error:", error);
          return NextResponse.json({ error: "Failed to create package" }, { status: 500 });
        }
        const newPackage = mapRowToPackage(data as Record<string, unknown>);
        return NextResponse.json(newPackage, { status: 201 });
      }
    }

    const packages = readPackages();
    const newPackage: Package = {
      id: crypto.randomUUID(),
      name,
      description: description || "",
      sessionCount,
      price: price || 0,
      duration: duration || "",
      features: features || [],
      isActive: isActive !== false,
      createdAt: new Date().toISOString(),
    };

    packages.push(newPackage);
    writePackages(packages);

    return NextResponse.json(newPackage, { status: 201 });
  } catch (error) {
    console.error("Packages POST error:", error);
    return NextResponse.json({ error: "Failed to create package" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Package ID is required" }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const db = await getDb();
      if (db) {
        const dbUpdates: Record<string, unknown> = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.sessionCount !== undefined) dbUpdates.session_count = updates.sessionCount;
        if (updates.price !== undefined) dbUpdates.price = updates.price;
        if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
        if (updates.features !== undefined) dbUpdates.features = updates.features;
        if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

        if (Object.keys(dbUpdates).length === 0) {
          const { data } = await db.from("packages").select("*").eq("id", id).single();
          if (!data) return NextResponse.json({ error: "Package not found" }, { status: 404 });
          return NextResponse.json(mapRowToPackage(data as Record<string, unknown>));
        }

        const { data, error } = await db.from("packages").update(dbUpdates).eq("id", id).select().single();
        if (error) {
          console.error("Packages PUT Supabase error:", error);
          return NextResponse.json({ error: "Failed to update package" }, { status: 500 });
        }
        if (!data) return NextResponse.json({ error: "Package not found" }, { status: 404 });
        return NextResponse.json(mapRowToPackage(data as Record<string, unknown>));
      }
    }

    const packages = readPackages();
    const idx = packages.findIndex((p) => p.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    packages[idx] = { ...packages[idx], ...updates, id };
    writePackages(packages);

    return NextResponse.json(packages[idx]);
  } catch (error) {
    console.error("Packages PUT error:", error);
    return NextResponse.json({ error: "Failed to update package" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Package ID is required" }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const db = await getDb();
      if (db) {
        const { error } = await db.from("packages").delete().eq("id", id);
        if (error) {
          console.error("Packages DELETE Supabase error:", error);
          return NextResponse.json({ error: "Failed to delete package" }, { status: 500 });
        }
        return NextResponse.json({ success: true });
      }
    }

    const packages = readPackages();
    const idx = packages.findIndex((p) => p.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    packages.splice(idx, 1);
    writePackages(packages);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Packages DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete package" }, { status: 500 });
  }
}
