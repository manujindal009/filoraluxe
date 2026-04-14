-- ============================================================
-- FILORA LUXE — ADMIN ROLE FIX
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Update the trigger so only specific emails get admin role
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    CASE 
      WHEN new.email IN ('filoraluxe@yahoo.com', 'manu.jindal2107@gmail.com') THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also update existing profiles for these two admin emails
UPDATE profiles SET role = 'admin'
WHERE email IN ('filoraluxe@yahoo.com', 'manu.jindal2107@gmail.com');

-- And make all other existing profiles regular users
UPDATE profiles SET role = 'user'
WHERE email NOT IN ('filoraluxe@yahoo.com', 'manu.jindal2107@gmail.com');

-- Verify
SELECT email, role FROM profiles ORDER BY role DESC;
