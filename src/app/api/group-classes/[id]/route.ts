import { NextRequest, NextResponse } from "next/server";
import {
  getGroupClassById,
  updateGroupClass,
  deleteGroupClass,
  joinGroupClass,
  leaveGroupClass,
} from "@/lib/group-classes";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const gc = getGroupClassById(id);
    if (!gc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(gc);
  } catch (error) {
    console.error("Group class GET error:", error);
    return NextResponse.json({ error: "Failed to load group class" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = updateGroupClass(id, body);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Group class PUT error:", error);
    return NextResponse.json({ error: "Failed to update group class" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleted = deleteGroupClass(id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Group class DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete group class" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, clientId } = body;

    if (!action || !clientId) {
      return NextResponse.json({ error: "Action and clientId are required" }, { status: 400 });
    }

    if (action === "join") {
      const result = joinGroupClass(id, clientId);
      if (result.status === "not_found") {
        return NextResponse.json({ error: "Class not found" }, { status: 404 });
      }
      return NextResponse.json(result);
    }

    if (action === "leave") {
      const result = leaveGroupClass(id, clientId);
      if (result.status === "not_found") {
        return NextResponse.json({ error: "Class not found" }, { status: 404 });
      }
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Group class PATCH error:", error);
    return NextResponse.json({ error: "Failed to update group class" }, { status: 500 });
  }
}
