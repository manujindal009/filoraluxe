-- ============================================================
-- FILORA LUXE — PROFILE BACKFILL & TRIGGER SYNC
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Update the trigger function (same as in latest schema)
-- This ensures future signups work perfectly
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(
      new.raw_user_meta_data->>'full_name', 
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    CASE 
      WHEN new.email IN ('filoraluxe@yahoo.com', 'manu.jindal2107@gmail.com') THEN 'admin'
      ELSE 'user'
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(profiles.name, EXCLUDED.name);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Backfill missing profiles
-- This finds anyone in auth.users who doesn't have a profile and creates one
INSERT INTO public.profiles (id, email, name, role)
SELECT 
  id, 
  email, 
  COALESCE(
    raw_user_meta_data->>'full_name', 
    raw_user_meta_data->>'name',
    split_part(email, '@', 1)
  ),
  CASE 
    WHEN email IN ('filoraluxe@yahoo.com', 'manu.jindal2107@gmail.com') THEN 'admin'
    ELSE 'user'
  END
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 3. Verify counts
SELECT role, count(*) FROM public.profiles GROUP BY role;
