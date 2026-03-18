/**
 * Supabase Database Access Layer
 *
 * Dual-mode: uses Supabase when configured, falls back to local JSON files.
 * This allows the app to work both locally (dev) and on Vercel (prod).
 */

import { createClient as createServerClient } from "./server";

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-project.supabase.co";

export function isSupabaseConfigured() {
  return SUPABASE_CONFIGURED;
}

/**
 * Get a server-side Supabase client, or null if not configured.
 * API routes should check this and fall back to JSON if null.
 */
export async function getDb() {
  if (!SUPABASE_CONFIGURED) return null;
  return await createServerClient();
}

// ── Generic CRUD helpers ──

export async function dbSelect<T>(table: string, options?: {
  filter?: Record<string, unknown>;
  order?: { column: string; ascending?: boolean };
  limit?: number;
}): Promise<T[] | null> {
  const db = await getDb();
  if (!db) return null;

  let query = db.from(table).select("*");

  if (options?.filter) {
    for (const [key, value] of Object.entries(options.filter)) {
      query = query.eq(key, value);
    }
  }

  if (options?.order) {
    query = query.order(options.order.column, { ascending: options.order.ascending ?? false });
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error(`DB select error (${table}):`, error);
    return null;
  }
  return data as T[];
}

export async function dbInsert<T>(table: string, row: Record<string, unknown>): Promise<T | null> {
  const db = await getDb();
  if (!db) return null;

  const { data, error } = await db.from(table).insert(row).select().single();
  if (error) {
    console.error(`DB insert error (${table}):`, error);
    return null;
  }
  return data as T;
}

export async function dbUpdate<T>(table: string, id: string, updates: Record<string, unknown>): Promise<T | null> {
  const db = await getDb();
  if (!db) return null;

  const { data, error } = await db.from(table).update(updates).eq("id", id).select().single();
  if (error) {
    console.error(`DB update error (${table}):`, error);
    return null;
  }
  return data as T;
}

export async function dbDelete(table: string, id: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const { error } = await db.from(table).delete().eq("id", id);
  if (error) {
    console.error(`DB delete error (${table}):`, error);
    return false;
  }
  return true;
}

export async function dbUpsert<T>(table: string, row: Record<string, unknown>, conflictColumn = "id"): Promise<T | null> {
  const db = await getDb();
  if (!db) return null;

  const { data, error } = await db.from(table).upsert(row, { onConflict: conflictColumn }).select().single();
  if (error) {
    console.error(`DB upsert error (${table}):`, error);
    return null;
  }
  return data as T;
}
