import { NextRequest, NextResponse } from "next/server";
import { getAllGroupClasses, createGroupClass } from "@/lib/group-classes";

export async function GET() {
  try {
    const classes = getAllGroupClasses();
    return NextResponse.json(classes);
  } catch (error) {
    console.error("Group classes GET error:", error);
    return NextResponse.json({ error: "Failed to load group classes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, dayOfWeek, time, duration, maxParticipants, price, isActive, location, meetLink } = body;

    if (!name || !dayOfWeek || !time) {
      return NextResponse.json({ error: "Name, day, and time are required" }, { status: 400 });
    }

    const gc = createGroupClass({
      name,
      description: description || "",
      dayOfWeek,
      time,
      duration: duration || 60,
      maxParticipants: maxParticipants || 8,
      price: price || 0,
      isActive: isActive !== false,
      location: location || "Studio",
      meetLink: meetLink || "",
    });

    return NextResponse.json(gc, { status: 201 });
  } catch (error) {
    console.error("Group classes POST error:", error);
    return NextResponse.json({ error: "Failed to create group class" }, { status: 500 });
  }
}
