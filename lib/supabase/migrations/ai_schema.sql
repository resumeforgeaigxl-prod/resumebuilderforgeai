-- AI Keys Table
CREATE TABLE IF NOT EXISTS ai_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider TEXT NOT NULL,
    key_value TEXT NOT NULL,
    status TEXT DEFAULT 'active', -- active, cooldown, inactive
    cooldown_until BIGINT, -- timestamp in ms
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Usage Logs Table
CREATE TABLE IF NOT EXISTS ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    provider TEXT NOT NULL,
    task TEXT NOT NULL,
    model_name TEXT,
    tokens_in INTEGER DEFAULT 0,
    tokens_out INTEGER DEFAULT 0,
    latency_ms INTEGER,
    status TEXT, -- success, failure
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_ai_keys_provider_status ON ai_keys(provider, status);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user ON ai_usage_logs(user_id);
