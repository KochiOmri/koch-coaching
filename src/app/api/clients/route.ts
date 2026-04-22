import { NextResponse } from "next/server";
import { isSupabaseConfigured, getDb } from "@/lib/supabase/db";
import { getAllClients } from "@/lib/clients";

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const db = await getDb();
      if (db) {
        const { data, error } = await db
          .from("profiles")
          .select("id, email, name, phone, created_at")
          .eq("role", "client");

        if (error) {
          console.error("Clients GET Supabase error:", error);
          return NextResponse.json({ error: "Failed to load clients" }, { status: 500 });
        }

        const clients = (data || []).map((p) => ({
          id: p.id,
          name: p.name ?? "",
          email: p.email ?? "",
          phone: p.phone ?? "",
          createdAt: p.created_at ?? new Date().toISOString(),
          programs: [] as string[],
        }));

        return NextResponse.json(clients);
      }
    }

    const allClients = await getAllClients();
    const clients = allClients.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      createdAt: c.createdAt,
      programs: c.programs,
    }));
    return NextResponse.json(clients);
  } catch (error) {
    console.error("Clients GET error:", error);
    return NextResponse.json({ error: "Failed to load clients" }, { status: 500 });
  }
}
