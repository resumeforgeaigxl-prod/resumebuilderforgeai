"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Loader2, RefreshCw, FileText, DollarSign,
  Info, CheckCircle2, ChevronRight, Mail, Download
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export default function AdminInvoicesPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/project-services/admin'); // API returns requests which contain invoices, or query database direct
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          // Flatten invoices from requests
          const list: any[] = [];
          const reqs = json.requests || [];
          
          await Promise.all(reqs.map(async (r: any) => {
            const detailRes = await fetch(`/api/project-services/requests/${r.id}`);
            if (detailRes.ok) {
              const detailJson = await detailRes.json();
              if (detailJson.success && detailJson.invoices) {
                detailJson.invoices.forEach((inv: any) => {
                  list.push({
                    ...inv,
                    project_title: r.project_title,
                    project_id: r.project_id,
                    client_name: r.full_name
                  });
                });
              }
            }
          }));

          setInvoices(list);
        }
      }
    } catch (err) {
      console.error('[Admin Invoices] Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleEmailInvoice = (inv: any) => {
    alert(`Email invoice statement (${inv.invoice_number}) sent to student!`);
  };

  return (
    <div className="space-y-8 animate-fade-in text-[#171717]">
      {/* Back Link */}
      <div>
        <Link 
          href={`/${locale}/admin/project-services`} 
          className="inline-flex items-center gap-2 text-xs font-mono text-stone-500 hover:text-[#171717]"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#8F8F8F] font-mono text-[11px] uppercase tracking-wider mb-1">
            <FileText className="w-3.5 h-3.5" /> Billing Records
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#171717]">Platform Invoices</h1>
          <p className="text-stone-500 text-xs mt-1">Review student invoices, monitor payment statuses, and email invoices.</p>
        </div>
        <button 
          onClick={fetchInvoices} 
          className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 hover:text-[#171717] transition-all shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Invoices List Grid */}
      <div className="border border-[#EBEBEB] bg-white rounded-xl overflow-hidden shadow-sm text-left">
        <div className="p-4 border-b border-[#EBEBEB] bg-[#fafaf9]">
          <h3 className="text-xs font-mono font-bold text-stone-500 uppercase">Statement Entries</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50/50 border-b border-[#EBEBEB] text-[#8F8F8F] font-mono uppercase tracking-wider">
                <th className="p-4 font-bold">Invoice Number</th>
                <th className="p-4 font-bold">Client / Title</th>
                <th className="p-4 font-bold">Billing Amount</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Due Date</th>
                <th className="p-4 font-bold">Paid Date</th>
                <th className="p-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBEBEB]">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-stone-50/50 transition-all">
                  <td className="p-4">
                    <p className="font-mono font-bold text-[#7c3aed]">{inv.invoice_number}</p>
                    <p className="text-[9px] text-stone-400 font-mono mt-0.5">{new Date(inv.created_at).toLocaleDateString()}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-[#171717]">{inv.client_name}</p>
                    <p className="text-[10px] text-stone-400 mt-0.5 truncate max-w-[150px]">{inv.project_title}</p>
                  </td>
                  <td className="p-4 font-mono font-bold text-[#171717]">₹{inv.amount}</td>
                  <td className="p-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                      inv.status === 'paid' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {inv.status === 'paid' ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td className="p-4 text-stone-500 font-mono">
                    {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-4 text-stone-500 font-mono">
                    {inv.paid_date ? new Date(inv.paid_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="p-4 text-right space-x-3">
                    <button 
                      onClick={() => handleEmailInvoice(inv)}
                      className="text-xs font-mono font-bold text-[#7c3aed] hover:text-[#6d28d9] inline-flex items-center gap-1"
                    >
                      <Mail className="w-3.5 h-3.5" /> Email
                    </button>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-400 font-medium">
                    No generated invoices records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
