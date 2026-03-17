-- SEO Structure Upgrade

-- 1. Knowledge Categories
CREATE TABLE IF NOT EXISTS public.knowledge_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Update Knowledge Topics
ALTER TABLE public.knowledge_topics ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.knowledge_categories(id) ON DELETE SET NULL;
ALTER TABLE public.knowledge_topics ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.knowledge_topics ADD COLUMN IF NOT EXISTS related_topics JSONB DEFAULT '[]';
ALTER TABLE public.knowledge_topics ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE public.knowledge_topics ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- 3. Blog / Platform Updates
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    seo_description TEXT,
    cover_image TEXT,
    status TEXT DEFAULT 'draft', -- draft, published
    published_at TIMESTAMPTZ DEFAULT (now()),
    locale TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.knowledge_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Public read for published content, service role for write)
-- Drop existing policies first to avoid errors on re-run
DROP POLICY IF EXISTS "Public read knowledge categories" ON public.knowledge_categories;
DROP POLICY IF EXISTS "Public read blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Service role full access knowledge categories" ON public.knowledge_categories;
DROP POLICY IF EXISTS "Service role full access blog posts" ON public.blog_posts;

CREATE POLICY "Public read knowledge categories" ON public.knowledge_categories FOR SELECT USING (true);
CREATE POLICY "Public read blog posts" ON public.blog_posts FOR SELECT USING (status = 'published');

-- Service role bypass
CREATE POLICY "Service role full access knowledge categories" ON public.knowledge_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access blog posts" ON public.blog_posts FOR ALL USING (true) WITH CHECK (true);

-- Ensure slug is unique for topics
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'knowledge_topics_slug_key') THEN
        ALTER TABLE public.knowledge_topics ADD CONSTRAINT knowledge_topics_slug_key UNIQUE (slug);
    END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_knowledge_topics_slug ON public.knowledge_topics(slug);
CREATE INDEX IF NOT EXISTS idx_knowledge_categories_slug ON public.knowledge_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(status, published_at);

-- Seed Initial Categories
INSERT INTO public.knowledge_categories (name, slug, description)
VALUES 
    ('Programming Fundamentals', 'programming-fundamentals', 'Master the basics of programming, variables, control flow, and logic.'),
    ('Data Structures', 'data-structures', 'Learn about arrays, linked lists, trees, graphs, and more.'),
    ('Algorithms', 'algorithms', 'Diving into searching, sorting, and complex problem-solving techniques.'),
    ('System Design', 'system-design', 'Understand high-level architecture, scalability, and distributed systems.'),
    ('Frontend Development', 'frontend-development', 'Master HTML, CSS, React, and modern web technologies.')
ON CONFLICT (slug) DO NOTHING;
