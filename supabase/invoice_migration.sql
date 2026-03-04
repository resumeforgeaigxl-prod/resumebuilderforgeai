-- ============================================================
-- ResumeForge AI — Invoice System Migration
-- Run in: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Invoice number sequence (auto-increments independently)
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- 2. Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    invoice_number TEXT NOT NULL UNIQUE, -- e.g. INV-000001
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    plan TEXT NOT NULL,
    amount INTEGER NOT NULL DEFAULT 0, -- in paise (₹29 => 2900). 0 for coupon.
    payment_method TEXT NOT NULL DEFAULT 'razorpay', -- 'razorpay' | 'coupon'
    coupon_code TEXT,
    razorpay_payment_id TEXT,
    razorpay_order_id TEXT,
    -- Billing snapshot at time of purchase
    billing_name TEXT,
    billing_email TEXT,
    billing_phone TEXT,
    billing_address TEXT,
    billing_city TEXT,
    billing_state TEXT,
    billing_country TEXT,
    billing_zip TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Helper function: generate next invoice number INV-XXXXXX
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    seq_val BIGINT;
BEGIN
    SELECT nextval('invoice_number_seq') INTO seq_val;
    RETURN 'INV-' || LPAD(seq_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- 4. Row-Level Security
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Users can only read their own invoices
CREATE POLICY "users_own_invoices" ON invoices FOR
SELECT USING (auth.uid () = user_id);

-- Service role (backend) can insert / select freely — no policy restriction needed
-- for server-side inserts via service role key they bypass RLS.

-- 5. Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices (user_id);

CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices (created_at DESC);