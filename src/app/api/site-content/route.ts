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
 * Integration: Uses @/lib/site-content for read/write. The admin editor calls
 * these endpoints to load and save content; the public site fetches via GET.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSiteContent, saveSiteContent } from "@/lib/site-content";

export async function GET() {
  try {
    const content = getSiteContent();
    return NextResponse.json(content);
  } catch (error) {
    console.error("Failed to read site content:", error);
    return NextResponse.json({ error: "Failed to read site content" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    saveSiteContent(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save site content:", error);
    return NextResponse.json({ error: "Failed to save site content" }, { status: 500 });
  }
}
