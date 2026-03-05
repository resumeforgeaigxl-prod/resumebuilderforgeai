import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = 'https://resumeforgeai.in';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const regions = ['in', 'us', 'eu'];
    const languagesMap: Record<string, string[]> = {
        'in': ['en', 'hi', 'te', 'ta', 'ml'],
        'us': ['en', 'es'],
        'eu': ['en', 'fr', 'de', 'es']
    };

    const routes: MetadataRoute.Sitemap = [];

    // 1. Static Routes for all regional combinations
    regions.forEach(r => {
        (languagesMap[r] || ['en']).forEach(l => {
            const prefix = `/${r}/${l}`;

            // Basic pages
            ['', '/jobs', '/login', '/signup', '/privacy-policy', '/cookie-policy', '/terms-of-service'].forEach(route => {
                routes.push({
                    url: `${BASE_URL}${prefix}${route}`,
                    lastModified: new Date(),
                    changeFrequency: 'daily',
                    priority: route === '' ? 1 : 0.8,
                });
            });
        });
    });

    // 2. Dynamic Job Routes (latest 500 jobs)
    const { data: jobs } = await supabase
        .from('jobs')
        .select('id, title, company, created_at')
        .order('created_at', { ascending: false })
        .limit(500);

    if (jobs) {
        jobs.forEach(job => {
            if (!job.title || !job.company || !job.id) return;

            const safeTitle = job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const safeCompany = job.company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const slug = `${safeTitle}-${safeCompany}-${job.id.slice(0, 8)}`;

            // For simplicity, add jobs to the default IN/EN region sitemap primarily
            routes.push({
                url: `${BASE_URL}/in/en/job/${slug}`,
                lastModified: new Date(job.created_at),
                changeFrequency: 'weekly',
                priority: 0.6,
            });
        });
    }

    return routes;
}
