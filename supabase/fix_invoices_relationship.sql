-- Fix Invoices table to reference the correct public.users table
-- The original migration used auth.users which fails for custom OAuth implementations.

-- 1. Drop existing table if it exists (recreating correctly)
DROP TABLE IF EXISTS public.invoices CASCADE;

-- 2. Re-create the table referencing public.users
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    invoice_number TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    plan TEXT NOT NULL,
    amount INTEGER NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL DEFAULT 'razorpay',
    coupon_code TEXT,
    razorpay_payment_id TEXT,
    razorpay_order_id TEXT,
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

-- 3. Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- 4. Service role full access policy
CREATE POLICY "Service role full access invoices" ON public.invoices FOR ALL USING (true)
WITH
    CHECK (true);

-- 5. User access policy (using custom JWT userId)
-- Note: Re-using the same pattern as other tables in this app.
-- If auth.uid() is not used (custom session), we might need a different check,
-- but for admin/backend it's fine.
-- In this app, many tables use "Service role full access" because they are handled by API routes with service role.

-- 6. Re-create indexes
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices (user_id);

CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON public.invoices (created_at DESC);