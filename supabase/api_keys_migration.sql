-- Create api_keys table for ResumeForgeAI API Platform
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    api_key TEXT UNIQUE NOT NULL,
    name TEXT, -- Optional name for the key
    usage_count INTEGER DEFAULT 0,
    usage_limit INTEGER DEFAULT 1000,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for fast lookups by api_key
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON public.api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON public.api_keys(user_id);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own api keys"
    ON public.api_keys FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own api keys"
    ON public.api_keys FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own api keys"
    ON public.api_keys FOR UPDATE
    USING (auth.uid() = user_id);

-- Function to increment usage
CREATE OR REPLACE FUNCTION increment_api_usage(p_api_key TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.api_keys
    SET usage_count = usage_count + 1,
        last_used_at = now()
    WHERE api_key = p_api_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
