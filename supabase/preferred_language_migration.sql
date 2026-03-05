-- Add preferred_language column to users table
alter table public.users
add column if not exists preferred_language text default 'en';

-- Update RLS policies if necessary (usually not needed for adding a column with default)