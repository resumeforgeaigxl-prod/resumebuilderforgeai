export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCanonicalJobUrl, generateJobSlug } from '@/lib/jobs/slug';
import { isJobIndexable } from '@/lib/jobs/indexability';

export async function GET() {
  try {
    const supabase = await createClient();

    // Query active canonical jobs up to 5,000 items per sitemap shard
    const { data: jobs } = await supabase
      .from('jobs')
      .select('id, title, company, location, city, description, apply_url, source_url, status, slug, last_seen_at, posted_at, created_at')
      .eq('status', 'ACTIVE')
      .order('last_seen_at', { ascending: false })
      .limit(5000);

    const eligibleJobs = (jobs || []).filter((job) => isJobIndexable(job).eligible);

    const urls = eligibleJobs.map((job) => {
      const canonicalUrl = getCanonicalJobUrl(job, 'en-in');
      const lastModDate = job.last_seen_at || job.posted_at || job.created_at || new Date().toISOString();
      const lastMod = new Date(lastModDate).toISOString();

      return `  <url>
    <loc>${canonicalUrl}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (err: any) {
    console.error('[JobsSitemap] Error generating jobs sitemap:', err?.message);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
