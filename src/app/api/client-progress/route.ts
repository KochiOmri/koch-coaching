import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const PROGRESS_FILE = path.join(DATA_DIR, "client-progress.json");

interface PainScore {
  date: string;
  score: number;
}
interface Note {
  date: string;
  text: string;
}
interface Photo {
  date: string;
  beforeUrl: string;
  afterUrl: string;
}
interface ClientProgress {
  painScores: PainScore[];
  notes: Note[];
  photos: Photo[];
}
type ProgressStore = Record<string, ClientProgress>;

function ensureFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PROGRESS_FILE)) {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify({}, null, 2));
  }
}

function readProgress(): ProgressStore {
  ensureFile();
  return JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf-8"));
}

function writeProgress(data: ProgressStore): void {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const progress = readProgress();

    if (clientId) {
      const entry = progress[clientId] || { painScores: [], notes: [], photos: [] };
      return NextResponse.json(entry);
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Client progress GET error:", error);
    return NextResponse.json({ error: "Failed to load progress" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, type, data } = body;

    if (!clientId || !type || !data) {
      return NextResponse.json(
        { error: "Missing clientId, type, or data" },
        { status: 400 },
      );
    }

    const progress = readProgress();
    if (!progress[clientId]) {
      progress[clientId] = { painScores: [], notes: [], photos: [] };
    }

    switch (type) {
      case "painScore":
        progress[clientId].painScores.push({
          date: data.date || new Date().toISOString().split("T")[0],
          score: data.score,
        });
        break;
      case "note":
        progress[clientId].notes.push({
          date: data.date || new Date().toISOString().split("T")[0],
          text: data.text,
        });
        break;
      case "photo":
        progress[clientId].photos.push({
          date: data.date || new Date().toISOString().split("T")[0],
          beforeUrl: data.beforeUrl || "",
          afterUrl: data.afterUrl || "",
        });
        break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    writeProgress(progress);
    return NextResponse.json(progress[clientId], { status: 201 });
  } catch (error) {
    console.error("Client progress POST error:", error);
    return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
  }
}
