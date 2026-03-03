-- ─── Migration: Admin Platform Monitoring Tables ──────────────────────────────
-- Run this in Supabase SQL Editor

-- 1) job_applications: Track when a user clicks "Apply Now" on a job
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID REFERENCES users (id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs (id) ON DELETE CASCADE,
    job_title TEXT,
    company TEXT,
    apply_url TEXT,
    applied_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON job_applications USING (false);

CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications (user_id);

CREATE INDEX IF NOT EXISTS idx_job_applications_applied_at ON job_applications (applied_at DESC);

-- 2) job_views: Track when a user opens/views a job listing
CREATE TABLE IF NOT EXISTS job_views (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID REFERENCES users (id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs (id) ON DELETE CASCADE,
    job_title TEXT,
    company TEXT,
    viewed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE job_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON job_views USING (false);

CREATE INDEX IF NOT EXISTS idx_job_views_user_id ON job_views (user_id);

CREATE INDEX IF NOT EXISTS idx_job_views_viewed_at ON job_views (viewed_at DESC);

-- 3) cover_letters: Already exists — ensure columns are present
-- If the table was created from previous migration, add missing columns:
ALTER TABLE cover_letters ADD COLUMN IF NOT EXISTS role_title TEXT;

ALTER TABLE cover_letters ADD COLUMN IF NOT EXISTS company_name TEXT;

ALTER TABLE cover_letters ADD COLUMN IF NOT EXISTS word_count INT;

-- Ensure indexes on existing tables
CREATE INDEX IF NOT EXISTS idx_cover_letters_user_id ON cover_letters (user_id);

CREATE INDEX IF NOT EXISTS idx_cover_letters_created_at ON cover_letters (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_mock_tests_user_id ON mock_tests (user_id);

CREATE INDEX IF NOT EXISTS idx_mock_tests_created_at ON mock_tests (created_at DESC);