'use client';

import { useState, useEffect } from 'react';
import { Play, Loader2, Database, Zap, Search, RefreshCcw, MapPin, CheckCircle2, XCircle } from 'lucide-react';

interface StoredJob {
    id: string;
    title?: string | null;
    company?: string | null;
    location?: string | null;
    source?: string | null;
    created_at: string;
}

export default function JobCollectorClient() {
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [status, setStatus] = useState<string>('');
    const [jobs, setJobs] = useState<StoredJob[]>([]);
    const [fetchingJobs, setFetchingJobs] = useState(false);
    const [filter, setFilter] = useState('');
    const [syncReport, setSyncReport] = useState<any>(null);

    const fetchJobs = async () => {
        setFetchingJobs(true);
        try {
            const res = await fetch('/api/admin/jobs');
            const data = await res.json();
            if (data.success) {
                setJobs(data.recentJobs || []);
            }
        } catch (err) {
            console.error('Failed to fetch jobs:', err);
        } finally {
            setFetchingJobs(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const runAction = async (action: 'collector' | 'sync' | 'dedupe', label: string) => {
        setLoading(prev => ({ ...prev, [action]: true }));
        setStatus(`Running ${label}...`);
        setSyncReport(null);

        try {
            let res;
            if (action === 'collector') {
                res = await fetch('/api/jobs/collector?limit=20');
            } else if (action === 'sync') {
                res = await fetch('/api/jobs/sync');
            } else {
                setStatus('Deduplication is handled automatically by the ingestion engine.');
                setLoading(prev => ({ ...prev, [action]: false }));
                return;
            }

            const data = await res.json();
            if (data.success) {
                const resultStats = data.summary?.unified_collector || data.stats || data.summary;
                setSyncReport(resultStats);
                setStatus(`${label} completed successfully.`);
                fetchJobs();
            } else {
                setStatus(`Error: ${data.detail || data.error}`);
            }
        } catch {
            setStatus('Failed to connect to API');
        } finally {
            setLoading(prev => ({ ...prev, [action]: false }));
        }
    };

    const filteredJobs = jobs.filter(j => 
        j.title?.toLowerCase().includes(filter.toLowerCase()) || 
        j.company?.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-white border border-[#EBEBEB] p-6 md:p-8 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] group hover:border-neutral-300 transition-all flex flex-col justify-between">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                            <Zap className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-lg md:text-xl font-bold text-[#171717]">Collector Run</h3>
                            <p className="text-xs md:text-sm text-[#666666]">Run targeted AI discovery for top tiers.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => runAction('collector', 'Collector')}
                        disabled={loading.collector}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-750 text-[#171717] font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm md:text-base shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                    >
                        {loading.collector ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        Start Collector
                    </button>
                </div>

                <div className="bg-white border border-[#EBEBEB] p-6 md:p-8 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] group hover:border-neutral-300 transition-all flex flex-col justify-between">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                            <RefreshCcw className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg md:text-xl font-bold text-[#171717]">Full Global Sync</h3>
                            <p className="text-xs md:text-sm text-[#666666]">Sync with all external AI APIs.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => runAction('sync', 'Full Sync')}
                        disabled={loading.sync}
                        className="w-full py-3 bg-white hover:bg-neutral-50 text-[#171717] border border-[#EBEBEB] font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm md:text-base shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                    >
                        {loading.sync ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                        Run Global Sync
                    </button>
                </div>
            </div>

            {status && (
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                        <span className="text-sm font-mono text-indigo-900 break-all">{status}</span>
                    </div>
                </div>
            )}

            {/* Sync Report Section */}
            {syncReport && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Inserted Jobs */}
                    <div className="bg-white border border-emerald-100 p-6 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] bg-emerald-50/10">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-emerald-700 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> New Ingestions ({syncReport.inserted || 0})
                            </h4>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto space-y-2 custom-scrollbar pr-2">
                            {syncReport.insertedDetails?.length > 0 ? (
                                syncReport.insertedDetails.map((job: any, i: number) => (
                                    <div key={i} className="p-3 bg-white rounded-lg border border-emerald-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                        <div className="text-xs font-bold text-emerald-950">{job.title}</div>
                                        <div className="text-[9px] text-emerald-600 font-mono mt-0.5 uppercase tracking-wide font-semibold">{job.company}</div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-[#666666] italic">No new jobs were inserted in this run.</p>
                            )}
                        </div>
                    </div>

                    {/* Skipped Jobs */}
                    <div className="bg-white border border-amber-100 p-6 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] bg-amber-50/10">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-amber-700 flex items-center gap-2">
                                <XCircle className="w-4 h-4" /> Skipped / Duplicates ({syncReport.skipped || 0})
                            </h4>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto space-y-2 custom-scrollbar pr-2">
                            {syncReport.skippedDetails?.length > 0 ? (
                                syncReport.skippedDetails.map((job: any, i: number) => (
                                    <div key={i} className="p-3 bg-white rounded-lg border border-amber-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                        <div className="text-xs font-bold text-amber-950">{job.title}</div>
                                        <div className="text-[9px] text-amber-600 font-mono mt-0.5 uppercase tracking-wide font-semibold">{job.company}</div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-[#666666] italic">No duplicates were found in this run.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white border border-[#EBEBEB] p-6 md:p-8 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h3 className="text-lg font-bold text-[#171717]">Stored Intelligence</h3>
                        <p className="text-xs text-[#666666]">Latest discovered jobs from the global vault.</p>
                    </div>
                    <div className="flex gap-2">
                         <div className="relative flex-1 sm:w-60">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F8F8F]" />
                            <input 
                                type="text" 
                                placeholder="Filter jobs..."
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full bg-white border border-[#EBEBEB] rounded-xl text-sm text-[#171717] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                         </div>
                         <button 
                            onClick={fetchJobs}
                            disabled={fetchingJobs}
                            className="p-2.5 bg-white hover:bg-neutral-50 border border-[#EBEBEB] rounded-xl text-[#666666] transition-all disabled:opacity-50"
                         >
                            <RefreshCcw className={`w-4 h-4 ${fetchingJobs ? 'animate-spin' : ''}`} />
                         </button>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-neutral-50 text-[#8F8F8F] uppercase text-[10px] font-bold tracking-widest font-mono border-y border-[#EBEBEB]">
                                <th className="px-6 py-4">Intelligence</th>
                                <th className="hidden sm:table-cell px-6 py-4">Location</th>
                                <th className="hidden lg:table-cell px-6 py-4">Source</th>
                                <th className="px-6 py-4 text-right">Collected</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EBEBEB]">
                            {fetchingJobs && jobs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mx-auto mb-2" />
                                        <span className="text-[#666666]">Fetching latest intelligence...</span>
                                    </td>
                                </tr>
                            ) : filteredJobs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-[#666666]">
                                        No jobs found in the vault.
                                    </td>
                                </tr>
                            ) : (
                                filteredJobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-neutral-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-[#171717] truncate max-w-[140px] xs:max-w-xs">{job.title}</div>
                                            <div className="text-[10px] text-indigo-600 font-semibold">{job.company}</div>
                                            <div className="sm:hidden text-[9px] text-[#8F8F8F] font-semibold uppercase mt-1 flex items-center gap-1">
                                                <MapPin className="w-2.5 h-2.5" /> {job.location || 'Remote'}
                                            </div>
                                        </td>
                                        <td className="hidden sm:table-cell px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-[#666666] text-xs">
                                                <MapPin className="w-3 h-3 text-[#8F8F8F]" />
                                                {job.location || 'Remote'}
                                            </div>
                                        </td>
                                        <td className="hidden lg:table-cell px-6 py-4">
                                            <span className="px-2 py-0.5 bg-neutral-50 border border-[#EBEBEB] rounded text-[9px] font-bold uppercase tracking-tighter text-[#666666]">
                                                {job.source}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-[#666666] tabular-nums text-xs font-medium">
                                            {new Date(job.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
