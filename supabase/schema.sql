-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Drop existing users table if it exists (clean slate)
-- WARNING: Only use this on a fresh database. Use migration.sql for existing databases.
drop table if exists public.resumes cascade;

drop table if exists public.users cascade;

-- Create users table (custom OAuth — NOT linked to Supabase Auth)
create table public.users (
    id uuid primary key default uuid_generate_v4 (),
    email text unique not null,
    full_name text,
    avatar_url text,
    phone_number text, -- nullable until profile completed
    provider text not null, -- google | github | discord | email
    provider_id text, -- OAuth provider's user id
    role text not null default 'user', -- user | admin
    is_blocked boolean not null default false,
    terms_accepted boolean not null default false,
    profile_completed boolean not null default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS
alter table public.users enable row level security;

-- Service-role bypass (API routes use service role key)
create policy "Service role full access" on public.users using (true)
with
    check (true);

-- Create resumes table
create table public.resumes (
    id               uuid primary key default uuid_generate_v4(),
    user_id          uuid references public.users(id) on delete cascade not null,
    title            text default 'Untitled Resume',
    resume_json      jsonb not null default '{}'::jsonb,
    template_selected text default 'modern',
    created_at       timestamptz default now(),
    updated_at       timestamptz default now()
);

-- Enable RLS for resumes
alter table public.resumes enable row level security;

create policy "Service role full access resumes" on public.resumes using (true)
with
    check (true);