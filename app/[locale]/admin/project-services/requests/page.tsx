"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Loader2, RefreshCw, Search, SlidersHorizontal, 
  Trash2, UserCheck, ShieldCheck, Download, Mail, Play, 
  Clock, CheckCircle, ChevronRight, FileSpreadsheet, Eye
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AdminRequestsPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const [requests, setRequests] = useState<any[]>([]);
  const [experts, setExperts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPerformingBulk, setIsPerformingBulk] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [domainFilter, setDomainFilter] = useState('ALL');
  const [expertFilter, setExpertFilter] = useState('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');

  // Bulk Selection States
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkExpertId, setBulkExpertId] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [reqsRes, expertsRes] = await Promise.all([
        fetch('/api/project-services/admin'),
        fetch('/api/project-services/admin?action=get_experts')
      ]);

      if (reqsRes.ok) {
        const json = await reqsRes.ok ? await reqsRes.json() : {};
        if (json.success) setRequests(json.requests || []);
      }
      if (expertsRes.ok) {
        const json = await expertsRes.ok ? await expertsRes.json() : {};
        if (json.success) setExperts(json.experts || []);
      }
    } catch (err) {
      console.error('[Admin Requests] Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredRequests.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkStatusUpdate = async () => {
    if (selectedIds.length === 0 || !bulkStatus) return;
    setIsPerformingBulk(true);

    try {
      await Promise.all(
        selectedIds.map(id => 
          fetch('/api/project-services/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'update_status',
              requestId: id,
              status: bulkStatus,
              title: `Bulk Status Update: ${bulkStatus}`,
              description: `Status updated to ${bulkStatus} in bulk admin operation.`
            })
          })
        )
      );

      alert(`Successfully updated status for ${selectedIds.length} tickets!`);
      setSelectedIds([]);
      setBulkStatus('');
      fetchData();
    } catch (err) {
      console.error('[Admin Requests] Bulk status update failed:', err);
    } finally {
      setIsPerformingBulk(false);
    }
  };

  const handleBulkAssignExpert = async () => {
    if (selectedIds.length === 0 || !bulkExpertId) return;
    setIsPerformingBulk(true);

    try {
      await Promise.all(
        selectedIds.map(id => 
          fetch('/api/project-services/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'assign_expert',
              requestId: id,
              expertId: bulkExpertId === 'unassign' ? null : bulkExpertId
            })
          })
        )
      );

      alert(`Successfully updated assignments for ${selectedIds.length} tickets!`);
      setSelectedIds([]);
      setBulkExpertId('');
      fetchData();
    } catch (err) {
      console.error('[Admin Requests] Bulk assignment update failed:', err);
    } finally {
      setIsPerformingBulk(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredRequests.length === 0) return;
    
    const headers = ['Project ID', 'Client Name', 'Email', 'Phone', 'College', 'Title', 'Domain', 'Type', 'Status', 'Urgency', 'Submission Date'];
    const rows = filteredRequests.map(r => [
      r.project_id,
      `"${r.full_name.replace(/"/g, '""')}"`,
      r.email,
      r.phone,
      `"${r.college.replace(/"/g, '""')}"`,
      `"${r.project_title.replace(/"/g, '""')}"`,
      r.project_domain,
      r.project_type,
      r.status,
      r.urgency,
      r.submission_date || 'N/A'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `admin_project_requests_${Date.now()}.csv`);
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
      r.project_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || r.project_type === typeFilter;
    const matchesDomain = domainFilter === 'ALL' || r.project_domain === domainFilter;
    const matchesUrgency = urgencyFilter === 'ALL' || r.urgency === urgencyFilter;
    const matchesExpert = expertFilter === 'ALL' || r.expert_id === expertFilter;

    return matchesSearch && matchesStatus && matchesType && matchesDomain && matchesUrgency && matchesExpert;
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
            <SlidersHorizontal className="w-3.5 h-3.5" /> Operations Registry
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#171717]">Project Requests</h1>
          <p className="text-stone-500 text-xs mt-1">Review student registrations, filter domains, perform bulk transitions, and export CSV lists.</p>
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

      {/* Filter Options */}
      <div className="bg-white border border-[#EBEBEB] p-6 rounded-xl shadow-sm space-y-4 text-left">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input 
            placeholder="Search by ID, name, email, college, title..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div>
            <label className="text-[10px] font-mono font-bold text-stone-400 uppercase block mb-1">Status</label>
            <select
              className="w-full h-9 border border-stone-200 bg-white px-2.5 rounded-lg text-xs font-semibold text-stone-600 focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
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
          <div>
            <label className="text-[10px] font-mono font-bold text-stone-400 uppercase block mb-1">Project Type</label>
            <select
              className="w-full h-9 border border-stone-200 bg-white px-2.5 rounded-lg text-xs font-semibold text-stone-600 focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="ALL">All Types</option>
              <option value="Major">Major</option>
              <option value="Minor">Minor</option>
              <option value="Mini">Mini</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-mono font-bold text-stone-400 uppercase block mb-1">Domain</label>
            <select
              className="w-full h-9 border border-stone-200 bg-white px-2.5 rounded-lg text-xs font-semibold text-stone-600 focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
              value={domainFilter}
              onChange={e => setDomainFilter(e.target.value)}
            >
              <option value="ALL">All Domains</option>
              {['AI', 'Machine Learning', 'Deep Learning', 'Data Science', 'Full Stack', 'Web Development', 'Mobile App', 'Cloud', 'Cyber Security', 'Blockchain', 'IoT'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-mono font-bold text-stone-400 uppercase block mb-1">Urgency</label>
            <select
              className="w-full h-9 border border-stone-200 bg-white px-2.5 rounded-lg text-xs font-semibold text-stone-600 focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
              value={urgencyFilter}
              onChange={e => setUrgencyFilter(e.target.value)}
            >
              <option value="ALL">All Urgency</option>
              <option value="Normal">Normal</option>
              <option value="Urgent">Urgent</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-mono font-bold text-stone-400 uppercase block mb-1">Developer</label>
            <select
              className="w-full h-9 border border-stone-200 bg-white px-2.5 rounded-lg text-xs font-semibold text-stone-600 focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
              value={expertFilter}
              onChange={e => setExpertFilter(e.target.value)}
            >
              <option value="ALL">All Devs</option>
              {experts.map(exp => (
                <option key={exp.id} value={exp.id}>{exp.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Action Controls */}
      {selectedIds.length > 0 && (
        <div className="bg-stone-50 border border-stone-200/60 p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between animate-fade-in text-left select-none">
          <div className="text-xs font-mono font-bold text-stone-500">
            <span>Staged Selection:</span> <span className="text-[#7c3aed] ml-1">{selectedIds.length} tickets</span>
          </div>
          <div className="flex gap-3 items-center">
            {/* Status */}
            <div className="flex gap-1.5 items-center">
              <select
                className="h-9 border border-stone-200 bg-white px-2 rounded-lg text-xs font-semibold text-stone-600 focus:outline-none"
                value={bulkStatus}
                onChange={e => setBulkStatus(e.target.value)}
              >
                <option value="">Status...</option>
                {['Pending', 'Under Review', 'In Progress', 'Testing', 'Completed', 'Delivered', 'Cancelled'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <Button 
                onClick={handleBulkStatusUpdate} 
                disabled={!bulkStatus || isPerformingBulk}
                className="bg-[#171717] hover:bg-stone-850 text-xs font-mono font-bold text-white rounded-lg h-9 px-3 shrink-0"
              >
                Update Status
              </Button>
            </div>

            {/* Expert */}
            <div className="flex gap-1.5 items-center">
              <select
                className="h-9 border border-stone-200 bg-white px-2 rounded-lg text-xs font-semibold text-stone-600 focus:outline-none"
                value={bulkExpertId}
                onChange={e => setBulkExpertId(e.target.value)}
              >
                <option value="">Expert...</option>
                <option value="unassign">Unassign Developer</option>
                {experts.map(exp => (
                  <option key={exp.id} value={exp.id}>{exp.name}</option>
                ))}
              </select>
              <Button 
                onClick={handleBulkAssignExpert} 
                disabled={!bulkExpertId || isPerformingBulk}
                className="bg-[#171717] hover:bg-stone-850 text-xs font-mono font-bold text-white rounded-lg h-9 px-3 shrink-0"
              >
                Assign
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main requests list table */}
      <div className="border border-[#EBEBEB] bg-white rounded-xl overflow-hidden shadow-sm text-left">
        <div className="p-4 border-b border-[#EBEBEB] bg-[#fafaf9]">
          <h3 className="text-xs font-mono font-bold text-stone-500 uppercase">Requests List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50/50 border-b border-[#EBEBEB] text-[#8F8F8F] font-mono uppercase tracking-wider select-none">
                <th className="p-4 font-bold text-center w-[50px]">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={filteredRequests.length > 0 && selectedIds.length === filteredRequests.length}
                  />
                </th>
                <th className="p-4 font-bold">Ticket ID</th>
                <th className="p-4 font-bold">Client Name / College</th>
                <th className="p-4 font-bold">Project Details</th>
                <th className="p-4 font-bold">Urgency</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Deadline</th>
                <th className="p-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBEBEB]">
              {filteredRequests.map((req) => {
                const isChecked = selectedIds.includes(req.id);
                return (
                  <tr key={req.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="p-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={() => handleToggleSelect(req.id)}
                      />
                    </td>
                    <td className="p-4 font-mono font-bold text-[#7c3aed]">{req.project_id}</td>
                    <td className="p-4">
                      <p className="font-semibold text-[#171717]">{req.full_name}</p>
                      <p className="text-[10px] text-stone-400 mt-0.5 max-w-[150px] truncate">{req.college}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-[#171717] truncate max-w-[180px]">{req.project_title}</p>
                      <p className="text-[10px] text-stone-500 mt-0.5">{req.project_type} ({req.project_domain})</p>
                    </td>
                    <td className="p-4 font-semibold text-stone-600 font-mono text-[10px]">{req.urgency}</td>
                    <td className="p-4">{getStatusBadge(req.status)}</td>
                    <td className="p-4 text-stone-500 font-mono">
                      {req.submission_date ? new Date(req.submission_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4 text-right">
                      <Link 
                        href={`/${locale}/admin/project-services/requests/${req.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#7c3aed] hover:text-[#6d28d9]"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Ticket
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-stone-400 font-medium">
                    No requests found matching criteria.
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
