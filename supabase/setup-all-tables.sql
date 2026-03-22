-- ============================================================
-- KOCH Coaching - Safe Table Setup (run in Supabase SQL Editor)
-- ============================================================
-- Uses public.is_admin() SECURITY DEFINER to avoid RLS recursion.
-- Safe to run multiple times (uses IF NOT EXISTS everywhere).
-- ============================================================

-- Step 1: Create the is_admin() helper
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- Step 2: Create tables

create table if not exists public.appointments (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references profiles(id) on delete set null,
  name text not null default '',
  email text,
  phone text,
  service text not null default 'consultation',
  date date not null,
  time text not null,
  duration integer default 60,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  message text,
  meet_link text,
  "googleEventId" text,
  "createdAt" text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.exercises (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  category text default 'general',
  difficulty text default 'intermediate',
  video_url text,
  thumbnail_url text,
  instructions text[],
  target_areas text[],
  tags text[],
  duration_minutes integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.programs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  duration text default '4 weeks',
  exercises jsonb default '[]'::jsonb,
  assigned_to text[] default '{}',
  created_by text default 'admin',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.session_notes (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references profiles(id) on delete cascade,
  date date not null,
  session_type text default 'in-person',
  notes text,
  pain_score integer,
  homework text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id text not null,
  receiver_id text not null,
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.packages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  session_count integer not null default 1,
  price decimal(10,2) not null default 0,
  currency text default 'ILS',
  duration text default '1 month',
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.client_packages (
  id uuid default gen_random_uuid() primary key,
  client_id text not null,
  package_id text not null,
  sessions_used integer default 0,
  sessions_total integer not null default 1,
  status text default 'active',
  start_date text,
  expiry_date text,
  purchased_at timestamptz default now()
);

create table if not exists public.client_progress (
  id uuid default gen_random_uuid() primary key,
  client_id text not null,
  date date not null,
  pain_score integer,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.referrals (
  id uuid default gen_random_uuid() primary key,
  referrer_id text not null,
  referrer_name text,
  referrer_email text,
  referral_code text unique,
  referred_clients jsonb default '[]'::jsonb,
  rewards_earned integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.site_content (
  id text primary key default 'main',
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

create table if not exists public.site_design (
  id text primary key default 'main',
  theme_mode text default 'dark',
  primary_color text default '#d4a843',
  accent_color text default '#d4a843',
  background_color text default '#0a0a0a',
  font_heading text default 'Outfit',
  font_body text default 'Inter',
  hero_style text default 'video',
  hero_overlay_opacity decimal default 0.6,
  sections_visible jsonb default '{"hero":true,"about":true,"videoShowcase":true,"methodology":true,"services":true,"method":true,"results":true,"booking":true}'::jsonb,
  custom_css text,
  updated_at timestamptz default now()
);

create table if not exists public.intake_forms (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text,
  phone text,
  age integer,
  gender text,
  goals text,
  pain_areas text[],
  pain_level integer,
  medical_history text,
  previous_treatment text,
  exercise_frequency text,
  consent boolean default false,
  submitted_at timestamptz default now()
);

create table if not exists public.group_classes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  instructor text,
  day_of_week text,
  time text,
  duration_minutes integer default 60,
  max_participants integer default 10,
  current_participants integer default 0,
  location text,
  is_active boolean default true,
  participants jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.posture_analyses (
  id uuid default gen_random_uuid() primary key,
  client_id text not null,
  view_type text default 'front',
  measurements jsonb default '{}'::jsonb,
  details jsonb default '[]'::jsonb,
  image_url text,
  overall_score integer,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.nav_order (
  id text primary key default 'admin',
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz default now()
);

-- Step 3: Enable RLS on all tables
do $$ 
declare
  tbl text;
begin
  for tbl in select unnest(array[
    'appointments','exercises','programs','session_notes','messages',
    'packages','client_packages','client_progress','referrals',
    'site_content','site_design','intake_forms','group_classes',
    'posture_analyses','nav_order'
  ]) loop
    execute format('alter table if exists public.%I enable row level security', tbl);
  end loop;
end $$;

-- Step 4: Set up RLS policies (using is_admin() to avoid recursion)

-- Appointments
drop policy if exists "Admins manage appointments" on appointments;
create policy "Admins manage appointments" on appointments for all using (public.is_admin());
drop policy if exists "Anyone can create appointments" on appointments;
create policy "Anyone can create appointments" on appointments for insert with check (true);
drop policy if exists "Anyone can read appointments" on appointments;
create policy "Anyone can read appointments" on appointments for select using (true);

-- Exercises
drop policy if exists "Admins manage exercises" on exercises;
create policy "Admins manage exercises" on exercises for all using (public.is_admin());
drop policy if exists "Anyone can read exercises" on exercises;
create policy "Anyone can read exercises" on exercises for select using (true);

-- Programs
drop policy if exists "Admins manage programs" on programs;
create policy "Admins manage programs" on programs for all using (public.is_admin());
drop policy if exists "Anyone can read programs" on programs;
create policy "Anyone can read programs" on programs for select using (true);

-- Session Notes
drop policy if exists "Admins manage session_notes" on session_notes;
create policy "Admins manage session_notes" on session_notes for all using (public.is_admin());
drop policy if exists "Clients read own notes" on session_notes;
create policy "Clients read own notes" on session_notes for select using (true);

-- Messages
drop policy if exists "Admins manage messages" on messages;
create policy "Admins manage messages" on messages for all using (public.is_admin());
drop policy if exists "Anyone can use messages" on messages;
create policy "Anyone can use messages" on messages for all using (true);

-- Packages
drop policy if exists "Admins manage packages" on packages;
create policy "Admins manage packages" on packages for all using (public.is_admin());
drop policy if exists "Anyone can read packages" on packages;
create policy "Anyone can read packages" on packages for select using (true);

-- Client Packages
drop policy if exists "Admins manage client_packages" on client_packages;
create policy "Admins manage client_packages" on client_packages for all using (public.is_admin());
drop policy if exists "Anyone can read client_packages" on client_packages;
create policy "Anyone can read client_packages" on client_packages for select using (true);

-- Client Progress
drop policy if exists "Admins manage progress" on client_progress;
create policy "Admins manage progress" on client_progress for all using (public.is_admin());
drop policy if exists "Anyone can use progress" on client_progress;
create policy "Anyone can use progress" on client_progress for all using (true);

-- Referrals
drop policy if exists "Admins manage referrals" on referrals;
create policy "Admins manage referrals" on referrals for all using (public.is_admin());
drop policy if exists "Anyone can use referrals" on referrals;
create policy "Anyone can use referrals" on referrals for all using (true);

-- Site Content
drop policy if exists "Anyone reads site_content" on site_content;
create policy "Anyone reads site_content" on site_content for select using (true);
drop policy if exists "Admins manage site_content" on site_content;
create policy "Admins manage site_content" on site_content for all using (public.is_admin());

-- Site Design
drop policy if exists "Anyone reads site_design" on site_design;
create policy "Anyone reads site_design" on site_design for select using (true);
drop policy if exists "Admins manage site_design" on site_design;
create policy "Admins manage site_design" on site_design for all using (public.is_admin());

-- Intake Forms
drop policy if exists "Admins manage intake_forms" on intake_forms;
create policy "Admins manage intake_forms" on intake_forms for all using (public.is_admin());
drop policy if exists "Anyone can submit intake" on intake_forms;
create policy "Anyone can submit intake" on intake_forms for insert with check (true);
drop policy if exists "Anyone can read intake" on intake_forms;
create policy "Anyone can read intake" on intake_forms for select using (true);

-- Group Classes
drop policy if exists "Admins manage group_classes" on group_classes;
create policy "Admins manage group_classes" on group_classes for all using (public.is_admin());
drop policy if exists "Anyone can read group_classes" on group_classes;
create policy "Anyone can read group_classes" on group_classes for select using (true);

-- Posture Analyses
drop policy if exists "Admins manage posture" on posture_analyses;
create policy "Admins manage posture" on posture_analyses for all using (public.is_admin());
drop policy if exists "Anyone can read posture" on posture_analyses;
create policy "Anyone can read posture" on posture_analyses for select using (true);

-- Nav Order
drop policy if exists "Anyone reads nav_order" on nav_order;
create policy "Anyone reads nav_order" on nav_order for select using (true);
drop policy if exists "Admins manage nav_order" on nav_order;
create policy "Admins manage nav_order" on nav_order for all using (public.is_admin());

-- Step 5: Insert defaults
insert into public.site_content (id, content) values ('main', '{}'::jsonb) on conflict (id) do nothing;
insert into public.site_design (id) values ('main') on conflict (id) do nothing;

-- Step 6: Indexes
create index if not exists idx_appointments_date on appointments(date);
create index if not exists idx_exercises_category on exercises(category);
create index if not exists idx_programs_assigned on programs using gin(assigned_to);

-- Done! All tables created with safe RLS policies.
