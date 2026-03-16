import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

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

export async function GET() {
  try {
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
