-- Daily Streak Tables
CREATE TABLE IF NOT EXISTS public.user_streaks (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_active_date DATE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.streak_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    streak_day INTEGER NOT NULL,
    reward_type TEXT NOT NULL, -- ai_requests, premium_unlock, etc.
    reward_value JSONB,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    reward_type TEXT NOT NULL,
    reward_value JSONB,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE
);

-- RLS
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own streaks" ON public.user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view streak rewards" ON public.streak_rewards FOR SELECT USING (true);
CREATE POLICY "Users can view their own rewards" ON public.user_rewards FOR SELECT USING (auth.uid() = user_id);

-- Seed defaults (Optional)
INSERT INTO public.streak_rewards (streak_day, reward_type, reward_value, description)
VALUES 
(1, 'ai_requests', '{"increment": 2}', 'Day 1: +2 AI requests per forge'),
(3, 'ai_requests', '{"increment": 5}', 'Day 3: +5 AI requests per forge'),
(7, 'ai_requests', '{"increment": 10}', 'Day 7: +10 AI requests per forge'),
(14, 'feature_unlock', '{"feature": "premium_explanations"}', 'Day 14: Premium AI explanations unlocked'),
(30, 'feature_unlock', '{"feature": "unlimited_access", "duration_hrs": 24}', 'Day 30: 24-hour unlimited AI access')
ON CONFLICT DO NOTHING;
