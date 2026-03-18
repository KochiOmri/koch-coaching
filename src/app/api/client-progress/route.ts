import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { isSupabaseConfigured, getDb } from "@/lib/supabase/db";

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
    if (isSupabaseConfigured()) {
      const db = await getDb();
      if (db) {
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get("clientId");

        const { data, error } = await db.from("client_progress").select("*");
        if (error) {
          console.error("Client progress GET Supabase error:", error);
          return NextResponse.json({ error: "Failed to load progress" }, { status: 500 });
        }

        const progress: ProgressStore = {};
        for (const row of data ?? []) {
          const r = row as Record<string, unknown>;
          const cid = String(r.client_id);
          progress[cid] = {
            painScores: (r.pain_scores as PainScore[]) ?? [],
            notes: (r.notes as Note[]) ?? [],
            photos: (r.photos as Photo[]) ?? [],
          };
        }

        if (clientId) {
          const entry = progress[clientId] || { painScores: [], notes: [], photos: [] };
          return NextResponse.json(entry);
        }

        return NextResponse.json(progress);
      }
    }

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

    if (isSupabaseConfigured()) {
      const db = await getDb();
      if (db) {
        const { data: existing } = await db
          .from("client_progress")
          .select("*")
          .eq("client_id", clientId)
          .single();

        const empty = { painScores: [], notes: [], photos: [] };
        const current = existing
          ? {
              painScores: ((existing as Record<string, unknown>).pain_scores as PainScore[]) ?? [],
              notes: ((existing as Record<string, unknown>).notes as Note[]) ?? [],
              photos: ((existing as Record<string, unknown>).photos as Photo[]) ?? [],
            }
          : empty;

        switch (type) {
          case "painScore":
            current.painScores.push({
              date: data.date || new Date().toISOString().split("T")[0],
              score: data.score,
            });
            break;
          case "note":
            current.notes.push({
              date: data.date || new Date().toISOString().split("T")[0],
              text: data.text,
            });
            break;
          case "photo":
            current.photos.push({
              date: data.date || new Date().toISOString().split("T")[0],
              beforeUrl: data.beforeUrl || "",
              afterUrl: data.afterUrl || "",
            });
            break;
          default:
            return NextResponse.json({ error: "Invalid type" }, { status: 400 });
        }

        const row = {
          client_id: clientId,
          pain_scores: current.painScores,
          notes: current.notes,
          photos: current.photos,
        };

        if (existing) {
          const { data: updated, error } = await db
            .from("client_progress")
            .update(row)
            .eq("client_id", clientId)
            .select()
            .single();
          if (error) {
            console.error("Client progress POST Supabase error:", error);
            return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
          }
          const u = updated as Record<string, unknown>;
          return NextResponse.json(
            {
              painScores: u.pain_scores ?? [],
              notes: u.notes ?? [],
              photos: u.photos ?? [],
            },
            { status: 201 }
          );
        } else {
          const { data: inserted, error } = await db
            .from("client_progress")
            .insert({ id: crypto.randomUUID(), ...row })
            .select()
            .single();
          if (error) {
            console.error("Client progress POST Supabase error:", error);
            return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
          }
          const u = inserted as Record<string, unknown>;
          return NextResponse.json(
            {
              painScores: u.pain_scores ?? [],
              notes: u.notes ?? [],
              photos: u.photos ?? [],
            },
            { status: 201 }
          );
        }
      }
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
