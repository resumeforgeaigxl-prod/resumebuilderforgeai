-- Migration to add referral_source column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS referral_source TEXT;
