-- SUPABASE INVOICE / BILLING MANAGEMENT SCHEMAS & POLICIES
-- Run this in your Supabase SQL Editor to establish database storage for Filora Luxe Invoices

-- 1. Create Invoice Settings Table
CREATE TABLE IF NOT EXISTS invoice_settings (
  id text PRIMARY KEY DEFAULT 'default',
  business jsonb NOT NULL,
  defaults jsonb NOT NULL,
  appearance jsonb NOT NULL,
  visibility jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on invoice_settings
ALTER TABLE invoice_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on invoice_settings" ON invoice_settings
  FOR SELECT USING (true);

CREATE POLICY "Allow admin write on invoice_settings" ON invoice_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 2. Create Invoices Sequence Table for Atomic Counter
CREATE TABLE IF NOT EXISTS invoice_sequences (
  key text PRIMARY KEY,
  current_val integer NOT NULL DEFAULT 0
);

INSERT INTO invoice_sequences (key, current_val)
VALUES ('invoice_num', 0)
ON CONFLICT (key) DO NOTHING;

-- Function to safely fetch and increment sequential invoice numbers
CREATE OR REPLACE FUNCTION get_next_invoice_number(p_prefix text DEFAULT 'INV-')
RETURNS text AS $$
DECLARE
  v_next_val integer;
  v_result text;
BEGIN
  UPDATE invoice_sequences
  SET current_val = current_val + 1
  WHERE key = 'invoice_num'
  RETURNING current_val INTO v_next_val;
  
  -- Format with 4 padded zeros: INV-0001
  v_result := p_prefix || lpad(v_next_val::text, 4, '0');
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Create Main Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id text PRIMARY KEY,
  invoice_number text UNIQUE NOT NULL,
  order_id text,
  order_number text,
  status text CHECK (status IN ('draft', 'pending', 'paid', 'partially_paid', 'refunded', 'cancelled')) NOT NULL DEFAULT 'draft',
  invoice_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  
  customer jsonb NOT NULL,
  business jsonb NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  
  subtotal numeric NOT NULL DEFAULT 0,
  discount numeric NOT NULL DEFAULT 0,
  shipping numeric NOT NULL DEFAULT 0,
  tax_enabled boolean NOT NULL DEFAULT false,
  tax_rate numeric NOT NULL DEFAULT 0,
  tax numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  
  payment jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  
  visibility_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  share_token text UNIQUE DEFAULT extensions.uuid_generate_v4()::text,
  
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  finalized_at timestamp with time zone
);

-- Indexes for lightning fast searching and filtering
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_share_token ON invoices(share_token);

-- RLS Policies for Invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Admins full access
CREATE POLICY "Admins have full access to invoices" ON invoices
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Customers can view specific invoice via share token or linked user order
CREATE POLICY "Public/Customers can view invoice via share token" ON invoices
  FOR SELECT USING (
    share_token IS NOT NULL
  );

-- Insert Default Invoice Settings if table is empty
INSERT INTO invoice_settings (id, business, defaults, appearance, visibility)
VALUES (
  'default',
  '{
    "name": "Filora Luxe",
    "tagline": "HANDMADE LUXURY CROCHET",
    "address": "Handcrafted with ♥ in India",
    "cityStatePin": "New Delhi, India",
    "email": "filoraluxe@yahoo.com",
    "phone": "+91 98765 43210",
    "website": "filoraluxe.in",
    "instagram": "@filora.luxe",
    "gstin": ""
  }'::jsonb,
  '{
    "invoicePrefix": "INV-",
    "orderPrefix": "FL-",
    "startingNumber": 1,
    "defaultPaymentMethod": "upi",
    "defaultPaymentStatus": "pending",
    "defaultNotes": "Thank you for supporting small handmade luxury business!",
    "defaultTaxEnabled": false,
    "defaultTaxRate": 0
  }'::jsonb,
  '{
    "primaryColor": "#581c87",
    "secondaryColor": "#faf9f7",
    "fontFamily": "Playfair Display, serif",
    "logoUrl": "/logo.png",
    "footerText": "Thank you for choosing handmade. ♡\nEvery Filora Luxe piece is handcrafted, so small variations are part of what makes your piece unique.",
    "careInstructions": "Hand wash gently • Dry flat • Reshape while damp • Do not wring"
  }'::jsonb,
  '{
    "showGst": false,
    "showDiscount": true,
    "showShipping": true,
    "showCustomerPhone": true,
    "showCustomerEmail": true,
    "showCustomerGstin": false,
    "showNotes": true,
    "showPaymentRef": true,
    "showDueDate": true,
    "showCareInstructions": true
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;
