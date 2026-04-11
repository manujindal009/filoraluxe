-- SQL MIGRATION: ADD PHONE NUMBER SUPPORT
-- Paste this into your Supabase SQL Editor and hit "Run"

-- 1. Add phone columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.custom_orders ADD COLUMN IF NOT EXISTS phone text;

-- 2. Update the profile creation function to capture phone number during signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, phone, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone',
    'user' -- Making newcomers 'user' by default now that testing is maturing
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Note: If you want to keep making everyone admin for testing, change 'user' to 'admin' above.
