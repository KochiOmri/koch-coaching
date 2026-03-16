import { NextRequest, NextResponse } from "next/server";
import { getProgramById, updateProgram, deleteProgram } from "@/lib/clients";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const program = getProgramById(id);
    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }
    return NextResponse.json(program);
  } catch (error) {
    console.error("Program GET error:", error);
    return NextResponse.json({ error: "Failed to load program" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = updateProgram(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Program PUT error:", error);
    return NextResponse.json({ error: "Failed to update program" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleted = deleteProgram(id);
    if (!deleted) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Program DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete program" }, { status: 500 });
  }
}
