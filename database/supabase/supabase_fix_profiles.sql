-- ============================================================
-- FILORA LUXE — PROFILE FIX SCRIPT
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Step 1: Create profiles for any auth users that don't have one yet
-- (This fixes users who registered before the schema/trigger was set up)
INSERT INTO public.profiles (id, email, name, role)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)) AS name,
  'admin' AS role  -- everyone gets admin for testing, change to 'user' in production
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL  -- only insert where profile is missing
ON CONFLICT (id) DO NOTHING;

-- Step 2: Verify profiles were created
SELECT id, email, name, role, created_at FROM profiles;
