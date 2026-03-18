import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { isSupabaseConfigured, getDb } from "@/lib/supabase/db";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "posture-analyses.json");

function ensureFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
}

export async function GET(request: NextRequest) {
  try {
    if (isSupabaseConfigured()) {
      const db = await getDb();
      if (db) {
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get("clientId");

        let query = db.from("posture_analyses").select("*");
        if (clientId) query = query.eq("client_id", clientId);

        const { data, error } = await query;
        if (error) {
          console.error("Posture analysis GET Supabase error:", error);
          return NextResponse.json(
            { error: "Failed to load analyses" },
            { status: 500 }
          );
        }

        const analyses = (data ?? []).map((r) => {
          const row = r as Record<string, unknown>;
          return {
            id: row.id,
            clientId: row.client_id,
            date: row.date,
            measurements: row.measurements,
            savedAt: row.saved_at,
            ...row,
          };
        });
        return NextResponse.json(analyses);
      }
    }

    ensureFile();
    const analyses = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    if (clientId) {
      const filtered = analyses.filter(
        (a: { clientId: string }) => a.clientId === clientId
      );
      return NextResponse.json(filtered);
    }

    return NextResponse.json(analyses);
  } catch (error) {
    console.error("Posture analysis GET error:", error);
    return NextResponse.json(
      { error: "Failed to load analyses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id || !body.clientId || !body.date || !body.measurements) {
      return NextResponse.json(
        { error: "Missing required fields: id, clientId, date, measurements" },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured()) {
      const db = await getDb();
      if (db) {
        const row = {
          id: body.id,
          client_id: body.clientId,
          date: body.date,
          measurements: body.measurements,
          saved_at: new Date().toISOString(),
        };
        const { data, error } = await db.from("posture_analyses").insert(row).select().single();
        if (error) {
          console.error("Posture analysis POST Supabase error:", error);
          return NextResponse.json(
            { error: "Failed to save analysis" },
            { status: 500 }
          );
        }
        const saved = data as Record<string, unknown>;
        return NextResponse.json(
          {
            id: saved.id,
            clientId: saved.client_id,
            date: saved.date,
            measurements: saved.measurements,
            savedAt: saved.saved_at,
          },
          { status: 201 }
        );
      }
    }

    ensureFile();
    const analyses = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    analyses.push({
      ...body,
      savedAt: new Date().toISOString(),
    });
    fs.writeFileSync(DATA_FILE, JSON.stringify(analyses, null, 2));

    return NextResponse.json(body, { status: 201 });
  } catch (error) {
    console.error("Posture analysis POST error:", error);
    return NextResponse.json(
      { error: "Failed to save analysis" },
      { status: 500 }
    );
  }
}
