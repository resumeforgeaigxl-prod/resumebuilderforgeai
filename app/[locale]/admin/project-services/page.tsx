"use client";

import React, { useState, useEffect } from 'react';
import { 
  FileText, ClipboardCheck, Clock, CheckCircle2, ChevronRight, 
  Search, SlidersHorizontal, Loader2, ArrowLeft, RefreshCw, 
  UserPlus, DollarSign, FileUp, Send, ShieldAlert, Award, 
  Layers, Download, Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/Badge';

export default function AdminProjectServicesPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const [requests, setRequests] = useState<any[]>([]);
  const [experts, setExperts] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Input states for Admin Actions
  const [statusInput, setStatusInput] = useState('Pending');
  const [timelineTitle, setTimelineTitle] = useState('');
  const [timelineDesc, setTimelineDesc] = useState('');
  
  const [assignedExpertId, setAssignedExpertId] = useState('');
  
  const [newExpertName, setNewExpertName] = useState('');
  const [newExpertEmail, setNewExpertEmail] = useState('');
  const [newExpertSpec, setNewExpertSpec] = useState('');
  
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceDueDate, setInvoiceDueDate] = useState('');
  const [invoicePayLink, setInvoicePayLink] = useState('');

  const [delivTitle, setDelivTitle] = useState('');
  const [delivDesc, setDelivDesc] = useState('');
  const [delivUrl, setDelivUrl] = useState('');
  const [delivName, setDelivName] = useState('');
  const [delivVersion, setDelivVersion] = useState('1.0');

  const [adminMsg, setAdminMsg] = useState('');

  const fetchData = async () => {
    try {
      const [reqsResponse, expertsResponse] = await Promise.all([
        fetch('/api/project-services/admin'),
        fetch('/api/project-services/admin?action=get_experts')
      ]);

      if (reqsResponse.ok) {
        const reqsData = await reqsResponse.json();
        if (reqsData.success) setRequests(reqsData.requests || []);
      }
      if (expertsResponse.ok) {
        const expertsData = await expertsResponse.json();
        if (expertsData.success) setExperts(expertsData.experts || []);
      }
    } catch (err) {
      console.error('[Admin] Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectRequest = async (req: any) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/project-services/requests/${req.id}`);
      if (res.ok) {
        const details = await res.json();
        if (details.success) {
          setSelectedRequest(details);
          setStatusInput(details.request.status);
          setAssignedExpertId(details.request.expert_id || '');
        }
      }
    } catch (err) {
      console.error('[Admin Details Fetch Error]', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedRequest) return;
    try {
      const res = await fetch('/api/project-services/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          requestId: selectedRequest.request.id,
          status: statusInput,
          title: timelineTitle.trim() || undefined,
          description: timelineDesc.trim() || undefined
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          alert('Status updated successfully!');
          setTimelineTitle('');
          setTimelineDesc('');
          handleSelectRequest(json.request);
          fetchData();
        }
      }
    } catch (err) {
      console.error('[Admin Update Status Error]', err);
    }
  };

  const handleAssignExpert = async () => {
    if (!selectedRequest) return;
    try {
      const res = await fetch('/api/project-services/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign_expert',
          requestId: selectedRequest.request.id,
          expertId: assignedExpertId || null
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          alert('Expert assigned successfully!');
          handleSelectRequest(json.request);
          fetchData();
        }
      }
    } catch (err) {
      console.error('[Admin Assign Expert Error]', err);
    }
  };

  const handleAddExpert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpertName.trim() || !newExpertEmail.trim()) return;

    try {
      const res = await fetch('/api/project-services/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_expert',
          name: newExpertName.trim(),
          email: newExpertEmail.trim(),
          specialization: newExpertSpec.trim() || undefined
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          alert('New expert added!');
          setExperts(prev => [...prev, json.expert]);
          setNewExpertName('');
          setNewExpertEmail('');
          setNewExpertSpec('');
        }
      }
    } catch (err) {
      console.error('[Admin Add Expert Error]', err);
    }
  };

  const handleIssueInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceAmount || !selectedRequest) return;

    try {
      const res = await fetch('/api/project-services/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_invoice',
          requestId: selectedRequest.request.id,
          amount: parseFloat(invoiceAmount),
          due_date: invoiceDueDate || undefined,
          payment_link: invoicePayLink.trim() || undefined
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          alert('Invoice generated successfully!');
          setInvoiceAmount('');
          setInvoiceDueDate('');
          setInvoicePayLink('');
          handleSelectRequest(selectedRequest.request);
        }
      }
    } catch (err) {
      console.error('[Admin Create Invoice Error]', err);
    }
  };

  const handleUploadDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delivTitle.trim() || !delivUrl.trim() || !delivName.trim() || !selectedRequest) return;

    try {
      const res = await fetch('/api/project-services/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upload_deliverable',
          requestId: selectedRequest.request.id,
          title: delivTitle.trim(),
          description: delivDesc.trim() || undefined,
          file_url: delivUrl.trim(),
          file_name: delivName.trim(),
          version: delivVersion.trim() || '1.0'
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          alert('Deliverable uploaded!');
          setDelivTitle('');
          setDelivDesc('');
          setDelivUrl('');
          setDelivName('');
          setDelivVersion('1.0');
          handleSelectRequest(selectedRequest.request);
        }
      }
    } catch (err) {
      console.error('[Admin Upload Deliverable Error]', err);
    }
  };

  const handleSendAdminMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminMsg.trim() || !selectedRequest) return;

    try {
      const res = await fetch(`/api/project-services/requests/${selectedRequest.request.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: adminMsg })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setDataDetails(json.message);
          setAdminMsg('');
        }
      }
    } catch (err) {
      console.error('[Admin Message Send Error]', err);
    }
  };

  const setDataDetails = (messageObj: any) => {
    setSelectedRequest((prev: any) => ({
      ...prev,
      messages: [...prev.messages, messageObj]
    }));
  };

  const handleExportCSV = () => {
    if (requests.length === 0) return;
    
    // Construct CSV headers
    const headers = ['Project ID', 'Client Name', 'Email', 'Phone', 'College', 'Title', 'Domain', 'Type', 'Status', 'Budget', 'Submission Date'];
    const rows = requests.map(r => [
      r.project_id,
      `"${r.full_name.replace(/"/g, '""')}"`,
      r.email,
      r.phone,
      `"${r.college.replace(/"/g, '""')}"`,
      `"${r.project_title.replace(/"/g, '""')}"`,
      r.project_domain,
      r.project_type,
      r.status,
      r.budget_range,
      r.submission_date || 'N/A'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `project_services_requests_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
      case 'Under Review':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Under Review</Badge>;
      case 'In Progress':
        return <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">In Progress</Badge>;
      case 'Testing':
        return <Badge className="bg-cyan-50 text-cyan-700 border-cyan-200">Testing</Badge>;
      case 'Completed':
        return <Badge className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'Delivered':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Delivered</Badge>;
      case 'Cancelled':
        return <Badge className="bg-rose-50 text-rose-700 border-rose-200">Cancelled</Badge>;
      default:
        return <Badge className="bg-stone-50 text-stone-700 border-stone-200">{status}</Badge>;
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = 
      r.project_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.project_title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading && requests.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#7c3aed]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-[#171717]">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] bg-stone-150 border border-stone-250 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold text-stone-600">System Administration</span>
          <h1 className="text-3xl font-bold tracking-tight text-[#171717] mt-2">Project Services Manager</h1>
          <p className="text-stone-500 text-xs mt-1">Review student registrations, assign developers, and release deliverables.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 h-10 rounded-xl border border-stone-200 bg-white text-xs font-mono font-bold text-stone-600 hover:text-[#171717] hover:bg-stone-50 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button 
            onClick={fetchData} 
            className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 hover:text-[#171717] transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main split */}
      {!selectedRequest ? (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 bg-white border border-[#EBEBEB] p-4 rounded-xl shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <Input 
                placeholder="Search by ID, client name, college, title..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              className="h-10 border border-stone-200 bg-white px-3 rounded-xl text-xs font-semibold text-stone-600 focus:outline-none focus:ring-1 focus:ring-[#7c3aed] transition-all shrink-0"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Testing">Testing</option>
              <option value="Completed">Completed</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* List Table */}
          <div className="border border-[#EBEBEB] bg-white rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#fafaf9] border-b border-[#EBEBEB] text-[#8F8F8F] font-mono uppercase tracking-wider">
                  <th className="p-4 font-bold">Ticket ID</th>
                  <th className="p-4 font-bold">Client / College</th>
                  <th className="p-4 font-bold">Project Info</th>
                  <th className="p-4 font-bold">Domain</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Deadline</th>
                  <th className="p-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBEBEB]">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-stone-50/50 transition-all">
                    <td className="p-4 font-mono font-bold text-[#7c3aed]">{req.project_id}</td>
                    <td className="p-4 text-left">
                      <p className="font-semibold text-[#171717]">{req.full_name}</p>
                      <p className="text-[10px] text-stone-400 mt-0.5 truncate max-w-[150px]">{req.college}</p>
                    </td>
                    <td className="p-4 text-left">
                      <p className="font-semibold text-[#171717] truncate max-w-[150px]">{req.project_title}</p>
                      <p className="text-[10px] text-stone-400 mt-0.5">{req.project_type}</p>
                    </td>
                    <td className="p-4 font-medium text-stone-500">{req.project_domain}</td>
                    <td className="p-4">{getStatusBadge(req.status)}</td>
                    <td className="p-4 text-stone-500 font-mono">
                      {req.submission_date ? new Date(req.submission_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleSelectRequest(req)}
                        className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#7c3aed] hover:text-[#6d28d9]"
                      >
                        Manage Ticket <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-stone-400 font-medium">
                      No project request records match filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* DETAIL DRAWER / ACTION VIEW */
        <div className="space-y-6 animate-fade-in">
          {/* Back Action */}
          <div>
            <button 
              onClick={() => setSelectedRequest(null)}
              className="inline-flex items-center gap-2 text-xs font-mono text-stone-500 hover:text-[#171717]"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Tickets List
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
            {/* Overview Detail Columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Client Info Card */}
              <div className="bg-white border border-[#EBEBEB] p-6 rounded-xl shadow-sm">
                <h3 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider mb-4">Client Identification</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div><span className="text-stone-400 block mb-0.5">Name</span> <p className="font-semibold">{selectedRequest.request.full_name}</p></div>
                  <div><span className="text-stone-400 block mb-0.5">Email</span> <p className="font-semibold">{selectedRequest.request.email}</p></div>
                  <div><span className="text-stone-400 block mb-0.5">Phone / WhatsApp</span> <p className="font-semibold">{selectedRequest.request.phone} / {selectedRequest.request.whatsapp || 'N/A'}</p></div>
                  <div><span className="text-stone-400 block mb-0.5">Academic details</span> <p className="font-semibold">{selectedRequest.request.college} ({selectedRequest.request.university}) - {selectedRequest.request.branch} ({selectedRequest.request.year})</p></div>
                </div>
              </div>

              {/* Requirement details */}
              <div className="bg-white border border-[#EBEBEB] p-6 rounded-xl shadow-sm">
                <h3 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider mb-4">Requirement Details</h3>
                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-stone-400 block mb-1">Project Title</span>
                    <p className="font-semibold text-sm">{selectedRequest.request.project_title}</p>
                  </div>
                  <div>
                    <span className="text-stone-400 block mb-1">Project Description</span>
                    <p className="text-stone-600 leading-relaxed font-sans">{selectedRequest.request.project_description}</p>
                  </div>
                  {selectedRequest.request.existing_abstract && (
                    <div>
                      <span className="text-stone-400 block mb-1">Project Abstract</span>
                      <p className="text-stone-600 leading-relaxed font-sans bg-stone-50 p-3 rounded-lg border border-stone-100">{selectedRequest.request.existing_abstract}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-stone-400 block mb-1.5">Deliverables Checklist</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedRequest.request.requirements.map((r: string) => (
                        <Badge key={r} variant="secondary" className="bg-[#7c3aed]/10 text-[#7c3aed] border-transparent">{r}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messaging chat thread */}
              <div className="bg-white border border-[#EBEBEB] rounded-xl overflow-hidden shadow-sm flex flex-col h-[350px]">
                <div className="p-4 border-b border-[#EBEBEB] bg-[#fafaf9]">
                  <h4 className="text-xs font-semibold">Discussion History</h4>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-50/50">
                  {selectedRequest.messages.map((msg: any) => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender_role === 'admin' ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-1.5 mb-0.5 text-[9px] font-mono text-stone-400">
                        <span className="uppercase font-bold">{msg.sender_role}</span>
                        <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className={`p-2.5 rounded-xl text-xs max-w-[80%] leading-relaxed ${
                        msg.sender_role === 'admin' 
                          ? 'bg-[#171717] text-white rounded-tr-none' 
                          : 'bg-white border border-[#EBEBEB] text-[#171717] rounded-tl-none'
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendAdminMessage} className="p-3 border-t border-[#EBEBEB] bg-white flex gap-2">
                  <Input 
                    placeholder="Type message to student..." 
                    value={adminMsg} 
                    onChange={e => setAdminMsg(e.target.value)} 
                    className="flex-1 text-xs h-9 rounded-xl"
                  />
                  <Button type="submit" className="bg-[#171717] hover:bg-stone-850 h-9 w-9 p-0 flex items-center justify-center rounded-xl shrink-0">
                    <Send className="w-4 h-4 text-white" />
                  </Button>
                </form>
              </div>
            </div>

            {/* Admin Controls Column */}
            <div className="space-y-6">
              {/* Status Update Card */}
              <div className="bg-white border border-[#EBEBEB] p-6 rounded-xl shadow-sm space-y-4">
                <h3 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider">Update Ticket Status</h3>
                <div>
                  <select
                    className="w-full h-10 border border-stone-200 bg-white px-3 rounded-xl text-xs font-semibold text-stone-600 focus:outline-none focus:ring-1 focus:ring-[#7c3aed] transition-all mb-4"
                    value={statusInput}
                    onChange={e => setStatusInput(e.target.value)}
                  >
                    {['Pending', 'Under Review', 'In Progress', 'Testing', 'Completed', 'Delivered', 'Cancelled'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <div className="space-y-3">
                    <Input 
                      placeholder="Timeline Event Title (Optional)" 
                      value={timelineTitle} 
                      onChange={e => setTimelineTitle(e.target.value)}
                      className="text-xs"
                    />
                    <Textarea 
                      placeholder="Timeline Event Details (Optional)" 
                      value={timelineDesc} 
                      onChange={e => setTimelineDesc(e.target.value)}
                      rows={2}
                      className="text-xs"
                    />
                  </div>
                  <Button onClick={handleUpdateStatus} className="w-full bg-[#171717] hover:bg-stone-850 text-xs font-mono font-bold text-white rounded-xl h-9 mt-4">
                    Update Status
                  </Button>
                </div>
              </div>

              {/* Expert assignment card */}
              <div className="bg-white border border-[#EBEBEB] p-6 rounded-xl shadow-sm space-y-4">
                <h3 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider">Expert Assignments</h3>
                <div>
                  <select
                    className="w-full h-10 border border-stone-200 bg-white px-3 rounded-xl text-xs font-semibold text-stone-600 focus:outline-none focus:ring-1 focus:ring-[#7c3aed] transition-all mb-4"
                    value={assignedExpertId}
                    onChange={e => setAssignedExpertId(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {experts.map(exp => (
                      <option key={exp.id} value={exp.id}>{exp.name} ({exp.specialization || 'General'})</option>
                    ))}
                  </select>
                  <Button onClick={handleAssignExpert} className="w-full bg-[#171717] hover:bg-stone-850 text-xs font-mono font-bold text-white rounded-xl h-9">
                    Assign Developer
                  </Button>
                </div>
                
                {/* Form to add new expert developer */}
                <form onSubmit={handleAddExpert} className="pt-4 border-t border-stone-100 space-y-3">
                  <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider block">Add Expert to Roster</span>
                  <Input 
                    placeholder="Expert Name" 
                    value={newExpertName} 
                    onChange={e => setNewExpertName(e.target.value)}
                    className="text-xs"
                  />
                  <Input 
                    placeholder="Expert Email" 
                    type="email"
                    value={newExpertEmail} 
                    onChange={e => setNewExpertEmail(e.target.value)}
                    className="text-xs"
                  />
                  <Input 
                    placeholder="Specialization (e.g. AI/ML)" 
                    value={newExpertSpec} 
                    onChange={e => setNewExpertSpec(e.target.value)}
                    className="text-xs"
                  />
                  <Button type="submit" className="w-full border border-stone-200 bg-white text-[#171717] text-xs font-mono font-bold hover:bg-stone-50 rounded-xl h-9">
                    Register Expert
                  </Button>
                </form>
              </div>

              {/* Issue Invoice Card */}
              <div className="bg-white border border-[#EBEBEB] p-6 rounded-xl shadow-sm space-y-4">
                <h3 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider">Generate Invoices</h3>
                <form onSubmit={handleIssueInvoice} className="space-y-3">
                  <Input 
                    placeholder="Amount (INR) *" 
                    type="number"
                    value={invoiceAmount} 
                    onChange={e => setInvoiceAmount(e.target.value)}
                    className="text-xs font-mono font-bold"
                  />
                  <Input 
                    placeholder="Due Date" 
                    type="date"
                    value={invoiceDueDate} 
                    onChange={e => setInvoiceDueDate(e.target.value)}
                    className="text-xs"
                  />
                  <Input 
                    placeholder="Custom Razorpay Payment Link" 
                    value={invoicePayLink} 
                    onChange={e => setInvoicePayLink(e.target.value)}
                    className="text-xs"
                  />
                  <Button type="submit" className="w-full bg-[#171717] hover:bg-stone-850 text-xs font-mono font-bold text-white rounded-xl h-9">
                    Issue Invoice
                  </Button>
                </form>
              </div>

              {/* Upload deliverables card */}
              <div className="bg-white border border-[#EBEBEB] p-6 rounded-xl shadow-sm space-y-4">
                <h3 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider">Upload Project Code</h3>
                <form onSubmit={handleUploadDeliverable} className="space-y-3">
                  <Input 
                    placeholder="Deliverable Title (e.g. Final Source Code)" 
                    value={delivTitle} 
                    onChange={e => setDelivTitle(e.target.value)}
                    className="text-xs"
                  />
                  <Input 
                    placeholder="File Name (e.g. src_code.zip)" 
                    value={delivName} 
                    onChange={e => setDelivName(e.target.value)}
                    className="text-xs"
                  />
                  <Input 
                    placeholder="File Download URL (Supabase/S3 public url)" 
                    value={delivUrl} 
                    onChange={e => setDelivUrl(e.target.value)}
                    className="text-xs"
                  />
                  <Input 
                    placeholder="Release Version (e.g. 1.0, 2.0)" 
                    value={delivVersion} 
                    onChange={e => setDelivVersion(e.target.value)}
                    className="text-xs"
                  />
                  <Textarea 
                    placeholder="Deliverable Notes / Descriptions" 
                    value={delivDesc} 
                    onChange={e => setDelivDesc(e.target.value)}
                    rows={2}
                    className="text-xs"
                  />
                  <Button type="submit" className="w-full bg-[#171717] hover:bg-stone-850 text-xs font-mono font-bold text-white rounded-xl h-9">
                    Upload Deliverable
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
