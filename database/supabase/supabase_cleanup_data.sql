-- ============================================================
-- FILORA LUXE — CLEAN SLATE SCRIPT (FIXED)
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Step 1: Clear the product catalog
-- This will remove all sample products we added earlier.
-- Using TRUNCATE CASCADE to handle any internal links safely.
TRUNCATE TABLE public.products CASCADE;

-- Step 2: Clear sales & customer data
-- Resets your orders and stats to zero.
TRUNCATE TABLE public.order_items CASCADE;
TRUNCATE TABLE public.orders CASCADE;

-- Step 3: Clear Marketing
-- Removes all sample coupons except WELCOME10.
-- Since there is no 'reviews' table yet, we skip it.
DELETE FROM public.coupons WHERE code != 'WELCOME10';

-- Step 4: Verify the cleanup
SELECT count(*) as product_count FROM public.products;
SELECT count(*) as category_count FROM public.categories;
SELECT code, used_count FROM public.coupons;
