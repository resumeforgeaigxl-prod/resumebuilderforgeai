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

export async function fetchApify(): Promise<NormalisedJob[]> {
    const token = process.env.APIFY_API_TOKEN;
    if (!token) return [];

    // Map of actor IDs/names to search queries or predefined datasets
    // In a real scenario, these would be configured in the admin panel
    const datasets = [
        { name: 'LinkedIn Jobs', datasetId: process.env.APIFY_LINKEDIN_DATASET_ID },
        { name: 'Indeed Jobs', datasetId: process.env.APIFY_INDEED_DATASET_ID }
    ];

    const results: NormalisedJob[] = [];

    for (const source of datasets) {
        if (!source.datasetId) continue;

        try {
            const url = `https://api.apify.com/v2/datasets/${source.datasetId}/items?token=${token}`;
            const res = await fetch(url);
            if (!res.ok) continue;

            const items = await res.json() as ApifyJobItem[];
            for (const item of items) {
                // Mapping depends on the specific actor's output format
                // This is a generic mapping for typical job scrapers
                const company = item.companyName || item.company || 'Unknown';
                const title = item.positionName || item.title || '';
                
                results.push({
                    external_id: `apify_${item.id || item.jobId || Math.random()}`,
                    title,
                    company,
                    location: item.location || 'Remote',
                    job_type: item.type || 'FULLTIME',
                    platform: source.name,
                    source: 'apify',
                    apply_url: item.url || item.jobUrl || '',
                    description: item.description || '',
                    posted_date: item.postedAt || new Date().toISOString(),
                    is_mnc: isMNC(company)
                });
            }
        } catch (_err) {
            console.error(`[Apify] Error fetching ${source.name}:`, _err);
        }
    }

    return results;
}
