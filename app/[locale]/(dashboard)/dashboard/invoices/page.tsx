'use client'
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { FileText, Download, Loader2, Receipt, CreditCard, Ticket, Calendar, IndianRupee } from '@/components/icons';
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
        case 'premium': return 'text-[#C4B5FD]';
        case 'pro': return 'text-[#22C7F2]';
        default: return 'text-[#BDBDBD]';
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
        <div className="max-w-4xl mx-auto space-y-8 pb-24 text-[#F5F5F5] animate-premium-in">
            {/* Header */}
            <header className="flex items-center gap-3 border-b border-[#242424] pb-6 mb-10">
                <div className="w-10 h-10 rounded-lg bg-[#101010] border border-[#242424] flex items-center justify-center shadow-sm">
                    <Receipt className="w-5 h-5 text-[#22C7F2]" />
                </div>
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-[#F5F5F5]">My Invoices</h1>
                    <p className="text-[#7E7E7E] text-xs mt-0.5">Download receipts for your purchases</p>
                </div>
            </header>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-6 h-6 animate-spin text-[#22C7F2]" />
                </div>
            ) : error ? (
                <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/30 text-red-400 text-xs">{error}</div>
            ) : invoices.length === 0 ? (
                <div className="p-12 rounded-xl bg-[#101010] border border-[#242424] text-center space-y-3 shadow-sm">
                    <FileText className="w-10 h-10 text-[#565656] mx-auto" />
                    <p className="text-[#F5F5F5] font-semibold text-sm">No invoices yet</p>
                    <p className="text-[#7E7E7E] text-xs font-medium">Invoices appear here after each purchase.</p>
                </div>
            ) : (
                <div className="bg-[#101010] border border-[#242424] rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="border-b border-[#242424] bg-[#0A0A0A]">
                            <tr className="text-left text-[10px] font-bold text-[#7E7E7E] uppercase tracking-wider font-mono">
                                <th className="px-5 py-3">Invoice ID</th>
                                <th className="px-5 py-3">Plan</th>
                                <th className="px-5 py-3">Amount</th>
                                <th className="px-5 py-3">Method</th>
                                <th className="px-5 py-3">Date</th>
                                <th className="px-5 py-3 text-right">Download</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#242424]">
                            {invoices.map(inv => (
                                <tr key={inv.id} className="hover:bg-[#151515]/50 transition-colors">
                                    {/* Invoice ID */}
                                    <td className="px-5 py-4">
                                        <div className="font-mono font-semibold text-[#F5F5F5] text-xs">{inv.invoice_number}</div>
                                    </td>

                                    {/* Plan */}
                                    <td className="px-5 py-4">
                                        <span className={`font-semibold capitalize text-xs ${planColor(inv.plan)}`}>
                                            {inv.plan.charAt(0) + inv.plan.slice(1).toLowerCase()}
                                        </span>
                                    </td>

                                    {/* Amount */}
                                    <td className="px-5 py-4">
                                        {inv.amount === 0 ? (
                                            <span className="flex items-center gap-0.5 text-[#22C7F2] font-bold text-xs">
                                                <IndianRupee className="w-3 h-3" />Free
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-0.5 text-[#F5F5F5] font-semibold text-xs">
                                                <IndianRupee className="w-3 h-3 text-[#7E7E7E]" />
                                                {(inv.amount / 100).toFixed(0)}
                                            </span>
                                        )}
                                    </td>

                                    {/* Method */}
                                    <td className="px-5 py-4">
                                        {inv.payment_method === 'coupon' ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#151515] border border-[#242424] text-[10px] font-bold text-[#BDBDBD] font-mono uppercase">
                                                <Ticket className="w-3 h-3 text-[#7E7E7E]" />
                                                {inv.coupon_code ?? 'Coupon'}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#151515] border border-[#242424] text-[10px] font-bold text-[#22C7F2] font-mono uppercase">
                                                <CreditCard className="w-3 h-3 text-[#22C7F2]" />
                                                Razorpay
                                            </span>
                                        )}
                                    </td>

                                    {/* Date */}
                                    <td className="px-5 py-4 text-[#BDBDBD] text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3 text-[#7E7E7E]" />
                                            {format(new Date(inv.created_at), 'MMM dd, yyyy')}
                                        </div>
                                    </td>

                                    {/* Download */}
                                    <td className="px-5 py-4 text-right">
                                        <button
                                            onClick={() => handleDownload(inv)}
                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#151515] border border-[#242424] text-[#F5F5F5] text-xs font-semibold hover:bg-[#242424] transition-all shadow-sm cursor-pointer"
                                        >
                                            <Download className="w-3 h-3 text-[#7E7E7E]" />
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
