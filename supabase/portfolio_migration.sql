-- ============================================================
-- ResumeForge AI — Portfolio System Migration
-- Run in: Supabase Dashboard > SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.portfolios (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id uuid REFERENCES public.users (id) ON DELETE CASCADE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    data JSONB NOT NULL DEFAULT '{}',
    theme TEXT NOT NULL DEFAULT 'minimal',
    is_public BOOLEAN NOT NULL DEFAULT false,
    preview_token TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_portfolios_username ON public.portfolios (username);

CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON public.portfolios (user_id);

CREATE INDEX IF NOT EXISTS idx_portfolios_preview_token ON public.portfolios (preview_token);

-- RLS
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename='portfolios'
        AND policyname='Service role full access portfolios'
    ) THEN
        CREATE POLICY "Service role full access portfolios"
            ON public.portfolios USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Verify:
-- SELECT table_name FROM information_schema.tables WHERE table_name='portfolios';