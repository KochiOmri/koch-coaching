import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/** Only allow same-origin relative paths (blocks open redirects). */
function safeNextPath(next: string | null, fallback: string): string {
  if (!next) return fallback;
  const t = next.trim();
  if (!t.startsWith("/") || t.startsWith("//") || t.includes("\\")) return fallback;
  return t;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextRaw = searchParams.get("next");

  if (!code) {
    console.error("[auth/callback] No code parameter received");
    return NextResponse.redirect(`${origin}/portal/login?error=no_code`);
  }

  const redirectTo = safeNextPath(nextRaw, "/auth/redirect");
  let response = NextResponse.redirect(`${origin}${redirectTo}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.redirect(`${origin}${redirectTo}`);
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchangeCodeForSession failed:", error.message);
    return NextResponse.redirect(`${origin}/portal/login?error=exchange_failed`);
  }

  return response;
}
