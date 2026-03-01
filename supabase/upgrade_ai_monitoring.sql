-- 1. Create AI Usage Logs Table
CREATE TABLE IF NOT EXISTS ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
    model_used TEXT NOT NULL,
    tokens_used INT NOT NULL,
    response_time_ms INT NOT NULL,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- 2. Ensure ai_messages has user_id for easier RLS and querying
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_messages' AND column_name='user_id') THEN
        ALTER TABLE ai_messages ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Update AI Violations to link with conversations
-- Note: We add columns to the existing table created in setup_ai_architecture.sql
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_violations' AND column_name='conversation_id') THEN
        ALTER TABLE ai_violations ADD COLUMN conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_violations' AND column_name='message_id') THEN
        ALTER TABLE ai_violations ADD COLUMN message_id UUID; -- Optional link to ai_messages
    END IF;
END $$;

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_usage_user ON ai_usage_logs (user_id);

CREATE INDEX IF NOT EXISTS idx_usage_convo ON ai_usage_logs (conversation_id);

CREATE INDEX IF NOT EXISTS idx_usage_created ON ai_usage_logs (created_at);

-- 5. RLS for Usage Logs
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage logs" ON ai_usage_logs FOR
SELECT TO authenticated USING (auth.uid () = user_id);

CREATE POLICY "Admins can view all usage logs" ON ai_usage_logs FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM users
            WHERE
                id = auth.uid ()
                AND role = 'admin'
        )
    );

-- 6. Enable Realtime
-- This is a Supabase specific extension
ALTER PUBLICATION supabase_realtime ADD TABLE ai_usage_logs;

ALTER PUBLICATION supabase_realtime ADD TABLE ai_violations;

-- 7. Add View for Admin Dashboard Stats
CREATE OR REPLACE VIEW ai_admin_stats_view AS
SELECT (
        SELECT COUNT(*)
        FROM ai_usage_logs
        WHERE
            created_at >= CURRENT_DATE
    ) as calls_today,
    (
        SELECT COUNT(DISTINCT user_id)
        FROM ai_usage_logs
        WHERE
            created_at >= CURRENT_DATE
    ) as active_users_today,
    (
        SELECT COALESCE(SUM(tokens_used), 0)
        FROM ai_usage_logs
        WHERE
            created_at >= CURRENT_DATE
    ) as tokens_today,
    (
        SELECT COUNT(*)
        FROM ai_violations
    ) as total_violations;