-- Admin Logs tracking for Audit capability
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    admin_id uuid REFERENCES public.users (id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    target_id uuid, -- Optional reference to affected entity (user_id, resume_id, coupon_id)
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON public.admin_logs (admin_id);

CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON public.admin_logs (action);

-- Enable RLS and bypass for service role
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Service role full access admin_logs') THEN
        CREATE POLICY "Service role full access admin_logs" ON public.admin_logs USING (true) WITH CHECK (true);
    END IF;
END $$;