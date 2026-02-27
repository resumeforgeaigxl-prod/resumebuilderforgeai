-- ============================================================
-- ResumeForge AI — Monetization Migration
-- Run in: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Add monetization fields to users
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_free_override BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS free_unlimited BOOLEAN NOT NULL DEFAULT false;

-- 2. Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id uuid REFERENCES public.users (id) ON DELETE CASCADE NOT NULL,
    plan TEXT NOT NULL DEFAULT 'pro',
    status TEXT NOT NULL DEFAULT 'active', -- active | cancelled | expired
    expires_at TIMESTAMPTZ, -- NULL = never expires
    coupon_code TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL DEFAULT 'full', -- 'percent' | 'fixed' | 'full'
    discount_value INTEGER NOT NULL DEFAULT 100,
    valid_until TIMESTAMPTZ, -- NULL = never expires
    max_uses INTEGER DEFAULT NULL, -- NULL = unlimited uses
    used_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Open RLS for service role (same pattern as other tables)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='subscriptions' AND policyname='Service role full access subscriptions') THEN
        CREATE POLICY "Service role full access subscriptions" ON public.subscriptions USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='coupons' AND policyname='Service role full access coupons') THEN
        CREATE POLICY "Service role full access coupons" ON public.coupons USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Done! Verify:
-- SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name IN ('is_free_override','free_unlimited');
-- SELECT table_name FROM information_schema.tables WHERE table_name IN ('subscriptions','coupons');