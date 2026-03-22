import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, getDb } from "@/lib/supabase/db";
import { getAllPrograms, createProgram, getClientPrograms } from "@/lib/clients";

interface ProgramRow {
  id: string;
  title: string;
  description: string | null;
  duration: string | null;
  exercises: unknown;
  assigned_to: string[] | null;
  created_by: string | null;
  created_at: string;
}

function mapRow(row: ProgramRow) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    duration: row.duration || "4 weeks",
    exercises: Array.isArray(row.exercises) ? row.exercises : [],
    createdBy: row.created_by || "admin",
    assignedTo: row.assigned_to || [],
    createdAt: row.created_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    const clientId = request.nextUrl.searchParams.get("clientId");

    if (isSupabaseConfigured()) {
      const db = await getDb();
      if (db) {
        let query = db.from("programs").select("*");
        if (clientId) {
          query = query.contains("assigned_to", [clientId]);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return NextResponse.json(data.map((r: ProgramRow) => mapRow(r)));
        }
        if (error) {
          console.error("Programs GET Supabase error:", error);
        }
      }
    }

    if (clientId) {
      return NextResponse.json(getClientPrograms(clientId));
    }
    return NextResponse.json(getAllPrograms());
  } catch (error) {
    console.error("Programs GET error:", error);
    return NextResponse.json({ error: "Failed to load programs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, duration, exercises, assignedTo } = body;

    if (!title || !description || !duration) {
      return NextResponse.json({ error: "Title, description, and duration are required" }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const db = await getDb();
      if (db) {
        const row = {
          title,
          description,
          duration,
          exercises: exercises || [],
          assigned_to: assignedTo || [],
          created_by: "admin",
        };
        const { data, error } = await db.from("programs").insert(row).select().single();
        if (!error && data) {
          return NextResponse.json(mapRow(data as ProgramRow), { status: 201 });
        }
        if (error) console.error("Programs POST Supabase error:", error);
      }
    }

    const program = createProgram({
      title,
      description,
      duration,
      exercises: exercises || [],
      createdBy: "admin",
      assignedTo: assignedTo || [],
    });

    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error("Programs POST error:", error);
    return NextResponse.json({ error: "Failed to create program" }, { status: 500 });
  }
}
