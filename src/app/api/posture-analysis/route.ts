import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "posture-analyses.json");

function ensureFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
}

export async function GET(request: NextRequest) {
  try {
    ensureFile();
    const analyses = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    if (clientId) {
      const filtered = analyses.filter(
        (a: { clientId: string }) => a.clientId === clientId
      );
      return NextResponse.json(filtered);
    }

    return NextResponse.json(analyses);
  } catch (error) {
    console.error("Posture analysis GET error:", error);
    return NextResponse.json(
      { error: "Failed to load analyses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    ensureFile();
    const body = await request.json();

    if (!body.id || !body.clientId || !body.date || !body.measurements) {
      return NextResponse.json(
        { error: "Missing required fields: id, clientId, date, measurements" },
        { status: 400 }
      );
    }

    const analyses = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    analyses.push({
      ...body,
      savedAt: new Date().toISOString(),
    });
    fs.writeFileSync(DATA_FILE, JSON.stringify(analyses, null, 2));

    return NextResponse.json(body, { status: 201 });
  } catch (error) {
    console.error("Posture analysis POST error:", error);
    return NextResponse.json(
      { error: "Failed to save analysis" },
      { status: 500 }
    );
  }
}
