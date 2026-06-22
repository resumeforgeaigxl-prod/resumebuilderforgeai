'use client'
export const dynamic = 'force-dynamic';
;
import { useState, useEffect } from 'react';
import {
    Receipt, Loader2, Search, FileText, CreditCard, Ticket,
    Calendar, User, IndianRupee, MapPin, ChevronDown, ChevronUp,
    Smartphone, Mail, CheckCircle2, AlertCircle
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
    status: string;
    invoice_url: string | null;
    payment_id: string | null;
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
        case 'career': return 'text-amber-600';
        case 'premium': return 'text-purple-600';
        case 'pro': return 'text-blue-600';
        default: return 'text-[#8F8F8F]';
    }
}

export default function AdminInvoicesPage() {
    const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [sendingEmail, setSendingEmail] = useState<string | null>(null);
    const [emailStatus, setEmailStatus] = useState<{ id: string, type: 'success' | 'error', msg: string } | null>(null);

    useEffect(() => {
        fetch('/api/admin/invoices')
            .then(r => r.json())
            .then(d => { if (d.success) setInvoices(d.invoices); })
            .finally(() => setLoading(false));
    }, []);

    const handleSendEmail = async (id: string) => {
        setSendingEmail(id);
        setEmailStatus(null);
        try {
            const res = await fetch(`/api/admin/invoices/${id}/send-email`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setEmailStatus({ id, type: 'success', msg: 'Email Sent!' });
            } else {
                setEmailStatus({ id, type: 'error', msg: data.error || 'Failed' });
            }
        } catch {
            setEmailStatus({ id, type: 'error', msg: 'Error' });
        } finally {
            setSendingEmail(null);
            setTimeout(() => setEmailStatus(null), 3000);
        }
    };

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
                        <Receipt className="w-6 h-6 text-indigo-600" /> Invoices
                    </h1>
                    <p className="text-[#8F8F8F] text-sm mt-1">{invoices.length} total invoices</p>
                </div>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8F8F8F]" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search email, invoice, plan…"
                        className="pl-9 pr-4 py-2 bg-white border border-[#EBEBEB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-full sm:w-72" />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Invoices', value: invoices.length, icon: <Receipt className="w-4 h-4 text-[#8F8F8F]" /> },
                    { label: 'Revenue (INR)', value: `₹${(totalRevenue / 100).toFixed(0)}`, icon: <IndianRupee className="w-4 h-4 text-amber-600" /> },
                    { label: 'Paid (Razorpay)', value: invoices.length - couponCount, icon: <CreditCard className="w-4 h-4 text-emerald-600" /> },
                    { label: 'Free (Coupon)', value: couponCount, icon: <Ticket className="w-4 h-4 text-indigo-600" /> },
                ].map(stat => (
                    <div key={stat.label} className="p-4 rounded-xl bg-white border border-[#EBEBEB] flex items-center gap-3">
                        {stat.icon}
                        <div>
                            <p className="text-xs text-[#8F8F8F]">{stat.label}</p>
                            <p className="text-lg font-bold text-[#171717]">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
            ) : (
                <div className="bg-white border border-[#EBEBEB] rounded-2xl overflow-hidden overflow-x-auto">
                    <table className="w-full text-sm min-w-[1000px]">
                        <thead className="border-b border-[#EBEBEB] bg-white">
                            <tr className="text-left text-xs text-[#8F8F8F] uppercase tracking-wider">
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
                        <tbody className="divide-y divide-[#EBEBEB]">
                            {filtered.map(inv => {
                                const isExpanded = expandedId === inv.id;
                                const hasBilling = !!(inv.billing_name || inv.billing_address);
                                const isSending = sendingEmail === inv.id;
                                const currentStatus = emailStatus?.id === inv.id ? emailStatus : null;

                                return (
                                    <>
                                        <tr key={inv.id} className="hover:bg-white transition-colors">
                                            {/* Invoice number */}
                                            <td className="px-5 py-4">
                                                <span className="font-mono font-bold text-indigo-300 text-xs">{inv.invoice_number}</span>
                                                <div className="mt-1">
                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${inv.status === 'paid' ? 'bg-emerald-50 border border-emerald-100 text-emerald-600' : 'bg-amber-500/20 text-amber-600'}`}>
                                                        {inv.status}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* User */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5 text-[#171717] text-xs font-medium">
                                                    <User className="w-3.5 h-3.5 text-[#8F8F8F] shrink-0" />
                                                    {inv.user_email}
                                                </div>
                                                <div className="text-[10px] text-[#8F8F8F] font-mono mt-0.5">{inv.user_id.slice(0, 8)}…</div>
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
                                                    ? <span className="text-emerald-600 font-bold text-xs">Free</span>
                                                    : <span className="text-[#171717] font-semibold text-xs">
                                                        {inv.currency === 'USD' ? '$' : '₹'}
                                                        {(inv.amount / 100).toFixed(inv.currency === 'USD' ? 2 : 0)}
                                                    </span>}
                                            </td>

                                            {/* Payment Method */}
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold ${inv.payment_method === 'coupon' ? 'bg-indigo-500/15 text-indigo-600 border border-indigo-500/20' : 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/20'}`}>
                                                    {inv.payment_method === 'coupon' ? <><Ticket className="w-3 h-3" /> Coupon</> : (inv.payment_method === 'razorpay' ? <><CreditCard className="w-3 h-3" /> Razorpay</> : <><CreditCard className="w-3 h-3" /> {inv.payment_method}</>)}
                                                </span>
                                                {(inv.razorpay_payment_id || inv.payment_id) && (
                                                    <div className="text-[10px] text-[#8F8F8F] font-mono mt-0.5 truncate max-w-[120px]">{inv.razorpay_payment_id || inv.payment_id}</div>
                                                )}
                                            </td>

                                            {/* Coupon */}
                                            <td className="px-5 py-4">
                                                {inv.coupon_code
                                                    ? <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-600">{inv.coupon_code}</span>
                                                    : <span className="text-[#8F8F8F]">—</span>}
                                            </td>

                                            {/* Date */}
                                            <td className="px-5 py-4 text-[#8F8F8F] text-xs">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3 h-3 text-[#8F8F8F]" />
                                                    {format(new Date(inv.created_at), 'MMM dd, yyyy')}
                                                </div>
                                                <div className="text-[10px] text-[#8F8F8F] mt-0.5">
                                                    {formatDistanceToNow(new Date(inv.created_at), { addSuffix: true })}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => inv.invoice_url ? window.open(inv.invoice_url, '_blank') : window.open(`/api/invoices/${inv.id}/download`, '_blank')}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-50 border border-indigo-100 border border-indigo-500/20 transition-all"
                                                        title="Download Invoice PDF"
                                                    >
                                                        <FileText className="w-3.5 h-3.5" /> PDF
                                                    </button>
                                                    <button
                                                        onClick={() => handleSendEmail(inv.id)}
                                                        disabled={isSending}
                                                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${currentStatus
                                                                ? (currentStatus.type === 'success' ? 'bg-emerald-50 border border-emerald-100 text-emerald-600 border-emerald-500/40' : 'bg-red-50 border border-red-100 text-red-600 border-red-500/40')
                                                                : 'bg-white text-[#4D4D4D] hover:bg-neutral-100 border-[#EBEBEB]'
                                                            }`}
                                                    >
                                                        {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                                                            currentStatus ? (currentStatus.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />) :
                                                                <Mail className="w-3.5 h-3.5" />}
                                                        {currentStatus ? currentStatus.msg : 'Email'}
                                                    </button>
                                                    {hasBilling && (
                                                        <button
                                                            onClick={() => setExpandedId(isExpanded ? null : inv.id)}
                                                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-700 text-[#4D4D4D] hover:bg-slate-600 transition-all"
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
                                            <tr key={`${inv.id}-billing`} className="bg-[#FAFAFA]/60">
                                                <td colSpan={8} className="px-5 py-4">
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                        <div className="p-3 rounded-xl bg-white border border-[#EBEBEB] space-y-1">
                                                            <p className="text-[10px] text-[#8F8F8F] uppercase tracking-wider font-bold">Contact</p>
                                                            {inv.billing_name && <div className="flex items-center gap-1.5 text-xs text-[#4D4D4D]"><User className="w-3 h-3 text-[#8F8F8F]" />{inv.billing_name}</div>}
                                                            {inv.billing_email && <div className="flex items-center gap-1.5 text-xs text-[#4D4D4D]"><CreditCard className="w-3 h-3 text-[#8F8F8F]" />{inv.billing_email}</div>}
                                                            {inv.billing_phone && <div className="flex items-center gap-1.5 text-xs text-[#4D4D4D]"><Smartphone className="w-3 h-3 text-[#8F8F8F]" />{inv.billing_phone}</div>}
                                                        </div>
                                                        <div className="sm:col-span-2 p-3 rounded-xl bg-white border border-[#EBEBEB]">
                                                            <p className="text-[10px] text-[#8F8F8F] uppercase tracking-wider font-bold mb-1">Billing Address</p>
                                                            <div className="flex items-start gap-1.5 text-xs text-[#4D4D4D]">
                                                                <MapPin className="w-3 h-3 text-[#8F8F8F] mt-0.5 shrink-0" />
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
                    {filtered.length === 0 && <div className="text-center py-12 text-[#8F8F8F]">No invoices found.</div>}
                </div>
            )}
        </div>
    );
}
