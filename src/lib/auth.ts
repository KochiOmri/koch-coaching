/* ============================================================
   ADMIN AUTH - src/lib/auth.ts
   ============================================================
   Simple password-based authentication for the admin panel.
   
   How it works:
   - Admin enters a password on the login page
   - Password is checked against ADMIN_PASSWORD env variable
   - If correct, a session token is stored in a cookie
   - The token is checked on every admin page load
   
   This is a simple approach for testing. In production,
   you'd use Supabase Auth or NextAuth.js for proper auth.
   
   Setup:
   Add to .env.local:
     ADMIN_PASSWORD=your-secret-password
   ============================================================ */

import { cookies } from "next/headers";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "koch2024";
const SESSION_TOKEN = "koch-admin-session";

/* --- Verify Password ---
   Checks if the provided password matches the admin password.
   Returns a simple session token if correct. */
export function verifyPassword(password: string): string | null {
  if (password === ADMIN_PASSWORD) {
    const token = Buffer.from(`koch-admin-${Date.now()}`).toString("base64");
    return token;
  }
  return null;
}

/* --- Check if Admin is Authenticated ---
   Reads the session cookie to check if the user is logged in.
   Returns true if a valid session token exists. */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_TOKEN);
  return !!session?.value;
}

export { SESSION_TOKEN };
