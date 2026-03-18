/**
 * CMS API — Site Content Management
 *
 * Endpoints:
 *   GET  — Returns all website text content (headings, paragraphs, CTAs, etc.).
 *          Used by the public site and admin preview to render editable content.
 *   PUT  — Saves updated content from the admin editor. Expects the full content
 *          object in the request body; overwrites data/site-content.json.
 *
 * Request/Response:
 *   GET  — No body. Returns JSON object with all content keys.
 *   PUT  — Body: full site content object. Returns { success: true } on success.
 *
 * Integration: Dual-mode — Supabase when configured, JSON file fallback otherwise.
 * Uses @/lib/site-content for read/write fallback.
 */
import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, getDb } from "@/lib/supabase/db";
import { getSiteContent, saveSiteContent } from "@/lib/site-content";

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const db = await getDb();
      if (db) {
        const { data, error } = await db
          .from("site_content")
          .select("content")
          .eq("id", "main")
          .single();
        if (!error && data?.content) {
          return NextResponse.json(data.content);
        }
      }
    }
    const content = await getSiteContent();
    return NextResponse.json(content);
  } catch (error) {
    console.error("Failed to read site content:", error);
    return NextResponse.json({ error: "Failed to read site content" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (isSupabaseConfigured()) {
      const db = await getDb();
      if (db) {
        const { error } = await db
          .from("site_content")
          .upsert({ id: "main", content: body }, { onConflict: "id" });
        if (!error) {
          return NextResponse.json({ success: true });
        }
      }
    }
    await saveSiteContent(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save site content:", error);
    return NextResponse.json({ error: "Failed to save site content" }, { status: 500 });
  }
}
