-- Run once in Supabase SQL Editor if email sign-up works but the app cannot create a profile row
-- (e.g. trigger missing). Lets authenticated users insert only their own profile row.

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);
