import { NextRequest, NextResponse } from "next/server";
import { getAllPrograms, createProgram, getClientPrograms } from "@/lib/clients";

export async function GET(request: NextRequest) {
  try {
    const clientId = request.nextUrl.searchParams.get("clientId");

    if (clientId) {
      const programs = getClientPrograms(clientId);
      return NextResponse.json(programs);
    }

    const programs = getAllPrograms();
    return NextResponse.json(programs);
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
