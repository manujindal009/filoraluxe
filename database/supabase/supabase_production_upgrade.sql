-- FILORA LUXE PRODUCTION UPGRADE SQL
-- Paste this script into your Supabase SQL Editor and hit "Run"

-- 1. Update Custom Orders table
ALTER TABLE public.custom_orders ADD COLUMN IF NOT EXISTS image_url text;

-- 2. Update Orders table with Indian delivery, gift, and payment fields
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_gift boolean DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS gift_message text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS recipient_name text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_for_someone_else boolean DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS recipient_phone text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method text CHECK (payment_method IN ('credit_card', 'cod', 'upi')) DEFAULT 'credit_card';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS upi_screenshot_url text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS utr_number text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_charge numeric DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS gst_amount numeric DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS gift_wrap_charge numeric DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pincode text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS state text;

-- 3. Update Profiles table
-- We keep phone optional at the DB level to prevent errors with existing users,
-- but the App UI will enforce it for all new signups.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;

-- 4. Row Level Security Updates
-- Ensure storage bucket permissions are handled separately in the Supabase UI 
-- (Policies -> Storage -> Create policies for public access).

-- 5. Helper function for Order confirmation screen (optional, if we need unique order numbering)
-- (We are already using 'ORD-' prefix in our API)
