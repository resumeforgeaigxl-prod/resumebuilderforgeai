import { NormalisedJob, isMNC } from '../ingestion-service';

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
    if (!appId || !appKey) return [];

    const queries = [
        { country: 'in', what: 'software engineer fresher' },
        { country: 'us', what: 'software engineer entry level' }
    ];
    const results: NormalisedJob[] = [];

    for (const q of queries) {
        try {
            const url = `https://api.adzuna.com/v1/api/jobs/${q.country}/search/1?app_id=${appId}&app_key=${appKey}&what=${encodeURIComponent(q.what)}&results_per_page=20`;
            const res = await fetch(url);
            if (!res.ok) continue;

            const data = await res.json() as { results?: AdzunaJob[] };
            const jobs = data?.results || [];

            for (const j of jobs) {
                const company = j.company?.display_name || 'Unknown';
                results.push({
                    external_id: `adzuna_${j.id}`,
                    title: j.title,
                    company,
                    location: j.location?.display_name || 'Remote',
                    job_type: j.contract_type === 'permanent' ? 'FULLTIME' : 'CONTRACT',
                    platform: 'Adzuna',
                    source: 'adzuna',
                    apply_url: j.redirect_url || '',
                    description: j.description || '',
                    posted_date: j.created || new Date().toISOString(),
                    country: q.country === 'in' ? 'India' : 'United States',
                    is_mnc: isMNC(company)
                });
            }
        } catch (_err) {
            console.error('[Adzuna] Fetch Error:', _err);
        }
    }

    return results;
}
