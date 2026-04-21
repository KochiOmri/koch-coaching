import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

/**
 * Ensures a `profiles` row exists for the auth user (fallback if DB trigger is missing).
 * Safe to call after sign-in or sign-up when the user has a session.
 */
export async function ensureClientProfile(
  supabase: SupabaseClient,
  user: User,
  displayName?: string
): Promise<void> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (existing) return;

  const name =
    displayName ||
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    user.email?.split("@")[0] ||
    "";

  await supabase.from("profiles").insert({
    id: user.id,
    email: user.email ?? "",
    name,
    role: "client",
  });
}
