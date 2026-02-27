'use client';
import { useState, useEffect } from 'react';
import { CreditCard, Loader2, Search, Calendar, User, Ticket, Clock, CheckCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface SubscriptionRow {
    id: string; plan: string; status: string; expires_at: string | null;
    created_at: string; coupon_code: string | null; user_email: string;
}

export default function AdminSubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [extending, setExtending] = useState<string | null>(null);

    async function loadSubs() {
        setLoading(true);
        const res = await fetch('/api/admin/subscriptions');
        const data = await res.json();
        if (data.success) setSubscriptions(data.subscriptions);
        setLoading(false);
    }

    useEffect(() => { loadSubs(); }, []);

    async function extendSub(id: string) {
        setExtending(id);
        const res = await fetch(`/api/admin/subscriptions/${id}/extend`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ days: 30 }) // Adding 30 days
        });
        if (res.ok) {
            alert('Successfully extended subscription by 30 days!');
            await loadSubs();
        } else {
            alert('Failed to extend subscription.');
        }
        setExtending(null);
    }

    const filtered = subscriptions.filter(s =>
        s.user_email?.toLowerCase().includes(search.toLowerCase()) ||
        s.coupon_code?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><CreditCard className="w-6 h-6 text-emerald-400" />Subscriptions</h1>
                    <p className="text-slate-500 text-sm mt-1">{subscriptions.length} billing records</p>
                </div>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search email or coupon…"
                        className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-full sm:w-64" />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-emerald-400" /></div>
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden overflow-x-auto">
                    <table className="w-full text-sm min-w-[900px]">
                        <thead className="border-b border-white/10 bg-white/5">
                            <tr className="text-left text-xs text-slate-500 uppercase tracking-wider">
                                <th className="px-5 py-3">User</th>
                                <th className="px-5 py-3">Plan / Status</th>
                                <th className="px-5 py-3">Coupon Used</th>
                                <th className="px-5 py-3">Expiry Date</th>
                                <th className="px-5 py-3">Generated</th>
                                <th className="px-5 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.map(s => {
                                const isExpired = s.expires_at && new Date(s.expires_at) < new Date();
                                const statusColor = isExpired ? 'bg-rose-500/20 text-rose-400' : (s.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400');

                                return (
                                    <tr key={s.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2 font-medium text-white mb-1"><User className="w-4 h-4 text-slate-500" />{s.user_email}</div>
                                            <div className="text-xs text-slate-500 font-mono">{s.id.split('-')[0]}...</div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="capitalize font-semibold text-emerald-400">{s.plan}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold ${statusColor}`}>
                                                    {isExpired ? 'Expired' : s.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            {s.coupon_code ? (
                                                <div className="flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 w-fit">
                                                    <Ticket className="w-3 h-3" />{s.coupon_code}
                                                </div>
                                            ) : <span className="text-slate-600">—</span>}
                                        </td>
                                        <td className="px-5 py-4 text-slate-300">
                                            {s.expires_at ? (
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                                                    {format(new Date(s.expires_at), 'MMM dd, yyyy')}
                                                </div>
                                            ) : <span className="text-slate-500 italic">Lifetime</span>}
                                        </td>
                                        <td className="px-5 py-4 text-slate-400">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3 h-3 text-slate-500" />
                                                {formatDistanceToNow(new Date(s.created_at), { addSuffix: true })}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <button
                                                onClick={() => extendSub(s.id)}
                                                disabled={extending === s.id}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
                                                title="Add 30 Days">
                                                {extending === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                                Extend (30d)
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    {filtered.length === 0 && <div className="text-center py-12 text-slate-500">No subscriptions match your search.</div>}
                </div>
            )}
        </div>
    );
}
