-- ═══════════════════════════════════════════════════════════════════
-- Admin Full Logging Migration — Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- 1) resume_scores — track every ATS evaluation
CREATE TABLE IF NOT EXISTS resume_scores (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID REFERENCES users (id) ON DELETE CASCADE,
    resume_id UUID REFERENCES resumes (id) ON DELETE SET NULL,
    score INT NOT NULL DEFAULT 0,
    keyword_match INT DEFAULT 0,
    skill_match INT DEFAULT 0,
    experience_match INT DEFAULT 0,
    completeness INT DEFAULT 0,
    job_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE resume_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role resume_scores" ON resume_scores USING (true)
WITH
    CHECK (true);

CREATE INDEX IF NOT EXISTS idx_resume_scores_user_id ON resume_scores (user_id);

CREATE INDEX IF NOT EXISTS idx_resume_scores_created_at ON resume_scores (created_at DESC);

-- 2) pdf_downloads — track every PDF download event
CREATE TABLE IF NOT EXISTS pdf_downloads (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID REFERENCES users (id) ON DELETE CASCADE,
    resume_id UUID REFERENCES resumes (id) ON DELETE SET NULL,
    resume_name TEXT,
    template TEXT,
    watermarked BOOLEAN DEFAULT TRUE,
    downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pdf_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role pdf_downloads" ON pdf_downloads USING (true)
WITH
    CHECK (true);

CREATE INDEX IF NOT EXISTS idx_pdf_downloads_user_id ON pdf_downloads (user_id);

CREATE INDEX IF NOT EXISTS idx_pdf_downloads_downloaded_at ON pdf_downloads (downloaded_at DESC);

-- 3) cover_letters — track every generated cover letter
CREATE TABLE IF NOT EXISTS cover_letters (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID REFERENCES users (id) ON DELETE CASCADE,
    resume_id UUID REFERENCES resumes (id) ON DELETE SET NULL,
    role_title TEXT,
    company_name TEXT,
    content TEXT,
    word_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cover_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role cover_letters" ON cover_letters USING (true)
WITH
    CHECK (true);

CREATE INDEX IF NOT EXISTS idx_cover_letters_user_id ON cover_letters (user_id);

CREATE INDEX IF NOT EXISTS idx_cover_letters_created_at ON cover_letters (created_at DESC);

-- 4) audit_logs — centralised action log for every significant event
CREATE TABLE IF NOT EXISTS audit_logs (
    id        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id   UUID REFERENCES users(id) ON DELETE CASCADE,
    action    TEXT NOT NULL,   -- e.g. RESUME_CREATED, PDF_DOWNLOADED, ATS_CHECKED
    metadata  JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role audit_logs" ON audit_logs USING (true)
WITH
    CHECK (true);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs (user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at DESC);

-- 5) job_applications — track Apply Now clicks
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID REFERENCES users (id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs (id) ON DELETE SET NULL,
    job_title TEXT,
    company TEXT,
    apply_url TEXT,
    applied_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role job_applications" ON job_applications USING (true)
WITH
    CHECK (true);

CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications (user_id);

CREATE INDEX IF NOT EXISTS idx_job_applications_applied_at ON job_applications (applied_at DESC);