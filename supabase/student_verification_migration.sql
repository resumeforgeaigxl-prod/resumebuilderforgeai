-- Student Verification Table
CREATE TABLE IF NOT EXISTS public.user_verification (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    verification_type TEXT DEFAULT 'student',
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP WITH TIME ZONE,
    otp_code TEXT,
    otp_expires_at TIMESTAMP WITH TIME ZONE,
    otp_attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.user_verification ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own verification" ON public.user_verification FOR SELECT USING (auth.uid() = user_id);
