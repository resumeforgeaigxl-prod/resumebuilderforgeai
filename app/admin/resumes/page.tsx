'use client';
import { useState, useEffect } from 'react';
import { FileText, Loader2, Search, Trash2, Calendar, Target, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ResumeRow {
    id: string; title: string; created_at: string; updated_at: string;
    user_email: string; ats_score: number | null;
}

export default function AdminResumesPage() {
    const [resumes, setResumes] = useState<ResumeRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deleting, setDeleting] = useState<string | null>(null);

    async function loadResumes() {
        setLoading(true);
        const res = await fetch('/api/admin/resumes');
        const data = await res.json();
        if (data.success) setResumes(data.resumes);
        setLoading(false);
    }

    useEffect(() => { loadResumes(); }, []);

    async function deleteResume(id: string) {
        if (!confirm('WARNING: Are you sure you want to delete this resume? The user will lose access.')) return;
        setDeleting(id);
        const res = await fetch(`/api/admin/resumes/${id}`, { method: 'DELETE' });
        if (res.ok) {
            setResumes(resumes.filter(r => r.id !== id));
        } else {
            alert('Failed to delete resume.');
        }
        setDeleting(null);
    }

    const filtered = resumes.filter(r =>
        r.title?.toLowerCase().includes(search.toLowerCase()) ||
        r.user_email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="w-6 h-6 text-purple-400" />Resume Monitoring</h1>
                    <p className="text-slate-500 text-sm mt-1">{resumes.length} total resumes indexed</p>
                </div>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search title or email…"
                        className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 w-full sm:w-64" />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-purple-400" /></div>
            ) : (
                <div className="space-y-4">
                    {/* Desktop View */}
                    <div className="hidden md:block bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-sm min-w-max">
                                <thead className="border-b border-white/10 bg-white/[0.02]">
                                    <tr className="text-left text-xs text-slate-500 uppercase tracking-wider">
                                        <th className="px-6 py-4 font-semibold">Document</th>
                                        <th className="px-6 py-4 font-semibold">Owner User</th>
                                        <th className="px-6 py-4 font-semibold text-center">ATS Score</th>
                                        <th className="px-6 py-4 font-semibold">Last Updated</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filtered.map(r => (
                                        <tr key={r.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                                                        <span className="text-white font-medium">{r.title || 'Untitled Resume'}</span>
                                                    </div>
                                                    <span className="text-[10px] text-slate-600 font-mono mt-1">ID: {r.id.split('-')[0]}...</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-300">
                                                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                                        {r.user_email.charAt(0).toUpperCase()}
                                                    </div>
                                                    {r.user_email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {r.ats_score !== null ? (
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs uppercase tracking-tighter shadow-sm shadow-emerald-500/10">
                                                        <Target className="w-3.5 h-3.5" />
                                                        {r.ats_score}%
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-500 uppercase font-bold tracking-widest">Unscored</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-slate-400">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-600" />
                                                    <span className="text-xs">{formatDistanceToNow(new Date(r.updated_at), { addSuffix: true })}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => deleteResume(r.id)}
                                                        disabled={deleting === r.id}
                                                        className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all active:scale-95"
                                                        title="Delete Resume"
                                                    >
                                                        {deleting === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden space-y-4">
                        {filtered.map(r => (
                            <div key={r.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                                            <span className="text-white font-semibold truncate block">{r.title || 'Untitled Resume'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                            <User className="w-3 h-3" />
                                            <span className="truncate max-w-[150px]">{r.user_email}</span>
                                        </div>
                                    </div>
                                    {r.ats_score !== null && (
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-xs font-bold text-emerald-400">{r.ats_score}%</span>
                                            <span className="text-[10px] text-slate-600 uppercase font-extrabold tracking-tighter">ATS Score</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium uppercase tracking-widest">
                                        <Calendar className="w-3 h-3" />
                                        {formatDistanceToNow(new Date(r.updated_at), { addSuffix: true })}
                                    </div>
                                    <button
                                        onClick={() => deleteResume(r.id)}
                                        disabled={deleting === r.id}
                                        className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 active:scale-95 transition-all"
                                    >
                                        {deleting === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
                            <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4 opacity-20" />
                            <h3 className="text-lg font-semibold text-slate-400">No resumes found</h3>
                            <p className="text-sm text-slate-600 mt-1">Try adjusting your search criteria.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
