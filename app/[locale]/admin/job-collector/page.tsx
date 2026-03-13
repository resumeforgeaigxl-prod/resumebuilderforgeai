import { createAdminClient } from '@/lib/supabase/admin';
import JobCollectorClient from './client-page';
import { Target } from 'lucide-react';

export default async function JobCollectorAdminPage() {
    const supabase = createAdminClient();

    // Stats
    const { count: totalJobs } = await supabase.from('jobs').select('*', { count: 'exact', head: true });
    const { count: collectorJobs } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('source', 'jobforgecollector');
    const { count: targetCompanies } = await supabase.from('target_companies').select('*', { count: 'exact', head: true });
    
    return (
        <div className="space-y-8 pb-20">
            <header>
                <div className="flex items-center gap-2 text-indigo-400 font-bold tracking-widest text-[10px] uppercase mb-4">
                    <Target className="w-3.5 h-3.5" /> AI Target Intel
                </div>
                <h1 className="text-4xl font-bold tracking-tighter text-white">JobForge Collector</h1>
                <p className="text-slate-400 mt-2">Manage AI-targeted job discovery and global sync pipelines.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 border-white/5">
                    <div className="text-sm font-medium text-slate-500 mb-1">Total Clean Jobs</div>
                    <div className="text-3xl font-black text-white">{(totalJobs || 0).toLocaleString()}</div>
                </div>
                <div className="glass-card p-6 border-indigo-500/20">
                    <div className="text-sm font-medium text-indigo-400 mb-1">AI Collector Hits</div>
                    <div className="text-3xl font-black text-white">{(collectorJobs || 0).toLocaleString()}</div>
                </div>
                <div className="glass-card p-6 border-white/5">
                    <div className="text-sm font-medium text-slate-500 mb-1">Target Companies</div>
                    <div className="text-3xl font-black text-white">{(targetCompanies || 0).toLocaleString()}</div>
                </div>
            </div>

            <JobCollectorClient />
        </div>
    );
}
