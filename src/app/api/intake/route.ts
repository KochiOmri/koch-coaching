import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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

export async function GET() {
  try {
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
