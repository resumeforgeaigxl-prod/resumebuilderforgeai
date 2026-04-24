import { cache } from 'react';
import { createAdminClient } from './supabase/admin';

export interface KnowledgeCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface KnowledgeTopic {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  related_topics: string[];
  meta_title?: string;
  meta_description?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  author: string;
  content: string;
  seo_description: string;
  cover_image: string;
  status: 'draft' | 'published';
  published_at: string;
  locale: string;
}

export const getKnowledgeCategories = cache(async () => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('knowledge_categories')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data as KnowledgeCategory[];
});

export const getKnowledgeCategoryBySlug = cache(async (slug: string) => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('knowledge_categories')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) return null;
  return data as KnowledgeCategory;
});

export const getKnowledgeTopicsByCategory = cache(async (categoryId: string) => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('knowledge_topics')
    .select('*')
    .eq('category_id', categoryId)
    .order('name');
  
  if (error) throw error;
  return data as KnowledgeTopic[];
});

export const getKnowledgeTopicBySlug = cache(async (categorySlug: string, topicSlug: string) => {
  const supabase = createAdminClient();
  
  // First get category
  const category = await getKnowledgeCategoryBySlug(categorySlug);
  if (!category) return null;

  const { data, error } = await supabase
    .from('knowledge_topics')
    .select('*, knowledge_lessons(*, knowledge_examples(*), knowledge_questions(*))')
    .eq('category_id', category.id)
    .eq('slug', topicSlug)
    .single();
  
  if (error) return null;
  return data;
});

export const getBlogPosts = cache(async (locale: string = 'en') => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .eq('locale', locale)
    .order('published_at', { ascending: false });
  
  if (error) throw error;
  return data as BlogPost[];
});

export const getBlogPostBySlug = cache(async (slug: string, locale: string = 'en') => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('locale', locale)
    .single();
  
  if (error) return null;
  return data as BlogPost;
});

export const getSitemapData = cache(async () => {
  const supabase = createAdminClient();
  
  const [categories, topics, posts, users] = await Promise.all([
    supabase.from('knowledge_categories').select('slug'),
    supabase.from('knowledge_topics').select('slug, knowledge_categories(slug)'),
    supabase.from('blog_posts').select('slug, locale').eq('status', 'published'),
    supabase.from('users').select('username').not('username', 'is', null)
  ]);

  return {
    categories: categories.data || [],
    topics: topics.data || [],
    posts: posts.data || [],
    users: users.data || []
  };
});
