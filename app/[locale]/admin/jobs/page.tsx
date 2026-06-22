export const dynamic = 'force-dynamic';
import { createAdminClient } from '@/lib/supabase/admin';
import JobsMonitorClient from './client-page';
import { Briefcase } from 'lucide-react';

export default async function JobsMonitorPage() {
    const supabase = createAdminClient();
    
    // Get total count
    const { count } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true });

    return (
        <div className="space-y-8 pb-20">
            <header>
                <div className="flex items-center gap-2 text-emerald-600 font-bold tracking-widest text-[10px] uppercase mb-4">
                    <Briefcase className="w-3.5 h-3.5" /> Platform Intelligence
                </div>
                <h1 className="text-4xl font-bold tracking-tighter text-[#171717]">Jobs Monitor</h1>
                <p className="text-[#8F8F8F] mt-2">Manage and monitor all AI-ingested jobs across the platform.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 border-[#EBEBEB]">
                    <div className="text-sm font-medium text-[#8F8F8F] mb-1">Live Job Database</div>
                    <div className="text-3xl font-black text-[#171717]">{(count || 0).toLocaleString()} <span className="text-xs text-[#8F8F8F] uppercase font-bold tracking-widest ml-2">Active Jobs</span></div>
                </div>
            </div>

            <JobsMonitorClient />
        </div>
    );
}
