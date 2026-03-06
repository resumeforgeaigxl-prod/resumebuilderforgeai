'use client';
import { useState, useEffect } from 'react';
import {
    Receipt, Loader2, Search, FileText, CreditCard, Ticket,
    Calendar, User, IndianRupee, MapPin, ChevronDown, ChevronUp,
    Smartphone
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface InvoiceRow {
    id: string;
    invoice_number: string;
    user_id: string;
    user_email: string;
    plan: string;
    amount: number;
    currency: string;
    payment_method: string;
    coupon_code: string | null;
    razorpay_payment_id: string | null;
    billing_name: string | null;
    billing_email: string | null;
    billing_phone: string | null;
    billing_address: string | null;
    billing_city: string | null;
    billing_state: string | null;
    billing_country: string | null;
    billing_zip: string | null;
    created_at: string;
}

function planColor(plan: string) {
    switch (plan.toLowerCase()) {
        case 'career': return 'text-amber-400';
        case 'premium': return 'text-purple-400';
        case 'pro': return 'text-blue-400';
        default: return 'text-slate-400';
    }
}

export default function AdminInvoicesPage() {
    const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/admin/invoices')
            .then(r => r.json())
            .then(d => { if (d.success) setInvoices(d.invoices); })
            .finally(() => setLoading(false));
    }, []);

    const filtered = invoices.filter(inv =>
        inv.user_email.toLowerCase().includes(search.toLowerCase()) ||
        inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
        inv.plan.toLowerCase().includes(search.toLowerCase()) ||
        (inv.coupon_code ?? '').toLowerCase().includes(search.toLowerCase())
    );

    const totalRevenue = invoices.reduce((s, inv) => s + (inv.amount || 0), 0);
    const couponCount = invoices.filter(i => i.payment_method === 'coupon').length;

    return (
        <div className="p-4 sm:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Receipt className="w-6 h-6 text-indigo-400" /> Invoices
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">{invoices.length} total invoices</p>
                </div>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search email, invoice, plan…"
                        className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-full sm:w-72" />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Invoices', value: invoices.length, icon: <Receipt className="w-4 h-4 text-slate-400" /> },
                    { label: 'Revenue (INR)', value: `₹${(totalRevenue / 100).toFixed(0)}`, icon: <IndianRupee className="w-4 h-4 text-amber-400" /> },
                    { label: 'Paid (Razorpay)', value: invoices.length - couponCount, icon: <CreditCard className="w-4 h-4 text-emerald-400" /> },
                    { label: 'Free (Coupon)', value: couponCount, icon: <Ticket className="w-4 h-4 text-indigo-400" /> },
                ].map(stat => (
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
                <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden overflow-x-auto">
                    <table className="w-full text-sm min-w-[1000px]">
                        <thead className="border-b border-white/10 bg-white/5">
                            <tr className="text-left text-xs text-slate-500 uppercase tracking-wider">
                                <th className="px-5 py-3">Invoice #</th>
                                <th className="px-5 py-3">User</th>
                                <th className="px-5 py-3">Plan</th>
                                <th className="px-5 py-3">Amount</th>
                                <th className="px-5 py-3">Payment Method</th>
                                <th className="px-5 py-3">Coupon</th>
                                <th className="px-5 py-3">Date</th>
                                <th className="px-5 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.map(inv => {
                                const isExpanded = expandedId === inv.id;
                                const hasBilling = !!(inv.billing_name || inv.billing_address);

                                return (
                                    <>
                                        <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                                            {/* Invoice number */}
                                            <td className="px-5 py-4">
                                                <span className="font-mono font-bold text-indigo-300 text-xs">{inv.invoice_number}</span>
                                            </td>

                                            {/* User */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5 text-white text-xs font-medium">
                                                    <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                                    {inv.user_email}
                                                </div>
                                                <div className="text-[10px] text-slate-600 font-mono mt-0.5">{inv.user_id.slice(0, 8)}…</div>
                                            </td>

                                            {/* Plan */}
                                            <td className="px-5 py-4">
                                                <span className={`font-semibold capitalize ${planColor(inv.plan)}`}>
                                                    {inv.plan.charAt(0) + inv.plan.slice(1).toLowerCase()}
                                                </span>
                                            </td>

                                            {/* Amount */}
                                            <td className="px-5 py-4">
                                                {inv.amount === 0
                                                    ? <span className="text-emerald-400 font-bold text-xs">Free</span>
                                                    : <span className="text-white font-semibold text-xs">
                                                        {inv.currency === 'USD' ? '$' : '₹'}
                                                        {(inv.amount / 100).toFixed(inv.currency === 'USD' ? 2 : 0)}
                                                    </span>}
                                            </td>

                                            {/* Payment Method */}
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold ${inv.payment_method === 'coupon' ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'}`}>
                                                    {inv.payment_method === 'coupon' ? <><Ticket className="w-3 h-3" /> Coupon</> : <><CreditCard className="w-3 h-3" /> Razorpay</>}
                                                </span>
                                                {inv.razorpay_payment_id && (
                                                    <div className="text-[10px] text-slate-600 font-mono mt-0.5 truncate max-w-[120px]">{inv.razorpay_payment_id}</div>
                                                )}
                                            </td>

                                            {/* Coupon */}
                                            <td className="px-5 py-4">
                                                {inv.coupon_code
                                                    ? <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">{inv.coupon_code}</span>
                                                    : <span className="text-slate-600">—</span>}
                                            </td>

                                            {/* Date */}
                                            <td className="px-5 py-4 text-slate-400 text-xs">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3 h-3 text-slate-600" />
                                                    {format(new Date(inv.created_at), 'MMM dd, yyyy')}
                                                </div>
                                                <div className="text-[10px] text-slate-600 mt-0.5">
                                                    {formatDistanceToNow(new Date(inv.created_at), { addSuffix: true })}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => window.open(`/api/invoices/${inv.id}/download`, '_blank')}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all"
                                                        title="Download Invoice PDF"
                                                    >
                                                        <FileText className="w-3 h-3" /> PDF
                                                    </button>
                                                    {hasBilling && (
                                                        <button
                                                            onClick={() => setExpandedId(isExpanded ? null : inv.id)}
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

                                        {/* Expanded billing row */}
                                        {isExpanded && (
                                            <tr key={`${inv.id}-billing`} className="bg-slate-900/60">
                                                <td colSpan={8} className="px-5 py-4">
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                        <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Contact</p>
                                                            {inv.billing_name && <div className="flex items-center gap-1.5 text-xs text-slate-300"><User className="w-3 h-3 text-slate-500" />{inv.billing_name}</div>}
                                                            {inv.billing_email && <div className="flex items-center gap-1.5 text-xs text-slate-300"><CreditCard className="w-3 h-3 text-slate-500" />{inv.billing_email}</div>}
                                                            {inv.billing_phone && <div className="flex items-center gap-1.5 text-xs text-slate-300"><Smartphone className="w-3 h-3 text-slate-500" />{inv.billing_phone}</div>}
                                                        </div>
                                                        <div className="sm:col-span-2 p-3 rounded-xl bg-white/5 border border-white/10">
                                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Billing Address</p>
                                                            <div className="flex items-start gap-1.5 text-xs text-slate-300">
                                                                <MapPin className="w-3 h-3 text-slate-500 mt-0.5 shrink-0" />
                                                                <span>
                                                                    {[inv.billing_address, inv.billing_city, inv.billing_state, inv.billing_zip, inv.billing_country].filter(Boolean).join(', ')}
                                                                </span>
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
                    {filtered.length === 0 && <div className="text-center py-12 text-slate-500">No invoices found.</div>}
                </div>
            )}
        </div>
    );
}
