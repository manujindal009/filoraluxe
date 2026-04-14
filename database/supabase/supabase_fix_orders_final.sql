-- FINAL ORDER VISIBILITY & ROLE SECURITY FIX
-- Run this in your Supabase SQL Editor

-- 1. DATA REPAIR: Link any orphaned orders (where user_id is null) by matching email
UPDATE public.orders
SET user_id = p.id
FROM public.profiles p
WHERE orders.user_id IS NULL
AND (orders.shipping_address->>'email') = p.email;

-- 2. REFRESH PROFILE ROLES
-- If you want to demote everyone who was accidentally made an admin:
-- UPDATE public.profiles SET role = 'user' WHERE role = 'admin' AND email NOT IN ('your-admin-email@example.com');

-- 3. REFRESH RLS POLICIES FOR ORDERS
DROP POLICY IF EXISTS "Users can view their own orders." ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders." ON public.orders;

CREATE POLICY "Users can view their own orders." 
ON public.orders FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders." 
ON public.orders FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 4. REFRESH RLS POLICIES FOR ORDER_ITEMS
DROP POLICY IF EXISTS "Users can view their own order items." ON public.order_items;
DROP POLICY IF EXISTS "Admins can view all order items." ON public.order_items;

CREATE POLICY "Users can view their own order items." 
ON public.order_items FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all order items." 
ON public.order_items FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 5. FINAL TRIGGER FIX (In case schema.sql wasn't run)
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'user' -- DEFAULT TO USER ROLE
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
