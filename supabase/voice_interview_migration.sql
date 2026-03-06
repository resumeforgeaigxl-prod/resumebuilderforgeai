-- Add interview_mode to mock_interviews table
ALTER TABLE public.mock_interviews
ADD COLUMN IF NOT EXISTS interview_mode TEXT DEFAULT 'chat';