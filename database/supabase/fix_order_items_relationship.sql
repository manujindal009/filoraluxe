-- FIX: PGRST200 Missing Relationship & Type Mismatch (UUID vs TEXT)
-- Run this in your Supabase SQL Editor

-- 1. Drop existing constraint if it exists
ALTER TABLE public.order_items
DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

-- 2. Convert product_id from TEXT to UUID (CRITICAL)
-- This assumes all current values in product_id are valid UUID strings.
ALTER TABLE public.order_items 
ALTER COLUMN product_id TYPE uuid USING product_id::uuid;

-- 3. Create the Foreign Key Constraint
ALTER TABLE public.order_items
ADD CONSTRAINT order_items_product_id_fkey
FOREIGN KEY (product_id)
REFERENCES public.products(id)
ON DELETE CASCADE;

-- 4. Verify and Cleanup (Optional)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.order_items TO service_role;
GRANT ALL ON public.products TO service_role;
