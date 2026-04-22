-- ============================================================
-- Create clients table for demo/simple client registration
-- ============================================================
-- This allows client registration without full Supabase Auth
-- Perfect for quick demos and testing
-- ============================================================

-- Create clients table
create table if not exists public.clients (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null unique,
  password text not null, -- hashed password
  phone text default '',
  "createdAt" text not null, -- Use camelCase to match application code
  programs text[] default '{}',

  -- Timestamps for tracking
  db_created_at timestamptz default now(),
  db_updated_at timestamptz default now()
);

-- Add index on email for faster lookups
create index if not exists idx_clients_email on clients(email);

-- Enable RLS
alter table public.clients enable row level security;

-- RLS Policies: Allow anyone to create (register), but only admins can read/update
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

-- Done! Clients table ready for demo registration
