-- ORDER VISIBILITY & RLS REFINEMENT
-- Paste this script into your Supabase SQL Editor and run it.

-- 1. Ensure RLS is enabled
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own orders." ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders." ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders." ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders." ON public.orders;

DROP POLICY IF EXISTS "Users can view their own order items." ON public.order_items;
DROP POLICY IF EXISTS "Admins can view all order items." ON public.order_items;
DROP POLICY IF EXISTS "Users can insert order items." ON public.order_items;

-- 3. robust Order Policies
-- Allows users to select orders where their ID matches
CREATE POLICY "Users can view their own orders." 
ON public.orders FOR SELECT 
USING (auth.uid() = user_id);

-- Allows admins to see everything
CREATE POLICY "Admins can view all orders." 
ON public.orders FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Allows authenticated users to insert orders (This check is safe as long as user_id matches their session)
CREATE POLICY "Users can insert their own orders." 
ON public.orders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allows admins to update status
CREATE POLICY "Admins can update orders." 
ON public.orders FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 4. Order Item Policies
-- Linking order_items visibility to the order owner
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

-- 5. BACKWARD FIX (Cleanup)
-- If there are any orders where user_id is null, you might want to link them to an existing user 
-- or delete them if they are test data.
-- Replace 'YOUR_USER_ID_HERE' with your real user ID if you want to recover missing orders.
/*
UPDATE public.orders 
SET user_id = 'YOUR_USER_ID_HERE' 
WHERE user_id IS NULL;
*/

-- 6. Grant sequence permissions just in case
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
