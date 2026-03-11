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
