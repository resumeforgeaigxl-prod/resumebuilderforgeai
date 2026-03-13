import { createAdminClient } from '@/lib/supabase/admin';
import JobSourcesClient from './client-page';
import { ShieldCheck } from 'lucide-react';

export default async function JobSourcesPage() {
    const supabase = createAdminClient();

    // Fetch counts per source
    const sources = ['jsearch', 'adzuna', 'apify', 'jobforgecollector'];
    const stats: Record<string, number> = {};

    for (const s of sources) {
        const { count } = await supabase
            .from('jobs')
            .select('*', { count: 'exact', head: true })
            .eq('source', s);
        stats[s] = count || 0;
    }

    return (
        <div className="space-y-8 pb-20">
            <header>
                <div className="flex items-center gap-2 text-indigo-400 font-bold tracking-widest text-[10px] uppercase mb-4">
                    <ShieldCheck className="w-3.5 h-3.5" /> Source Governance
                </div>
                <h1 className="text-4xl font-bold tracking-tighter text-white">Job Ingestion Sources</h1>
                <p className="text-slate-400 mt-2">Monitor and manually trigger job aggregation pipelines.</p>
            </header>

            <JobSourcesClient initialStats={stats} />
        </div>
    );
}
