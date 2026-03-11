/* ============================================================
   AUTH API - src/app/api/auth/route.ts
   ============================================================
   POST /api/auth → Login (set session cookie)
   DELETE /api/auth → Logout (clear session cookie)
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, SESSION_TOKEN } from "@/lib/auth";

/* --- Login Handler ---
   Verifies password and sets a session cookie. */
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const token = verifyPassword(password);

    if (!token) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_TOKEN, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Auth failed" }, { status: 500 });
  }
}

/* --- Logout Handler ---
   Clears the session cookie. */
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(SESSION_TOKEN);
  return response;
}
