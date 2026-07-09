import { MetadataRoute } from 'next';
import { getSitemapData } from '@/lib/seo-service';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://resumeforgeai.in';
  const primaryLocale = 'en-in';
  
  // Static public routes
  const staticRoutes = [
    { path: '', priority: 1.0 },
    { path: '/resumes', priority: 0.9 },
    { path: '/ats-resume-builder', priority: 0.9 },
    { path: '/ai-mock-interview', priority: 0.9 },
    { path: '/job-interview-ai-coach', priority: 0.9 },
    { path: '/jobs', priority: 0.8 },
    { path: '/privacy', priority: 0.5 },
    { path: '/terms', priority: 0.5 },
  ];

  const sitemapData: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}/${primaryLocale}${route.path}`.replace(/\/$/, ''),
    lastModified: new Date(),
    changeFrequency: (route.path === '' ? 'daily' : 'weekly') as "daily" | "weekly",
    priority: route.priority,
  }));

  // Fetch dynamic content
  try {
    const { categories, topics, posts } = await getSitemapData();

    // Add categories
    categories.forEach((cat: any) => {
      sitemapData.push({
        url: `${baseUrl}/${primaryLocale}/knowledge/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    });

    // Add topics
    topics.forEach((topic: any) => {
      if (topic.knowledge_categories?.slug) {
        sitemapData.push({
          url: `${baseUrl}/${primaryLocale}/knowledge/${topic.knowledge_categories.slug}/${topic.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }
    });

    // Add blog posts
    posts.forEach((post: any) => {
      sitemapData.push({
        url: `${baseUrl}/${post.locale}-${primaryLocale.split('-')[1]}/blogs/${post.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    });
  } catch (err) {
    console.error('Sitemap dynamic generation failed:', err);
  }

  // Add the root homepage without locale
  sitemapData.unshift({
    url: `${baseUrl}/`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  });

  return sitemapData;
}
