-- AUTH SYSTEM UPGRADE
-- Run this in your Supabase SQL Editor

-- 1. Add phone column to profiles if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='phone') THEN
        ALTER TABLE public.profiles ADD COLUMN phone text;
    END IF;
END $$;

-- 2. Update the new user handler function
-- This version: 
-- - Defaults role to 'user'
-- - Captures 'phone' from metadata
-- - Cleans up metadata extraction
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, phone, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone',
    'user' -- DEFAULT TO USER FOR PRODUCTION
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-enable the trigger (it might already exist, so we drop/create to be safe)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Safety: Fix any existing users who might be missing profiles
INSERT INTO public.profiles (id, email, name, role)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)), 'user'
FROM auth.users
ON CONFLICT (id) DO NOTHING;
