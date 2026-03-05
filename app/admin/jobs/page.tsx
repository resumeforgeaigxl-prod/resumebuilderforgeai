'use client';

import { useState, useEffect, useCallback } from 'react';
import { Briefcase, Star, Users, MousePointerClick, Eye, RefreshCw, Loader2 } from 'lucide-react';

interface Application {
    id: string;
    user_id: string;
    user_email: string | null;
    user_name: string | null;
    job_title: string;
    company: string;
    apply_url: string;
    applied_at: string;
}

interface JobStats {
    total: number;
    mnc: number;
    applications: number;
    views: number;
    recentApplications: Application[];
}

export default function AdminJobsPage() {
    const [stats, setStats] = useState<JobStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/jobs');
            const data = await res.json();
            if (data.success) {
                setStats(data);
                setLastUpdated(new Date());
            }
        } catch (e) {
            console.error('Admin jobs fetch error:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 10000);
        return () => clearInterval(interval);
    }, [fetchStats]);

    const cards = stats ? [
        { label: 'Total Jobs', value: stats.total, icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'MNC Jobs', value: stats.mnc, icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { label: 'Total Applications', value: stats.applications, icon: MousePointerClick, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Total Job Views', value: stats.views, icon: Eye, color: 'text-purple-400', bg: 'bg-purple-500/10' }
    ] : [];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-blue-400" />
                        Jobs Monitor
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Job board stats, applications, and activity tracking
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {lastUpdated && (
                        <p className="text-[11px] text-slate-600">
                            Updated {lastUpdated.toLocaleTimeString()}
                        </p>
                    )}
                    <button
                        onClick={fetchStats}
                        className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all"
                    >
                        <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                        Refresh
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 opacity-50" />
                </div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {cards.map(card => (
                            <div key={card.label} className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                                <div className={`inline-flex p-3 rounded-xl ${card.bg} mb-4`}>
                                    <card.icon className={`w-5 h-5 ${card.color}`} />
                                </div>
                                <div className="text-3xl font-bold text-white mb-1">{card.value.toLocaleString()}</div>
                                <div className="text-sm text-slate-400">{card.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Recent Applications Table */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
                                <Users className="w-4 h-4 text-emerald-400" />
                                <h2 className="font-semibold text-sm">Recent Job Applications</h2>
                                <span className="ml-auto text-xs text-slate-500">Live</span>
                            </div>

                            {stats?.recentApplications?.length === 0 ? (
                                <div className="py-16 text-center text-slate-600 text-sm">
                                    No applications tracked yet.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-white/5 text-xs text-slate-500 uppercase tracking-wider">
                                                <th className="px-6 py-3 text-left font-bold">User</th>
                                                <th className="px-6 py-3 text-left font-bold">Job</th>
                                                <th className="px-6 py-3 text-left font-bold">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {stats?.recentApplications?.map(app => (
                                                <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-6 py-3">
                                                        <p className="text-slate-200 font-semibold text-xs truncate max-w-[120px]">{app.user_name || app.user_email}</p>
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <p className="text-slate-200 font-medium truncate max-w-[150px]">{app.job_title}</p>
                                                        <p className="text-slate-500 text-[10px]">{app.company}</p>
                                                    </td>
                                                    <td className="px-6 py-3 text-slate-500 text-[10px]">
                                                        {new Date(app.applied_at).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Recent Job Listings (Ingestion Monitor) */}
                        <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
                                <RefreshCw className="w-4 h-4 text-blue-400" />
                                <h2 className="font-semibold text-sm">Recently Ingested Jobs</h2>
                                <span className="ml-auto text-xs text-slate-500">Updates live</span>
                            </div>

                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {(stats as any)?.recentJobs?.length === 0 ? (
                                <div className="py-16 text-center text-slate-600 text-sm">
                                    No jobs added recently.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-white/5 text-xs text-slate-500 uppercase tracking-wider">
                                                <th className="px-6 py-3 text-left font-bold">Job Title</th>
                                                <th className="px-6 py-3 text-left font-bold">Company</th>
                                                <th className="px-6 py-3 text-left font-bold">Source</th>
                                                <th className="px-6 py-3 text-left font-bold">Added</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            {(stats as any)?.recentJobs?.map((job: any) => (
                                                <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-6 py-3 text-slate-200 font-semibold text-xs truncate max-w-[180px]">{job.title}</td>
                                                    <td className="px-6 py-3 text-slate-400 text-xs">{job.company}</td>
                                                    <td className="px-6 py-3">
                                                        <span className="px-2 py-1 bg-white/5 text-[10px] text-slate-500 rounded-md font-bold uppercase tracking-widest">{job.source}</span>
                                                    </td>
                                                    <td className="px-6 py-3 text-slate-500 text-[10px]">
                                                        {new Date(job.created_at).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
