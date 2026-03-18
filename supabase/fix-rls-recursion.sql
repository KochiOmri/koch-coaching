-- ============================================================
-- FIX: Infinite recursion in profiles RLS policy
-- ============================================================
-- The "Admins can do anything with profiles" policy queries the
-- profiles table itself, causing infinite recursion. This script
-- creates a SECURITY DEFINER function that bypasses RLS to check
-- the admin role, then replaces the broken policy.
-- ============================================================

-- Step 1: Create a helper function that bypasses RLS
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- Step 2: Drop the broken recursive policy on profiles
drop policy if exists "Admins can do anything with profiles" on profiles;

-- Step 3: Recreate it using the safe function
create policy "Admins can do anything with profiles"
  on profiles for all using (public.is_admin());

-- Done! The is_admin() function runs with SECURITY DEFINER,
-- meaning it bypasses RLS when checking the profiles table,
-- breaking the infinite recursion cycle.
