import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

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

export async function GET(request: NextRequest) {
  try {
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
