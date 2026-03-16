import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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
