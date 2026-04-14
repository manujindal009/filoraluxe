-- FINAL "NUCLEAR" RLS RESET FOR FILORA LUXE
-- Paste this into Supabase SQL Editor and run it.

-- 1. Disable and Re-enable RLS (Clean Slate)
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 2. Drop EVERY existing policy to ensure no conflicts
DROP POLICY IF EXISTS "Users can view their own orders." ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders." ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders." ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders." ON public.orders;
DROP POLICY IF EXISTS "Users can view their own order items." ON public.order_items;
DROP POLICY IF EXISTS "Admins can view all order items." ON public.order_items;
DROP POLICY IF EXISTS "Users can insert order items." ON public.order_items;

-- 3. Simplified Order Policies
-- Allow anyone to see an order if they are the owner OR an admin
CREATE POLICY "Order Visibility" 
ON public.orders FOR SELECT 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Allow authenticated users to create orders
CREATE POLICY "Order Creation" 
ON public.orders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow admins to update orders (status)
CREATE POLICY "Order Admin Updates" 
ON public.orders FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 4. Simplified Order Items Policies
-- IMPORTANT: We simplify this to rely on the parent order's visibility
CREATE POLICY "Order Item Visibility" 
ON public.order_items FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id
  )
);

-- Allow insertion of items if you own the order
CREATE POLICY "Order Item Creation" 
ON public.order_items FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  )
);

-- 5. Final Permission Grants
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT ON public.orders TO authenticated;
GRANT INSERT ON public.order_items TO authenticated;
