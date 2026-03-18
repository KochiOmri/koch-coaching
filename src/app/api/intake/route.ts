import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { isSupabaseConfigured, getDb } from "@/lib/supabase/db";

export interface IntakeSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: string;
  occupation: string;
  painConditions: string[];
  mainConcern: string;
  previousInjuries: string;
  surgeries: string;
  currentMedications: string;
  allergies: string;
  activityLevel: string;
  hoursSitting: string;
  exerciseFrequency: string;
  sportsActivities: string;
  goals: string;
  consentAccepted: boolean;
  submittedAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "intake-forms.json");

function ensureDataFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
}

function getAllSubmissions(): IntakeSubmission[] {
  ensureDataFile();
  const data = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(data);
}

function mapRowToSubmission(row: Record<string, unknown>): IntakeSubmission {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    age: String(row.age ?? ""),
    occupation: String(row.occupation ?? ""),
    painConditions: Array.isArray(row.pain_conditions) ? (row.pain_conditions as string[]) : [],
    mainConcern: String(row.main_concern ?? ""),
    previousInjuries: String(row.previous_injuries ?? ""),
    surgeries: String(row.surgeries ?? ""),
    currentMedications: String(row.current_medications ?? ""),
    allergies: String(row.allergies ?? ""),
    activityLevel: String(row.activity_level ?? ""),
    hoursSitting: String(row.hours_sitting ?? ""),
    exerciseFrequency: String(row.exercise_frequency ?? ""),
    sportsActivities: String(row.sports_activities ?? ""),
    goals: String(row.goals ?? ""),
    consentAccepted: row.consent_accepted === true,
    submittedAt: String(row.submitted_at ?? ""),
  };
}

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const db = await getDb();
      if (db) {
        const { data, error } = await db.from("intake_forms").select("*");
        if (error) {
          console.error("Intake GET Supabase error:", error);
          return NextResponse.json(
            { error: "Failed to fetch intake forms" },
            { status: 500 }
          );
        }
        const submissions = (data ?? []).map((r) => mapRowToSubmission(r as Record<string, unknown>));
        return NextResponse.json(submissions);
      }
    }

    const submissions = getAllSubmissions();
    return NextResponse.json(submissions);
  } catch (error) {
    console.error("Failed to fetch intake forms:", error);
    return NextResponse.json(
      { error: "Failed to fetch intake forms" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const required = ["name", "email", "phone", "age", "painConditions", "consentAccepted"];
    for (const field of required) {
      if (!body[field] || (field === "painConditions" && body[field].length === 0)) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    if (!body.consentAccepted) {
      return NextResponse.json(
        { error: "Consent must be accepted" },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured()) {
      const db = await getDb();
      if (db) {
        const row = {
          id: crypto.randomUUID(),
          name: body.name,
          email: body.email,
          phone: body.phone,
          age: body.age,
          occupation: body.occupation || "",
          pain_conditions: body.painConditions,
          main_concern: body.mainConcern || "",
          previous_injuries: body.previousInjuries || "",
          surgeries: body.surgeries || "",
          current_medications: body.currentMedications || "",
          allergies: body.allergies || "",
          activity_level: body.activityLevel || "",
          hours_sitting: body.hoursSitting || "",
          exercise_frequency: body.exerciseFrequency || "",
          sports_activities: body.sportsActivities || "",
          goals: body.goals || "",
          consent_accepted: body.consentAccepted,
          submitted_at: new Date().toISOString(),
        };
        const { data, error } = await db.from("intake_forms").insert(row).select().single();
        if (error) {
          console.error("Intake POST Supabase error:", error);
          return NextResponse.json(
            { error: "Failed to save intake form" },
            { status: 500 }
          );
        }
        const newSubmission = mapRowToSubmission(data as Record<string, unknown>);
        return NextResponse.json(newSubmission, { status: 201 });
      }
    }

    const submissions = getAllSubmissions();

    const newSubmission: IntakeSubmission = {
      id: crypto.randomUUID(),
      name: body.name,
      email: body.email,
      phone: body.phone,
      age: body.age,
      occupation: body.occupation || "",
      painConditions: body.painConditions,
      mainConcern: body.mainConcern || "",
      previousInjuries: body.previousInjuries || "",
      surgeries: body.surgeries || "",
      currentMedications: body.currentMedications || "",
      allergies: body.allergies || "",
      activityLevel: body.activityLevel || "",
      hoursSitting: body.hoursSitting || "",
      exerciseFrequency: body.exerciseFrequency || "",
      sportsActivities: body.sportsActivities || "",
      goals: body.goals || "",
      consentAccepted: body.consentAccepted,
      submittedAt: new Date().toISOString(),
    };

    submissions.push(newSubmission);
    ensureDataFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(submissions, null, 2));

    return NextResponse.json(newSubmission, { status: 201 });
  } catch (error) {
    console.error("Failed to create intake submission:", error);
    return NextResponse.json(
      { error: "Failed to save intake form" },
      { status: 500 }
    );
  }
}
