-- ============================================================
-- ResumeForge AI — Fix Support Tickets + Subscription Pricing
-- Run in: Supabase Dashboard > SQL Editor
-- ============================================================

-- ── 1. Create ticket_number_seq if missing ─────────────────
CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START 1;

-- ── 2. Create / replace generate_ticket_id() function ──────
CREATE OR REPLACE FUNCTION generate_ticket_id()
RETURNS TEXT AS $$
DECLARE seq_val BIGINT;
BEGIN
    SELECT nextval('ticket_number_seq') INTO seq_val;
    RETURN 'TKT-' || LPAD(seq_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- ── 3. Create support_tickets table if missing ─────────────
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

-- ── 4. Indexes ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets (user_id);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets (status);

CREATE INDEX IF NOT EXISTS idx_support_tickets_created ON support_tickets (created_at DESC);

-- ── 5. RLS: Enable and add policies ────────────────────────
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Allow users to SELECT their own tickets
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename='support_tickets' AND policyname='users_own_tickets'
    ) THEN
        CREATE POLICY "users_own_tickets"
            ON support_tickets FOR SELECT
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- Allow service role full access (insert/update/delete)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename='support_tickets' AND policyname='Service role full access support_tickets'
    ) THEN
        CREATE POLICY "Service role full access support_tickets"
            ON support_tickets
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

-- ── 6. Auto-update updated_at trigger ──────────────────────
CREATE OR REPLACE FUNCTION update_support_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS support_tickets_updated_at ON support_tickets;

CREATE TRIGGER support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_support_tickets_updated_at();

-- ── 7. Add pricing columns to payments table if missing ─────
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS original_price INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS discount_amount INTEGER DEFAULT 0;

-- ── 8. Add pricing columns to orders table if missing ───────
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS original_price INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS discount_amount INTEGER DEFAULT 0;

-- ── 9. increment_coupon_used helper RPC ────────────────────
CREATE OR REPLACE FUNCTION increment_coupon_used(p_code TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE coupons SET used_count = used_count + 1 WHERE code = p_code;
END;
$$;

-- ── 10. Verify ─────────────────────────────────────────────
SELECT 'support_tickets columns: ' || string_agg (
        column_name, ', '
        ORDER BY ordinal_position
    )
FROM information_schema.columns
WHERE
    table_name = 'support_tickets';

SELECT 'payments columns: ' || string_agg (
        column_name, ', '
        ORDER BY ordinal_position
    )
FROM information_schema.columns
WHERE
    table_name = 'payments';