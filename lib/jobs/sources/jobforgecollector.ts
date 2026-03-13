import { NormalisedJob } from '../ingestion-service';
import { generateJsonGemini } from '@/lib/gemini-service';
import { createClient } from '@supabase/supabase-js';
import google from 'googlethis';

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

export async function fetchJobForgeCollector(limit: number = 20): Promise<NormalisedJob[]> {
    const results: NormalisedJob[] = [];

    // 1. Get Target Companies and Roles from DB
    const { data: companies } = await supabaseAdmin.from('target_companies').select('name');
    const { data: roles } = await supabaseAdmin.from('target_roles').select('name');

    if (!companies || !roles) return [];

    // Pick a random subset to avoid hitting rate limits in one go if run frequently
    // Or just run a limited set if 'limit' is provided
    const shuffledCompanies = companies.sort(() => 0.5 - Math.random()).slice(0, 5);
    const shuffledRoles = roles.sort(() => 0.5 - Math.random()).slice(0, 4);

    for (const company of shuffledCompanies) {
        for (const role of shuffledRoles) {
            try {
                // Search Strategy: company + role + location
                const query = `${company.name} ${role.name} India careers openings 2026`;
                console.log(`[JobForgeCollector] Searching: ${query}`);
                
                const search = await google.search(query, {
                    page: 0,
                    safe: false,
                    parse_ads: false,
                    additional_params: {
                        hl: 'en'
                    }
                });

                const snippets = search.results.map(r => ({
                    title: r.title,
                    description: r.description,
                    url: r.url
                })).slice(0, 5);

                if (snippets.length === 0) continue;

                // Use Gemini Flash for extraction and classification
                const aiOutput = await generateJsonGemini(
                    `Extract job opportunities for the query "${query}" from these search results:
                    ${JSON.stringify(snippets)}
                    
                    Return a JSON array of objects with fields: title, company, location, job_type, apply_url, description, posted_date.
                    If results are not actual job postings for ${company.name}, return an empty array.
                    Classify job_type as 'Full-time', 'Internship', or 'Contract'.
                    Ensure the output matches the company: ${company.name}.`,
                    "You are an expert AI job extractor. Only extract real job opportunities."
                );

                const aiJobs = aiOutput as AIJobOutput[];

                if (Array.isArray(aiJobs)) {
                    for (const job of aiJobs) {
                        results.push({
                            external_id: `jfc_${Buffer.from(job.apply_url || '').toString('base64').slice(0, 16)}`,
                            title: job.title || role.name,
                            company: company.name,
                            location: job.location || 'Remote',
                            job_type: job.job_type || (role.name.toLowerCase().includes('intern') ? 'Internship' : 'Full-time'),
                            platform: 'Collector AI',
                            source: 'jobforgecollector',
                            apply_url: job.apply_url || '',
                            description: job.description || '',
                            posted_date: job.posted_date || new Date().toISOString(),
                            is_mnc: true // collector mostly targets high-tier companies
                        });
                    }
                }

                if (results.length >= limit) break;
            } catch (_err) {
                console.error(`[JobForgeCollector] Error for ${company.name} ${role.name}:`, _err);
            }
        }
        if (results.length >= limit) break;
    }

    return results;
}
