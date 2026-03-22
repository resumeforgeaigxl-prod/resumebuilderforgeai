import { NormalisedJob } from '../ingestion-service';
import { generateJsonGemini } from '@/lib/gemini-service';
import { createClient } from '@supabase/supabase-js';
import { searchSerper, searchDuckDuckGo, searchTavily, SearchResult } from './search-providers';
import { fetchJSearch } from './jsearch';
import { fetchAdzuna } from './adzuna';
import { fetchApify } from './apify';
import { isValidLocation, retry } from '../utils';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AIJobOutput {
    title?: string;
    company?: string;
    location?: string;
    job_type?: string;
    apply_url?: string;
    description?: string;
    posted_date?: string;
}

// PIPELINE LIMITS
const MAX_QUERIES = 25; // Balanced for speed
const MAX_JOBS = 100;
const MAX_TIME_MS = 180000; // 3 minutes

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchJobForgeCollector(requestedLimit: number = 80): Promise<Partial<NormalisedJob>[]> {
    const startTime = Date.now();
    const finalJobs: Partial<NormalisedJob>[] = [];
    
    // Stats for Logging
    const stats = {
        queries_generated: 0,
        queries_processed: 0,
        serper_results: 0,
        duckduckgo_results: 0,
        tavily_results: 0,
        merged_results: 0,
        valid_urls: 0,
        jobs_parsed: 0,
        duplicates_removed: 0,
        location_filtered: 0,
        jobs_collected: 0
    };

    console.log('[JobForgeCollector] Pipeline Initialized (Serper + DuckDuckGo + Tavily).');

    // Stage 1: QUERY GENERATOR
    const { data: companies } = await supabaseAdmin.from('target_companies').select('name').limit(20);
    const { data: roles } = await supabaseAdmin.from('target_roles').select('name').limit(15);
    
    if (!roles || roles.length === 0) {
        console.warn('[JobForgeCollector] No roles found in DB, using defaults.');
        roles?.push({ name: 'Software Engineer' }, { name: 'Full Stack Developer' });
    }

    const shuffledRoles = roles?.sort(() => 0.5 - Math.random()) || [];
    const shuffledCompanies = (companies || []).sort(() => 0.5 - Math.random());

    const queryQueue: { type: string; q: string }[] = [];

    // Company Queries - Targeting India offices
    shuffledCompanies.slice(0, 8).forEach((c: { name: string }) => {
        const r = shuffledRoles[Math.floor(Math.random() * shuffledRoles.length)].name;
        queryQueue.push({ type: 'company', q: `"${c.name}" "${r}" jobs India` });
        queryQueue.push({ type: 'company', q: `site:*.com/careers "${r}" India` });
    });

    // Platform Queries - Targeting Direct Job Pages in India
    const indianCities = ['Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Mumbai', 'Delhi NCR', 'Remote'];
    shuffledRoles.slice(0, 10).forEach((role: { name: string }) => {
        const city = indianCities[Math.floor(Math.random() * indianCities.length)];
        queryQueue.push({ type: 'platform', q: `site:linkedin.com/jobs/view "${role.name}" ${city} India` });
        queryQueue.push({ type: 'platform', q: `site:indeed.com/viewjob "${role.name}" ${city}` });
        queryQueue.push({ type: 'platform', q: `site:wellfound.com/jobs "${role.name}" India` });
        queryQueue.push({ type: 'platform', q: `site:boards.greenhouse.io "${role.name}" India` });
        queryQueue.push({ type: 'platform', q: `site:jobs.lever.co "${role.name}" India` });
    });

    stats.queries_generated = queryQueue.length;

    // Helpers
    const getPlatformFromUrl = (url: string): string => {
        const lower = url.toLowerCase();
        if (lower.includes('linkedin.com')) return 'LinkedIn';
        if (lower.includes('indeed.com')) return 'Indeed';
        if (lower.includes('wellfound.com')) return 'Wellfound';
        if (lower.includes('glassdoor.com')) return 'Glassdoor';
        if (lower.includes('greenhouse.io')) return 'Greenhouse';
        if (lower.includes('lever.co')) return 'Lever';
        if (lower.includes('ashbyhq.com')) return 'Ashby';
        return 'Company Career';
    };

    const isJobPage = (url: string) => {
        const lower = url.toLowerCase();
        const blocked = ['/jobs/search', '/jobs?q', '/l-', '/blog/', '/category/', '/teams/', '/about/', 'google.com/search'];
        if (blocked.some(p => lower.includes(p))) return false;
        
        const allowed = ['linkedin.com/jobs/view', 'indeed.com/viewjob', 'wellfound.com/jobs', 'greenhouse.io', 'lever.co', 'ashbyhq.com', 'workdayjobs.com', '/careers/', '/jobs/'];
        return allowed.some(p => lower.includes(p));
    };

    // MAIN PIPELINE LOOP
    for (const item of queryQueue) {
        if (stats.queries_processed >= MAX_QUERIES || finalJobs.length >= MAX_JOBS || (Date.now() - startTime) >= MAX_TIME_MS) break;

        if (stats.queries_processed > 0) {
            await sleep(1500); // Respectful delay
        }

        stats.queries_processed++;

        try {
            console.log(`[JobForgeCollector] Query ${stats.queries_processed}/${MAX_QUERIES}: "${item.q}"`);
            
            // SEARCH ENGINE
            const searchResults = await retry(async () => {
                const [serper, ddg, tavily] = await Promise.all([
                    searchSerper(item.q).catch(() => []),
                    searchDuckDuckGo(item.q).catch(() => []),
                    searchTavily(item.q).catch(() => [])
                ]);
                return [...serper, ...ddg, ...tavily];
            }, 1, 1000);

            stats.serper_results += searchResults.length;

            const mergedMap = new Map<string, SearchResult>();
            searchResults.forEach(res => {
                if (!mergedMap.has(res.url)) mergedMap.set(res.url, res);
            });
            const mergedResults = Array.from(mergedMap.values());
            stats.merged_results += mergedResults.length;

            const validSnippets = mergedResults.filter(r => isJobPage(r.url));
            stats.valid_urls += validSnippets.length;

            if (validSnippets.length === 0) continue;

            // AI EXTRACTION
            const aiOutput = await generateJsonGemini(
                `Extract active Indian job opportunities for the search query "${item.q}" from these results:
                ${JSON.stringify(validSnippets.slice(0, 10))}
                
                Return a JSON array of objects with fields: title, company, location, job_type, apply_url, description.
                STRICT RULES:
                1. Only extract specific job posting pages (not search result pages).
                2. Ensure title, company, and apply_url are exact.
                3. Focus on locations: Bangalore, Hyderabad, Pune, Chennai, Remote, or India.
                4. If location is missing or outside India, skip unless it's Remote.`,
                "You are a high-precision Indian job extractor. Only return valid, individual job postings."
            );

            const aiJobs = aiOutput as AIJobOutput[];

            if (!Array.isArray(aiJobs)) continue;

            for (const job of aiJobs) {
                if (!job.title || !job.company || !job.apply_url) continue;
                
                // Location Filter
                if (!isValidLocation(job.location || 'India')) {
                    stats.location_filtered++;
                    continue;
                }
                
                // Deduplicate in memory
                if (finalJobs.some(f => f.apply_url === job.apply_url)) {
                    stats.duplicates_removed++;
                    continue;
                }

                stats.jobs_parsed++;

                finalJobs.push({
                    external_id: `jfc_${Buffer.from(job.apply_url).toString('base64').slice(0, 24)}`,
                    title: job.title,
                    company: job.company,
                    location: job.location || 'India',
                    job_type: job.job_type || 'Full-time',
                    platform: getPlatformFromUrl(job.apply_url),
                    source: 'jobforgecollector',
                    apply_url: job.apply_url,
                    description: job.description || '',
                    posted_date: new Date().toISOString()
                });

                if (finalJobs.length >= requestedLimit) break;
            }

        } catch (err) {
            console.error(`[JobForgeCollector] Query Error "${item.q}":`, err instanceof Error ? err.message : err);
        }

        if (finalJobs.length >= requestedLimit) break;
    }

    // STAGE 7: EXTERNAL API INTEGRATION
    console.log('[JobForgeCollector] Fetching from External APIs...');
    
    // Parallelize with individual error handling and retries
    const sourceResults = await Promise.allSettled([
        retry(fetchArbeitnowJobs, 2, 2000),
        retry(fetchJobicyJobs, 2, 2000),
        retry(fetchMuseJobs, 2, 2000),
        retry(fetchJoobleJobs, 2, 2000),
        retry(fetchFindworkJobs, 2, 2000),
        retry(fetchCareerjetJobs, 2, 2000),
        retry(fetchJSearch, 2, 2000),
        retry(fetchAdzuna, 2, 2000),
        retry(fetchApify, 1, 2000)
    ]);

    const allSourceJobs: Partial<NormalisedJob>[] = [];
    sourceResults.forEach((res, idx) => {
        if (res.status === 'fulfilled') {
            allSourceJobs.push(...res.value);
        } else {
            console.error(`[JobForgeCollector] External Source #${idx} failed:`, res.reason);
        }
    });

    console.log(`[JobForgeCollector] Collected ${allSourceJobs.length} jobs from external APIs.`);

    // Merge API jobs
    for (const job of allSourceJobs) {
        if (!job.apply_url || !job.title) continue;

        const isDup = finalJobs.some(f => f.apply_url === job.apply_url || f.external_id === job.external_id);
        const isLocaleValid = isValidLocation(job.location || 'India');
        
        if (!isDup && isLocaleValid) {
            finalJobs.push({
                ...job,
                posted_date: job.posted_date || new Date().toISOString(),
                source: job.source || 'jobforgecollector'
            });
        } else if (!isLocaleValid) {
            stats.location_filtered++;
        } else {
            stats.duplicates_removed++;
        }
    }

    stats.jobs_collected = finalJobs.length;

    console.log(`
[JobForgeCollector] Final Statistics:
- Queries Processed: ${stats.queries_processed}
- Valid URLs Found: ${stats.valid_urls}
- API Jobs Fetched: ${allSourceJobs.length}
- Location Filtered: ${stats.location_filtered}
- Memory Duplicates: ${stats.duplicates_removed}
- Total Jobs Exported: ${stats.jobs_collected}
- Total Time: ${((Date.now() - startTime) / 1000).toFixed(2)}s
--------------------------------------
    `);

    return finalJobs;
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW SOURCE FETCHERS
// ─────────────────────────────────────────────────────────────────────────────

interface ArbeitnowJob {
    title: string;
    company_name: string;
    location: string;
    remote: boolean;
    url: string;
    description: string;
    created_at: number;
}

export async function fetchArbeitnowJobs(): Promise<Partial<NormalisedJob>[]> {
    try {
        const res = await fetch('https://www.arbeitnow.com/api/job-board-api', { signal: AbortSignal.timeout(10000) });
        if (!res.ok) throw new Error(`Arbeitnow status ${res.status}`);
        const data = await res.json() as { data?: ArbeitnowJob[] };
        return (data.data || []).map((j: ArbeitnowJob) => ({
            title: j.title,
            company: j.company_name,
            location: j.location,
            job_type: j.remote ? 'Remote' : 'Full-time',
            apply_url: j.url,
            description: j.description,
            posted_date: new Date(j.created_at * 1000).toISOString(),
            source: 'arbeitnow'
        }));
    } catch (e) {
        console.error('[Arbeitnow] Error:', e);
        return [];
    }
}

interface JobicyJob {
    jobTitle: string;
    companyName: string;
    jobGeo: string;
    url: string;
    jobDescription: string;
    pubDate: string;
}

export async function fetchJobicyJobs(): Promise<Partial<NormalisedJob>[]> {
    try {
        const res = await fetch('https://jobicy.com/api/v2/remote-jobs?count=30', { signal: AbortSignal.timeout(10000) });
        if (!res.ok) throw new Error(`Jobicy status ${res.status}`);
        const data = await res.json() as { jobs?: JobicyJob[] };
        return (data.jobs || []).map((j: JobicyJob) => ({
            title: j.jobTitle,
            company: j.companyName,
            location: j.jobGeo || 'Remote',
            job_type: 'Remote',
            apply_url: j.url,
            description: j.jobDescription,
            posted_date: j.pubDate,
            source: 'jobicy'
        }));
    } catch (e) {
        console.error('[Jobicy] Error:', e);
        return [];
    }
}

interface MuseJob {
    name: string;
    company: { name: string };
    locations: { name: string }[];
    refs: { landing_page: string };
    contents: string;
    publication_date: string;
}

export async function fetchMuseJobs(): Promise<Partial<NormalisedJob>[]> {
    try {
        const res = await fetch('https://www.themuse.com/api/public/jobs?page=0&category=Software%20Engineering&location=India', { signal: AbortSignal.timeout(10000) });
        if (!res.ok) throw new Error(`The Muse status ${res.status}`);
        const data = await res.json() as { results?: MuseJob[] };
        return (data.results || []).map((j: MuseJob) => ({
            title: j.name,
            company: j.company?.name || 'Unknown',
            location: j.locations?.[0]?.name || 'India',
            job_type: 'Full-time',
            apply_url: j.refs?.landing_page,
            description: j.contents,
            posted_date: j.publication_date,
            source: 'themuse'
        }));
    } catch (e) {
        console.error('[The Muse] Error:', e);
        return [];
    }
}

interface JoobleJob {
    title: string;
    company: string;
    location: string;
    type: string;
    link: string;
    snippet: string;
    updated: string;
}

export async function fetchJoobleJobs(): Promise<Partial<NormalisedJob>[]> {
    const key = process.env.JOOBLE_API_KEY;
    if (!key) return [];
    try {
        const res = await fetch(`https://jooble.org/api/${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keywords: 'software developer', location: 'India' }),
            signal: AbortSignal.timeout(10000)
        });
        if (!res.ok) throw new Error(`Jooble status ${res.status}`);
        const data = await res.json() as { jobs?: JoobleJob[] };
        return (data.jobs || []).map((j: JoobleJob) => ({
            title: j.title,
            company: j.company || 'Unknown',
            location: j.location || 'India',
            job_type: j.type || 'Full-time',
            apply_url: j.link,
            description: j.snippet,
            posted_date: j.updated,
            source: 'jooble'
        }));
    } catch (e) {
        console.error('[Jooble] Error:', e);
        return [];
    }
}

interface FindworkJob {
    role: string;
    company_name: string;
    location: string;
    employment_type: string;
    url: string;
    text: string;
    date_posted: string;
}

export async function fetchFindworkJobs(): Promise<Partial<NormalisedJob>[]> {
    const token = process.env.FINDWORK_API_TOKEN;
    if (!token) return [];
    try {
        const res = await fetch('https://findwork.dev/api/jobs/?location=india&search=software', {
            headers: { 'Authorization': `Token ${token}` },
            signal: AbortSignal.timeout(10000)
        });
        if (!res.ok) throw new Error(`Findwork status ${res.status}`);
        const data = await res.json() as { results?: FindworkJob[] };
        return (data.results || []).map((j: FindworkJob) => ({
            title: j.role,
            company: j.company_name,
            location: j.location || 'India',
            job_type: j.employment_type || 'Full-time',
            apply_url: j.url,
            description: j.text,
            posted_date: j.date_posted,
            source: 'findwork'
        }));
    } catch (e) {
        console.error('[Findwork] Error:', e);
        return [];
    }
}

interface CareerjetJob {
    title: string;
    company: string;
    locations: string;
    url: string;
    description: string;
    date: string;
}

export async function fetchCareerjetJobs(): Promise<Partial<NormalisedJob>[]> {
    const affid = process.env.CAREERJET_AFFID || 'test';
    try {
        const res = await fetch(`http://public.api.careerjet.net/search?affid=${affid}&keywords=software&location=india&user_ip=127.0.0.1&user_agent=Mozilla`, {
             signal: AbortSignal.timeout(10000) 
        });
        if (!res.ok) throw new Error(`Careerjet status ${res.status}`);
        const data = await res.json() as { jobs?: CareerjetJob[] };
        return (data.jobs || []).map((j: CareerjetJob) => ({
            title: j.title,
            company: j.company,
            location: j.locations || 'India',
            apply_url: j.url,
            description: j.description,
            posted_date: j.date,
            source: 'careerjet'
        }));
    } catch (e) {
        console.error('[Careerjet] Error:', e);
        return [];
    }
}

