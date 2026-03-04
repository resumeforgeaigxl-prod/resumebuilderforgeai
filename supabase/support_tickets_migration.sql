-- ============================================================
-- ResumeForge AI — Support Tickets Migration
-- Run in: Supabase Dashboard > SQL Editor
-- ============================================================

-- Ticket ID sequence: TKT-000001
CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_ticket_id()
RETURNS TEXT AS $$
DECLARE seq_val BIGINT;
BEGIN
    SELECT nextval('ticket_number_seq') INTO seq_val;
    RETURN 'TKT-' || LPAD(seq_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    ticket_id TEXT NOT NULL UNIQUE, -- TKT-000001
    user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    name TEXT,
    category TEXT NOT NULL, -- 'payment_issue' | 'resume_error' | ...
    message TEXT NOT NULL,
    screenshot_url TEXT,
    status TEXT NOT NULL DEFAULT 'open', -- 'open' | 'in_progress' | 'resolved'
    admin_reply TEXT,
    replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets (user_id);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets (status);

CREATE INDEX IF NOT EXISTS idx_support_tickets_created ON support_tickets (created_at DESC);

-- RLS: users see only their own tickets
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_tickets" ON support_tickets FOR
SELECT USING (auth.uid () = user_id);

-- Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();