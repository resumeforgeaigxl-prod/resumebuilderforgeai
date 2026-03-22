import { NormalisedJob, isMNC } from '../ingestion-service';
import { retry } from '../utils';

interface JSearchJob {
    job_id: string;
    job_title: string;
    employer_name: string;
    job_city: string;
    job_country: string;
    job_is_remote: boolean;
    job_employment_type: string;
    job_apply_link: string;
    job_description: string;
    job_posted_at_datetime_utc: string;
}

export async function fetchJSearch(): Promise<NormalisedJob[]> {
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
        console.warn('[JSearch] No API key found.');
        return [];
    }

    const queries = [
        'software developer india',
        'software engineer fresher india',
        'web developer intern india'
    ];
    
    const results: NormalisedJob[] = [];

    for (const q of queries) {
        try {
            console.log(`[JSearch] Fetching for query: "${q}"`);
            
            const data = await retry(async () => {
                const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(q)}&page=1&num_pages=1&date_posted=month`;
                const res = await fetch(url, {
                    headers: {
                        'X-RapidAPI-Key': apiKey,
                        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
                    }
                });

                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(`JSearch API failed: ${res.status} - ${errText}`);
                }
                
                return await res.json() as { data?: JSearchJob[] };
            }, 2, 2000);

            const jobs = data?.data || [];
            console.log(`[JSearch] Found ${jobs.length} jobs for "${q}"`);

            for (const j of jobs) {
                if (!j.job_title || !j.job_apply_link) continue;
                
                results.push({
                    external_id: `jsearch_${j.job_id}`,
                    title: j.job_title,
                    company: j.employer_name || 'Unknown',
                    location: j.job_is_remote ? 'Remote' : (j.job_city ? `${j.job_city}, ${j.job_country || 'India'}` : 'India'),
                    job_type: j.job_employment_type || 'FULLTIME',
                    platform: 'JSearch',
                    source: 'jsearch',
                    apply_url: j.job_apply_link,
                    description: j.job_description || '',
                    posted_date: j.job_posted_at_datetime_utc || new Date().toISOString(),
                    country: j.job_country || 'India',
                    is_mnc: isMNC(j.employer_name)
                });
            }
        } catch (_err) {
            console.error(`[JSearch] Error for query "${q}":`, _err instanceof Error ? _err.message : _err);
        }
    }

    return results;
}

