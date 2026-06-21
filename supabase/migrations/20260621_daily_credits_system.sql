-- Migration: Add daily credits system to users table and update usage tracking
-- 1. Add columns to users table if they don't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS daily_credits_used INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS daily_credits_limit INTEGER DEFAULT 50;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_token_reset TIMESTAMPTZ DEFAULT NOW();

-- 2. Add tokens_used to usage_logs table if it doesn't exist
ALTER TABLE public.usage_logs ADD COLUMN IF NOT EXISTS tokens_used INTEGER DEFAULT 1;

-- 3. Create or replace the increment_user_usage RPC function
CREATE OR REPLACE FUNCTION public.increment_user_usage(p_user_id UUID, p_tokens INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    v_last_reset TIMESTAMPTZ;
    v_today_start TIMESTAMPTZ;
    v_used INTEGER;
    v_limit INTEGER;
BEGIN
    -- Get current usage, limit, and reset time
    SELECT daily_credits_used, daily_credits_limit, last_token_reset
    INTO v_used, v_limit, v_last_reset
    FROM public.users
    WHERE id = p_user_id;

    -- If user not found, return false
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Calculate the start of today in UTC
    v_today_start := date_trunc('day', NOW());

    -- Reset if last reset was before today
    IF v_last_reset IS NULL OR v_last_reset < v_today_start THEN
        UPDATE public.users
        SET daily_credits_used = p_tokens,
            last_token_reset = NOW()
        WHERE id = p_user_id;
        RETURN TRUE;
    ELSE
        UPDATE public.users
        SET daily_credits_used = daily_credits_used + p_tokens
        WHERE id = p_user_id;
        RETURN TRUE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions to execute the RPC
ALTER FUNCTION public.increment_user_usage(UUID, INTEGER) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.increment_user_usage(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_user_usage(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_user_usage(UUID, INTEGER) TO anon;
