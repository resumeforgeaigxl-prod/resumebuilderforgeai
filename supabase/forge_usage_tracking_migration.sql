-- Forge Usage Tracking Migration
-- Author: Forge Neural Engine

-- 1. EXTEND USERS TABLE FOR FREE USAGE
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS free_resume_count INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS free_coding_runs INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS free_interview_sessions INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS free_prep_questions INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS free_job_views INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS free_project_creates INTEGER DEFAULT 0;

-- 2. CREATE INCREMENT FUNCTION FOR TOKENS/USAGE
CREATE OR REPLACE FUNCTION increment_user_usage(user_id_p UUID, column_name TEXT) 
RETURNS VOID AS $$
BEGIN
    EXECUTE format('UPDATE users SET %I = %I + 1 WHERE id = $1', column_name, column_name)
    USING user_id_p;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. ENABLE RLS BYPASS FOR SERVICE ROLE (Ensures function works)
ALTER FUNCTION increment_user_usage(UUID, TEXT) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION increment_user_usage(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION increment_user_usage(UUID, TEXT) TO authenticated;
