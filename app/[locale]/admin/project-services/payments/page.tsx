"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Loader2, RefreshCw, DollarSign, CheckCircle2, 
  HelpCircle, CreditCard, ExternalLink, ShieldCheck, Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

export default function AdminPaymentsPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const [payments, setPayments] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Manual payment entry form
  const [requestId, setRequestId] = useState('');
  const [amount, setAmount] = useState('');
  const [txnId, setTxnId] = useState('');
  const [payMethod, setPayMethod] = useState('Manual Bank Transfer');
  const [status, setStatus] = useState('Paid');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [paymentsRes, requestsRes] = await Promise.all([
        fetch('/api/project-services/admin/payments'),
        fetch('/api/project-services/admin')
      ]);

      if (paymentsRes.ok) {
        const json = await paymentsRes.json();
        if (json.success) setPayments(json.payments || []);
      }
      if (requestsRes.ok) {
        const json = await requestsRes.json();
        if (json.success) setRequests(json.requests || []);
      }
    } catch (err) {
      console.error('[Admin Payments] Fetch Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegisterPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestId || !amount) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/project-services/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          amount: parseFloat(amount),
          transactionId: txnId.trim() || undefined,
          paymentMethod: payMethod,
          status: status
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          alert('Transaction logged successfully!');
          setRequestId('');
          setAmount('');
          setTxnId('');
          fetchData();
        }
      }
    } catch (err) {
      console.error('[Admin Register Payment Error]', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerifyPayment = async (pay: any) => {
    if (!confirm('Mark transaction status as Verified (Paid)? This will trigger project lifecycle updates.')) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/project-services/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: pay.id,
          requestId: pay.request_id,
          amount: pay.amount,
          status: 'Paid',
          paymentMethod: pay.payment_method
        })
      });
      if (res.ok) {
        alert('Transaction verified successfully!');
        fetchData();
      }
    } catch (err) {
      console.error('[Admin Verify Payment Error]', err);
    } finally {
      setIsSaving(false);
    }
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
          <div className="flex items-center gap-2 text-indigo-600 font-bold tracking-widest text-[11px] font-mono uppercase mb-1">
            <CreditCard className="w-3.5 h-3.5" /> Platform Ledger
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#171717]">Transactions & Payments</h1>
          <p className="text-stone-500 text-xs mt-1">Review student checkout payments, Razorpay webhooks, and manual transfer approvals.</p>
        </div>
        <button 
          onClick={fetchData} 
          className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 hover:text-[#171717] transition-all shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        {/* Payments Logs List */}
        <div className="lg:col-span-2 border border-[#EBEBEB] bg-white rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#EBEBEB] bg-[#fafaf9]">
            <h3 className="text-xs font-mono font-bold text-stone-500 uppercase">Transaction History Logs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50/50 border-b border-[#EBEBEB] text-[#8F8F8F] font-mono uppercase tracking-wider">
                  <th className="p-4 font-bold">Transaction Reference</th>
                  <th className="p-4 font-bold">Client / Project</th>
                  <th className="p-4 font-bold">Amount</th>
                  <th className="p-4 font-bold">Method</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBEBEB]">
                {payments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-stone-50/50 transition-all">
                    <td className="p-4">
                      <p className="font-mono font-bold text-[#171717]">{pay.transaction_id}</p>
                      {pay.razorpay_payment_id && <p className="text-[9px] text-[#8F8F8F] font-mono mt-0.5">RP: {pay.razorpay_payment_id}</p>}
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-[#171717]">{pay.project_requests?.full_name}</p>
                      <p className="text-[10px] text-stone-400 mt-0.5 truncate max-w-[150px]">{pay.project_requests?.project_title}</p>
                    </td>
                    <td className="p-4 font-mono font-bold text-[#171717]">₹{pay.amount}</td>
                    <td className="p-4 text-stone-500 font-medium">{pay.payment_method}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        pay.status === 'Paid' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : pay.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {pay.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {pay.status === 'Pending' && (
                        <button 
                          onClick={() => handleVerifyPayment(pay)}
                          className="text-xs font-mono font-bold text-emerald-600 hover:text-emerald-800"
                        >
                          Verify Payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-stone-400 font-medium">
                      No payment transactions recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Manual Payment Verification Input Card */}
        <Card className="bg-white border border-[#EBEBEB] shadow-sm">
          <CardHeader className="pb-3 border-b border-[#EBEBEB]">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#7c3aed]" /> Record Manual Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleRegisterPayment} className="space-y-4 text-xs">
              <div>
                <label className="text-xs font-mono font-bold text-stone-400 uppercase block mb-1.5 font-semibold">Select Project Ticket *</label>
                <select
                  className="w-full h-10 border border-stone-200 bg-white px-3 rounded-xl text-xs font-semibold text-stone-600 focus:outline-none focus:ring-1 focus:ring-[#7c3aed] transition-all"
                  value={requestId}
                  onChange={e => setRequestId(e.target.value)}
                  required
                >
                  <option value="">Choose ticket...</option>
                  {requests.map(r => (
                    <option key={r.id} value={r.id}>{r.project_id} - {r.full_name} (₹{r.budget_range})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-mono font-bold text-stone-400 uppercase block mb-1.5 font-semibold">Received Amount (INR) *</label>
                <Input 
                  type="number"
                  placeholder="e.g. 5000"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-mono font-bold text-stone-400 uppercase block mb-1.5 font-semibold">Transaction Reference ID</label>
                <Input 
                  placeholder="e.g. TXN-GPAY-9812739"
                  value={txnId}
                  onChange={e => setTxnId(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-mono font-bold text-stone-400 uppercase block mb-1.5 font-semibold">Payment Mode</label>
                <select
                  className="w-full h-10 border border-stone-200 bg-white px-3 rounded-xl text-xs font-semibold text-stone-600 focus:outline-none focus:ring-1 focus:ring-[#7c3aed] transition-all"
                  value={payMethod}
                  onChange={e => setPayMethod(e.target.value)}
                >
                  <option value="Manual Bank Transfer">Manual Bank Transfer</option>
                  <option value="UPI / GPay / PhonePe">UPI / GPay / PhonePe</option>
                  <option value="Cash Deposit">Cash Deposit</option>
                  <option value="Razorpay Online Gateway">Razorpay Online Gateway</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-mono font-bold text-stone-400 uppercase block mb-1.5 font-semibold">Transaction Status</label>
                <select
                  className="w-full h-10 border border-stone-200 bg-white px-3 rounded-xl text-xs font-semibold text-stone-600 focus:outline-none focus:ring-1 focus:ring-[#7c3aed] transition-all"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                >
                  <option value="Paid">Paid / Cleared</option>
                  <option value="Pending">Pending / Verifying</option>
                  <option value="Failed">Failed / Declined</option>
                </select>
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-xs font-mono font-bold text-white rounded-xl h-10"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-white mr-1.5" /> : null}
                  Log Payment Reference
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
