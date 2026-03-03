'use client';

import { useState, useEffect, useCallback } from 'react';
import { Briefcase, Star, Users, MousePointerClick, Eye, RefreshCw, Loader2, ExternalLink, Mail } from 'lucide-react';

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
                    <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
                            <Users className="w-4 h-4 text-emerald-400" />
                            <h2 className="font-semibold text-sm">Recent Job Applications</h2>
                            <span className="ml-auto text-xs text-slate-500">Live · auto-refreshes every 10s</span>
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
                                            <th className="px-6 py-3 text-left font-bold">Job Title</th>
                                            <th className="px-6 py-3 text-left font-bold">Company</th>
                                            <th className="px-6 py-3 text-left font-bold">Date</th>
                                            <th className="px-6 py-3 text-left font-bold">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {stats?.recentApplications?.map(app => (
                                            <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                                                {/* User cell — shows avatar, name & email */}
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-2.5">
                                                        {/* Avatar initials */}
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/40 to-purple-500/40 border border-indigo-500/20 flex items-center justify-center shrink-0">
                                                            <span className="text-[11px] font-bold text-indigo-300 uppercase">
                                                                {(app.user_name || app.user_email || '?').charAt(0)}
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0">
                                                            {app.user_name && (
                                                                <p className="text-slate-200 font-semibold text-xs truncate max-w-[150px]">
                                                                    {app.user_name}
                                                                </p>
                                                            )}
                                                            {app.user_email ? (
                                                                <p className="text-slate-500 text-[11px] flex items-center gap-1 truncate max-w-[160px]">
                                                                    <Mail className="w-2.5 h-2.5 shrink-0" />
                                                                    {app.user_email}
                                                                </p>
                                                            ) : (
                                                                <p className="font-mono text-[10px] text-slate-600">
                                                                    {app.user_id?.slice(0, 12)}…
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 text-slate-200 font-medium">{app.job_title}</td>
                                                <td className="px-6 py-3 text-slate-400">{app.company}</td>
                                                <td className="px-6 py-3 text-slate-500 text-xs">
                                                    {new Date(app.applied_at).toLocaleString('en-IN', {
                                                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </td>
                                                <td className="px-6 py-3">
                                                    <a
                                                        href={app.apply_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors"
                                                    >
                                                        <ExternalLink className="w-3 h-3" /> View Job
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
