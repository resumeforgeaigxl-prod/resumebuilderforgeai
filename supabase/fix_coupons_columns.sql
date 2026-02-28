-- ============================================================
-- ResumeForge AI — FIX COUPONS SCHEMA
-- Error: "Could not find the 'expires_at' column of 'coupons'"
-- Run in: Supabase Dashboard > SQL Editor
-- ============================================================

-- Rename mismatched columns in public.coupons safely
DO $$ 
BEGIN 
    -- Rename discount_type
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='coupons' AND column_name='discount_type') THEN
        ALTER TABLE public.coupons RENAME COLUMN discount_type TO type;
    END IF;

    -- Rename discount_value
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='coupons' AND column_name='discount_value') THEN
        ALTER TABLE public.coupons RENAME COLUMN discount_value TO value;
    END IF;

    -- Rename valid_until
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='coupons' AND column_name='valid_until') THEN
        ALTER TABLE public.coupons RENAME COLUMN valid_until TO expires_at;
    END IF;
END $$;

-- Re-verify
SELECT 'Coupons table fixed. Current columns: ' || string_agg (column_name, ', ')
FROM information_schema.columns
WHERE
    table_name = 'coupons';