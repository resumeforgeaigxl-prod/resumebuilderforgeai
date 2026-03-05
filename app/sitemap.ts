import { MetadataRoute } from 'next';

/**
 * Dynamic sitemap — Next.js will serve this at /sitemap.xml
 * Add new public pages here as they are created.
 */
export default function sitemap(): MetadataRoute.Sitemap {
    const BASE = 'https://resumeforgeai.in';
    const now = new Date();

    const staticPages: MetadataRoute.Sitemap = [
        { url: `${BASE}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
        { url: `${BASE}/jobforgeai`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
        { url: `${BASE}/mock-test`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
        { url: `${BASE}/portfolio`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${BASE}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
        { url: `${BASE}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
        // Regional landing pages
        { url: `${BASE}/in`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
        { url: `${BASE}/us`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
        { url: `${BASE}/eu`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
        // SEO landing pages
        { url: `${BASE}/ai-resume-builder`, lastModified: now, changeFrequency: 'monthly', priority: 0.95 },
        { url: `${BASE}/ats-resume-builder`, lastModified: now, changeFrequency: 'monthly', priority: 0.95 },
        { url: `${BASE}/ai-mock-interview`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
        { url: `${BASE}/job-interview-ai-coach`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    ];

    return staticPages;
}
