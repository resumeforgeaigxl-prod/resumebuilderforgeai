'use client'
export const dynamic = 'force-dynamic';
;

import { useState, useEffect } from 'react';
import { FileText, Download, Loader2, Receipt, CreditCard, Ticket, Calendar, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';

interface Invoice {
    id: string;
    invoice_number: string;
    plan: string;
    amount: number;
    payment_method: string;
    coupon_code: string | null;
    created_at: string;
    status: string;
    invoice_url: string | null;
}

function planColor(plan: string) {
    switch (plan.toLowerCase()) {
        case 'career': return 'text-amber-400';
        case 'premium': return 'text-purple-400';
        case 'pro': return 'text-blue-400';
        default: return 'text-slate-400';
    }
}

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/invoices')
            .then(r => r.json())
            .then(d => {
                if (d.success) setInvoices(d.invoices);
                else setError(d.error ?? 'Failed to load invoices');
            })
            .catch(() => setError('Failed to load invoices'))
            .finally(() => setLoading(false));
    }, []);

    const handleDownload = (inv: Invoice) => {
        if (inv.invoice_url) {
            window.open(inv.invoice_url, '_blank');
        } else {
            // Open in new tab — print dialog fires automatically
            window.open(`/api/invoices/${inv.id}/download`, '_blank');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">My Invoices</h1>
                    <p className="text-slate-400 text-sm">Download receipts for your purchases</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                </div>
            ) : error ? (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
            ) : invoices.length === 0 ? (
                <div className="p-12 rounded-2xl bg-white/5 border border-white/10 text-center space-y-3">
                    <FileText className="w-12 h-12 text-slate-600 mx-auto" />
                    <p className="text-slate-400 font-medium">No invoices yet</p>
                    <p className="text-slate-600 text-sm">Invoices appear here after each purchase.</p>
                </div>
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="border-b border-white/10 bg-white/5">
                            <tr className="text-left text-xs text-slate-500 uppercase tracking-wider">
                                <th className="px-5 py-3">Invoice ID</th>
                                <th className="px-5 py-3">Plan</th>
                                <th className="px-5 py-3">Amount</th>
                                <th className="px-5 py-3">Method</th>
                                <th className="px-5 py-3">Date</th>
                                <th className="px-5 py-3">Download</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {invoices.map(inv => (
                                <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                                    {/* Invoice ID */}
                                    <td className="px-5 py-4">
                                        <div className="font-mono font-bold text-white text-xs">{inv.invoice_number}</div>
                                    </td>

                                    {/* Plan */}
                                    <td className="px-5 py-4">
                                        <span className={`font-semibold capitalize ${planColor(inv.plan)}`}>
                                            {inv.plan.charAt(0) + inv.plan.slice(1).toLowerCase()}
                                        </span>
                                    </td>

                                    {/* Amount */}
                                    <td className="px-5 py-4">
                                        {inv.amount === 0 ? (
                                            <span className="flex items-center gap-1 text-emerald-400 font-bold text-xs">
                                                <IndianRupee className="w-3 h-3" />Free
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-white font-semibold">
                                                <IndianRupee className="w-3 h-3 text-slate-400" />
                                                {(inv.amount / 100).toFixed(0)}
                                            </span>
                                        )}
                                    </td>

                                    {/* Method */}
                                    <td className="px-5 py-4">
                                        {inv.payment_method === 'coupon' ? (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                                                <Ticket className="w-3 h-3" />
                                                {inv.coupon_code ?? 'Coupon'}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                                <CreditCard className="w-3 h-3" />
                                                Razorpay
                                            </span>
                                        )}
                                    </td>

                                    {/* Date */}
                                    <td className="px-5 py-4 text-slate-400 text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3 text-slate-600" />
                                            {format(new Date(inv.created_at), 'MMM dd, yyyy')}
                                        </div>
                                    </td>

                                    {/* Download */}
                                    <td className="px-5 py-4">
                                        <button
                                            onClick={() => handleDownload(inv)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 text-xs font-semibold transition-all border border-indigo-500/20 hover:border-indigo-500/40"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            PDF
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
