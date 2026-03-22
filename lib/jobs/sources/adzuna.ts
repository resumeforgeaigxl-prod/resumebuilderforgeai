import { NormalisedJob, isMNC } from '../ingestion-service';
import { retry } from '../utils';

interface AdzunaJob {
    id: string;
    title: string;
    description: string;
    company: { display_name: string };
    location: { display_name: string };
    redirect_url: string;
    contract_type?: string;
    created: string;
}

export async function fetchAdzuna(): Promise<NormalisedJob[]> {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_API_KEY;
    
    if (!appId || !appKey) {
        console.warn('[Adzuna] Missing APP_ID or API_KEY.');
        return [];
    }

    const queries = [
        { country: 'in', what: 'software engineer' },
        { country: 'in', what: 'web developer' },
        { country: 'in', what: 'full stack developer' }
    ];
    const results: NormalisedJob[] = [];

    for (const q of queries) {
        try {
            console.log(`[Adzuna] Fetching for: ${q.what} in ${q.country}`);
            
            const data = await retry(async () => {
                const url = `https://api.adzuna.com/v1/api/jobs/${q.country}/search/1?app_id=${appId}&app_key=${appKey}&what=${encodeURIComponent(q.what)}&results_per_page=30`;
                const res = await fetch(url);
                
                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(`Adzuna API failed: ${res.status} - ${errText}`);
                }
                
                return await res.json() as { results?: AdzunaJob[] };
            }, 2, 2000);

            const jobs = data?.results || [];
            console.log(`[Adzuna] Found ${jobs.length} jobs for "${q.what}"`);

            for (const j of jobs) {
                if (!j.title || !j.redirect_url) continue;
                
                const company = j.company?.display_name || 'Unknown';
                results.push({
                    external_id: `adzuna_${j.id}`,
                    title: j.title,
                    company,
                    location: j.location?.display_name || 'India',
                    job_type: j.contract_type === 'permanent' ? 'FULLTIME' : 'CONTRACT',
                    platform: 'Adzuna',
                    source: 'adzuna',
                    apply_url: j.redirect_url,
                    description: j.description || '',
                    posted_date: j.created || new Date().toISOString(),
                    country: 'India',
                    is_mnc: isMNC(company)
                });
            }
        } catch (_err) {
            console.error(`[Adzuna] Error for query "${q.what}":`, _err instanceof Error ? _err.message : _err);
        }
    }

    return results;
}

