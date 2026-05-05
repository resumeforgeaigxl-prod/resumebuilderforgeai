'use client';

import { useState, useEffect } from 'react';
import { 
    Search, MapPin, Briefcase, Trash2, 
    ExternalLink, Filter, Loader2, AlertCircle,
    ChevronLeft, ChevronRight, CheckCircle2
} from 'lucide-react';

interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    country: string;
    job_type: string;
    source: string;
    created_at: string;
}

export default function JobsMonitorClient() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalJobs, setTotalJobs] = useState(0);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                search: searchTerm,
                page: page.toString(),
                limit: '20'
            });
            const res = await fetch(`/api/jobs/list?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setJobs(data.jobs);
                setTotalJobs(data.totalJobs);
            }
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [page]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchJobs();
    };

    const deleteJob = async (id: string) => {
        if (!confirm('Are you sure you want to remove this job?')) return;
        setDeletingId(id);
        try {
            const res = await fetch(`/api/admin/jobs/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobId: id })
            });
            if (res.ok) {
                setJobs(prev => prev.filter(j => j.id !== id));
                setTotalJobs(prev => prev - 1);
            } else {
                alert('Failed to delete job');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <form onSubmit={handleSearch} className="relative w-full md:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                        type="text"
                        placeholder="Filter by title or company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-white"
                    />
                </form>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => fetchJobs()}
                        className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                        title="Refresh data"
                    >
                        <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="glass-card overflow-hidden border-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Job Details</th>
                                <th className="hidden md:table-cell px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Location</th>
                                <th className="hidden lg:table-cell px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Source</th>
                                <th className="hidden sm:table-cell px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Ingested</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading && jobs.length === 0 ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-8"><div className="h-4 bg-white/5 rounded w-full" /></td>
                                    </tr>
                                ))
                            ) : jobs.length > 0 ? (
                                jobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-white truncate max-w-[140px] xs:max-w-xs">{job.title}</div>
                                            <div className="text-[10px] text-indigo-400 font-bold mb-1">{job.company}</div>
                                            <div className="md:hidden text-[9px] text-slate-500 uppercase flex items-center gap-1">
                                                <MapPin className="w-2.5 h-2.5" /> {job.location}
                                            </div>
                                        </td>
                                        <td className="hidden md:table-cell px-6 py-4">
                                            <div className="text-sm text-slate-400 flex items-center gap-1.5">
                                                <MapPin className="w-3 h-3 text-indigo-400/50" />
                                                {job.location}
                                            </div>
                                            <div className="text-[10px] text-slate-600 uppercase font-black">{job.country}</div>
                                        </td>
                                        <td className="hidden lg:table-cell px-6 py-4">
                                            <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-[10px] font-black text-indigo-400 uppercase tracking-tighter">
                                                {job.source}
                                            </span>
                                        </td>
                                        <td className="hidden sm:table-cell px-6 py-4 text-xs text-slate-500">
                                            {new Date(job.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => deleteJob(job.id)}
                                                    disabled={deletingId === job.id}
                                                    className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 rounded-lg transition-all disabled:opacity-50"
                                                >
                                                    {deletingId === job.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <AlertCircle className="w-10 h-10 text-slate-700 mx-auto mb-4" />
                                        <p className="text-slate-500 font-medium">No jobs found in database matching criteria.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {totalJobs > 20 && (
                <div className="flex items-center justify-between px-2">
                    <p className="text-xs text-slate-500 font-medium">
                        Showing {(page-1)*20+1}-{Math.min(page*20, totalJobs)} of {totalJobs} jobs
                    </p>
                    <div className="flex items-center gap-4">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 disabled:opacity-30 transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" /> Previous
                        </button>
                        <button 
                            disabled={page * 20 >= totalJobs}
                            onClick={() => setPage(p => p + 1)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 disabled:opacity-30 transition-all"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
