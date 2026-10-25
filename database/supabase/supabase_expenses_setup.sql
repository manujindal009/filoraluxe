-- SUPABASE BUSINESS EXPENSES MANAGEMENT SCHEMAS & POLICIES
-- Run this in your Supabase SQL Editor to establish database storage for Filora Luxe Business Expenses

-- 1. Create Expense Settings Table
CREATE TABLE IF NOT EXISTS expense_settings (
  id text PRIMARY KEY DEFAULT 'default',
  prefix text NOT NULL DEFAULT 'EXP-',
  starting_number integer NOT NULL DEFAULT 1,
  monthly_budget numeric NOT NULL DEFAULT 50000,
  default_payment_method text NOT NULL DEFAULT 'upi',
  default_payment_status text NOT NULL DEFAULT 'paid',
  default_category text NOT NULL DEFAULT 'raw_materials',
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on expense_settings
ALTER TABLE expense_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on expense_settings" ON expense_settings
  FOR SELECT USING (true);

CREATE POLICY "Allow admin full access on expense_settings" ON expense_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 2. Create Expenses Sequence Table for Atomic Sequential ID
CREATE TABLE IF NOT EXISTS expense_sequences (
  key text PRIMARY KEY,
  current_val integer NOT NULL DEFAULT 0
);

INSERT INTO expense_sequences (key, current_val)
VALUES ('expense_num', 0)
ON CONFLICT (key) DO NOTHING;

-- Function to safely fetch and increment sequential expense numbers
CREATE OR REPLACE FUNCTION get_next_expense_number(p_prefix text DEFAULT 'EXP-')
RETURNS text AS $$
DECLARE
  v_next_val integer;
  v_result text;
BEGIN
  UPDATE expense_sequences
  SET current_val = current_val + 1
  WHERE key = 'expense_num'
  RETURNING current_val INTO v_next_val;
  
  -- Format with 4 padded zeros: EXP-0001
  v_result := p_prefix || lpad(v_next_val::text, 4, '0');
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Create Main Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id text PRIMARY KEY,
  expense_number text UNIQUE NOT NULL,
  title text NOT NULL,
  category text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  
  subtotal numeric NOT NULL DEFAULT 0,
  tax_enabled boolean NOT NULL DEFAULT false,
  tax_rate numeric NOT NULL DEFAULT 0,
  tax_amount numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  
  status text CHECK (status IN ('paid', 'pending', 'partially_paid')) NOT NULL DEFAULT 'paid',
  payment_method text NOT NULL DEFAULT 'upi',
  amount_paid numeric NOT NULL DEFAULT 0,
  balance_due numeric NOT NULL DEFAULT 0,
  reference_number text,
  
  vendor jsonb NOT NULL DEFAULT '{}'::jsonb,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  
  notes text,
  receipt_url text,
  
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for searching and filtering
CREATE INDEX IF NOT EXISTS idx_expenses_expense_number ON expenses(expense_number);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at DESC);

-- RLS Policies for Expenses
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to expenses" ON expenses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Insert Default Settings if not exists
INSERT INTO expense_settings (id, prefix, starting_number, monthly_budget, default_payment_method, default_payment_status, default_category)
VALUES ('default', 'EXP-', 1, 50000, 'upi', 'paid', 'raw_materials')
ON CONFLICT (id) DO NOTHING;
