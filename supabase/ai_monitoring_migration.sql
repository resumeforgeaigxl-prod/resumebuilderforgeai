-- AI Monitoring System Update
-- Author: Forge Neural Engine
-- Purpose: Consolidate and unify AI monitoring across all features.

-- PRE-FLIGHT: Drop view to allow table modifications
DROP VIEW IF EXISTS ai_admin_stats_view;

-- 1. Unify Usage Logs (Extend if exists or create)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_usage_logs') THEN
        CREATE TABLE ai_usage_logs (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
            feature TEXT NOT NULL, -- 'assistant', 'resume', 'coding', 'explainforge', etc.
            model TEXT,
            tokens INTEGER DEFAULT 0,
            cost_estimate DECIMAL(10, 6) DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
    ELSE
        -- Ensure columns exist
        ALTER TABLE ai_usage_logs ADD COLUMN IF NOT EXISTS cost_estimate DECIMAL(10, 6) DEFAULT 0;
        ALTER TABLE ai_usage_logs ADD COLUMN IF NOT EXISTS feature TEXT DEFAULT 'unknown';
        
        -- Handle tokens vs tokens_used renaming logic
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_usage_logs' AND column_name='tokens_used') THEN
            ALTER TABLE ai_usage_logs RENAME COLUMN tokens_used TO tokens;
        ELSE
            ALTER TABLE ai_usage_logs ADD COLUMN IF NOT EXISTS tokens INTEGER DEFAULT 0;
        END IF;
    END IF;
END $$;

-- 2. Chat Sessions (The high-level conversation container)
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT DEFAULT 'active'
);

-- 3. Chat Messages (The individual exchanges)
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    role TEXT NOT NULL, -- 'user', 'assistant'
    message TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    model_used TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Admin Stats View (For the dashboard)
CREATE OR REPLACE VIEW ai_admin_stats_view AS
SELECT 
    COUNT(*)::INTEGER as calls_today,
    COUNT(DISTINCT user_id)::INTEGER as active_users_today,
    COALESCE(SUM(tokens), 0)::INTEGER as tokens_today,
    (SELECT COUNT(*)::INTEGER FROM chat_sessions WHERE started_at >= CURRENT_DATE) as new_sessions_today
FROM ai_usage_logs
WHERE created_at >= CURRENT_DATE;

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_v2 ON ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_feature_v2 ON ai_usage_logs(feature);

-- 6. RLS Policies
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Cleanup existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can insert their own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can view their own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert messages into their own sessions" ON chat_messages;
DROP POLICY IF EXISTS "Users can view their own usage logs" ON ai_usage_logs;

-- Re-apply policies
CREATE POLICY "Users can view their own chat sessions" ON chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own chat sessions" ON chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sessions" ON chat_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own chat messages" ON chat_messages FOR SELECT USING (EXISTS (SELECT 1 FROM chat_sessions WHERE chat_sessions.id = chat_messages.session_id AND chat_sessions.user_id = auth.uid()));
CREATE POLICY "Users can insert messages into their own sessions" ON chat_messages FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM chat_sessions WHERE chat_sessions.id = session_id AND chat_sessions.user_id = auth.uid()));
CREATE POLICY "Users can view their own usage logs" ON ai_usage_logs FOR SELECT USING (auth.uid() = user_id);
