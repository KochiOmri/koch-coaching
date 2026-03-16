import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "whatsapp-templates.json");

function readTemplates() {
  if (!fs.existsSync(FILE)) return [];
  return JSON.parse(fs.readFileSync(FILE, "utf-8"));
}

export async function GET() {
  try {
    return NextResponse.json(readTemplates());
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, template } = await request.json();
    const templates = readTemplates();
    const idx = templates.findIndex((t: { id: string }) => t.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    templates[idx].template = template;
    fs.writeFileSync(FILE, JSON.stringify(templates, null, 2));
    return NextResponse.json(templates[idx]);
  } catch (error) {
    console.error("Failed to update template:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
