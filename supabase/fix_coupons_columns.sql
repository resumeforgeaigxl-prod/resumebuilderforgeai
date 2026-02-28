-- ============================================================
-- ResumeForge AI — FIX COUPONS SCHEMA
-- Error: "Could not find the 'expires_at' column of 'coupons'"
-- Run in: Supabase Dashboard > SQL Editor
-- ============================================================

-- Rename mismatched columns in public.coupons
ALTER TABLE public.coupons
RENAME COLUMN IF EXISTS discount_type TO type;

ALTER TABLE public.coupons
RENAME COLUMN IF EXISTS discount_value TO value;

ALTER TABLE public.coupons
RENAME COLUMN IF EXISTS valid_until TO expires_at;

-- Re-verify
SELECT 'Coupons table fixed. Current columns: ' || string_agg (column_name, ', ')
FROM information_schema.columns
WHERE
    table_name = 'coupons';