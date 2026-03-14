-- Badge System Tables
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    badge_name TEXT NOT NULL,
    badge_type TEXT NOT NULL CHECK (badge_type IN ('skill', 'activity', 'interview', 'verification')),
    description TEXT,
    icon TEXT, -- Lucide icon name or SVG
    category_color TEXT, -- green, blue, gold
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, badge_id)
);

-- RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view badges" ON public.badges FOR SELECT USING (true);
CREATE POLICY "Users can view their own badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);

-- Seed Badges
INSERT INTO public.badges (badge_name, badge_type, description, category_color, icon)
VALUES 
('Verified Student', 'verification', 'Verified through college email', 'green', 'CheckCircle'),
('Backend Builder', 'skill', 'Mastered backend development skills', 'blue', 'Server'),
('Coding Master', 'skill', 'Solved advanced coding problems', 'blue', 'Code'),
('System Design Expert', 'skill', 'Expertise in high-level system architecture', 'blue', 'Layers'),
('Streak Master', 'activity', 'Maintained a 30-day streak', 'gold', 'Flame'),
('Learning Champion', 'activity', 'Completed 10 learning modules', 'gold', 'BookOpen'),
('Interview Ready', 'interview', 'Excelled in mock interviews', 'blue', 'Mic')
ON CONFLICT DO NOTHING;
