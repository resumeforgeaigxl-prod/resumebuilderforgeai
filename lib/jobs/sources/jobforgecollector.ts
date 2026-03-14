import { NormalisedJob } from '../ingestion-service';
import { generateJsonGemini } from '@/lib/gemini-service';
import { createClient } from '@supabase/supabase-js';
import { searchSerper, searchDuckDuckGo, searchTavily, SearchResult } from './search-providers';

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
    const normalizeForDupCheck = (text: string) => 
        (text || '').toLowerCase().replace(/[^a-z0-9]/g, '');

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
                
                // STAGE 5: DEDUPLICATION
                const normTitle = normalizeForDupCheck(job.title);
                const normCompany = normalizeForDupCheck(job.company);
                const normLoc = normalizeForDupCheck(location);
                
                const isLocalDup = finalJobs.some(f =>
                    normalizeForDupCheck(f.title!) === normTitle && 
                    normalizeForDupCheck(f.company!) === normCompany &&
                    normalizeForDupCheck(f.location!) === normLoc
                );

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
