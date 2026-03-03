'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileHeart, Loader2, RefreshCw, Calendar, Building2, Briefcase, FileText } from 'lucide-react';

interface CoverLetter {
    id: string;
    user_id: string;
    role_title: string;
    company_name: string;
    word_count: number;
    created_at: string;
}

export default function AdminCoverLettersPage() {
    const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/cover-letters');
            const data = await res.json();
            if (data.success) {
                setCoverLetters(data.coverLetters || []);
                setTotal(data.total || 0);
            }
        } catch (e) {
            console.error('Cover letters fetch error:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [fetchData]);

    return (
        <div className="p-4 sm:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileHeart className="w-6 h-6 text-pink-400" />
                        Cover Letters
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        All AI-generated cover letters across the platform
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all"
                >
                    <RefreshCw className="w-3.5 h-3.5 text-pink-400" />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="inline-flex p-3 rounded-xl bg-pink-500/10 mb-4">
                        <FileHeart className="w-5 h-5 text-pink-400" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{total}</div>
                    <div className="text-sm text-slate-400">Total Generated</div>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="inline-flex p-3 rounded-xl bg-purple-500/10 mb-4">
                        <Briefcase className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                        {new Set(coverLetters.map(c => c.role_title).filter(Boolean)).size}
                    </div>
                    <div className="text-sm text-slate-400">Unique Roles</div>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="inline-flex p-3 rounded-xl bg-blue-500/10 mb-4">
                        <Building2 className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                        {new Set(coverLetters.map(c => c.company_name).filter(Boolean)).size}
                    </div>
                    <div className="text-sm text-slate-400">Unique Companies</div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-pink-400" />
                    <h2 className="font-semibold text-sm">Recent Cover Letters</h2>
                    <span className="ml-auto text-xs text-slate-600">Auto-refreshes every 10s</span>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-7 h-7 animate-spin text-pink-400 opacity-50" />
                    </div>
                ) : coverLetters.length === 0 ? (
                    <div className="py-16 text-center text-slate-600 text-sm">
                        No cover letters generated yet. They will appear here once users generate them.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-white/5 text-xs text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3 text-left font-bold">User ID</th>
                                    <th className="px-6 py-3 text-left font-bold">Role</th>
                                    <th className="px-6 py-3 text-left font-bold">Company</th>
                                    <th className="px-6 py-3 text-left font-bold">Words</th>
                                    <th className="px-6 py-3 text-left font-bold">Generated</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {coverLetters.map(cl => (
                                    <tr key={cl.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-3 font-mono text-xs text-slate-500">
                                            {cl.user_id?.slice(0, 8)}…
                                        </td>
                                        <td className="px-6 py-3 text-slate-200 font-medium">
                                            {cl.role_title || <span className="text-slate-600 italic">Unknown Role</span>}
                                        </td>
                                        <td className="px-6 py-3 text-slate-400">
                                            {cl.company_name || <span className="text-slate-600 italic">Not specified</span>}
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className="px-2 py-0.5 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-md text-[11px] font-bold">
                                                {cl.word_count || 0}w
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-slate-500 text-xs flex items-center gap-2">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(cl.created_at).toLocaleString('en-IN', {
                                                day: '2-digit', month: 'short',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
