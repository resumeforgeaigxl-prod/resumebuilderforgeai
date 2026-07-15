"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Loader2, RefreshCw, FileText, FilePlus, DollarSign,
  Info, CheckCircle2, ChevronRight, Download, Send, Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';

export default function AdminQuotationsPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const [quotations, setQuotations] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form input states
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [requestId, setRequestId] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [discount, setDiscount] = useState('0');
  const [additionalCharges, setAdditionalCharges] = useState('0');
  const [tax, setTax] = useState('0');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('Draft');
  const [dueDate, setDueDate] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [quotesRes, reqsRes] = await Promise.all([
        fetch('/api/project-services/admin/quotations'),
        fetch('/api/project-services/admin')
      ]);

      if (quotesRes.ok) {
        const json = await quotesRes.json();
        if (json.success) setQuotations(json.quotations || []);
      }
      if (reqsRes.ok) {
        const json = await reqsRes.json();
        if (json.success) setRequests(json.requests || []);
      }
    } catch (err) {
      console.error('[Admin Quotations] Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditClick = (quote: any) => {
    setSelectedQuote(quote);
    setRequestId(quote.request_id);
    setBasePrice(quote.base_price.toString());
    setDiscount(quote.discount.toString());
    setAdditionalCharges(quote.additional_charges.toString());
    setTax(quote.tax.toString());
    setNotes(quote.notes || '');
    setStatus(quote.status);
    setDueDate(quote.due_date || '');
  };

  const handleResetForm = () => {
    setSelectedQuote(null);
    setRequestId('');
    setBasePrice('');
    setDiscount('0');
    setAdditionalCharges('0');
    setTax('0');
    setNotes('');
    setStatus('Draft');
    setDueDate('');
  };

  const calculateFinalAmount = () => {
    const bp = parseFloat(basePrice) || 0;
    const disc = parseFloat(discount) || 0;
    const add = parseFloat(additionalCharges) || 0;
    const tx = parseFloat(tax) || 0;
    return Math.max(bp - disc + add + tx, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestId || !basePrice) return;

    setIsSaving(true);
    try {
      const finalAmount = calculateFinalAmount();
      const res = await fetch('/api/project-services/admin/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedQuote?.id || undefined,
          requestId,
          basePrice: parseFloat(basePrice),
          discount: parseFloat(discount),
          additionalCharges: parseFloat(additionalCharges),
          tax: parseFloat(tax),
          finalAmount,
          currency: 'INR',
          dueDate: dueDate || undefined,
          status,
          notes: notes.trim() || undefined
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          alert(selectedQuote ? 'Quotation updated!' : 'Quotation generated!');
          handleResetForm();
          fetchData();
        }
      }
    } catch (err) {
      console.error('[Admin Quotations] Submit Error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendQuotation = async (quote: any) => {
    if (!confirm('Are you sure you want to send this quotation to the student?')) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/project-services/admin/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: quote.id,
          requestId: quote.request_id,
          basePrice: quote.base_price,
          status: 'Sent'
        })
      });
      if (res.ok) {
        alert('Quotation sent to student successfully!');
        fetchData();
      }
    } catch (err) {
      console.error('[Admin Quotations] Send error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApproveQuotation = async (quote: any) => {
    if (!confirm('Mark this quotation as Approved? This will automatically generate the corresponding Invoice.')) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/project-services/admin/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: quote.id,
          requestId: quote.request_id,
          basePrice: quote.base_price,
          status: 'Approved'
        })
      });
      if (res.ok) {
        alert('Quotation Approved! Unpaid Invoice generated.');
        fetchData();
      }
    } catch (err) {
      console.error('[Admin Quotations] Approve error:', err);
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
            <FileText className="w-3.5 h-3.5" /> Billing Management
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#171717]">Platform Quotations</h1>
          <p className="text-stone-500 text-xs mt-1">Generate project cost estimates, apply tax rules, and request approval.</p>
        </div>
        <button 
          onClick={fetchData} 
          className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 hover:text-[#171717] transition-all shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        {/* Quotations List */}
        <div className="lg:col-span-2 border border-[#EBEBEB] bg-white rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#EBEBEB] bg-[#fafaf9]">
            <h3 className="text-xs font-mono font-bold text-stone-500 uppercase">Quotations</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50/50 border-b border-[#EBEBEB] text-[#8F8F8F] font-mono uppercase tracking-wider">
                  <th className="p-4 font-bold">Quote Number</th>
                  <th className="p-4 font-bold">Project / ID</th>
                  <th className="p-4 font-bold">Total Amount</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Due Date</th>
                  <th className="p-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBEBEB]">
                {quotations.map((quote) => (
                  <tr key={quote.id} className="hover:bg-stone-50/50 transition-all">
                    <td className="p-4">
                      <p className="font-mono font-bold text-[#7c3aed]">{quote.quotation_number}</p>
                      <p className="text-[9px] text-stone-400 font-mono mt-0.5">{new Date(quote.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-[#171717] truncate max-w-[150px]">{quote.project_requests?.project_title}</p>
                      <p className="text-[10px] text-stone-400 mt-0.5 font-mono">{quote.project_requests?.project_id}</p>
                    </td>
                    <td className="p-4 font-mono font-bold text-[#171717]">₹{quote.final_amount}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        quote.status === 'Approved' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : quote.status === 'Sent'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-stone-50 text-stone-500 border-stone-200'
                      }`}>
                        {quote.status}
                      </span>
                    </td>
                    <td className="p-4 text-stone-500 font-mono">
                      {quote.due_date ? new Date(quote.due_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {quote.status === 'Draft' && (
                        <button 
                          onClick={() => handleSendQuotation(quote)}
                          className="text-[10px] font-mono font-bold text-blue-600 hover:text-blue-800"
                        >
                          Send
                        </button>
                      )}
                      {quote.status === 'Sent' && (
                        <button 
                          onClick={() => handleApproveQuotation(quote)}
                          className="text-[10px] font-mono font-bold text-emerald-600 hover:text-emerald-800"
                        >
                          Approve
                        </button>
                      )}
                      <button 
                        onClick={() => handleEditClick(quote)}
                        className="text-[10px] font-mono font-bold text-stone-600 hover:text-[#171717]"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {quotations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-stone-400 font-medium">
                      No quotations created yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Builder Panel */}
        <Card className="bg-white border border-[#EBEBEB] shadow-sm">
          <CardHeader className="pb-3 border-b border-[#EBEBEB]">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FilePlus className="w-4 h-4 text-[#7c3aed]" /> {selectedQuote ? 'Modify Quotation' : 'New Estimate Builder'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
                    <option key={r.id} value={r.id}>{r.project_id} - {r.full_name} ({r.project_title.substring(0, 20)}...)</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono font-bold text-stone-400 uppercase block mb-1.5 font-semibold">Base Price *</label>
                  <Input 
                    type="number"
                    placeholder="INR Amount"
                    value={basePrice}
                    onChange={e => setBasePrice(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-mono font-bold text-stone-400 uppercase block mb-1.5 font-semibold">Discounts</label>
                  <Input 
                    type="number"
                    value={discount}
                    onChange={e => setDiscount(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono font-bold text-stone-400 uppercase block mb-1.5 font-semibold">Additional Charges</label>
                  <Input 
                    type="number"
                    value={additionalCharges}
                    onChange={e => setAdditionalCharges(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-mono font-bold text-stone-400 uppercase block mb-1.5 font-semibold">Tax (GST)</label>
                  <Input 
                    type="number"
                    value={tax}
                    onChange={e => setTax(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono font-bold text-stone-400 uppercase block mb-1.5 font-semibold">Due Date</label>
                  <Input 
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-mono font-bold text-stone-400 uppercase block mb-1.5 font-semibold">Status</label>
                  <select
                    className="w-full h-10 border border-stone-200 bg-white px-3 rounded-xl text-xs font-semibold text-stone-600 focus:outline-none focus:ring-1 focus:ring-[#7c3aed] transition-all"
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-mono font-bold text-stone-400 uppercase block mb-1.5 font-semibold">Notes / Terms</label>
                <Textarea 
                  placeholder="Payment milestones, deliverables schedule..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Total Calculation Display */}
              <div className="bg-stone-50 border border-stone-150 p-4 rounded-xl flex justify-between items-center font-mono font-bold text-xs select-none">
                <span className="text-stone-400 uppercase">Calculated Total</span>
                <span className="text-base text-[#7c3aed]">₹{calculateFinalAmount()}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-1 bg-[#7c3aed] hover:bg-[#6d28d9] text-xs font-mono font-bold text-white rounded-xl h-10"
                >
                  {selectedQuote ? 'Save Quotation' : 'Build Estimate'}
                </Button>
                {selectedQuote && (
                  <button 
                    type="button" 
                    onClick={handleResetForm}
                    className="px-4 border border-stone-200 bg-white text-[#171717] text-xs font-mono font-bold hover:bg-stone-50 rounded-xl"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
