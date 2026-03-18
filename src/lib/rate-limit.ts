/**
 * Simple in-memory rate limiter for API routes.
 * 
 * In production with multiple instances, use Redis or Supabase 
 * for distributed rate limiting. This works for single-instance deployments.
 */

const requests = new Map<string, { count: number; resetAt: number }>();

const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, val] of requests.entries()) {
    if (val.resetAt < now) requests.delete(key);
  }
}

interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
}

export function rateLimit(
  identifier: string,
  { windowMs = 60_000, maxRequests = 30 }: RateLimitOptions = {}
): { success: boolean; remaining: number } {
  cleanup();
  const now = Date.now();
  const entry = requests.get(identifier);

  if (!entry || entry.resetAt < now) {
    requests.set(identifier, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: maxRequests - 1 };
  }

  entry.count += 1;
  if (entry.count > maxRequests) {
    return { success: false, remaining: 0 };
  }

  return { success: true, remaining: maxRequests - entry.count };
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
