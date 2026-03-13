import { NormalisedJob, isMNC } from '../ingestion-service';

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
    if (!apiKey) return [];

    const queries = [
        'software engineer fresher india',
        'web developer intern india',
        'amazon sde intern',
        'google software engineer entry level'
    ];
    
    const results: NormalisedJob[] = [];

    for (const q of queries) {
        try {
            const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(q)}&page=1&num_pages=1&date_posted=month`;
            const res = await fetch(url, {
                headers: {
                    'X-RapidAPI-Key': apiKey,
                    'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
                }
            });

            if (!res.ok) continue;
            const data = await res.json() as { data?: JSearchJob[] };
            const jobs = data?.data || [];

            for (const j of jobs) {
                results.push({
                    external_id: `jsearch_${j.job_id}`,
                    title: j.job_title,
                    company: j.employer_name || 'Unknown',
                    location: j.job_is_remote ? 'Remote' : (j.job_city ? `${j.job_city}, ${j.job_country || 'India'}` : 'India'),
                    job_type: j.job_employment_type || 'FULLTIME',
                    platform: 'JSearch',
                    source: 'jsearch',
                    apply_url: j.job_apply_link || '',
                    description: j.job_description || '',
                    posted_date: j.job_posted_at_datetime_utc || new Date().toISOString(),
                    country: j.job_country || 'India',
                    is_mnc: isMNC(j.employer_name)
                });
            }
        } catch (_err) {
            console.error('[JSearch] Fetch Error:', _err);
        }
    }

    return results;
}
