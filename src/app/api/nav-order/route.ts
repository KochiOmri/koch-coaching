import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, getDb } from "@/lib/supabase/db";
import fs from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "nav-order.json");

function readFile(): string[] {
  try {
    if (fs.existsSync(FILE)) {
      return JSON.parse(fs.readFileSync(FILE, "utf-8"));
    }
  } catch {}
  return [];
}

function writeFile(items: string[]) {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(items, null, 2));
}

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const db = await getDb();
      if (db) {
        const { data } = await db.from("nav_order").select("items").eq("id", "admin").single();
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          return NextResponse.json(data.items);
        }
      }
    }
    return NextResponse.json(readFile());
  } catch {
    return NextResponse.json([]);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const items: string[] = await request.json();
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Expected array" }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const db = await getDb();
      if (db) {
        const { error } = await db.from("nav_order").upsert(
          { id: "admin", items, updated_at: new Date().toISOString() },
          { onConflict: "id" }
        );
        if (!error) return NextResponse.json({ ok: true });
        console.error("Nav order save error:", error);
      }
    }

    writeFile(items);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Nav order save error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
