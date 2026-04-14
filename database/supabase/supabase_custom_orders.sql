-- SQL SCRIPT FOR CUSTOM ORDERS TABLE
-- Paste this into your Supabase SQL Editor and run it.

-- 1. Create Custom Orders table
CREATE TABLE IF NOT EXISTS public.custom_orders (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  description text NOT NULL,
  budget text NOT NULL,
  timeline text NOT NULL,
  status text CHECK (status IN ('pending', 'reviewed', 'quoted', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Turn on RLS
ALTER TABLE public.custom_orders ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- Anyone (Guests) can insert a custom order request
DROP POLICY IF EXISTS "Anyone can submit custom orders" ON public.custom_orders;
CREATE POLICY "Anyone can submit custom orders" ON public.custom_orders 
  FOR INSERT WITH CHECK (true);

-- Only admins can view custom orders
-- (Assuming is_admin() helper already exists from previous steps, otherwise we use the subquery)
DROP POLICY IF EXISTS "Admins can view custom orders" ON public.custom_orders;
CREATE POLICY "Admins can view custom orders" ON public.custom_orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update custom orders
DROP POLICY IF EXISTS "Admins can update custom orders" ON public.custom_orders;
CREATE POLICY "Admins can update custom orders" ON public.custom_orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete custom orders (optional cleanup)
DROP POLICY IF EXISTS "Admins can delete custom orders" ON public.custom_orders;
CREATE POLICY "Admins can delete custom orders" ON public.custom_orders
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
