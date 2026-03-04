-- Add plan_type column to coupons table
ALTER TABLE public.coupons
ADD COLUMN IF NOT EXISTS plan_type TEXT NOT NULL DEFAULT 'all';

-- Update index if needed (optional but good for performance if we filter by plan_type)
CREATE INDEX IF NOT EXISTS idx_coupons_plan_type ON public.coupons (plan_type);