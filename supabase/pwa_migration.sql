-- PWA Install Tracking
CREATE TABLE IF NOT EXISTS public.pwa_installs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    device TEXT,
    installed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.pwa_installs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own PWA installs" ON public.pwa_installs FOR SELECT USING (auth.uid() = user_id);
