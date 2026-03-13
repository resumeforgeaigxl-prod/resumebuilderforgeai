'use client';
import { useState, useEffect } from 'react';
import { LayoutTemplate, Loader2, Search, ExternalLink, Globe, GlobeLock, User, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface PortfolioRow {
    id: string; username: string; theme: string; is_public: boolean;
    created_at: string; user_email: string;
}

export default function AdminPortfoliosPage() {
    const [portfolios, setPortfolios] = useState<PortfolioRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [toggling, setToggling] = useState<string | null>(null);

    async function loadPortfolios() {
        setLoading(true);
        const res = await fetch('/api/admin/portfolios');
        const data = await res.json();
        if (data.success) setPortfolios(data.portfolios);
        setLoading(false);
    }

    useEffect(() => { loadPortfolios(); }, []);

    async function toggleVisibility(id: string, currentStatus: boolean) {
        if (!confirm(`Are you sure you want to make this portfolio ${currentStatus ? 'PRIVATE' : 'PUBLIC'}?`)) return;
        setToggling(id);
        const res = await fetch(`/api/admin/portfolios/${id}/toggle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_public: !currentStatus })
        });
        if (res.ok) {
            await loadPortfolios();
        } else {
            alert('Failed to update portfolio visibility');
        }
        setToggling(null);
    }

    const filtered = portfolios.filter(p =>
        p.username?.toLowerCase().includes(search.toLowerCase()) ||
        p.user_email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><LayoutTemplate className="w-6 h-6 text-pink-400" />Portfolio Monitoring</h1>
                    <p className="text-slate-500 text-sm mt-1">{portfolios.length} live portfolios</p>
                </div>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search username or email…"
                        className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 w-full sm:w-64" />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-pink-400" /></div>
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden overflow-x-auto">
                    <table className="w-full text-sm min-w-[800px]">
                        <thead className="border-b border-white/10 bg-white/5">
                            <tr className="text-left text-xs text-slate-500 uppercase tracking-wider">
                                <th className="px-5 py-3">Portfolio Username</th>
                                <th className="px-5 py-3">Owner User</th>
                                <th className="px-5 py-3">Theme</th>
                                <th className="px-5 py-3">Created</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.map(p => (
                                <tr key={p.id} className={`hover:bg-white/5 transition-colors ${!p.is_public ? 'opacity-60' : ''}`}>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <LayoutTemplate className="w-4 h-4 text-slate-500 shrink-0" />
                                            <Link href={`/portfolio/${p.username}`} target="_blank" className="font-medium text-pink-400 hover:text-pink-300 flex items-center gap-1.5 transition-colors">
                                                {p.username}
                                                <ExternalLink className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <User className="w-3.5 h-3.5 text-slate-500" />
                                            {p.user_email}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-slate-300 capitalize">{p.theme || 'minimal'}</td>
                                    <td className="px-5 py-4 text-slate-400">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3 text-slate-500" />
                                            {formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        {p.is_public ? (
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 flex items-center gap-1.5 w-fit"><Globe className="w-3 h-3" /> Public</span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 flex items-center gap-1.5 w-fit"><GlobeLock className="w-3 h-3" /> Disabled</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4">
                                        <button
                                            onClick={() => toggleVisibility(p.id, p.is_public)}
                                            disabled={toggling === p.id}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${p.is_public ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'} disabled:opacity-50`}>
                                            {toggling === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : (p.is_public ? <GlobeLock className="w-3 h-3" /> : <Globe className="w-3 h-3" />)}
                                            {p.is_public ? 'Force Disable' : 'Enable Public'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && <div className="text-center py-12 text-slate-500">No portfolios found matching your search.</div>}
                </div>
            )}
        </div>
    );
}
