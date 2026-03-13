-- Migration to add image_svg column to coding_questions table
-- Run this in Supabase SQL Editor

ALTER TABLE public.coding_questions 
ADD COLUMN IF NOT EXISTS image_svg TEXT;

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'coding_questions' AND column_name = 'image_svg';
