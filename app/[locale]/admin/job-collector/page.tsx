export const dynamic = 'force-dynamic';
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
                <div className="flex items-center gap-2 text-indigo-600 font-bold tracking-widest text-[11px] font-mono uppercase mb-4">
                    <Target className="w-3.5 h-3.5" /> AI Target Intel
                </div>
                <h1 className="text-4xl font-bold tracking-tighter text-[#171717]">JobForge Collector</h1>
                <p className="text-[#666666] mt-2">Manage AI-targeted job discovery and global sync pipelines.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-[#EBEBEB] p-6 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    <div className="text-xs font-semibold text-[#8F8F8F] uppercase tracking-wider font-mono mb-1">Total Clean Jobs</div>
                    <div className="text-3xl font-black text-[#171717]">{(totalJobs || 0).toLocaleString()}</div>
                </div>
                <div className="bg-white border border-[#EBEBEB] p-6 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider font-mono mb-1">AI Collector Hits</div>
                    <div className="text-3xl font-black text-indigo-600">{(collectorJobs || 0).toLocaleString()}</div>
                </div>
                <div className="bg-white border border-[#EBEBEB] p-6 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    <div className="text-xs font-semibold text-[#8F8F8F] uppercase tracking-wider font-mono mb-1">Target Companies</div>
                    <div className="text-3xl font-black text-[#171717]">{(targetCompanies || 0).toLocaleString()}</div>
                </div>
            </div>

            <JobCollectorClient />
        </div>
    );
}
