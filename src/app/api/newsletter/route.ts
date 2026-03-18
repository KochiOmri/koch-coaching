/**
 * Newsletter API — Subscriber List Management
 *
 * Endpoints:
 *   GET  — Returns all newsletter subscribers. Used by the admin dashboard to
 *          view and manage the list.
 *   POST — Adds a new subscriber. Validates email format and rejects duplicates
 *          (returns 409 if already subscribed).
 *
 * Request/Response:
 *   GET  — No body. Returns array of { email, subscribedAt } objects.
 *   POST — Body: { email: string }. Returns { success: true } (201) or
 *          { error: "Invalid email" } (400) / { error: "Already subscribed" } (409).
 *
 * Integration: Persists to data/newsletter.json. The signup form on the public
 * site calls POST; the admin panel uses GET to display subscribers.
 */
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { isSupabaseConfigured, getDb } from "@/lib/supabase/db";

const DATA_PATH = path.join(process.cwd(), "data", "newsletter.json");

function getSubscribers(): Array<{ email: string; subscribedAt: string }> {
  try {
    if (!fs.existsSync(DATA_PATH)) return [];
    return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
  } catch {
    return [];
  }
}

function saveSubscribers(subs: Array<{ email: string; subscribedAt: string }>) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(subs, null, 2));
}

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const db = await getDb();
      if (db) {
        const { data, error } = await db.from("newsletter_subscribers").select("email, subscribed_at");
        if (error) {
          console.error("Newsletter GET Supabase error:", error);
          return NextResponse.json({ error: "Failed to load subscribers" }, { status: 500 });
        }
        const subs = (data ?? []).map((r: Record<string, unknown>) => ({
          email: String(r.email),
          subscribedAt: String(r.subscribed_at ?? ""),
        }));
        return NextResponse.json(subs);
      }
    }

    return NextResponse.json(getSubscribers());
  } catch (error) {
    console.error("Newsletter GET error:", error);
    return NextResponse.json({ error: "Failed to load subscribers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const db = await getDb();
      if (db) {
        const { data: existing } = await db
          .from("newsletter_subscribers")
          .select("id")
          .eq("email", email)
          .maybeSingle();

        if (existing) {
          return NextResponse.json({ error: "Already subscribed" }, { status: 409 });
        }

        const { error } = await db.from("newsletter_subscribers").insert({
          email,
          subscribed_at: new Date().toISOString(),
        });

        if (error) {
          if (error.code === "23505") {
            return NextResponse.json({ error: "Already subscribed" }, { status: 409 });
          }
          console.error("Newsletter POST Supabase error:", error);
          return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
        }

        return NextResponse.json({ success: true }, { status: 201 });
      }
    }

    const subs = getSubscribers();
    if (subs.some((s) => s.email === email)) {
      return NextResponse.json({ error: "Already subscribed" }, { status: 409 });
    }

    subs.push({ email, subscribedAt: new Date().toISOString() });
    saveSubscribers(subs);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
