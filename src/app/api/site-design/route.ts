import { NextResponse } from "next/server";
import { isSupabaseConfigured, getDb } from "@/lib/supabase/db";
import fs from "fs";
import path from "path";

const DESIGN_FILE = path.join(process.cwd(), "data", "site-design.json");

const DEFAULT_DESIGN = {
  theme_mode: "dark",
  primary_color: "#d4a843",
  accent_color: "#d4a843",
  background_color: "#0a0a0a",
  font_heading: "Outfit",
  font_body: "Inter",
  hero_style: "video",
  hero_overlay_opacity: 0.6,
  sections_visible: {
    hero: true,
    about: true,
    videoShowcase: true,
    methodology: true,
    services: true,
    method: true,
    results: true,
    booking: true,
  },
  custom_css: "",
};

export async function GET() {
  if (isSupabaseConfigured()) {
    const db = await getDb();
    if (db) {
      const { data } = await db
        .from("site_design")
        .select("*")
        .eq("id", "main")
        .single();
      return NextResponse.json(data || DEFAULT_DESIGN);
    }
  }

  try {
    if (fs.existsSync(DESIGN_FILE)) {
      const data = JSON.parse(fs.readFileSync(DESIGN_FILE, "utf-8"));
      return NextResponse.json(data);
    }
  } catch { /* fallback */ }

  return NextResponse.json(DEFAULT_DESIGN);
}

export async function PUT(request: Request) {
  const body = await request.json();

  if (isSupabaseConfigured()) {
    const db = await getDb();
    if (db) {
      const { data, error } = await db
        .from("site_design")
        .upsert({ id: "main", ...body, updated_at: new Date().toISOString() })
        .select()
        .single();
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json(data);
    }
  }

  try {
    const dir = path.dirname(DESIGN_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DESIGN_FILE, JSON.stringify(body, null, 2));
    return NextResponse.json(body);
  } catch {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
