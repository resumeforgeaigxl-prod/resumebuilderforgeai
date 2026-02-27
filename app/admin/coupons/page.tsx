'use client';
import { useState, useEffect } from 'react';
import { Ticket, Loader2, Search, Plus, Ban, CheckCircle, Calendar } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface CouponRow {
    id: string; code: string; type: string; value: number;
    max_uses: number | null; used_count: number; is_active: boolean;
    expires_at: string | null; created_at: string;
}

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<CouponRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [toggling, setToggling] = useState<string | null>(null);

    // Create Modal state
    const [creating, setCreating] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ code: '', type: 'percentage', value: '', max_uses: '', expires_at: '' });

    async function loadCoupons() {
        setLoading(true);
        const res = await fetch('/api/admin/coupons');
        const data = await res.json();
        if (data.success) setCoupons(data.coupons);
        setLoading(false);
    }

    useEffect(() => { loadCoupons(); }, []);

    async function toggleStatus(id: string, currentStatus: boolean) {
        setToggling(id);
        const res = await fetch(`/api/admin/coupons/${id}/toggle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_active: !currentStatus })
        });
        if (res.ok) await loadCoupons();
        setToggling(null);
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        const res = await fetch('/api/admin/coupons/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: form.code,
                type: form.type,
                value: Number(form.value),
                max_uses: form.max_uses ? Number(form.max_uses) : null,
                expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null
            })
        });

        if (res.ok) {
            setCreating(false);
            setForm({ code: '', type: 'percentage', value: '', max_uses: '', expires_at: '' });
            await loadCoupons();
        } else {
            const data = await res.json();
            alert(`Error: ${data.error}`);
        }
        setSubmitting(false);
    }

    const filtered = coupons.filter(c => c.code?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><Ticket className="w-6 h-6 text-fuchsia-400" />Coupon Management</h1>
                    <p className="text-slate-500 text-sm mt-1">{coupons.length} discount codes</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search code…"
                            className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 w-full sm:w-48" />
                    </div>
                    <button onClick={() => setCreating(true)} className="px-4 py-2 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Create
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-fuchsia-400" /></div>
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden overflow-x-auto">
                    <table className="w-full text-sm min-w-[900px]">
                        <thead className="border-b border-white/10 bg-white/5">
                            <tr className="text-left text-xs text-slate-500 uppercase tracking-wider">
                                <th className="px-5 py-3">Code</th>
                                <th className="px-5 py-3">Discount Value</th>
                                <th className="px-5 py-3">Usage</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3">Expiry</th>
                                <th className="px-5 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.map(c => {
                                const isExpired = c.expires_at && new Date(c.expires_at) < new Date();
                                const isMaxed = c.max_uses && c.used_count >= c.max_uses;
                                const isUsable = c.is_active && !isExpired && !isMaxed;

                                return (
                                    <tr key={c.id} className={`hover:bg-white/5 transition-colors ${!isUsable ? 'opacity-60' : ''}`}>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2 font-mono font-bold text-lg text-white mb-1"><Ticket className="w-4 h-4 text-fuchsia-400" />{c.code}</div>
                                            <div className="text-[10px] text-slate-500 flex items-center gap-1"><Calendar className="w-3 h-3" />Created {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="px-2.5 py-1 rounded bg-fuchsia-500/20 text-fuchsia-400 font-bold tracking-wide">
                                                {c.type === 'percentage' ? `${c.value}% OFF` : (c.type === 'fixed' ? `$${c.value} OFF` : `${c.value} Months Free`)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 font-medium text-slate-300">
                                            {c.used_count} <span className="text-slate-500 text-xs">/ {c.max_uses ? c.max_uses : '∞'}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            {!c.is_active ? <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-500/20 text-slate-400 flex w-fit items-center"><Ban className="w-3 h-3 mr-1" /> Disabled</span> :
                                                isExpired ? <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-rose-500/20 text-rose-400 flex w-fit items-center">Expired</span> :
                                                    isMaxed ? <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 flex w-fit items-center">Max Reached</span> :
                                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 flex w-fit items-center"><CheckCircle className="w-3 h-3 mr-1" /> Active</span>
                                            }
                                        </td>
                                        <td className="px-5 py-4 text-slate-400 text-xs">
                                            {c.expires_at ? format(new Date(c.expires_at), 'MMM dd, yyyy') : 'No expiry'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <button
                                                onClick={() => toggleStatus(c.id, c.is_active)}
                                                disabled={toggling === c.id}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${c.is_active ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'} disabled:opacity-50`}>
                                                {toggling === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : (c.is_active ? <Ban className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />)}
                                                {c.is_active ? 'Disable' : 'Enable'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filtered.length === 0 && <div className="text-center py-12 text-slate-500">No coupons found.</div>}
                </div>
            )}

            {/* Create Modal */}
            {creating && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleCreate} className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-fuchsia-400" /> Create Coupon</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Coupon Code (e.g. SUMMER50)</label>
                                <input required value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-fuchsia-400 uppercase" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Type</label>
                                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-white outline-none">
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount ($)</option>
                                        <option value="free_months">Free Months</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Value Amount</label>
                                    <input required type="number" min="1" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-fuchsia-400" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Max Uses (Optional)</label>
                                    <input type="number" min="1" value={form.max_uses} onChange={e => setForm({ ...form, max_uses: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-fuchsia-400" placeholder="Unlimited" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Expiry Date (Optional)</label>
                                    <input type="date" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-fuchsia-400" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3 justify-end">
                            <button type="button" onClick={() => setCreating(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">Cancel</button>
                            <button type="submit" disabled={submitting} className="px-4 py-2 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create Code
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
