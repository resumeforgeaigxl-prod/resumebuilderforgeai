import { MetadataRoute } from 'next';
import { getSitemapData } from '@/lib/seo-service';

const BASE_URL = 'https://resumeforgeai.in';
const REGIONS = ['in', 'us', 'eu'];
const LANGUAGES_MAP: Record<string, string[]> = {
    'in': ['en', 'hi', 'te', 'ta', 'ml'],
    'us': ['en', 'es'],
    'eu': ['en', 'fr', 'de', 'es']
};

const STATIC_PAGES = [
    '', 
    '/jobs', 
    '/login', 
    '/signup', 
    '/privacy-policy', 
    '/cookie-policy', 
    '/terms-of-service',
    '/pricing',
    '/knowledge',
    '/posts',
    '/ai-resume-builder',
    '/ats-resume-builder',
    '/ai-mock-interview',
    '/job-interview-ai-coach'
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const { categories, topics, posts, users } = await getSitemapData();
    const routes: MetadataRoute.Sitemap = [];

    // All possible locale-region combinations
    const allLocales: string[] = [];
    REGIONS.forEach(r => {
        (LANGUAGES_MAP[r] || ['en']).forEach(l => {
            allLocales.push(`${l}-${r}`);
        });
    });

    // 1. Static Pages for all locales
    allLocales.forEach(locale => {
        STATIC_PAGES.forEach(page => {
            routes.push({
                url: `${BASE_URL}/${locale}${page}`,
                lastModified: new Date(),
                changeFrequency: page === '' ? 'daily' : 'weekly',
                priority: page === '' ? 1 : 0.8,
            });
        });
    });

    // 2. Knowledge Categories
    allLocales.forEach(locale => {
        categories.forEach(cat => {
            routes.push({
                url: `${BASE_URL}/${locale}/knowledge/${cat.slug}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.7,
            });
        });
    });

    // 3. Knowledge Topics
    allLocales.forEach(locale => {
        topics.forEach(topic => {
            const category = Array.isArray(topic.knowledge_categories) 
                ? topic.knowledge_categories[0] 
                : topic.knowledge_categories;
            
            if (category?.slug) {
                routes.push({
                    url: `${BASE_URL}/${locale}/knowledge/${category.slug}/${topic.slug}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly',
                    priority: 0.8,
                });
            }
        });
    });

    // 4. Blog Posts
    posts.forEach(post => {
        REGIONS.forEach(r => {
            routes.push({
                url: `${BASE_URL}/${post.locale}-${r}/posts/${post.slug}`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.7,
            });
        });
    });

    // 5. User Profiles
    users.forEach(user => {
        allLocales.forEach(locale => {
            routes.push({
                url: `${BASE_URL}/${locale}/u/${user.username}`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.4,
            });
        });
    });

    return routes;
}
