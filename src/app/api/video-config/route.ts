/**
 * Video Config API — Video Slot Assignment
 *
 * Manages which videos are assigned to which slots on the site (e.g. hero,
 * testimonials, course preview). The config maps slot IDs to video metadata.
 *
 * Endpoints:
 *   GET — Returns the current video configuration (slot → video mappings).
 *         Used by the public site to render videos and by the admin to load
 *         the current state.
 *   PUT — Saves the updated config from the admin video manager. Expects the
 *         full config object; overwrites the stored configuration.
 *
 * Request/Response:
 *   GET — No body. Returns JSON object with slot assignments.
 *   PUT — Body: full video config object. Returns { success: true } on success.
 *
 * Integration: Uses @/lib/video-config for read/write. The admin video manager
 * calls GET to load and PUT to save; the public site fetches via GET to display.
 */
import { NextRequest, NextResponse } from "next/server";
import { getVideoConfig, saveVideoConfig } from "@/lib/video-config";

export async function GET() {
  try {
    const config = getVideoConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error("Failed to get video config:", error);
    return NextResponse.json({ error: "Failed to load config" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const config = await request.json();
    saveVideoConfig(config);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save video config:", error);
    return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
  }
}
