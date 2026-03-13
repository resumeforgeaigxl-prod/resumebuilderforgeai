import { NormalisedJob } from '../ingestion-service';
import { generateJsonGemini } from '@/lib/gemini-service';

interface AIJobOutput {
    title?: string;
    company?: string;
    location?: string;
    job_type?: string;
    apply_url?: string;
    description?: string;
    posted_date?: string;
}
import google from 'googlethis';

const TARGET_COMPANIES = ['Google', 'Amazon', 'Microsoft', 'IBM', 'Meta', 'Netflix', 'NVIDIA', 'Apple', 'Oracle'];
const TARGET_ROLES = ['Software Engineer Intern', 'Backend Developer Intern', 'Fullstack Intern', 'Data Science Intern'];

export async function fetchJobForgeCollector(): Promise<NormalisedJob[]> {
    const results: NormalisedJob[] = [];

    for (const company of TARGET_COMPANIES) {
        for (const role of TARGET_ROLES) {
            try {
                const query = `${company} ${role} careers openings 2026`;
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

                // Use Gemini Flash to extract job details from snippets
                const aiOutput = await generateJsonGemini(
                    `Extract job opportunities for the query "${query}" from these search results:
                    ${JSON.stringify(snippets)}
                    
                    Return a JSON array of objects with fields: title, company, location, job_type, apply_url, description, posted_date.
                    If results are not actual job postings for ${company}, return an empty array.
                    Ensure the output matches the company: ${company}.`,
                    "You are an expert AI job extractor. Only extract real job opportunities."
                );

                const aiJobs = aiOutput as AIJobOutput[];

                if (Array.isArray(aiJobs)) {
                    for (const job of aiJobs) {
                        results.push({
                            external_id: `jfc_${Buffer.from(job.apply_url || '').toString('base64').slice(0, 16)}`,
                            title: job.title || role,
                            company: company,
                            location: job.location || 'Remote',
                            job_type: job.job_type || 'Internship',
                            platform: 'MNC Careers',
                            source: 'jobforgecollector',
                            apply_url: job.apply_url || '',
                            description: job.description || '',
                            posted_date: job.posted_date || new Date().toISOString(),
                            is_mnc: true
                        });
                    }
                }
            } catch (err) {
                console.error(`[JobForgeCollector] Error for ${company} ${role}:`, err);
            }
        }
    }

    return results;
}
