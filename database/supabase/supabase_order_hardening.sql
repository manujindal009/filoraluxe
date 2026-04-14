-- ORDER VISIBILITY HARDENING & DATA REPAIR
-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. ENABLE EXTENSIONS (If not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. DATA REPAIR: Link Orphaned Orders by Email
-- Many times orders are "orphaned" because the user_id was null but the email was captured.
-- This script tries to find the correct user by matching the email in shipping_address.
UPDATE public.orders
SET user_id = p.id
FROM public.profiles p
WHERE orders.user_id IS NULL
AND (orders.shipping_address->>'email') = p.email;

-- 3. SCHEMA HARDENING: Enforce NOT NULL and FK
-- This ensures every order MUST belong to a valid user.
ALTER TABLE public.orders 
ALTER COLUMN user_id SET NOT NULL;

-- 4. REFRESH RLS POLICIES (Simplified & Robust)
-- First, drop all existing order-related policies
DROP POLICY IF EXISTS "Users can view their own orders." ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders." ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders." ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders." ON public.orders;

-- SELECT: Standard secure ownership check
CREATE POLICY "Users can view their own orders." 
ON public.orders FOR SELECT 
USING (auth.uid() = user_id);

-- ADMIN SELECT: Clean role-based check
CREATE POLICY "Admins can view all orders." 
ON public.orders FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- INSERT: Enforce that the user can only insert orders for themselves
CREATE POLICY "Users can insert their own orders." 
ON public.orders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- ADMIN UPDATE: Allow status updates
CREATE POLICY "Admins can update orders." 
ON public.orders FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 5. REFRESH ORDER_ITEMS POLICIES
DROP POLICY IF EXISTS "Users can view their own order items." ON public.order_items;
DROP POLICY IF EXISTS "Admins can view all order items." ON public.order_items;
DROP POLICY IF EXISTS "Users can insert order items." ON public.order_items;

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

CREATE POLICY "Users can insert order items." 
ON public.order_items FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  )
);

-- 6. Grant Permissions
GRANT ALL ON public.orders TO service_role;
GRANT ALL ON public.order_items TO service_role;
