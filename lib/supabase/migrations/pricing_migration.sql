-- Pricing and Feature Locking Migration
-- Run in Supabase SQL Editor

-- 1. Ensure user table has pricing-related fields
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS plan_id TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS daily_credits_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_credits_reset DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS daily_job_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_job_reset DATE DEFAULT CURRENT_DATE;

-- 2. Ensure subscriptions table is updated (already exists, but adding fields)
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS plan_id TEXT DEFAULT 'free';

-- 3. Function to reset daily credits automatically if needed, 
-- or we can handle it in the application code during the first request of the day.

-- 4. Audit log for credit consumption (Optional but good for production)
CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id uuid REFERENCES public.users (id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL,
    task TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_users_plan_id ON public.users(plan_id);
CREATE INDEX IF NOT EXISTS idx_users_last_credits_reset ON public.users(last_credits_reset);

-- 5. Helper Functions for atomic updates
CREATE OR REPLACE FUNCTION increment_credits(user_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.users
    SET daily_credits_used = daily_credits_used + amount
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_job_views(user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.users
    SET daily_job_views = daily_job_views + 1
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;
