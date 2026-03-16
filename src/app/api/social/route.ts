/**
 * Social Media API — Proxy to Late API
 *
 * This route proxies requests to the Late API for social media management.
 * All heavy lifting (auth, API calls) is done in @/lib/social.
 *
 * Endpoints:
 *   GET    — Fetches data based on ?action= query param:
 *            accounts   → connected social accounts
 *            scheduled  → posts waiting to be published
 *            published  → already-published posts
 *            analytics  → engagement metrics
 *            status     → whether Late API is configured
 *   POST   — Creates or schedules a post. Body format depends on Late API.
 *   DELETE — Removes a scheduled post. Requires ?id=<postId>.
 *
 * Request/Response:
 *   GET    — Query: action. Returns JSON shaped by action (accounts, posts, etc.).
 *   POST   — Body: post payload. Returns created post object (201) or error.
 *   DELETE — Query: id. Returns { success: true } or error.
 *
 * Integration: Used by the admin social manager UI. Late API keys live in env;
 * if not configured, POST/create operations fail with a clear error.
 */
import { NextRequest, NextResponse } from "next/server";
import * as social from "@/lib/social";

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get("action");

  try {
    switch (action) {
      case "accounts":
        return NextResponse.json({ accounts: await social.getAccounts() });
      case "scheduled":
        return NextResponse.json({ posts: await social.getScheduledPosts() });
      case "published":
        return NextResponse.json({ posts: await social.getPublishedPosts() });
      case "analytics":
        return NextResponse.json(await social.getAnalytics());
      case "status":
        return NextResponse.json({ configured: social.isConfigured() });
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Social API error:", error);
    return NextResponse.json({ error: "Social API request failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await social.createPost(body);
    if (!result) {
      return NextResponse.json({ error: "Failed to create post. Check API key configuration." }, { status: 500 });
    }
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Social post error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const postId = request.nextUrl.searchParams.get("id");
  if (!postId) {
    return NextResponse.json({ error: "Post ID required" }, { status: 400 });
  }
  try {
    await social.deletePost(postId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Social delete error:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
