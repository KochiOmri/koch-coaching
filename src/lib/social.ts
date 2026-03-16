/**
 * SOCIAL MEDIA — Late API client for cross-platform posting
 *
 * WHAT IT DOES:
 * Wrapper around the Late API (getlate.dev) for managing social accounts and posts.
 * Post once to Instagram, TikTok, Facebook, YouTube from a single API. Handles
 * accounts, creating/scheduling posts, and basic analytics.
 *
 * ARCHITECTURE:
 * - Thin client: all logic lives in Late's servers; we just HTTP + auth
 * - Used by: admin/social UI for scheduling and viewing posts
 * - Requires LATE_API_KEY in .env; isConfigured() checks before showing social features
 *
 * DEV PLAN:
 * - Connect accounts in Late dashboard; getAccounts() lists what's linked
 * - createPost() supports media URLs, platforms array, and optional scheduled_at
 * - Analytics are basic; expand if you need per-platform breakdowns
 */

const LATE_API_KEY = process.env.LATE_API_KEY || "";
const LATE_BASE_URL = "https://api.getlate.dev/v1";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SocialPost {
  content: string;
  platforms: string[];
  mediaUrls?: string[];
  scheduledAt?: string;
}

interface SocialAccount {
  id: string;
  platform: string;
  username: string;
  profileUrl: string;
  connected: boolean;
}

// ─── API client (auth + base request) ─────────────────────────────────────────

export function isConfigured(): boolean {
  return !!LATE_API_KEY;
}

async function lateRequest(endpoint: string, options: RequestInit = {}) {
  if (!LATE_API_KEY) return null;

  const res = await fetch(`${LATE_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${LATE_API_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`Late API error (${res.status}):`, err);
    return null;
  }
  return res.json();
}

// ─── Accounts & posts ─────────────────────────────────────────────────────────

export async function getAccounts(): Promise<SocialAccount[]> {
  const data = await lateRequest("/accounts");
  if (!data) return [];
  return data.accounts || [];
}

export async function createPost(post: SocialPost) {
  return lateRequest("/posts", {
    method: "POST",
    body: JSON.stringify({
      text: post.content,
      platforms: post.platforms,
      media: post.mediaUrls?.map((url) => ({ url })),
      scheduled_at: post.scheduledAt,
    }),
  });
}

export async function getScheduledPosts() {
  const data = await lateRequest("/posts?status=scheduled");
  return data?.posts || [];
}

export async function getPublishedPosts(limit = 20) {
  const data = await lateRequest(`/posts?status=published&limit=${limit}`);
  return data?.posts || [];
}

export async function deletePost(postId: string) {
  return lateRequest(`/posts/${postId}`, { method: "DELETE" });
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export async function getAnalytics() {
  const data = await lateRequest("/analytics");
  return data || { followers: 0, engagement: 0, posts: 0 };
}
