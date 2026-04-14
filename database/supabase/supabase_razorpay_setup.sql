-- RAZORPAY & OAUTH UPDATES
-- Run this in your Supabase SQL Editor

-- 1. Add Razorpay specific tracking columns to orders
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='razorpay_order_id') THEN
        ALTER TABLE public.orders ADD COLUMN razorpay_order_id text;
        ALTER TABLE public.orders ADD COLUMN razorpay_payment_id text;
        ALTER TABLE public.orders ADD COLUMN razorpay_signature text;
    END IF;
END $$;

-- 2. Ensure payment_method allows 'razorpay'
DO $$ 
BEGIN
    -- This is just a safety check if you have an enum or check constraint
    -- If your check constraint doesn't include razorpay, we update it
    ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
    ALTER TABLE public.orders ADD CONSTRAINT orders_payment_method_check 
    CHECK (payment_method IN ('credit_card', 'cod', 'upi', 'razorpay'));
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
