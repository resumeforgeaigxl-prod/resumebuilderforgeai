-- Waitlist System Migration
CREATE TABLE IF NOT EXISTS public.waitlist_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    college TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    coupon_sent BOOLEAN DEFAULT FALSE,
    coupon_code TEXT,
    position SERIAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.waitlist_users ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable public inserts for waitlist" ON public.waitlist_users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable admin read/update for waitlist" ON public.waitlist_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_waitlist_users_updated_at
    BEFORE UPDATE ON public.waitlist_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
