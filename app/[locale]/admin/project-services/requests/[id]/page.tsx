"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Loader2, Send, Upload, FileText, Download, Calendar, 
  DollarSign, CheckCircle2, MessageSquare, Clock, ShieldAlert,
  Info, Users, BookOpen, ExternalLink, RefreshCw, Mail, Phone,
  MessageCircle, Plus, Trash2, Edit2, AlertCircle, Sparkles, Code
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function AdminProjectDetailsPage({ params }: { params: { locale: string; id: string } }) {
  const { locale, id } = params;
  const [data, setData] = useState<any>(null);
  const [experts, setExperts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Tab Input states
  const [statusInput, setStatusInput] = useState('Pending');
  const [urgencyInput, setUrgencyInput] = useState('Normal');
  const [expertIdInput, setExpertIdInput] = useState('');
  const [completionPercent, setCompletionPercent] = useState(0);

  // Messages
  const [adminMsg, setAdminMsg] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Timeline
  const [newTimelineTitle, setNewTimelineTitle] = useState('');
  const [newTimelineDesc, setNewTimelineDesc] = useState('');

  // Quotation Builder
  const [basePrice, setBasePrice] = useState('');
  const [discount, setDiscount] = useState('0');
  const [additionalCharges, setAdditionalCharges] = useState('0');
  const [tax, setTax] = useState('0');
  const [quoteNotes, setQuoteNotes] = useState('');
  const [quoteDueDate, setQuoteDueDate] = useState('');

  // Payments
  const [payAmount, setPayAmount] = useState('');
  const [payTxnId, setPayTxnId] = useState('');
  const [payMethod, setPayMethod] = useState('Manual Bank Transfer');
  const [payStatus, setPayStatus] = useState('Paid');

  // Deliverables
  const [delTitle, setDelTitle] = useState('');
  const [delName, setDelName] = useState('');
  const [delUrl, setDelUrl] = useState('');
  const [delVersion, setDelVersion] = useState('1.0');
  const [delDesc, setDelDesc] = useState('');

  // Internal Notes
  const [internalNote, setInternalNote] = useState('');
  const [internalNotesList, setInternalNotesList] = useState<Array<{ note: string; created_at: string }>>([]);

  const fetchDetails = async () => {
    try {
      const [detailsRes, expertsRes] = await Promise.all([
        fetch(`/api/project-services/requests/${id}`),
        fetch('/api/project-services/admin?action=get_experts')
      ]);

      if (detailsRes.ok) {
        const json = await detailsRes.json();
        if (json.success) {
          setData(json);
          setStatusInput(json.request.status);
          setUrgencyInput(json.request.urgency);
          setExpertIdInput(json.request.expert_id || '');
          
          // Set completion percentage based on status
          const percentMap: Record<string, number> = {
            'Pending': 5,
            'Under Review': 15,
            'Quotation Sent': 25,
            'Awaiting Payment': 35,
            'In Progress': 55,
            'Testing': 75,
            'Client Review': 85,
            'Delivered': 95,
            'Completed': 100
          };
          setCompletionPercent(percentMap[json.request.status] || 0);

          // Get first quotation if present to populate
          if (json.invoices && json.invoices.length > 0) {
            setBasePrice(json.invoices[0].amount.toString());
          }
        }
      }

      if (expertsRes.ok) {
        const json = await expertsRes.json();
        if (json.success) setExperts(json.experts || []);
      }
    } catch (err) {
      console.error('[Admin Details Page] Fetch Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'messages') {
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [data?.messages, activeTab]);

  const handleUpdateOverview = async () => {
    try {
      const response = await fetch(`/api/project-services/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusInput,
          urgency: urgencyInput
        })
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success) {
          alert('Overview updated successfully!');
          fetchDetails();
        }
      }
    } catch (err) {
      console.error('[Admin Details] Patch overview error:', err);
    }
  };

  const handleAssignExpert = async () => {
    try {
      const response = await fetch('/api/project-services/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign_expert',
          requestId: id,
          expertId: expertIdInput || null
        })
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success) {
          alert('Expert assigned successfully!');
          fetchDetails();
        }
      }
    } catch (err) {
      console.error('[Admin Details] Assign expert error:', err);
    }
  };

  const handleAddTimelineEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTimelineTitle.trim()) return;

    try {
      const response = await fetch('/api/project-services/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          requestId: id,
          status: statusInput,
          title: newTimelineTitle.trim(),
          description: newTimelineDesc.trim() || undefined
        })
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success) {
          alert('Timeline event added!');
          setNewTimelineTitle('');
          setNewTimelineDesc('');
          fetchDetails();
        }
      }
    } catch (err) {
      console.error('[Admin Details] Add timeline event error:', err);
    }
  };

  const handleBuildQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!basePrice) return;

    try {
      const bp = parseFloat(basePrice);
      const disc = parseFloat(discount) || 0;
      const add = parseFloat(additionalCharges) || 0;
      const tx = parseFloat(tax) || 0;
      const finalAmount = Math.max(bp - disc + add + tx, 0);

      const response = await fetch('/api/project-services/admin/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: id,
          basePrice: bp,
          discount: disc,
          additionalCharges: add,
          tax: tx,
          finalAmount,
          dueDate: quoteDueDate || undefined,
          notes: quoteNotes.trim() || undefined,
          status: 'Sent'
        })
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success) {
          alert('Quotation generated and sent to student!');
          setBasePrice('');
          setDiscount('0');
          setAdditionalCharges('0');
          setTax('0');
          setQuoteNotes('');
          fetchDetails();
        }
      }
    } catch (err) {
      console.error('[Admin Details] Quotation build error:', err);
    }
  };

  const handleLogPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount) return;

    try {
      const response = await fetch('/api/project-services/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: id,
          amount: parseFloat(payAmount),
          transactionId: payTxnId.trim() || undefined,
          paymentMethod: payMethod,
          status: payStatus
        })
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success) {
          alert('Transaction logged successfully!');
          setPayAmount('');
          setPayTxnId('');
          fetchDetails();
        }
      }
    } catch (err) {
      console.error('[Admin Details] Payment log error:', err);
    }
  };

  const handleUploadDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delTitle.trim() || !delUrl.trim() || !delName.trim()) return;

    try {
      const response = await fetch('/api/project-services/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upload_deliverable',
          requestId: id,
          title: delTitle.trim(),
          description: delDesc.trim() || undefined,
          file_url: delUrl.trim(),
          file_name: delName.trim(),
          version: delVersion.trim()
        })
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success) {
          alert('Deliverable uploaded!');
          setDelTitle('');
          setDelName('');
          setDelUrl('');
          setDelDesc('');
          setDelVersion('1.0');
          fetchDetails();
        }
      }
    } catch (err) {
      console.error('[Admin Details] Upload deliverable error:', err);
    }
  };

  const handleSendAdminMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminMsg.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch(`/api/project-services/requests/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: adminMsg })
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success) {
          setData((prev: any) => ({
            ...prev,
            messages: [...prev.messages, json.message]
          }));
          setAdminMsg('');
        }
      }
    } catch (err) {
      console.error('[Admin Details] Message send error:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleAddInternalNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalNote.trim()) return;

    const newNote = {
      note: internalNote.trim(),
      created_at: new Date().toISOString()
    };
    setInternalNotesList(prev => [newNote, ...prev]);
    setInternalNote('');
    alert('Internal note saved!');
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#7c3aed]" />
      </div>
    );
  }

  if (!data?.request) {
    return (
      <div className="text-center py-20">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold">Ticket not found</h2>
        <Link href={`/${locale}/admin/project-services/requests`} className="inline-flex items-center gap-2 mt-6 text-sm font-mono text-[#7c3aed]">
          <ArrowLeft className="w-4 h-4" /> Return to requests
        </Link>
      </div>
    );
  }

  const { request, files, timeline, messages, deliverables, invoices } = data;

  const tabList = [
    { id: 'overview', name: 'Overview' },
    { id: 'student', name: 'Student' },
    { id: 'project', name: 'Project' },
    { id: 'timeline', name: 'Timeline' },
    { id: 'quotation', name: 'Quotation' },
    { id: 'payments', name: 'Payments' },
    { id: 'files', name: 'Files' },
    { id: 'deliverables', name: 'Deliverables' },
    { id: 'messages', name: 'Messages' },
    { id: 'notes', name: 'Notes' }
  ];

  return (
    <div className="space-y-8 animate-fade-in text-[#171717]">
      {/* Back Link */}
      <div>
        <Link 
          href={`/${locale}/admin/project-services/requests`} 
          className="inline-flex items-center gap-2 text-xs font-mono text-stone-500 hover:text-[#171717]"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Requests
        </Link>
      </div>

      {/* Ticket header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-lg font-bold text-[#7c3aed]">{request.project_id}</span>
            <Badge className={request.urgency === 'Critical' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-stone-50 text-stone-500 border-stone-200'}>
              {request.urgency}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold mt-2">{request.project_title}</h1>
          <p className="text-stone-500 text-xs mt-1">Student: {request.full_name} ({request.college})</p>
        </div>
        <button 
          onClick={fetchDetails}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 hover:text-[#171717] hover:bg-stone-50 text-xs font-mono font-bold transition-all shadow-sm shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Ticket
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 overflow-x-auto gap-6 select-none scrollbar-none">
        {tabList.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 text-sm font-semibold whitespace-nowrap transition-all border-b-2 -mb-[2px] ${
              activeTab === tab.id 
                ? 'border-[#7c3aed] text-[#7c3aed]' 
                : 'border-transparent text-stone-500 hover:text-[#171717]'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[300px] text-left">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              {/* Progress and status update */}
              <Card className="bg-white border border-[#EBEBEB] shadow-sm">
                <CardHeader className="pb-3 border-b border-[#EBEBEB]">
                  <CardTitle className="text-sm font-semibold">Project Progress & Status</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-xs font-mono font-bold text-stone-400 mb-2">
                      <span>COMPLETION PERCENTAGE</span>
                      <span className="text-[#7c3aed]">{completionPercent}%</span>
                    </div>
                    <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-[#7c3aed] h-full transition-all duration-300" style={{ width: `${completionPercent}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono font-bold text-stone-400 block mb-1.5">PROJECT STATUS</label>
                      <select
                        className="w-full h-10 border border-stone-200 bg-white px-3 rounded-xl text-xs font-semibold text-stone-600 focus:outline-none"
                        value={statusInput}
                        onChange={e => setStatusInput(e.target.value)}
                      >
                        {['Pending', 'Under Review', 'In Progress', 'Testing', 'Completed', 'Delivered', 'Cancelled'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-mono font-bold text-stone-400 block mb-1.5">URGENCY LEVEL</label>
                      <select
                        className="w-full h-10 border border-stone-200 bg-white px-3 rounded-xl text-xs font-semibold text-stone-600 focus:outline-none"
                        value={urgencyInput}
                        onChange={e => setUrgencyInput(e.target.value)}
                      >
                        <option value="Normal">Normal</option>
                        <option value="Urgent">Urgent</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                  </div>
                  <Button onClick={handleUpdateOverview} className="w-full bg-[#171717] hover:bg-stone-850 text-xs font-mono font-bold text-white rounded-xl h-10">
                    Apply Updates
                  </Button>
                </CardContent>
              </Card>

              {/* Expert assignment */}
              <Card className="bg-white border border-[#EBEBEB] shadow-sm">
                <CardHeader className="pb-3 border-b border-[#EBEBEB]">
                  <CardTitle className="text-sm font-semibold">Assign Developer Expert</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <label className="text-[10px] font-mono font-bold text-stone-400 block mb-1.5">CHOOSE DEVELOPER</label>
                    <select
                      className="w-full h-10 border border-stone-200 bg-white px-3 rounded-xl text-xs font-semibold text-stone-600 focus:outline-none"
                      value={expertIdInput}
                      onChange={e => setExpertIdInput(e.target.value)}
                    >
                      <option value="">Choose expert developer...</option>
                      {experts.map(exp => (
                        <option key={exp.id} value={exp.id}>{exp.name} ({exp.specialization || 'General'})</option>
                      ))}
                    </select>
                  </div>
                  <Button onClick={handleAssignExpert} className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-xs font-mono font-bold text-white rounded-xl h-10">
                    Update Assignment
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Spec details card */}
            <div className="bg-white border border-[#EBEBEB] p-6 rounded-xl shadow-sm space-y-4">
              <h3 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider">Project Lifecycle Specifications</h3>
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-400">Created Date</span>
                  <span className="font-semibold font-mono">{new Date(request.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-400">Target Submission</span>
                  <span className="font-semibold font-mono">{request.submission_date ? new Date(request.submission_date).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-400">Project Type</span>
                  <span className="font-semibold">{request.project_type}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-400">Domain Scope</span>
                  <span className="font-semibold">{request.project_domain}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-stone-400">Team Size</span>
                  <span className="font-semibold">{request.project_mode} ({request.team_size} members)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STUDENT TAB */}
        {activeTab === 'student' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-white border border-[#EBEBEB] p-6 rounded-xl shadow-sm space-y-6">
              <h3 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider mb-2">Student Information</h3>
              <div className="grid grid-cols-2 gap-6 text-xs">
                <div><span className="text-stone-400 block mb-0.5">Name</span> <p className="font-semibold text-sm">{request.full_name}</p></div>
                <div><span className="text-stone-400 block mb-0.5">Email</span> <p className="font-semibold text-sm">{request.email}</p></div>
                <div><span className="text-stone-400 block mb-0.5">Mobile Phone</span> <p className="font-semibold text-sm">{request.phone}</p></div>
                <div><span className="text-stone-400 block mb-0.5">WhatsApp</span> <p className="font-semibold text-sm">{request.whatsapp || request.phone}</p></div>
                <div><span className="text-stone-400 block mb-0.5">College Name</span> <p className="font-semibold text-sm">{request.college}</p></div>
                <div><span className="text-stone-400 block mb-0.5">University</span> <p className="font-semibold text-sm">{request.university}</p></div>
                <div><span className="text-stone-400 block mb-0.5">Branch</span> <p className="font-semibold text-sm">{request.branch}</p></div>
                <div><span className="text-stone-400 block mb-0.5">Year / Sem</span> <p className="font-semibold text-sm">{request.year} - {request.semester}</p></div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white border border-[#EBEBEB] p-6 rounded-xl shadow-sm space-y-4">
              <h3 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider">Quick Actions</h3>
              <div className="space-y-3">
                <a 
                  href={`mailto:${request.email}`}
                  className="w-full inline-flex items-center justify-center gap-2 border border-stone-200 bg-white hover:bg-stone-50 px-4 h-10 rounded-xl text-xs font-mono font-bold text-[#171717] transition-all shadow-sm"
                >
                  <Mail className="w-4 h-4 text-[#7c3aed]" /> Email Student
                </a>
                <a 
                  href={`tel:${request.phone}`}
                  className="w-full inline-flex items-center justify-center gap-2 border border-stone-200 bg-white hover:bg-stone-50 px-4 h-10 rounded-xl text-xs font-mono font-bold text-[#171717] transition-all shadow-sm"
                >
                  <Phone className="w-4 h-4 text-[#7c3aed]" /> Call Student
                </a>
                <a 
                  href={`https://wa.me/${request.whatsapp?.replace(/[^0-9]/g, '') || request.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 border border-stone-200 bg-white hover:bg-stone-50 px-4 h-10 rounded-xl text-xs font-mono font-bold text-[#171717] transition-all shadow-sm"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" /> WhatsApp Chat
                </a>
              </div>
            </div>
          </div>
        )}

        {/* PROJECT TAB */}
        {activeTab === 'project' && (
          <div className="space-y-6">
            {/* Description */}
            <div className="bg-white border border-[#EBEBEB] p-6 rounded-xl shadow-sm">
              <h3 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider mb-2">Project Definitions</h3>
              <h4 className="text-sm font-semibold text-[#171717] mb-3">{request.project_title}</h4>
              <p className="text-stone-600 text-xs leading-relaxed whitespace-pre-wrap">{request.project_description}</p>
            </div>

            {/* Deliverables Checklist */}
            <div className="bg-white border border-[#EBEBEB] p-6 rounded-xl shadow-sm">
              <h3 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider mb-3">Requested Deliverables</h3>
              <div className="flex flex-wrap gap-1.5">
                {request.requirements.map((r: string) => (
                  <Badge key={r} variant="secondary" className="bg-[#7c3aed]/10 text-[#7c3aed] border-transparent">{r}</Badge>
                ))}
              </div>
            </div>

            {/* Stack Preferences */}
            <div className="bg-white border border-[#EBEBEB] p-6 rounded-xl shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div><span className="text-stone-400 block mb-0.5">Language</span> <p className="font-semibold">{request.tech_language || 'N/A'}</p></div>
              <div><span className="text-stone-400 block mb-0.5">AI Framework</span> <p className="font-semibold">{request.tech_ai_framework || 'N/A'}</p></div>
              <div><span className="text-stone-400 block mb-0.5">Frontend Stack</span> <p className="font-semibold">{request.tech_frontend || 'N/A'}</p></div>
              <div><span className="text-stone-400 block mb-0.5">Backend Stack</span> <p className="font-semibold">{request.tech_backend || 'N/A'}</p></div>
            </div>
          </div>
        )}

        {/* TIMELINE TAB */}
        {activeTab === 'timeline' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-white border border-[#EBEBEB] p-6 rounded-xl shadow-sm">
              <h3 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider mb-6">Logs Timeline</h3>
              <div className="relative pl-6 border-l-2 border-stone-200 space-y-6">
                {timeline.map((event: any) => (
                  <div key={event.id} className="relative">
                    <div className="absolute -left-[31px] top-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#7c3aed] text-white">
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    </div>
                    <h4 className="text-xs font-bold text-[#171717]">{event.title}</h4>
                    <p className="text-[11px] text-stone-500 mt-0.5">{event.description}</p>
                    <span className="text-[9px] font-mono text-stone-300 block mt-1">{new Date(event.created_at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Builder */}
            <Card className="bg-white border border-[#EBEBEB] shadow-sm">
              <CardHeader className="pb-3 border-b border-[#EBEBEB]">
                <CardTitle className="text-sm font-semibold">Add Timeline Log</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleAddTimelineEvent} className="space-y-4 text-xs">
                  <div>
                    <label className="text-[10px] font-mono font-bold text-stone-400 block mb-1.5">Event Title *</label>
                    <Input 
                      placeholder="e.g. Code Review Completed"
                      value={newTimelineTitle}
                      onChange={e => setNewTimelineTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono font-bold text-stone-400 block mb-1.5">Description</label>
                    <Textarea 
                      placeholder="e.g. System tested and passed criteria..."
                      value={newTimelineDesc}
                      onChange={e => setNewTimelineDesc(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-[#171717] hover:bg-stone-850 text-xs font-mono font-bold text-white rounded-xl h-10">
                    Add Timeline Event
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* QUOTATION TAB */}
        {activeTab === 'quotation' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              {/* Existing Invoices / Quotations */}
              <div className="bg-white border border-[#EBEBEB] rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[#EBEBEB] bg-[#fafaf9]">
                  <h3 className="text-xs font-mono font-bold text-stone-500 uppercase">Quotations Issued</h3>
                </div>
                <div className="divide-y divide-[#EBEBEB]">
                  {invoices.map((inv: any) => (
                    <div key={inv.id} className="p-4 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-mono text-stone-400 block">{inv.invoice_number}</span>
                        <h4 className="text-sm font-bold text-[#171717] font-mono">₹{inv.amount}</h4>
                      </div>
                      <Badge className={inv.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}>
                        {inv.status}
                      </Badge>
                    </div>
                  ))}
                  {invoices.length === 0 && (
                    <div className="p-6 text-center text-stone-400">No quotation invoices generated.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Quotation Builder */}
            <Card className="bg-white border border-[#EBEBEB] shadow-sm">
              <CardHeader className="pb-3 border-b border-[#EBEBEB]">
                <CardTitle className="text-sm font-semibold">Generate Quotation</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleBuildQuotation} className="space-y-4 text-xs">
                  <div>
                    <label className="text-[10px] font-mono font-bold text-stone-400 block mb-1.5 font-semibold">Base Price *</label>
                    <Input 
                      type="number"
                      placeholder="e.g. 15000"
                      value={basePrice}
                      onChange={e => setBasePrice(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono font-bold text-stone-400 block mb-1.5">Discount</label>
                      <Input 
                        type="number"
                        value={discount}
                        onChange={e => setDiscount(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono font-bold text-stone-400 block mb-1.5">Taxes</label>
                      <Input 
                        type="number"
                        value={tax}
                        onChange={e => setTax(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono font-bold text-stone-400 block mb-1.5 font-semibold">Terms / Milestone Details</label>
                    <Textarea 
                      placeholder="e.g. 50% advance, 50% on code delivery..."
                      value={quoteNotes}
                      onChange={e => setQuoteNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-xs font-mono font-bold text-white rounded-xl h-10">
                    Send Quotation & Invoice
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* PAYMENTS TAB */}
        {activeTab === 'payments' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              {/* Transaction Logs */}
              <div className="bg-white border border-[#EBEBEB] rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[#EBEBEB] bg-[#fafaf9]">
                  <h3 className="text-xs font-mono font-bold text-stone-500 uppercase">Payment Logs</h3>
                </div>
                <div className="divide-y divide-[#EBEBEB] text-xs">
                  {invoices.map((inv: any) => (
                    <div key={inv.id} className="p-4 flex justify-between items-center">
                      <div>
                        <span className="font-mono text-stone-400 block">{inv.invoice_number}</span>
                        <h4 className="text-sm font-bold text-stone-700 font-mono">₹{inv.amount}</h4>
                      </div>
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        inv.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Log Manual Transfer */}
            <Card className="bg-white border border-[#EBEBEB] shadow-sm">
              <CardHeader className="pb-3 border-b border-[#EBEBEB]">
                <CardTitle className="text-sm font-semibold">Record Manual Payment</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleLogPayment} className="space-y-4 text-xs">
                  <div>
                    <label className="text-[10px] font-mono font-bold text-stone-400 block mb-1.5 font-semibold">Amount Received *</label>
                    <Input 
                      type="number"
                      placeholder="e.g. 7500"
                      value={payAmount}
                      onChange={e => setPayAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono font-bold text-stone-400 block mb-1.5">Reference Transaction ID</label>
                    <Input 
                      placeholder="e.g. TXN-UPI-9812739"
                      value={payTxnId}
                      onChange={e => setPayTxnId(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono font-bold text-stone-400 block mb-1.5">Mode</label>
                      <select
                        className="w-full h-10 border border-stone-200 bg-white px-2 rounded-xl text-xs font-semibold text-stone-600 focus:outline-none"
                        value={payMethod}
                        onChange={e => setPayMethod(e.target.value)}
                      >
                        <option value="Manual Bank Transfer">Manual</option>
                        <option value="UPI / GPay / PhonePe">UPI</option>
                        <option value="Razorpay Online Gateway">Razorpay</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-mono font-bold text-stone-400 block mb-1.5">Status</label>
                      <select
                        className="w-full h-10 border border-stone-200 bg-white px-2 rounded-xl text-xs font-semibold text-stone-600 focus:outline-none"
                        value={payStatus}
                        onChange={e => setPayStatus(e.target.value)}
                      >
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Failed">Failed</option>
                      </select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-[#171717] hover:bg-stone-850 text-xs font-mono font-bold text-white rounded-xl h-10">
                    Register Payment
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* FILES TAB */}
        {activeTab === 'files' && (
          <div className="bg-white border border-[#EBEBEB] rounded-xl overflow-hidden shadow-sm max-w-[600px] mx-auto text-left">
            <div className="p-4 border-b border-[#EBEBEB] bg-[#fafaf9]">
              <h3 className="text-xs font-mono font-bold text-stone-500 uppercase">Documents Attached</h3>
            </div>
            <div className="divide-y divide-[#EBEBEB] text-xs">
              {files.map((file: any) => (
                <div key={file.id} className="p-4 flex items-center justify-between hover:bg-stone-50/50 transition-all">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-stone-400 shrink-0" />
                    <div>
                      <p className="font-semibold text-[#171717] truncate max-w-[250px]">{file.file_name}</p>
                      <p className="text-[9px] text-stone-400 font-mono mt-0.5">{(file.file_size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <a 
                    href={file.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 border border-stone-200 bg-white rounded-lg text-[10px] font-mono font-bold text-stone-600 hover:text-[#171717] hover:bg-stone-50 transition-all shadow-sm"
                  >
                    <Download className="w-3 h-3" /> Download
                  </a>
                </div>
              ))}
              {files.length === 0 && (
                <div className="p-8 text-center text-stone-400">No documents uploaded.</div>
              )}
            </div>
          </div>
        )}

        {/* DELIVERABLES TAB */}
        {activeTab === 'deliverables' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Deliverable List */}
            <div className="md:col-span-2 border border-[#EBEBEB] bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-[#EBEBEB] bg-[#fafaf9]">
                <h3 className="text-xs font-mono font-bold text-stone-500 uppercase">Project Deliverables</h3>
              </div>
              <div className="divide-y divide-[#EBEBEB] text-xs">
                {deliverables.map((del: any) => (
                  <div key={del.id} className="p-4 flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="inline-flex px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 text-[9px] font-mono font-bold">v{del.version}</span>
                      <h4 className="font-semibold text-[#171717]">{del.title}</h4>
                      {del.description && <p className="text-stone-500 text-[11px] leading-relaxed">{del.description}</p>}
                    </div>
                    <a 
                      href={del.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-stone-200 bg-white rounded-lg text-[10px] font-mono font-bold text-stone-600 hover:text-[#171717]"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  </div>
                ))}
                {deliverables.length === 0 && (
                  <div className="p-6 text-center text-stone-400">No deliverables uploaded yet.</div>
                )}
              </div>
            </div>

            {/* Deliverable Form */}
            <Card className="bg-white border border-[#EBEBEB] shadow-sm">
              <CardHeader className="pb-3 border-b border-[#EBEBEB]">
                <CardTitle className="text-sm font-semibold">Upload Deliverable</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleUploadDeliverable} className="space-y-4 text-xs">
                  <div>
                    <label className="text-[10px] font-mono font-bold text-stone-400 block mb-1.5">Deliverable Title *</label>
                    <Input 
                      placeholder="e.g. Base Paper PDF"
                      value={delTitle}
                      onChange={e => setDelTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono font-bold text-stone-400 block mb-1.5">File Name *</label>
                    <Input 
                      placeholder="e.g. report.pdf"
                      value={delName}
                      onChange={e => setDelName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono font-bold text-stone-400 block mb-1.5">Download File URL *</label>
                    <Input 
                      placeholder="https://..."
                      value={delUrl}
                      onChange={e => setDelUrl(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono font-bold text-stone-400 block mb-1.5">Version</label>
                    <Input 
                      placeholder="e.g. 1.0"
                      value={delVersion}
                      onChange={e => setDelVersion(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono font-bold text-stone-400 block mb-1.5">Release Notes</label>
                    <Textarea 
                      placeholder="e.g. Abstract structure and index copy..."
                      value={delDesc}
                      onChange={e => setDelDesc(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-[#171717] hover:bg-stone-850 text-xs font-mono font-bold text-white rounded-xl h-10">
                    Publish Deliverable
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div className="max-w-[700px] border border-[#EBEBEB] bg-white rounded-xl overflow-hidden shadow-sm flex flex-col h-[500px] mx-auto text-left">
            <div className="p-4 border-b border-[#EBEBEB] bg-[#fafaf9] flex items-center justify-between">
              <span className="text-xs font-semibold flex items-center gap-1.5"><MessageSquare className="w-4 h-4 text-[#7c3aed]" /> Discussion Thread</span>
              <span className="text-[10px] font-mono text-stone-400">Admin Console</span>
            </div>
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-stone-50/50">
              {messages.map((msg: any) => {
                const isAdmin = msg.sender_role === 'admin';
                return (
                  <div key={msg.id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold text-stone-400 uppercase">
                        {isAdmin ? 'You (Admin)' : 'Student'}
                      </span>
                      <span className="text-[9px] font-mono text-stone-300">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={`p-3.5 rounded-2xl text-xs max-w-[80%] leading-relaxed shadow-sm ${
                      isAdmin 
                        ? 'bg-[#171717] text-white rounded-tr-none' 
                        : 'bg-white border border-[#EBEBEB] text-[#171717] rounded-tl-none'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                );
              })}
              <div ref={messageEndRef} />
            </div>
            <form onSubmit={handleSendAdminMessage} className="p-4 border-t border-[#EBEBEB] bg-white flex gap-3">
              <Input 
                placeholder="Type your message to student..." 
                value={adminMsg} 
                onChange={e => setAdminMsg(e.target.value)} 
                disabled={isSending}
                className="flex-1 rounded-xl"
              />
              <Button type="submit" disabled={isSending || !adminMsg.trim()} className="bg-[#7c3aed] hover:bg-[#6d28d9] shrink-0 h-9 w-9 p-0 flex items-center justify-center rounded-xl">
                <Send className="w-4 h-4 text-white" />
              </Button>
            </form>
          </div>
        )}

        {/* NOTES TAB */}
        {activeTab === 'notes' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white border border-[#EBEBEB] rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[#EBEBEB] bg-[#fafaf9]">
                  <h3 className="text-xs font-mono font-bold text-stone-500 uppercase">Private Admin Notes</h3>
                </div>
                <div className="divide-y divide-[#EBEBEB] text-xs">
                  {internalNotesList.map((n, idx) => (
                    <div key={idx} className="p-4 space-y-1 hover:bg-stone-50/50 transition-all">
                      <p className="text-stone-600 leading-relaxed font-sans">{n.note}</p>
                      <span className="text-[9px] font-mono text-stone-300 block">{new Date(n.created_at).toLocaleString()}</span>
                    </div>
                  ))}
                  {internalNotesList.length === 0 && (
                    <div className="p-6 text-center text-stone-400">No internal admin notes saved.</div>
                  )}
                </div>
              </div>
            </div>

            <Card className="bg-white border border-[#EBEBEB] shadow-sm">
              <CardHeader className="pb-3 border-b border-[#EBEBEB]">
                <CardTitle className="text-sm font-semibold">Write Private Note</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleAddInternalNote} className="space-y-4 text-xs">
                  <Textarea 
                    placeholder="Enter private notes only visible to admins..."
                    value={internalNote}
                    onChange={e => setInternalNote(e.target.value)}
                    rows={4}
                    required
                  />
                  <Button type="submit" className="w-full bg-[#171717] hover:bg-stone-850 text-xs font-mono font-bold text-white rounded-xl h-10">
                    Save Internal Note
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
