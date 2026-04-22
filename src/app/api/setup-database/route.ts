import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Check if clients table exists
    const { data: tables, error: tableError } = await supabase
      .from("clients")
      .select("id")
      .limit(1);

    if (tableError && tableError.message.includes("does not exist")) {
      // Table doesn't exist, create it
      const createTableSQL = `
        -- Create clients table
        create table if not exists public.clients (
          id uuid default gen_random_uuid() primary key,
          name text not null,
          email text not null unique,
          password text not null,
          phone text default '',
          created_at text not null,
          programs text[] default '{}',
          db_created_at timestamptz default now(),
          db_updated_at timestamptz default now()
        );

        -- Add index on email
        create index if not exists idx_clients_email on clients(email);

        -- Enable RLS
        alter table public.clients enable row level security;

        -- RLS Policies
        drop policy if exists "Anyone can register as client" on clients;
        create policy "Anyone can register as client"
          on clients for insert
          with check (true);

        drop policy if exists "Anyone can read clients" on clients;
        create policy "Anyone can read clients"
          on clients for select
          using (true);

        drop policy if exists "Clients can update own data" on clients;
        create policy "Clients can update own data"
          on clients for update
          using (true);
      `;

      return NextResponse.json({
        status: "setup_needed",
        message: "Clients table doesn't exist. Please run the SQL in supabase/create-clients-table.sql in your Supabase SQL editor.",
        sql: createTableSQL,
      });
    }

    return NextResponse.json({
      status: "ready",
      message: "Database is set up correctly",
      tableExists: true,
    });
  } catch (error) {
    console.error("Database setup error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
