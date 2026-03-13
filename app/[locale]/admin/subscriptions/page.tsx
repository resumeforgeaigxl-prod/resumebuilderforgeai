'use client';
import { useState, useEffect } from 'react';
import {
    CreditCard, Loader2, Search, Calendar, User, Ticket,
    Clock, CheckCircle, ChevronDown, ChevronUp, MapPin,
    IndianRupee, Smartphone, Building2, FileText, Tag, Zap
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface SubscriptionRow {
    id: string;
    plan: string;
    status: string;
    expires_at: string | null;
    created_at: string;
    coupon_code: string | null;
    user_id: string;
    user_email: string;
    original_price: number;  // paise (before coupon)
    discount_amount: number; // paise saved
    amount: number;          // final paid, paise
    currency: string;
    payment_method: string;
    razorpay_payment_id: string | null;
    // billing
    billing_name: string | null;
    billing_phone: string | null;
    billing_company: string | null;
    billing_address: string | null;
    // invoice
    invoice_number: string | null;
    invoice_id: string | null;
}

function planColor(plan: string) {
    switch (plan.toLowerCase()) {
        case 'career': return 'text-amber-400';
        case 'premium': return 'text-purple-400';
        case 'pro': return 'text-blue-400';
        default: return 'text-slate-400';
    }
}

function methodBadge(method: string) {
    if (method === 'coupon_free') return 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20';
    if (method === 'coupon_partial') return 'bg-purple-500/15 text-purple-400 border border-purple-500/20';
    if (method === 'razorpay') return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20';
    if (method === 'admin_override') return 'bg-amber-500/15 text-amber-500 border border-amber-500/20';
    return 'bg-slate-500/15 text-slate-400 border border-slate-700';
}

function methodLabel(method: string) {
    if (method === 'coupon_free') return 'Coupon (Free)';
    if (method === 'coupon_partial') return 'Coupon + Pay';
    if (method === 'razorpay') return 'Razorpay';
    if (method === 'admin_override') return 'Admin Override';
    return '—';
}

function fmt(paise: number, currency = 'INR') {
    const symbol = currency === 'INR' ? '₹' : '$';
    const val = paise / 100;
    const formatted = currency === 'INR' ? val.toFixed(0) : val.toFixed(2);
    return `${symbol}${formatted}`;
}

export default function AdminSubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [extending, setExtending] = useState<string | null>(null);
    const [fixing, setFixing] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    async function loadSubs() {
        setLoading(true);
        const [subsRes, invRes] = await Promise.all([
            fetch('/api/admin/subscriptions', { cache: 'no-store' }),
            fetch('/api/admin/invoices', { cache: 'no-store' }),
        ]);
        const subsData = await subsRes.json();
        const invData = await invRes.json();

        // Build invoice lookup by user_id (latest invoice per user)
        const invMap: Record<string, { id: string; invoice_number: string }> = {};
        if (invData.success) {
            for (const inv of invData.invoices) {
                if (!invMap[inv.user_id]) invMap[inv.user_id] = { id: inv.id, invoice_number: inv.invoice_number };
            }
        }

        if (subsData.success) {
            setSubscriptions(subsData.subscriptions.map((s: SubscriptionRow) => ({
                ...s,
                invoice_number: invMap[s.user_id]?.invoice_number ?? null,
                invoice_id: invMap[s.user_id]?.id ?? null,
            })));
        }
        setLoading(false);
    }

    useEffect(() => { loadSubs(); }, []);

    async function fixSubInvoice(id: string) {
        setFixing(id);
        const res = await fetch(`/api/admin/subscriptions/${id}/fix-invoice`, {
            method: 'POST'
        });
        const data = await res.json();
        if (data.success) {
            alert(`Success! Invoice ${data.invoice_number} generated and sent.`);
            await loadSubs();
        } else {
            alert(`Error: ${data.error || 'Failed to fix invoice'}`);
        }
        setFixing(null);
    }

    async function extendSub(id: string) {
        setExtending(id);
        const res = await fetch(`/api/admin/subscriptions/${id}/extend`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ days: 30 })
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
        s.coupon_code?.toLowerCase().includes(search.toLowerCase()) ||
        s.plan?.toLowerCase().includes(search.toLowerCase()) ||
        s.payment_method?.toLowerCase().includes(search.toLowerCase())
    );

    const totalRevenue = subscriptions.reduce((sum, s) => sum + (s.amount || 0), 0);
    const activeCount = subscriptions.filter(s => s.status === 'active' && (!s.expires_at || new Date(s.expires_at) > new Date())).length;
    const overrideCount = subscriptions.filter(s => s.payment_method === 'admin_override').length;

    return (
        <div className="p-4 sm:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-emerald-400" />
                        Subscriptions & Payments
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">{subscriptions.length} billing records</p>
                </div>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search email, plan, coupon…"
                        className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-full sm:w-72"
                    />
                </div>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Records', value: subscriptions.length, icon: <CreditCard className="w-4 h-4 text-slate-400" /> },
                    { label: 'Active Now', value: activeCount, icon: <CheckCircle className="w-4 h-4 text-emerald-400" /> },
                    { label: 'Revenue Collected', value: `₹${(totalRevenue / 100).toFixed(0)}+`, icon: <IndianRupee className="w-4 h-4 text-amber-400" /> },
                    { label: 'Overrides', value: overrideCount, icon: <Zap className="w-4 h-4 text-amber-400" /> },
                ].slice(0, 4).map(stat => (
                    <div key={stat.label} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                        {stat.icon}
                        <div>
                            <p className="text-xs text-slate-500">{stat.label}</p>
                            <p className="text-lg font-bold text-white">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                </div>
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden overflow-x-auto">
                    <table className="w-full text-sm min-w-[1100px]">
                        <thead className="border-b border-white/10 bg-white/5">
                            <tr className="text-left text-xs text-slate-500 uppercase tracking-wider">
                                <th className="px-5 py-3">User</th>
                                <th className="px-5 py-3">Plan</th>
                                <th className="px-5 py-3">Original Price</th>
                                <th className="px-5 py-3">Coupon Used</th>
                                <th className="px-5 py-3">Discount</th>
                                <th className="px-5 py-3">Final Paid</th>
                                <th className="px-5 py-3">Payment Method</th>
                                <th className="px-5 py-3">Start / Expires</th>
                                <th className="px-5 py-3">Invoice</th>
                                <th className="px-5 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.map(s => {
                                const isExpired = s.expires_at && new Date(s.expires_at) < new Date();
                                const statusColor = isExpired
                                    ? 'bg-rose-500/20 text-rose-400'
                                    : s.status === 'active'
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'bg-slate-500/20 text-slate-400';
                                const isExpanded = expandedId === s.id;
                                const hasDiscount = s.discount_amount > 0;

                                return (
                                    <>
                                        <tr key={s.id} className="hover:bg-white/5 transition-colors">
                                            {/* User */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 font-medium text-white text-xs mb-0.5">
                                                    <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                                    {s.user_email}
                                                </div>
                                                <div className="text-[10px] text-slate-600 font-mono">{s.user_id.slice(0, 8)}…</div>
                                            </td>

                                            {/* Plan */}
                                            <td className="px-5 py-4">
                                                <div className={`font-semibold capitalize ${planColor(s.plan)}`}>{s.plan}</div>
                                                <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold ${statusColor}`}>
                                                    {isExpired ? 'Expired' : s.status}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className={`text-xs font-semibold ${hasDiscount ? 'line-through text-slate-500' : 'text-white'}`}>
                                                    {s.original_price > 0 ? fmt(s.original_price, s.currency) : '—'}
                                                </span>
                                            </td>

                                            {/* Coupon Used */}
                                            <td className="px-5 py-4">
                                                {s.coupon_code ? (
                                                    <div className="flex items-center gap-1 text-xs font-mono px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 w-fit border border-indigo-500/20">
                                                        <Tag className="w-3 h-3" />{s.coupon_code}
                                                    </div>
                                                ) : <span className="text-slate-600">—</span>}
                                            </td>

                                            {/* Discount */}
                                            <td className="px-5 py-4">
                                                {hasDiscount ? (
                                                    <span className="text-xs font-bold text-emerald-400">
                                                        −{fmt(s.discount_amount, s.currency)}
                                                    </span>
                                                ) : <span className="text-slate-600">—</span>}
                                            </td>

                                            <td className="px-5 py-4">
                                                {s.amount === 0
                                                    ? <span className="text-emerald-400 font-bold text-xs">Free</span>
                                                    : <span className="text-white font-bold">{fmt(s.amount, s.currency)}</span>
                                                }
                                            </td>

                                            {/* Payment Method */}
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold ${methodBadge(s.payment_method)}`}>
                                                    {s.payment_method === 'razorpay' ? (
                                                        <><CreditCard className="w-3 h-3" /> Razorpay</>
                                                    ) : s.payment_method === 'admin_override' ? (
                                                        <><Zap className="w-3 h-3" /> Admin Override</>
                                                    ) : s.payment_method?.startsWith('coupon') ? (
                                                        <><Ticket className="w-3 h-3" /> {methodLabel(s.payment_method)}</>
                                                    ) : '—'}
                                                </span>
                                                {s.razorpay_payment_id && (
                                                    <div className="text-[10px] text-slate-600 font-mono mt-0.5 truncate max-w-[120px]">{s.razorpay_payment_id}</div>
                                                )}
                                            </td>

                                            {/* Dates */}
                                            <td className="px-5 py-4 text-slate-300 text-xs">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <Calendar className="w-3 h-3 text-slate-500" />
                                                    {format(new Date(s.created_at), 'MMM dd, yyyy')}
                                                </div>
                                                {s.expires_at ? (
                                                    <div className={`flex items-center gap-1 text-[10px] ${isExpired ? 'text-rose-400' : 'text-slate-500'}`}>
                                                        <Clock className="w-3 h-3" />
                                                        {formatDistanceToNow(new Date(s.expires_at), { addSuffix: true })}
                                                    </div>
                                                ) : <span className="text-[10px] text-slate-600">Lifetime</span>}
                                            </td>

                                            {/* Invoice */}
                                            <td className="px-5 py-4">
                                                {s.invoice_id ? (
                                                    <button
                                                        onClick={() => window.open(`/api/invoices/${s.invoice_id}/download`, '_blank')}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all"
                                                        title={s.invoice_number ?? 'View Invoice'}
                                                    >
                                                        <FileText className="w-3 h-3" />
                                                        {s.invoice_number ?? 'View'}
                                                    </button>
                                                ) : s.payment_method !== '—' && s.payment_method !== 'admin_override' ? (
                                                    <button
                                                        onClick={() => fixSubInvoice(s.id)}
                                                        disabled={fixing === s.id}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20 transition-all"
                                                        title="Generate & Send missing Invoice"
                                                    >
                                                        {fixing === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                                                        Fix & Send
                                                    </button>
                                                ) : <span className="text-slate-600 text-xs">—</span>}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => extendSub(s.id)}
                                                        disabled={extending === s.id}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
                                                        title="Add 30 Days"
                                                    >
                                                        {extending === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                                                        +30d
                                                    </button>
                                                    {s.billing_address && (
                                                        <button
                                                            onClick={() => setExpandedId(isExpanded ? null : s.id)}
                                                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all"
                                                            title="View Billing Details"
                                                        >
                                                            <MapPin className="w-3 h-3" />
                                                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Expanded billing details */}
                                        {isExpanded && (
                                            <tr key={`${s.id}-billing`} className="bg-slate-900/60">
                                                <td colSpan={10} className="px-5 py-4">
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                        <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Contact</p>
                                                            {s.billing_name && (
                                                                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                                                                    <User className="w-3 h-3 text-slate-500" /> {s.billing_name}
                                                                </div>
                                                            )}
                                                            {s.billing_phone && (
                                                                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                                                                    <Smartphone className="w-3 h-3 text-slate-500" /> {s.billing_phone}
                                                                </div>
                                                            )}
                                                            {s.billing_company && (
                                                                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                                                                    <Building2 className="w-3 h-3 text-slate-500" /> {s.billing_company}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="sm:col-span-2 p-3 rounded-xl bg-white/5 border border-white/10">
                                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Billing Address</p>
                                                            <div className="flex items-start gap-1.5 text-xs text-slate-300">
                                                                <MapPin className="w-3 h-3 text-slate-500 mt-0.5 shrink-0" />
                                                                <span>{s.billing_address}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                );
                            })}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="text-center py-12 text-slate-500">No subscriptions match your search.</div>
                    )}
                </div>
            )}
        </div>
    );
}
