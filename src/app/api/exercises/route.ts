import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const search = searchParams.get("search");
    let exercises = readExercises();

    if (category) {
      exercises = exercises.filter((e) => e.category === category);
    }
    if (difficulty) {
      exercises = exercises.filter((e) => e.difficulty === difficulty);
    }
    if (search) {
      const q = search.toLowerCase();
      exercises = exercises.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q)) ||
          e.targetAreas.some((a) => a.toLowerCase().includes(q))
      );
    }

    return NextResponse.json(exercises);
  } catch (error) {
    console.error("Exercises GET error:", error);
    return NextResponse.json({ error: "Failed to load exercises" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, videoUrl, thumbnailUrl, category, difficulty, targetAreas, duration, tags, instructions } = body;

    if (!name || !category || !difficulty) {
      return NextResponse.json(
        { error: "Name, category, and difficulty are required" },
        { status: 400 }
      );
    }

    const exercises = readExercises();
    const newExercise: Exercise = {
      id: crypto.randomUUID(),
      name,
      description: description || "",
      videoUrl: videoUrl || "",
      thumbnailUrl: thumbnailUrl || "",
      category,
      difficulty,
      targetAreas: targetAreas || [],
      duration: duration || "",
      tags: tags || [],
      instructions: instructions || [],
      createdAt: new Date().toISOString(),
    };

    exercises.push(newExercise);
    writeExercises(exercises);

    return NextResponse.json(newExercise, { status: 201 });
  } catch (error) {
    console.error("Exercises POST error:", error);
    return NextResponse.json({ error: "Failed to create exercise" }, { status: 500 });
  }
}
