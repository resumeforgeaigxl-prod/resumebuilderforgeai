-- ============================================================
-- ResumeForge AI — Razorpay Payment System Migration
-- Run in: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Add payment plan columns to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS plan_type TEXT NOT NULL DEFAULT 'free';
-- free | pro | premium | career

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS plan_start TIMESTAMPTZ;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS plan_end TIMESTAMPTZ;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS daily_resume_limit INTEGER NOT NULL DEFAULT 1;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS daily_cover_limit INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS daily_mock_limit INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS access_expires_at TIMESTAMPTZ;
-- keep compatibility with legacy checkUserAccess

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS plan TEXT;
-- keep backward compat: 'pro' | null

-- ============================================================
-- 2. Billing Details table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.billing_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id UUID REFERENCES public.users (id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    country TEXT,
    state TEXT,
    city TEXT,
    zip_code TEXT,
    address TEXT,
    company_name TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. Orders table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id UUID REFERENCES public.users (id) ON DELETE CASCADE NOT NULL,
    plan_name TEXT NOT NULL, -- PRO | PREMIUM | CAREER
    amount INTEGER NOT NULL, -- in paise (INR * 100)
    razorpay_order_id TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending', -- pending | success | failed
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 4. Payments table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id UUID REFERENCES public.users (id) ON DELETE CASCADE NOT NULL,
    plan_name TEXT NOT NULL,
    amount INTEGER NOT NULL,
    razorpay_payment_id TEXT,
    razorpay_order_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- pending | success | failed
    billing_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. Row Level Security — service role full access
-- ============================================================
ALTER TABLE public.billing_details ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='billing_details' AND policyname='Service role full access billing_details') THEN
        CREATE POLICY "Service role full access billing_details"
            ON public.billing_details USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='Service role full access orders') THEN
        CREATE POLICY "Service role full access orders"
            ON public.orders USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='payments' AND policyname='Service role full access payments') THEN
        CREATE POLICY "Service role full access payments"
            ON public.payments USING (true) WITH CHECK (true);
    END IF;
END $$;

-- ============================================================
-- Done! Verify:
-- SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name IN ('plan_type','plan_start','plan_end','daily_resume_limit','daily_cover_limit','daily_mock_limit');
-- SELECT table_name FROM information_schema.tables WHERE table_name IN ('billing_details','orders','payments');
-- ============================================================