'use client'
export const dynamic = 'force-dynamic';
;
import { useState, useEffect } from 'react';
import { Ticket, Loader2, Search, Plus, Ban, CheckCircle, Calendar, Hash, ArrowUpRight, Activity } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';

interface CouponRow {
    id: string; code: string; type: string; value: number;
    plan_type: string;
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
    const [form, setForm] = useState({ code: '', type: 'percentage', value: '', plan_type: 'all', max_uses: '', expires_at: '' });

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
                plan_type: form.plan_type,
                max_uses: form.max_uses ? Number(form.max_uses) : null,
                expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null
            })
        });

        if (res.ok) {
            setCreating(false);
            setForm({ code: '', type: 'percentage', value: '', plan_type: 'all', max_uses: '', expires_at: '' });
            await loadCoupons();
        } else {
            const data = await res.json();
            alert(`Error: ${data.error}`);
        }
        setSubmitting(false);
    }

    const filtered = coupons.filter(c => c.code?.toLowerCase().includes(search.toLowerCase()));

    // Stats
    const totalCoupons = coupons.length;
    let activeCoupons = 0;
    let totalRedemptions = 0;

    coupons.forEach(c => {
        const isExpired = c.expires_at && new Date(c.expires_at) < new Date();
        const isMaxed = c.max_uses && c.used_count >= c.max_uses;
        if (c.is_active && !isExpired && !isMaxed) activeCoupons++;
        totalRedemptions += c.used_count;
    });

    return (
        <div className="p-4 sm:p-8 space-y-8 max-w-[1200px]">
            {/* Breadcrumb & Header */}
            <div>
                <div className="flex items-center gap-2 text-sm text-[#8F8F8F] mb-2 font-medium">
                    <Link href="/admin" className="hover:text-[#4D4D4D]">Admin</Link>
                    <span>/</span>
                    <span className="text-[#171717]">Coupons</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#171717] tracking-tight">Coupons</h1>
                        <p className="text-[#8F8F8F] mt-1 max-w-xl text-sm leading-relaxed">
                            Create and manage discount codes for subscriptions. Set specific redemption limits, assign expirations, and monitor usage in real-time.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setCreating(true)} className="px-5 py-2.5 bg-white text-black hover:bg-slate-200 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-sm">
                            <Plus className="w-4 h-4" /> New Coupon
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl border border-[#EBEBEB] bg-[#0f1117] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform"><Hash className="w-16 h-16" /></div>
                    <div className="text-[#8F8F8F] font-medium text-sm mb-1 flex items-center gap-2"><Ticket className="w-4 h-4 text-indigo-600" /> Total Created</div>
                    <div className="text-3xl font-bold text-[#171717]">{totalCoupons}</div>
                </div>
                <div className="p-5 rounded-2xl border border-[#EBEBEB] bg-[#0f1117] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform"><Activity className="w-16 h-16" /></div>
                    <div className="text-[#8F8F8F] font-medium text-sm mb-1 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" /> Active Now</div>
                    <div className="text-3xl font-bold text-[#171717]">{activeCoupons}</div>
                </div>
                <div className="p-5 rounded-2xl border border-[#EBEBEB] bg-[#0f1117] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform"><ArrowUpRight className="w-16 h-16" /></div>
                    <div className="text-[#8F8F8F] font-medium text-sm mb-1 flex items-center gap-2"><Plus className="w-4 h-4 text-pink-600" /> Total Redemptions</div>
                    <div className="text-3xl font-bold text-[#171717]">{totalRedemptions}</div>
                </div>
            </div>

            {/* Main Table area */}
            <div className="bg-[#0c0e12] border border-[#EBEBEB] rounded-2xl shadow-xl flex flex-col">
                <div className="p-4 border-b border-[#EBEBEB] flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.01]">
                    <div className="font-semibold text-[#171717]">All Coupons</div>
                    <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8F8F8F]" />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search by code..."
                            className="pl-9 pr-4 py-2 bg-black/40 border border-[#EBEBEB] rounded-lg text-sm text-[#171717] focus:outline-none focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500/50 w-full transition-all" />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center p-20"><Loader2 className="w-6 h-6 animate-spin text-[#8F8F8F]" /></div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#8F8F8F] mb-4">
                            <Ticket className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-[#171717] mb-2">No coupons found</h3>
                        <p className="text-[#8F8F8F] text-sm max-w-sm mb-6">
                            {search ? `Your search for "${search}" did not yield any results.` : "Create a coupon to offer discounts to your subscribers. You can limit usage and set expirations."}
                        </p>
                        {!search && (
                            <button onClick={() => setCreating(true)} className="px-5 py-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-50 border border-indigo-100 border border-indigo-500/20 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors">
                                <Plus className="w-4 h-4" /> Create your first coupon
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="bg-[#0f1117] border-b border-[#EBEBEB]">
                                <tr className="text-xs font-semibold text-[#8F8F8F] uppercase tracking-widest">
                                    <th className="px-6 py-4">Code</th>
                                    <th className="px-6 py-4">Value</th>
                                    <th className="px-6 py-4">Plan</th>
                                    <th className="px-6 py-4">Redemptions</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#EBEBEB]">
                                {filtered.map(c => {
                                    const isExpired = c.expires_at && new Date(c.expires_at) < new Date();
                                    const isMaxed = c.max_uses && c.used_count >= c.max_uses;
                                    const isUsable = c.is_active && !isExpired && !isMaxed;

                                    return (
                                        <tr key={c.id} className={`hover:bg-white/[0.02] transition-colors group ${!isUsable ? 'opacity-60 bg-black/10' : ''}`}>
                                            <td className="px-6 py-4">
                                                <div className="font-mono font-bold text-sm text-[#171717] group-hover:text-indigo-300 transition-colors uppercase tracking-wider">{c.code}</div>
                                                <div className="text-[11px] text-[#8F8F8F] mt-1">
                                                    Created {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-[#4D4D4D]">
                                                    {c.type === 'percentage' ? `${c.value}% OFF` : (c.type === 'fixed' ? `$${c.value} OFF` : `${c.value} Months Free`)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${c.plan_type === 'all' ? 'bg-slate-500/10 text-[#8F8F8F] border border-slate-500/20' :
                                                        c.plan_type === 'pro' ? 'bg-indigo-50 text-indigo-600 border border-indigo-500/20' :
                                                            c.plan_type === 'premium' ? 'bg-amber-50 text-amber-600 border border-amber-500/20' :
                                                                'bg-purple-50 text-purple-600 border border-purple-500/20'
                                                    }`}>
                                                    {c.plan_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-baseline gap-1.5 font-medium text-[#171717]">
                                                    {c.used_count} <span className="text-[#8F8F8F] text-xs font-normal">/ {c.max_uses ? c.max_uses : '∞'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {!c.is_active ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-500/10 text-[#8F8F8F] border border-slate-500/20"><Ban className="w-3 h-3" /> Disabled</span>
                                                    ) : isExpired ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20"><Calendar className="w-3 h-3" /> Expired</span>
                                                    ) : isMaxed ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-orange-50 text-orange-600 border border-orange-500/20"><Hash className="w-3 h-3" /> Max Reached</span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-500/20"><CheckCircle className="w-3 h-3" /> Active</span>
                                                    )}
                                                    {c.expires_at && (
                                                        <span className="text-[10px] text-[#8F8F8F] ml-1">
                                                            (Ends {format(new Date(c.expires_at), 'MMM d, yyyy')})
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => toggleStatus(c.id, c.is_active)}
                                                    disabled={toggling === c.id}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all border ${c.is_active ? 'bg-black/20 text-[#8F8F8F] hover:text-[#171717] border-[#EBEBEB] hover:border-neutral-200' : 'bg-indigo-50 text-indigo-600 border-indigo-500/20 hover:bg-indigo-50 border border-indigo-100'} disabled:opacity-50`}>
                                                    {toggling === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : (c.is_active ? <Ban className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />)}
                                                    {c.is_active ? 'Disable' : 'Enable'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {creating && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
                    <form onSubmit={handleCreate} className="bg-[#0f1117] border border-[#EBEBEB] p-6 md:p-8 rounded-2xl w-full max-w-lg shadow-2xl relative my-8">
                        <div className="mb-6 border-b border-[#EBEBEB] pb-4">
                            <h2 className="text-xl font-bold text-[#171717] tracking-tight flex items-center gap-2"><Ticket className="w-5 h-5 text-indigo-600" /> Create New Coupon</h2>
                            <p className="text-[#8F8F8F] text-sm mt-1">Configure limits and values for the new discount code.</p>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#8F8F8F] mb-2">Coupon Code</label>
                                <input required value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                    className="w-full bg-black/40 border border-[#EBEBEB] rounded-lg px-4 py-2.5 text-[#171717] font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50"
                                    placeholder="e.g. BFCM50" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#8F8F8F] mb-2">Discount Type</label>
                                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                                        className="w-full bg-black/40 border border-[#EBEBEB] rounded-lg px-4 py-2.5 text-[#171717] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors">
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount ($)</option>
                                        <option value="free_months">Free Months</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#8F8F8F] mb-2">Value</label>
                                    <div className="relative">
                                        {form.type === 'percentage' && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8F8F8F]">%</span>}
                                        {form.type === 'fixed' && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8F8F8F]">$</span>}
                                        <input required type="number" min="1" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })}
                                            className={`w-full bg-black/40 border border-[#EBEBEB] rounded-lg py-2.5 text-[#171717] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${form.type === 'fixed' ? 'pl-8 pr-4' : 'px-4'}`}
                                            placeholder="50" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#8F8F8F] mb-2">Max Uses</label>
                                    <input type="number" min="1" value={form.max_uses} onChange={e => setForm({ ...form, max_uses: e.target.value })}
                                        className="w-full bg-black/40 border border-[#EBEBEB] rounded-lg px-4 py-2.5 text-[#171717] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        placeholder="Infinite" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#8F8F8F] mb-2">Expiry Date</label>
                                    <input type="date" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })}
                                        className="w-full bg-black/40 border border-[#EBEBEB] rounded-lg px-4 py-2.5 text-[#171717] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        style={{ colorScheme: 'dark' }} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#8F8F8F] mb-2">Applicable Plan</label>
                                <select value={form.plan_type} onChange={e => setForm({ ...form, plan_type: e.target.value })}
                                    className="w-full bg-black/40 border border-[#EBEBEB] rounded-lg px-4 py-2.5 text-[#171717] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors">
                                    <option value="all">All Plans</option>
                                    <option value="pro">Pro</option>
                                    <option value="premium">Premium</option>
                                    <option value="career">Career</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-8 pt-4 border-t border-[#EBEBEB] flex gap-3 justify-end items-center">
                            <button type="button" onClick={() => setCreating(false)}
                                className="px-5 py-2.5 text-[#8F8F8F] hover:text-[#171717] hover:bg-white rounded-lg text-sm font-bold transition-all">
                                Cancel
                            </button>
                            <button type="submit" disabled={submitting}
                                className="px-5 py-2.5 bg-white hover:bg-slate-200 text-black rounded-lg text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm">
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Plus className="w-4 h-4" />} Create Coupon
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
