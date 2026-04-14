-- SQL Extensions for Coupons & Affiliates
-- Paste this script directly into your Supabase SQL Editor and hit "Run"

-- 1. Create the Coupons Table
CREATE TABLE coupons (
  id uuid default extensions.uuid_generate_v4() primary key,
  code text unique not null,
  discount_percentage numeric not null check (discount_percentage > 0 and discount_percentage <= 100),
  owner_name text not null,
  expiry_date timestamp with time zone not null,
  max_usage integer not null default 1,
  used_count integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Coupons
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Allow public to select valid coupons (useful for checkout validation)
CREATE POLICY "Public can select active coupons." 
  on coupons for select using (true);

-- Allow admins to mutate coupons
CREATE POLICY "Admins can insert coupons." on coupons for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
CREATE POLICY "Admins can update coupons." on coupons for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
CREATE POLICY "Admins can delete coupons." on coupons for delete using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- 2. Modify the Orders Table 
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS coupon_code text references coupons(code) on delete set null,
ADD COLUMN IF NOT EXISTS discount_amount numeric default 0,
ADD COLUMN IF NOT EXISTS final_amount numeric,
ADD COLUMN IF NOT EXISTS coupon_owner text;

-- 3. Create RPC Function to safely increment usage securely
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_code text)
RETURNS void AS $$
BEGIN
  UPDATE coupons
  SET used_count = used_count + 1
  WHERE code = coupon_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- DEMO SEED: Insert a default test coupon
INSERT INTO coupons (code, discount_percentage, owner_name, expiry_date, max_usage, used_count)
VALUES ('FILORA20', 20.00, 'jane_influencer', '2030-12-31 23:59:59', 100, 0);
