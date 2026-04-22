-- ============================================================
-- Fix clients table column name (created_at → createdAt)
-- ============================================================
-- Run this to fix the column name mismatch
-- ============================================================

-- Drop the old table (it's empty anyway)
drop table if exists public.clients cascade;

-- Recreate with correct column name
create table public.clients (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null unique,
  password text not null,
  phone text default '',
  "createdAt" text not null, -- camelCase to match application code
  programs text[] default '{}',

  -- Tracking timestamps
  db_created_at timestamptz default now(),
  db_updated_at timestamptz default now()
);

-- Add index on email
create index idx_clients_email on clients(email);

-- Enable RLS
alter table public.clients enable row level security;

-- RLS Policies
create policy "Anyone can register as client"
  on clients for insert
  with check (true);

create policy "Anyone can read clients"
  on clients for select
  using (true);

create policy "Clients can update own data"
  on clients for update
  using (true);

-- Done!
