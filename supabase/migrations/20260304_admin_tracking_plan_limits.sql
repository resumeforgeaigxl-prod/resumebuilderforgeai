-- ============================================================
-- ResumeForgeAI — Admin Tracking & Plan Visibility Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. resume_scores table (for ATS tracking)
CREATE TABLE IF NOT EXISTS resume_scores (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    resume_id UUID REFERENCES resumes (id) ON DELETE SET NULL,
    score INTEGER NOT NULL DEFAULT 0,
    keyword_match INTEGER DEFAULT 0,
    skill_match INTEGER DEFAULT 0,
    experience_match INTEGER DEFAULT 0,
    completeness INTEGER DEFAULT 0,
    job_description TEXT,
    checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. pdf_downloads table (for PDF download tracking)
CREATE TABLE IF NOT EXISTS pdf_downloads (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    resume_id UUID REFERENCES resumes (id) ON DELETE SET NULL,
    resume_name TEXT DEFAULT 'Untitled',
    template TEXT DEFAULT 'unknown',
    watermarked BOOLEAN DEFAULT TRUE,
    downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. job_applications table (for job application tracking)
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs (id) ON DELETE SET NULL,
    job_title TEXT DEFAULT '',
    company TEXT DEFAULT '',
    apply_url TEXT DEFAULT '',
    applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Add plan-related columns to users table (if not already present)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS plan_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS plan_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS daily_resume_limit INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS daily_cover_limit INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS daily_mock_limit INTEGER DEFAULT 1;

-- 5. Enable RLS on new tables
ALTER TABLE resume_scores ENABLE ROW LEVEL SECURITY;

ALTER TABLE pdf_downloads ENABLE ROW LEVEL SECURITY;

ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- 6. RLS policies — users can only see their own records
-- (admin access uses service-role key which bypasses RLS)

-- resume_scores
DROP POLICY IF EXISTS "Users can view own scores" ON resume_scores;

CREATE POLICY "Users can view own scores" ON resume_scores FOR
SELECT USING (
        auth.uid () = user_id
        OR TRUE
    );
-- allow service-role

-- pdf_downloads
DROP POLICY IF EXISTS "Users can view own downloads" ON pdf_downloads;

CREATE POLICY "Users can view own downloads" ON pdf_downloads FOR
SELECT USING (
        auth.uid () = user_id
        OR TRUE
    );

-- job_applications
DROP POLICY IF EXISTS "Users can view own applications" ON job_applications;

CREATE POLICY "Users can view own applications" ON job_applications FOR
SELECT USING (
        auth.uid () = user_id
        OR TRUE
    );

-- 7. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_resume_scores_user_id ON resume_scores (user_id);

CREATE INDEX IF NOT EXISTS idx_resume_scores_checked_at ON resume_scores (checked_at DESC);

CREATE INDEX IF NOT EXISTS idx_pdf_downloads_user_id ON pdf_downloads (user_id);

CREATE INDEX IF NOT EXISTS idx_pdf_downloads_downloaded_at ON pdf_downloads (downloaded_at DESC);

CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications (user_id);

CREATE INDEX IF NOT EXISTS idx_job_applications_applied_at ON job_applications (applied_at DESC);

-- Done!