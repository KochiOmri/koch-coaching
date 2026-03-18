-- ============================================================
-- KOCH Coaching Platform - Full Database Schema
-- ============================================================
-- Run this in the Supabase SQL Editor (supabase.com > SQL Editor)
-- This creates all tables, RLS policies, and indexes.
-- ============================================================

-- ── Profiles (extends Supabase auth.users) ──

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique,
  name text not null default '',
  phone text,
  avatar_url text,
  role text not null default 'client' check (role in ('admin', 'client')),
  bio text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Admins can do anything with profiles"
  on profiles for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url',
    'client'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Appointments ──

create table if not exists public.appointments (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references profiles(id) on delete set null,
  client_name text not null,
  client_email text,
  client_phone text,
  service text not null default 'consultation',
  date date not null,
  time text not null,
  duration integer default 60,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  notes text,
  meet_link text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.appointments enable row level security;

create policy "Admins can manage all appointments"
  on appointments for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Clients can view own appointments"
  on appointments for select using (client_id = auth.uid());

create policy "Clients can create appointments"
  on appointments for insert with check (client_id = auth.uid());

create policy "Anyone can create appointments (booking form)"
  on appointments for insert with check (true);

-- ── Intake Forms ──

create table if not exists public.intake_forms (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references profiles(id) on delete set null,
  name text not null,
  email text,
  phone text,
  age integer,
  gender text,
  occupation text,
  goals text,
  pain_areas text[],
  pain_level integer,
  medical_history text,
  previous_treatment text,
  exercise_frequency text,
  consent boolean default false,
  submitted_at timestamptz default now()
);

alter table public.intake_forms enable row level security;

create policy "Admins can manage intake forms"
  on intake_forms for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Clients can view own intake forms"
  on intake_forms for select using (client_id = auth.uid());

create policy "Anyone can submit intake forms"
  on intake_forms for insert with check (true);

-- ── Programs ──

create table if not exists public.programs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  duration_weeks integer default 4,
  difficulty text default 'intermediate' check (difficulty in ('beginner', 'intermediate', 'advanced')),
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.programs enable row level security;

create policy "Programs viewable by authenticated users"
  on programs for select using (auth.uid() is not null);

create policy "Admins can manage programs"
  on programs for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ── Exercises ──

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

alter table public.exercises enable row level security;

create policy "Exercises viewable by authenticated users"
  on exercises for select using (auth.uid() is not null);

create policy "Admins can manage exercises"
  on exercises for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ── Program Exercises (junction) ──

create table if not exists public.program_exercises (
  id uuid default gen_random_uuid() primary key,
  program_id uuid references programs(id) on delete cascade,
  exercise_id uuid references exercises(id) on delete cascade,
  day_number integer default 1,
  sets integer,
  reps text,
  sort_order integer default 0
);

alter table public.program_exercises enable row level security;

create policy "Viewable by authenticated users"
  on program_exercises for select using (auth.uid() is not null);

create policy "Admins can manage"
  on program_exercises for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ── Client Programs (assignments) ──

create table if not exists public.client_programs (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references profiles(id) on delete cascade,
  program_id uuid references programs(id) on delete cascade,
  assigned_at timestamptz default now(),
  completed_exercises jsonb default '[]'::jsonb,
  status text default 'active' check (status in ('active', 'completed', 'paused'))
);

alter table public.client_programs enable row level security;

create policy "Clients can view own assignments"
  on client_programs for select using (client_id = auth.uid());

create policy "Clients can update own progress"
  on client_programs for update using (client_id = auth.uid());

create policy "Admins can manage"
  on client_programs for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ── Session Notes ──

create table if not exists public.session_notes (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references profiles(id) on delete cascade,
  appointment_id uuid references appointments(id) on delete set null,
  date date not null,
  session_type text default 'in-person',
  notes text,
  pain_score integer,
  homework text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

alter table public.session_notes enable row level security;

create policy "Admins can manage session notes"
  on session_notes for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Clients can view own session notes"
  on session_notes for select using (client_id = auth.uid());

-- ── Client Progress ──

create table if not exists public.client_progress (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references profiles(id) on delete cascade,
  date date not null,
  pain_score integer,
  notes text,
  photo_before_url text,
  photo_after_url text,
  metrics jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.client_progress enable row level security;

create policy "Admins can manage progress"
  on client_progress for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Clients can manage own progress"
  on client_progress for all using (client_id = auth.uid());

-- ── Packages ──

create table if not exists public.packages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  session_count integer not null,
  price decimal(10,2) not null,
  currency text default 'ILS',
  is_active boolean default true,
  stripe_price_id text,
  created_at timestamptz default now()
);

alter table public.packages enable row level security;

create policy "Packages viewable by everyone"
  on packages for select using (true);

create policy "Admins can manage packages"
  on packages for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ── Client Packages ──

create table if not exists public.client_packages (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references profiles(id) on delete cascade,
  package_id uuid references packages(id) on delete set null,
  sessions_used integer default 0,
  sessions_total integer not null,
  status text default 'active' check (status in ('active', 'expired', 'cancelled')),
  stripe_subscription_id text,
  purchased_at timestamptz default now(),
  expires_at timestamptz
);

alter table public.client_packages enable row level security;

create policy "Admins can manage client packages"
  on client_packages for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Clients can view own packages"
  on client_packages for select using (client_id = auth.uid());

-- ── Group Classes ──

create table if not exists public.group_classes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  instructor text,
  day_of_week text,
  time text,
  duration_minutes integer default 60,
  max_participants integer default 10,
  location text,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.group_classes enable row level security;

create policy "Group classes viewable by everyone"
  on group_classes for select using (true);

create policy "Admins can manage group classes"
  on group_classes for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ── Group Class Participants ──

create table if not exists public.group_class_participants (
  id uuid default gen_random_uuid() primary key,
  class_id uuid references group_classes(id) on delete cascade,
  client_id uuid references profiles(id) on delete cascade,
  status text default 'enrolled' check (status in ('enrolled', 'waitlisted', 'cancelled')),
  joined_at timestamptz default now(),
  unique(class_id, client_id)
);

alter table public.group_class_participants enable row level security;

create policy "Admins can manage participants"
  on group_class_participants for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Clients can manage own participation"
  on group_class_participants for all using (client_id = auth.uid());

-- ── Posture Analyses ──

create table if not exists public.posture_analyses (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references profiles(id) on delete cascade,
  view_type text default 'front' check (view_type in ('front', 'side', 'both')),
  measurements jsonb not null default '{}'::jsonb,
  details jsonb not null default '[]'::jsonb,
  landmarks jsonb,
  image_url text,
  image_width integer,
  image_height integer,
  overall_score integer,
  clinical_summary text,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

alter table public.posture_analyses enable row level security;

create policy "Admins can manage posture analyses"
  on posture_analyses for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Clients can view own analyses"
  on posture_analyses for select using (client_id = auth.uid());

-- ── Referrals ──

create table if not exists public.referrals (
  id uuid default gen_random_uuid() primary key,
  referrer_id uuid references profiles(id) on delete cascade,
  referral_code text unique not null,
  referred_name text,
  referred_email text,
  status text default 'pending' check (status in ('pending', 'converted', 'rewarded')),
  reward_type text,
  created_at timestamptz default now(),
  converted_at timestamptz
);

alter table public.referrals enable row level security;

create policy "Admins can manage referrals"
  on referrals for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Clients can view own referrals"
  on referrals for select using (referrer_id = auth.uid());

create policy "Anyone can create referrals"
  on referrals for insert with check (true);

-- ── Newsletter Subscribers ──

create table if not exists public.newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text,
  subscribed_at timestamptz default now(),
  is_active boolean default true
);

alter table public.newsletter_subscribers enable row level security;

create policy "Admins can manage subscribers"
  on newsletter_subscribers for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Anyone can subscribe"
  on newsletter_subscribers for insert with check (true);

-- ── Messages (Coach/Client Chat) ──

create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references profiles(id) on delete cascade,
  receiver_id uuid references profiles(id) on delete cascade,
  content text not null,
  is_read boolean default false,
  attachment_url text,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

create policy "Users can view own messages"
  on messages for select using (
    sender_id = auth.uid() or receiver_id = auth.uid()
  );

create policy "Users can send messages"
  on messages for insert with check (sender_id = auth.uid());

create policy "Users can mark own received messages as read"
  on messages for update using (receiver_id = auth.uid());

create policy "Admins can view all messages"
  on messages for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ── Site Content (CMS) ──

create table if not exists public.site_content (
  id text primary key default 'main',
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now(),
  updated_by uuid references profiles(id)
);

alter table public.site_content enable row level security;

create policy "Site content viewable by everyone"
  on site_content for select using (true);

create policy "Admins can update site content"
  on site_content for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ── Site Design (Visual Editor) ──

create table if not exists public.site_design (
  id text primary key default 'main',
  theme_mode text default 'dark' check (theme_mode in ('dark', 'light')),
  primary_color text default '#d4a843',
  accent_color text default '#d4a843',
  background_color text default '#0a0a0a',
  font_heading text default 'Outfit',
  font_body text default 'Inter',
  hero_style text default 'video',
  hero_overlay_opacity decimal default 0.6,
  sections_visible jsonb default '{"hero":true,"about":true,"videoShowcase":true,"methodology":true,"services":true,"method":true,"results":true,"booking":true}'::jsonb,
  custom_css text,
  updated_at timestamptz default now(),
  updated_by uuid references profiles(id)
);

alter table public.site_design enable row level security;

create policy "Site design viewable by everyone"
  on site_design for select using (true);

create policy "Admins can update site design"
  on site_design for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ── Video Config ──

create table if not exists public.video_config (
  id text primary key default 'main',
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table public.video_config enable row level security;

create policy "Video config viewable by everyone"
  on video_config for select using (true);

create policy "Admins can update video config"
  on video_config for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ── WhatsApp Templates ──

create table if not exists public.whatsapp_templates (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  template text not null,
  category text default 'general',
  created_at timestamptz default now()
);

alter table public.whatsapp_templates enable row level security;

create policy "Admins can manage templates"
  on whatsapp_templates for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ── Payments (Stripe) ──

create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references profiles(id) on delete set null,
  package_id uuid references packages(id) on delete set null,
  amount decimal(10,2) not null,
  currency text default 'ILS',
  status text default 'pending' check (status in ('pending', 'succeeded', 'failed', 'refunded')),
  stripe_payment_id text unique,
  stripe_invoice_url text,
  description text,
  created_at timestamptz default now()
);

alter table public.payments enable row level security;

create policy "Admins can manage payments"
  on payments for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Clients can view own payments"
  on payments for select using (client_id = auth.uid());

-- ── Availability (Coach schedule) ──

create table if not exists public.availability (
  id uuid default gen_random_uuid() primary key,
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time text not null,
  end_time text not null,
  is_active boolean default true
);

alter table public.availability enable row level security;

create policy "Availability viewable by everyone"
  on availability for select using (true);

create policy "Admins can manage availability"
  on availability for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ── Indexes for performance ──

create index if not exists idx_appointments_date on appointments(date);
create index if not exists idx_appointments_client on appointments(client_id);
create index if not exists idx_session_notes_client on session_notes(client_id);
create index if not exists idx_client_progress_client on client_progress(client_id);
create index if not exists idx_messages_sender on messages(sender_id);
create index if not exists idx_messages_receiver on messages(receiver_id);
create index if not exists idx_messages_created on messages(created_at);
create index if not exists idx_posture_analyses_client on posture_analyses(client_id);
create index if not exists idx_referrals_code on referrals(referral_code);
create index if not exists idx_payments_client on payments(client_id);

-- ── Enable Realtime for messages ──

alter publication supabase_realtime add table messages;

-- ── Insert default data ──

insert into public.site_content (id, content) values ('main', '{}'::jsonb)
  on conflict (id) do nothing;

insert into public.site_design (id) values ('main')
  on conflict (id) do nothing;

insert into public.video_config (id, config) values ('main', '{}'::jsonb)
  on conflict (id) do nothing;
