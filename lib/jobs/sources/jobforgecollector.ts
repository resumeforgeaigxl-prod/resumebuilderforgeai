import { NormalisedJob } from '../ingestion-service';
import { generateJsonGemini } from '@/lib/gemini-service';
import { createClient } from '@supabase/supabase-js';
import { searchSerper, searchDuckDuckGo, searchTavily, SearchResult } from './search-providers';
import { fetchJSearch } from './jsearch';
import { fetchAdzuna } from './adzuna';
import { fetchApify } from './apify';

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
const MAX_QUERIES = 60;
const MAX_JOBS = 100;
const MAX_TIME_MS = 120000; // 2 minutes

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
        jobs_inserted: 0
    };

    console.log('[JobForgeCollector] Pipeline Initialized (Serper + DuckDuckGo + Tavily).');

    // Stage 1: QUERY GENERATOR (Optimization: No years)
    const { data: companies } = await supabaseAdmin.from('target_companies').select('name');
    const { data: roles } = await supabaseAdmin.from('target_roles').select('name');
    if (!roles || roles.length === 0) return [];

    const shuffledRoles = roles.sort(() => 0.5 - Math.random());
    const shuffledCompanies = (companies || []).sort(() => 0.5 - Math.random());

    const queryQueue: { type: string; q: string }[] = [];

    // Company Queries
    shuffledCompanies.slice(0, 10).forEach((c: { name: string }) => {
        const r = shuffledRoles[Math.floor(Math.random() * shuffledRoles.length)].name;
        const domain = c.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
        
        queryQueue.push({ type: 'company', q: `site:${domain} "${r}" "${c.name} careers"` });
        queryQueue.push({ type: 'company', q: `site:${domain}/jobs "${r}"` });
        queryQueue.push({ type: 'company', q: `site:${domain}/careers "${r}"` });
    });

    // Platform Queries - Targeting Direct Job Pages
    shuffledRoles.slice(0, 8).forEach((role: { name: string }) => {
        queryQueue.push({ type: 'platform', q: `site:linkedin.com/jobs/view "${role.name}" India` });
        queryQueue.push({ type: 'platform', q: `site:indeed.com/viewjob "${role.name}" India` });
        queryQueue.push({ type: 'platform', q: `site:wellfound.com/jobs "${role.name}"` });
        queryQueue.push({ type: 'platform', q: `site:boards.greenhouse.io "${role.name}"` });
        queryQueue.push({ type: 'platform', q: `site:jobs.lever.co "${role.name}"` });
        queryQueue.push({ type: 'platform', q: `site:ashbyhq.com "${role.name}"` });
    });

    // Startup Queries
    shuffledRoles.slice(0, 5).forEach((role: { name: string }) => {
        queryQueue.push({ type: 'startup', q: `site:wellfound.com/jobs "${role.name}"` });
        queryQueue.push({ type: 'startup', q: `site:boards.greenhouse.io "${role.name}" India` });
        queryQueue.push({ type: 'startup', q: `site:jobs.lever.co "${role.name}" India` });
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
        // Allowed direct patterns
        const allowedDirect = [
            'linkedin.com/jobs/view',
            'indeed.com/viewjob',
            'wellfound.com/jobs',
            'glassdoor.com/job-listing',
            'greenhouse.io',
            'lever.co',
            'ashbyhq.com',
            'workdayjobs.com',
            'smartrecruiters.com',
            'bamboohr.com'
        ];
        
        // Blocked patterns
        const blocked = [
            'linkedin.com/jobs/search',
            'indeed.com/jobs?q',
            'indeed.com/l-', // location search
            '/blog/',
            '/category/',
            '/teams/',
            '/locations/',
            '/about/'
        ];

        if (blocked.some(p => lower.includes(p))) return false;
        if (allowedDirect.some(p => lower.includes(p))) return true;

        // Company career pages heuristics
        if (lower.includes('/careers/') || lower.includes('/jobs/') || lower.includes('/opportunities/')) {
            return !['search', 'index', 'listing'].some(k => lower.endsWith(k) || lower.includes(k + '?'));
        }
        
        return false;
    };

    // MAIN PIPELINE LOOP
    for (const item of queryQueue) {
        if (stats.queries_processed >= MAX_QUERIES || finalJobs.length >= MAX_JOBS || (Date.now() - startTime) >= MAX_TIME_MS) break;

        // Rate Limiting: 2 seconds delay between queries (except first)
        if (stats.queries_processed > 0) {
            await sleep(2000);
        }

        stats.queries_processed++;

        try {
            console.log(`[JobForgeCollector] Stage 2: Searching (${stats.queries_processed}/${MAX_QUERIES}) -> "${item.q}"`);
            
            // 2. SEARCH ENGINE (Parallel Providers)
            const [serperResults, ddgResults, tavilyResults] = await Promise.all([
                searchSerper(item.q),
                searchDuckDuckGo(item.q),
                searchTavily(item.q)
            ]);

            stats.serper_results += serperResults.length;
            stats.duckduckgo_results += ddgResults.length;
            stats.tavily_results += tavilyResults.length;

            // Merge and Deduplicate by URL
            const mergedMap = new Map<string, SearchResult>();
            [...serperResults, ...ddgResults, ...tavilyResults].forEach(res => {
                if (!mergedMap.has(res.url)) {
                    mergedMap.set(res.url, res);
                }
            });
            const mergedResults = Array.from(mergedMap.values());
            stats.merged_results += mergedResults.length;

            // DEBUG LOGGING: Show raw search results before filtering
            console.log(`[JobForgeCollector] Raw Search Results for "${item.q}":`);
            mergedResults.forEach(r => {
                const isJob = isJobPage(r.url);
                console.log(`  - [${isJob ? 'V' : 'X'}] ${r.url}`);
            });

            // Filter for Job Pages
            const validSnippets = mergedResults.filter(r => isJobPage(r.url));
            stats.valid_urls += validSnippets.length;

            if (validSnippets.length === 0) continue;

            // 3. AI EXTRACTION
            const aiOutput = await generateJsonGemini(
                `Extract job opportunities for the query "${item.q}" from these search results:
                ${JSON.stringify(validSnippets)}
                
                Return a JSON array of objects with fields: title, company, location, job_type, apply_url, description.
                STRICT RULES:
                1. Only extract specific job posting pages.
                2. Ensure title, company, and apply_url exist.
                3. Default location to "India" if missing.`,
                "You are a high-precision job extractor. Only return specific, valid job postings."
            );

            const aiJobs = aiOutput as AIJobOutput[];

            if (!Array.isArray(aiJobs)) continue;

            for (const job of aiJobs) {
                if (!job.title || !job.company || !job.apply_url) continue;
                
                const location = job.location || 'India';
                
                // STAGE 5: MEMORY DEDUPLICATION (Primary: apply_url)
                const isLocalDup = finalJobs.some(f => f.apply_url === job.apply_url);

                if (isLocalDup) {
                    stats.duplicates_removed++;
                    continue;
                }

                stats.jobs_parsed++;

                // STAGE 6: PLATFORM DETECTION & PREPARE
                finalJobs.push({
                    external_id: `jfc_${Buffer.from(job.apply_url).toString('base64').slice(0, 24)}`,
                    title: job.title,
                    company: job.company,
                    location: location,
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
            console.error(`[JobForgeCollector] Error processing query "${item.q}":`, err);
        }

        if (finalJobs.length >= requestedLimit) break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STAGE 7: EXTERNAL API INTEGRATION (NEW SOURCES)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('[JobForgeCollector] Stage 7: Running Parallel External APIs...');
    
    const [
        arbeitnowJobs, jobicyJobs, museJobs, joobleJobs, findworkJobs, careerjetJobs,
        jsearchJobs, adzunaJobs, apifyJobs
    ] = await Promise.all([
        fetchArbeitnowJobs().catch(e => { console.error('[Arbeitnow] failed:', e); return []; }),
        fetchJobicyJobs().catch(e => { console.error('[Jobicy] failed:', e); return []; }),
        fetchMuseJobs().catch(e => { console.error('[The Muse] failed:', e); return []; }),
        fetchJoobleJobs().catch(e => { console.error('[Jooble] failed:', e); return []; }),
        fetchFindworkJobs().catch(e => { console.error('[Findwork] failed:', e); return []; }),
        fetchCareerjetJobs().catch(e => { console.error('[Careerjet] failed:', e); return []; }),
        fetchJSearch().catch(e => { console.error('[JSearch] failed:', e); return []; }),
        fetchAdzuna().catch(e => { console.error('[Adzuna] failed:', e); return []; }),
        fetchApify().catch(e => { console.error('[Apify] failed:', e); return []; })
    ]);

    const allSourceJobs = [
        ...arbeitnowJobs, ...jobicyJobs, ...museJobs, ...joobleJobs, 
        ...findworkJobs, ...careerjetJobs, ...jsearchJobs, ...adzunaJobs, ...apifyJobs
    ];

    console.log(`[JobForgeCollector] New Sources Summary: 
      - Arbeitnow: ${arbeitnowJobs.length}
      - Jobicy: ${jobicyJobs.length}
      - The Muse: ${museJobs.length}
      - Jooble: ${joobleJobs.length}
      - Findwork: ${findworkJobs.length}
      - Careerjet: ${careerjetJobs.length}
      - JSearch: ${jsearchJobs.length}
      - Adzuna: ${adzunaJobs.length}
      - Apify: ${apifyJobs.length}`);

    // Merge API jobs with Search results using robust deduplication
    for (const job of allSourceJobs) {
        if (!job.apply_url && !job.title) continue;

        // Primary: apply_url. Fallback: hash(title+company+location)
        const dedupKey = job.apply_url || 
            `hash_${Buffer.from((job.title || '') + (job.company || '') + (job.location || '')).toString('base64').slice(0, 16)}`;

        const isDup = finalJobs.some(f => f.apply_url === job.apply_url || f.external_id === dedupKey);
        
        if (!isDup) {
            finalJobs.push({
                ...job,
                external_id: job.external_id || `api_${Buffer.from(dedupKey).toString('base64').slice(0, 24)}`,
                posted_date: job.posted_date || new Date().toISOString(),
                source: job.source || 'jobforgecollector'
            });
        } else {
            stats.duplicates_removed++;
        }
    }

    stats.jobs_inserted = finalJobs.length;

    // FINAL PIPELINE LOGS
    console.log(`
[JobForgeCollector]
queries_generated: ${stats.queries_generated}
serper_results: ${stats.serper_results}
duckduckgo_results: ${stats.duckduckgo_results}
tavily_results: ${stats.tavily_results}
merged_results: ${stats.merged_results}
valid_urls: ${stats.valid_urls}
jobs_inserted: ${stats.jobs_inserted}
Time Taken: ${((Date.now() - startTime) / 1000).toFixed(2)}s
--------------------------------------
    `);

    return finalJobs;
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW SOURCE FETCHERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 1. Arbeitnow API
 */
export async function fetchArbeitnowJobs(): Promise<Partial<NormalisedJob>[]> {
    try {
        const res = await fetch('https://www.arbeitnow.com/api/job-board-api', { signal: AbortSignal.timeout(10000) });
        const data = await res.json();
        return (data.data || []).map((j: { title: string; company_name: string; location: string; remote: boolean; url: string; description: string; created_at: number }) => ({
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
        console.error('[Arbeitnow] Fetch Error:', e);
        return [];
    }
}

/**
 * 2. Jobicy API
 */
export async function fetchJobicyJobs(): Promise<Partial<NormalisedJob>[]> {
    try {
        const res = await fetch('https://jobicy.com/api/v2/remote-jobs?count=20', { signal: AbortSignal.timeout(10000) });
        const data = await res.json();
        return (data.jobs || []).map((j: { jobTitle: string; companyName: string; jobGeo: string; url: string; jobDescription: string; pubDate: string }) => ({
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
        console.error('[Jobicy] Fetch Error:', e);
        return [];
    }
}

/**
 * 3. The Muse API
 */
export async function fetchMuseJobs(): Promise<Partial<NormalisedJob>[]> {
    try {
        const res = await fetch('https://www.themuse.com/api/public/jobs?page=0&category=Software%20Engineering&location=India', { signal: AbortSignal.timeout(10000) });
        const data = await res.json();
        return (data.results || []).map((j: { name: string; company: { name: string }; locations: { name: string }[]; refs: { landing_page: string }; contents: string; publication_date: string }) => ({
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
        console.error('[The Muse] Fetch Error:', e);
        return [];
    }
}

/**
 * 4. Jooble API
 */
export async function fetchJoobleJobs(): Promise<Partial<NormalisedJob>[]> {
    const key = process.env.JOOBLE_API_KEY;
    if (!key) {
        console.warn('[Jooble] No API Key found.');
        return [];
    }
    try {
        const res = await fetch(`https://jooble.org/api/${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keywords: 'software engineer', location: 'India' }),
            signal: AbortSignal.timeout(10000)
        });
        const data = await res.json();
        return (data.jobs || []).map((j: { title: string; company: string; location: string; type: string; link: string; snippet: string; updated: string }) => ({
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
        console.error('[Jooble] Fetch Error:', e);
        return [];
    }
}

/**
 * 5. Findwork API
 */
export async function fetchFindworkJobs(): Promise<Partial<NormalisedJob>[]> {
    const token = process.env.FINDWORK_API_TOKEN;
    if (!token) {
        console.warn('[Findwork] No API Token found.');
        return [];
    }
    try {
        const res = await fetch('https://findwork.dev/api/jobs/?location=india&search=software', {
            headers: { 'Authorization': `Token ${token}` },
            signal: AbortSignal.timeout(10000)
        });
        const data = await res.json();
        return (data.results || []).map((j: { role: string; company_name: string; location: string; employment_type: string; url: string; text: string; date_posted: string }) => ({
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
        console.error('[Findwork] Fetch Error:', e);
        return [];
    }
}

/**
 * 6. Careerjet API
 */
export async function fetchCareerjetJobs(): Promise<Partial<NormalisedJob>[]> {
    const affid = process.env.CAREERJET_AFFID || 'test'; // Use test if missing
    try {
        const res = await fetch(`http://public.api.careerjet.net/search?affid=${affid}&keywords=software&location=india&user_ip=127.0.0.1&user_agent=Mozilla`, {
             signal: AbortSignal.timeout(10000) 
        });
        const data = await res.json();
        return (data.jobs || []).map((j: { title: string; company: string; locations: string; url: string; description: string; date: string }) => ({
            title: j.title,
            company: j.company,
            location: j.locations || 'India',
            apply_url: j.url,
            description: j.description,
            posted_date: j.date,
            source: 'careerjet'
        }));
    } catch (e) {
        console.error('[Careerjet] Fetch Error:', e);
        return [];
    }
}
