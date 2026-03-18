import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { isSupabaseConfigured, getDb } from "@/lib/supabase/db";

const DATA_DIR = path.join(process.cwd(), "data");
const EXERCISES_FILE = path.join(DATA_DIR, "exercises.json");

interface Exercise {
  id: string;
  name: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  category: string;
  difficulty: string;
  targetAreas: string[];
  duration: string;
  tags: string[];
  instructions: string[];
  createdAt: string;
}

function ensureFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(EXERCISES_FILE)) {
    fs.writeFileSync(EXERCISES_FILE, JSON.stringify([], null, 2));
  }
}

function readExercises(): Exercise[] {
  ensureFile();
  return JSON.parse(fs.readFileSync(EXERCISES_FILE, "utf-8"));
}

function writeExercises(data: Exercise[]): void {
  fs.writeFileSync(EXERCISES_FILE, JSON.stringify(data, null, 2));
}

function mapSupabaseToExercise(row: Record<string, unknown>): Exercise {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    description: String(row.description ?? ""),
    videoUrl: String(row.video_url ?? ""),
    thumbnailUrl: String(row.thumbnail_url ?? ""),
    category: String(row.category ?? "general"),
    difficulty: String(row.difficulty ?? "intermediate"),
    targetAreas: Array.isArray(row.target_areas) ? row.target_areas.map(String) : [],
    duration: row.duration_minutes != null ? String(row.duration_minutes) : "",
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    instructions: Array.isArray(row.instructions) ? row.instructions.map(String) : [],
    createdAt: row.created_at ? new Date(row.created_at as string).toISOString() : new Date().toISOString(),
  };
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (isSupabaseConfigured()) {
      const db = await getDb();
      if (db) {
        const { data, error } = await db.from("exercises").select("*").eq("id", id).single();

        if (error || !data) {
          return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
        }

        const exercise = mapSupabaseToExercise(data as Record<string, unknown>);
        return NextResponse.json(exercise);
      }
    }

    const exercises = readExercises();
    const exercise = exercises.find((e) => e.id === id);
    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }
    return NextResponse.json(exercise);
  } catch (error) {
    console.error("Exercise GET error:", error);
    return NextResponse.json({ error: "Failed to load exercise" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (isSupabaseConfigured()) {
      const db = await getDb();
      if (db) {
        const updates: Record<string, unknown> = {};
        if (body.name != null) updates.name = body.name;
        if (body.description != null) updates.description = body.description;
        if (body.videoUrl != null) updates.video_url = body.videoUrl;
        if (body.thumbnailUrl != null) updates.thumbnail_url = body.thumbnailUrl;
        if (body.category != null) updates.category = body.category;
        if (body.difficulty != null) updates.difficulty = body.difficulty;
        if (body.targetAreas != null) updates.target_areas = body.targetAreas;
        if (body.duration != null) updates.duration_minutes = body.duration ? parseInt(String(body.duration), 10) || null : null;
        if (body.tags != null) updates.tags = body.tags;
        if (body.instructions != null) updates.instructions = body.instructions;

        const { data, error } = await db.from("exercises").update(updates).eq("id", id).select().single();

        if (error) {
          console.error("Exercise PUT Supabase error:", error);
          return NextResponse.json({ error: "Failed to update exercise" }, { status: 500 });
        }

        if (!data) {
          return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
        }

        const exercise = mapSupabaseToExercise(data as Record<string, unknown>);
        return NextResponse.json(exercise);
      }
    }

    const exercises = readExercises();
    const idx = exercises.findIndex((e) => e.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }
    exercises[idx] = { ...exercises[idx], ...body, id };
    writeExercises(exercises);
    return NextResponse.json(exercises[idx]);
  } catch (error) {
    console.error("Exercise PUT error:", error);
    return NextResponse.json({ error: "Failed to update exercise" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (isSupabaseConfigured()) {
      const db = await getDb();
      if (db) {
        const { error } = await db.from("exercises").delete().eq("id", id);

        if (error) {
          console.error("Exercise DELETE Supabase error:", error);
          return NextResponse.json({ error: "Failed to delete exercise" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
      }
    }

    const exercises = readExercises();
    const idx = exercises.findIndex((e) => e.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }
    exercises.splice(idx, 1);
    writeExercises(exercises);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Exercise DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete exercise" }, { status: 500 });
  }
}
