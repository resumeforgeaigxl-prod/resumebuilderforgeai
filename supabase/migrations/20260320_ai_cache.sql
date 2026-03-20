-- AI Cache Table for Centralized RAG System
CREATE TABLE IF NOT EXISTS ai_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_hash TEXT NOT NULL UNIQUE,
    response JSONB NOT NULL,
    context_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ -- Optional for TTL
);

CREATE INDEX IF NOT EXISTS idx_ai_cache_hash ON ai_cache(query_hash);

-- Helper function to clean old cache entries
CREATE OR REPLACE FUNCTION delete_expired_ai_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM ai_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
