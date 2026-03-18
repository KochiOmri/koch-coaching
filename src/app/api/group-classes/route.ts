import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { isSupabaseConfigured, getDb } from "@/lib/supabase/db";
import { getAllGroupClasses, createGroupClass } from "@/lib/group-classes";

function mapRowToGroupClass(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    name: String(row.name),
    description: String(row.description ?? ""),
    dayOfWeek: String(row.day_of_week),
    time: String(row.time),
    duration: Number(row.duration ?? 60),
    maxParticipants: Number(row.max_participants ?? 8),
    currentParticipants: Array.isArray(row.current_participants) ? (row.current_participants as string[]) : [],
    waitlist: Array.isArray(row.waitlist) ? (row.waitlist as string[]) : [],
    price: Number(row.price ?? 0),
    isActive: row.is_active !== false,
    location: String(row.location ?? "Studio"),
    meetLink: String(row.meet_link ?? ""),
    createdAt: String(row.created_at ?? ""),
  };
}

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const db = await getDb();
      if (db) {
        const { data, error } = await db.from("group_classes").select("*");
        if (error) {
          console.error("Group classes GET Supabase error:", error);
          return NextResponse.json({ error: "Failed to load group classes" }, { status: 500 });
        }
        const classes = (data ?? []).map((r) => mapRowToGroupClass(r as Record<string, unknown>));
        return NextResponse.json(classes);
      }
    }

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

    if (isSupabaseConfigured()) {
      const db = await getDb();
      if (db) {
        const row = {
          id: crypto.randomUUID(),
          name,
          description: description || "",
          day_of_week: dayOfWeek,
          time,
          duration: duration || 60,
          max_participants: maxParticipants || 8,
          current_participants: [],
          waitlist: [],
          price: price || 0,
          is_active: isActive !== false,
          location: location || "Studio",
          meet_link: meetLink || "",
          created_at: new Date().toISOString(),
        };
        const { data, error } = await db.from("group_classes").insert(row).select().single();
        if (error) {
          console.error("Group classes POST Supabase error:", error);
          return NextResponse.json({ error: "Failed to create group class" }, { status: 500 });
        }
        const gc = mapRowToGroupClass(data as Record<string, unknown>);
        return NextResponse.json(gc, { status: 201 });
      }
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
