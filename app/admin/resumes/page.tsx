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
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden overflow-x-auto">
                    <table className="w-full text-sm min-w-[800px]">
                        <thead className="border-b border-white/10 bg-white/5">
                            <tr className="text-left text-xs text-slate-500 uppercase tracking-wider">
                                <th className="px-5 py-3">Document</th>
                                <th className="px-5 py-3">Owner User</th>
                                <th className="px-5 py-3">Latest ATS Score</th>
                                <th className="px-5 py-3">Last Updated</th>
                                <th className="px-5 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.map(r => (
                                <tr key={r.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                                            <span className="font-medium text-white">{r.title || 'Untitled Resume'}</span>
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1 font-mono">{r.id.split('-')[0]}...</div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <User className="w-3.5 h-3.5 text-slate-500" />
                                            {r.user_email}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        {r.ats_score !== null ? (
                                            <div className="flex items-center gap-1.5">
                                                <Target className="w-4 h-4 text-emerald-400" />
                                                <span className="font-semibold text-emerald-400">{r.ats_score}%</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">Unscored</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-slate-400">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3 text-slate-500" />
                                            {formatDistanceToNow(new Date(r.updated_at), { addSuffix: true })}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <button
                                            onClick={() => deleteResume(r.id)}
                                            disabled={deleting === r.id}
                                            className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                                            title="Delete Resume">
                                            {deleting === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && <div className="text-center py-12 text-slate-500">No resumes found matching your search.</div>}
                </div>
            )}
        </div>
    );
}
