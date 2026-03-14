-- LearnForge Tables
CREATE TABLE IF NOT EXISTS public.learnforge_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_type TEXT NOT NULL CHECK (video_type IN ('technical', 'professional')),
    career_path TEXT, -- Nullable for professional videos, matching roadmap for technical
    category TEXT, -- communication, leadership, etc.
    title TEXT NOT NULL,
    video_url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.learnforge_video_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID REFERENCES public.learnforge_videos(id) ON DELETE CASCADE NOT NULL,
    transcript TEXT,
    ai_explanation JSONB, -- { "00:00 - 00:20": "Explanation...", ... }
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(video_id)
);

-- RLS
ALTER TABLE public.learnforge_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learnforge_video_notes ENABLE ROW LEVEL SECURITY;

-- Policies (Public read for now, admin write handled by service role/admin panel)
CREATE POLICY "Anyone can view learnforge videos" ON public.learnforge_videos FOR SELECT USING (true);
CREATE POLICY "Anyone can view learnforge notes" ON public.learnforge_video_notes FOR SELECT USING (true);
