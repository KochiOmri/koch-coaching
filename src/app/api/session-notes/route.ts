import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { isSupabaseConfigured, getDb } from "@/lib/supabase/db";

const DATA_DIR = path.join(process.cwd(), "data");
const NOTES_FILE = path.join(DATA_DIR, "session-notes.json");

interface SessionNote {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  sessionType: string;
  notes: string;
  painScore: number;
  homework: string[];
  createdAt: string;
}

function ensureFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(NOTES_FILE)) {
    fs.writeFileSync(NOTES_FILE, JSON.stringify([], null, 2));
  }
}

function readNotes(): SessionNote[] {
  ensureFile();
  return JSON.parse(fs.readFileSync(NOTES_FILE, "utf-8"));
}

function writeNotes(data: SessionNote[]): void {
  fs.writeFileSync(NOTES_FILE, JSON.stringify(data, null, 2));
}

function mapRowToNote(row: Record<string, unknown>): SessionNote {
  return {
    id: String(row.id),
    clientId: String(row.client_id),
    clientName: String(row.client_name ?? ""),
    date: String(row.date),
    sessionType: String(row.session_type ?? "General"),
    notes: String(row.notes),
    painScore: Number(row.pain_score ?? 5),
    homework: Array.isArray(row.homework) ? row.homework as string[] : [],
    createdAt: String(row.created_at ?? ""),
  };
}

export async function GET(request: NextRequest) {
  try {
    if (isSupabaseConfigured()) {
      const db = await getDb();
      if (db) {
        let query = db.from("session_notes").select("*");
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get("clientId");
        const date = searchParams.get("date");
        if (clientId) query = query.eq("client_id", clientId);
        if (date) query = query.eq("date", date);
        query = query.order("date", { ascending: false });
        const { data, error } = await query;
        if (error) {
          console.error("Session notes GET Supabase error:", error);
          return NextResponse.json({ error: "Failed to load notes" }, { status: 500 });
        }
        const notes = (data ?? []).map((r) => mapRowToNote(r as Record<string, unknown>));
        return NextResponse.json(notes);
      }
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const date = searchParams.get("date");
    let notes = readNotes();

    if (clientId) {
      notes = notes.filter((n) => n.clientId === clientId);
    }
    if (date) {
      notes = notes.filter((n) => n.date === date);
    }

    notes.sort((a, b) => b.date.localeCompare(a.date));
    return NextResponse.json(notes);
  } catch (error) {
    console.error("Session notes GET error:", error);
    return NextResponse.json({ error: "Failed to load notes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, clientName, date, sessionType, notes: noteText, painScore, homework } = body;

    if (!clientId || !date || !noteText) {
      return NextResponse.json(
        { error: "Missing required fields: clientId, date, notes" },
        { status: 400 },
      );
    }

    if (isSupabaseConfigured()) {
      const db = await getDb();
      if (db) {
        const row = {
          id: crypto.randomUUID(),
          client_id: clientId,
          client_name: clientName || "",
          date,
          session_type: sessionType || "General",
          notes: noteText,
          pain_score: painScore ?? 5,
          homework: homework || [],
          created_at: new Date().toISOString(),
        };
        const { data, error } = await db.from("session_notes").insert(row).select().single();
        if (error) {
          console.error("Session notes POST Supabase error:", error);
          return NextResponse.json({ error: "Failed to save note" }, { status: 500 });
        }
        const newNote = mapRowToNote(data as Record<string, unknown>);
        return NextResponse.json(newNote, { status: 201 });
      }
    }

    const allNotes = readNotes();
    const newNote: SessionNote = {
      id: crypto.randomUUID(),
      clientId,
      clientName: clientName || "",
      date,
      sessionType: sessionType || "General",
      notes: noteText,
      painScore: painScore ?? 5,
      homework: homework || [],
      createdAt: new Date().toISOString(),
    };

    allNotes.push(newNote);
    writeNotes(allNotes);

    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    console.error("Session notes POST error:", error);
    return NextResponse.json({ error: "Failed to save note" }, { status: 500 });
  }
}
