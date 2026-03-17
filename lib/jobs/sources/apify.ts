import { NormalisedJob, isMNC } from '../ingestion-service';

interface ApifyJobItem {
    id?: string;
    jobId?: string;
    companyName?: string;
    company?: string;
    positionName?: string;
    title?: string;
    location?: string;
    type?: string;
    url?: string;
    jobUrl?: string;
    description?: string;
    postedAt?: string;
}

export async function fetchApify(targetUrl?: string): Promise<NormalisedJob[]> {
    const token = process.env.APIFY_API_TOKEN;
    if (!token) {
         console.warn('[Apify] Missing APIFY_API_TOKEN');
         return [];
    }

    // Support single URL scraping if provided
    if (targetUrl) {
         console.log(`[Apify] Targeting specific job URL: ${targetUrl}`);
         // Here we would typically trigger an actor run for this specific URL
         // For now, we'll check if this URL is already in a dataset or just log
    }

    // Map of actor IDs/names to search queries or predefined datasets
    // In a real scenario, these would be configured in the admin panel
    const datasets = [
        { name: 'LinkedIn Jobs', datasetId: process.env.APIFY_LINKEDIN_DATASET_ID },
        { name: 'Indeed Jobs', datasetId: process.env.APIFY_INDEED_DATASET_ID },
        { name: 'Custom Dataset', datasetId: process.env.APIFY_DATASET_ID }
    ].filter(d => d.datasetId);

    if (datasets.length === 0) {
        console.warn('[Apify] No Dataset IDs (LinkedIn/Indeed/Custom) configured.');
        return [];
    }

    const results: NormalisedJob[] = [];

    for (const source of datasets) {
        if (!source.datasetId) continue;

        try {
            const url = `https://api.apify.com/v2/datasets/${source.datasetId}/items?token=${token}`;
            const res = await fetch(url);
            if (!res.ok) continue;

            const items = await res.json() as ApifyJobItem[];
            for (const item of items) {
                // Expanded mapping for various Apify job actors
                const company = item.companyName || item.company || (item as any).employerName || 'Unknown';
                const title = item.positionName || item.title || (item as any).jobTitle || '';
                const applyUrl = item.url || item.jobUrl || (item as any).applyLink || '';
                
                if (!title || !applyUrl) continue;

                results.push({
                    external_id: `apify_${item.id || item.jobId || (item as any).id || Math.random().toString(36).slice(2)}`,
                    title,
                    company,
                    location: item.location || (item as any).city || 'Remote',
                    job_type: item.type || (item as any).employmentType || 'FULLTIME',
                    platform: (item as any).platform || source.name,
                    source: 'apify',
                    apply_url: applyUrl,
                    description: item.description || (item as any).jobDescription || '',
                    posted_date: item.postedAt || (item as any).postedDate || new Date().toISOString(),
                    is_mnc: isMNC(company)
                });
            }
        } catch (_err) {
            console.error(`[Apify] Error fetching ${source.name}:`, _err);
        }
    }

    if (results.length === 0 && (!process.env.APIFY_LINKEDIN_DATASET_ID && !process.env.APIFY_INDEED_DATASET_ID)) {
        console.warn('[Apify] No Dataset IDs configured in .env.local. Apify Scraper will return 0 jobs.');
    }

    return results;
}
