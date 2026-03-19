-- ============================================================
-- FIX: Infinite recursion in ALL RLS policies
-- ============================================================
-- Safe to run multiple times. Only touches tables that exist.
-- ============================================================

-- Ensure is_admin() exists
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- Fix profiles table
drop policy if exists "Admins can do anything with profiles" on profiles;
create policy "Admins can do anything with profiles"
  on profiles for all using (public.is_admin());

drop policy if exists "Users can read own profile" on profiles;
create policy "Users can read own profile"
  on profiles for select using (auth.uid() = id);

-- Fix appointments table
do $$ begin
  if exists (select 1 from pg_tables where tablename = 'appointments' and schemaname = 'public') then
    execute 'drop policy if exists "Admins can do anything with appointments" on appointments';
    execute 'create policy "Admins can do anything with appointments" on appointments for all using (public.is_admin())';
    execute 'drop policy if exists "Clients can read own appointments" on appointments';
    execute 'create policy "Clients can read own appointments" on appointments for select using (auth.uid()::text = client_id or public.is_admin())';
  end if;
end $$;

-- Fix session_notes table
do $$ begin
  if exists (select 1 from pg_tables where tablename = 'session_notes' and schemaname = 'public') then
    execute 'drop policy if exists "Admins can do anything with session_notes" on session_notes';
    execute 'create policy "Admins can do anything with session_notes" on session_notes for all using (public.is_admin())';
    execute 'drop policy if exists "Clients can read own session_notes" on session_notes';
    execute 'create policy "Clients can read own session_notes" on session_notes for select using (auth.uid()::text = client_id or public.is_admin())';
  end if;
end $$;

-- Fix messages table
do $$ begin
  if exists (select 1 from pg_tables where tablename = 'messages' and schemaname = 'public') then
    execute 'drop policy if exists "Admins can do anything with messages" on messages';
    execute 'create policy "Admins can do anything with messages" on messages for all using (public.is_admin())';
    execute 'drop policy if exists "Users can access own messages" on messages';
    execute 'create policy "Users can access own messages" on messages for all using (auth.uid()::text = sender_id or auth.uid()::text = receiver_id or public.is_admin())';
  end if;
end $$;

-- Fix referrals table
do $$ begin
  if exists (select 1 from pg_tables where tablename = 'referrals' and schemaname = 'public') then
    execute 'drop policy if exists "Admins can do anything with referrals" on referrals';
    execute 'create policy "Admins can do anything with referrals" on referrals for all using (public.is_admin())';
  end if;
end $$;

-- Fix exercises table
do $$ begin
  if exists (select 1 from pg_tables where tablename = 'exercises' and schemaname = 'public') then
    execute 'drop policy if exists "Admins can do anything with exercises" on exercises';
    execute 'create policy "Admins can do anything with exercises" on exercises for all using (public.is_admin())';
    execute 'drop policy if exists "Anyone can read exercises" on exercises';
    execute 'create policy "Anyone can read exercises" on exercises for select using (true)';
  end if;
end $$;

-- Fix programs table
do $$ begin
  if exists (select 1 from pg_tables where tablename = 'programs' and schemaname = 'public') then
    execute 'drop policy if exists "Admins can do anything with programs" on programs';
    execute 'create policy "Admins can do anything with programs" on programs for all using (public.is_admin())';
    execute 'drop policy if exists "Anyone can read programs" on programs';
    execute 'create policy "Anyone can read programs" on programs for select using (true)';
  end if;
end $$;

-- Fix packages table
do $$ begin
  if exists (select 1 from pg_tables where tablename = 'packages' and schemaname = 'public') then
    execute 'drop policy if exists "Admins can do anything with packages" on packages';
    execute 'create policy "Admins can do anything with packages" on packages for all using (public.is_admin())';
    execute 'drop policy if exists "Anyone can read packages" on packages';
    execute 'create policy "Anyone can read packages" on packages for select using (true)';
  end if;
end $$;

-- Fix client_packages table
do $$ begin
  if exists (select 1 from pg_tables where tablename = 'client_packages' and schemaname = 'public') then
    execute 'drop policy if exists "Admins can do anything with client_packages" on client_packages';
    execute 'create policy "Admins can do anything with client_packages" on client_packages for all using (public.is_admin())';
  end if;
end $$;

-- Fix posture_analyses table
do $$ begin
  if exists (select 1 from pg_tables where tablename = 'posture_analyses' and schemaname = 'public') then
    execute 'drop policy if exists "Admins can do anything with posture_analyses" on posture_analyses';
    execute 'create policy "Admins can do anything with posture_analyses" on posture_analyses for all using (public.is_admin())';
  end if;
end $$;

-- Fix intake_forms table
do $$ begin
  if exists (select 1 from pg_tables where tablename = 'intake_forms' and schemaname = 'public') then
    execute 'drop policy if exists "Admins can do anything with intake_forms" on intake_forms';
    execute 'create policy "Admins can do anything with intake_forms" on intake_forms for all using (public.is_admin())';
  end if;
end $$;

-- Fix group_classes table
do $$ begin
  if exists (select 1 from pg_tables where tablename = 'group_classes' and schemaname = 'public') then
    execute 'drop policy if exists "Admins can do anything with group_classes" on group_classes';
    execute 'create policy "Admins can do anything with group_classes" on group_classes for all using (public.is_admin())';
    execute 'drop policy if exists "Anyone can read group_classes" on group_classes';
    execute 'create policy "Anyone can read group_classes" on group_classes for select using (true)';
  end if;
end $$;

-- Fix site_content table
do $$ begin
  if exists (select 1 from pg_tables where tablename = 'site_content' and schemaname = 'public') then
    execute 'drop policy if exists "Admins can do anything with site_content" on site_content';
    execute 'create policy "Admins can do anything with site_content" on site_content for all using (public.is_admin())';
    execute 'drop policy if exists "Anyone can read site_content" on site_content';
    execute 'create policy "Anyone can read site_content" on site_content for select using (true)';
  end if;
end $$;

-- Fix site_design table
do $$ begin
  if exists (select 1 from pg_tables where tablename = 'site_design' and schemaname = 'public') then
    execute 'drop policy if exists "Admins can do anything with site_design" on site_design';
    execute 'create policy "Admins can do anything with site_design" on site_design for all using (public.is_admin())';
    execute 'drop policy if exists "Anyone can read site_design" on site_design';
    execute 'create policy "Anyone can read site_design" on site_design for select using (true)';
  end if;
end $$;

-- Fix clients table
do $$ begin
  if exists (select 1 from pg_tables where tablename = 'clients' and schemaname = 'public') then
    execute 'drop policy if exists "Admins can do anything with clients" on clients';
    execute 'create policy "Admins can do anything with clients" on clients for all using (public.is_admin())';
  end if;
end $$;
