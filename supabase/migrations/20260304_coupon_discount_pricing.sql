-- ============================================================
-- ResumeForgeAI — Coupon Discount Pricing Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add pricing breakdown columns to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS original_price INTEGER DEFAULT 0, -- base plan price (paise)
ADD COLUMN IF NOT EXISTS coupon_code TEXT, -- coupon applied (if any)
ADD COLUMN IF NOT EXISTS discount_amount INTEGER DEFAULT 0;
-- amount saved (paise)

-- 2. Add pricing breakdown columns to payments table
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS original_price INTEGER DEFAULT 0, -- base plan price (paise)
ADD COLUMN IF NOT EXISTS coupon_code TEXT, -- coupon applied (if any)
ADD COLUMN IF NOT EXISTS discount_amount INTEGER DEFAULT 0;
-- amount saved (paise)

-- 3. Helper RPC function to safely increment coupon used_count
--    Called by /api/payment/verify after a paid coupon order is confirmed
CREATE OR REPLACE FUNCTION increment_coupon_used(p_code TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE coupons
       SET used_count = used_count + 1
     WHERE code = p_code;
END;
$$;

-- 4. Indexes for new columns (speeds up admin queries)
CREATE INDEX IF NOT EXISTS idx_orders_coupon_code ON orders (coupon_code)
WHERE
    coupon_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payments_coupon_code ON payments (coupon_code)
WHERE
    coupon_code IS NOT NULL;

-- Done!
-- After running this, future orders and payments will store full pricing breakdown:
--   original_price  = full plan price before discount
--   coupon_code     = coupon code used (NULL if no coupon)
--   discount_amount = savings (0 if no coupon)
--   amount          = final amount charged