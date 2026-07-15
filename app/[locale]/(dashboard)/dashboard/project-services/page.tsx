"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, ClipboardCheck, Clock, CheckCircle2, ChevronRight, 
  HelpCircle, Eye, ArrowLeft, Loader2, Sparkles, FolderKanban, Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function StudentProjectDashboard({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const response = await fetch('/api/project-services/requests');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setRequests(data.requests || []);
          }
        }
      } catch (err) {
        console.error('[Student Dashboard] Fetch Error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRequests();
  }, []);

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

  const getCardStats = () => {
    const stats = { total: 0, pending: 0, development: 0, completed: 0 };
    requests.forEach(r => {
      stats.total++;
      if (r.status === 'Pending' || r.status === 'Under Review') stats.pending++;
      else if (r.status === 'In Progress' || r.status === 'Testing') stats.development++;
      else if (r.status === 'Completed' || r.status === 'Delivered') stats.completed++;
    });
    return stats;
  };

  const stats = getCardStats();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#7c3aed]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-[#171717]">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[#8F8F8F] font-mono text-[11px] uppercase tracking-wider mb-2 font-medium">
            <FolderKanban className="w-3.5 h-3.5 text-[#171717]" /> Academic Guidance
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#171717]">
            Project Services
          </h1>
          <p className="text-[#4D4D4D] mt-1 text-sm">Submit and track your academic project requirements with expert mentors.</p>
        </div>
        <Link 
          href={`/${locale}/project-services/request`}
          className="inline-flex items-center justify-center gap-2 px-5 h-10 rounded-xl bg-[#7c3aed] border border-[#6d28d9] hover:bg-[#6d28d9] text-white text-sm font-medium transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" /> Request Project
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Requests', val: stats.total, color: 'text-stone-700' },
          { label: 'Pending Review', val: stats.pending, color: 'text-amber-600' },
          { label: 'In Development', val: stats.development, color: 'text-indigo-600' },
          { label: 'Completed', val: stats.completed, color: 'text-emerald-600' }
        ].map((item, idx) => (
          <Card key={idx} className="bg-white border border-[#EBEBEB] shadow-sm select-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider">{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold tracking-tight ${item.color}`}>{item.val}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Requests Table */}
      <div className="border border-[#EBEBEB] bg-white rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[#EBEBEB]">
          <h3 className="font-semibold text-sm text-[#171717]">My Project Submissions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#fafaf9] border-b border-[#EBEBEB] text-[#8F8F8F] font-mono uppercase tracking-wider">
                <th className="p-4 font-bold">Project ID</th>
                <th className="p-4 font-bold">Project Name</th>
                <th className="p-4 font-bold">Project Type</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Deadline</th>
                <th className="p-4 font-bold">Last Updated</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBEBEB]">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="p-4 font-mono font-bold text-[#7c3aed]">{req.project_id}</td>
                  <td className="p-4 font-semibold text-[#171717] max-w-[200px] truncate">{req.project_title}</td>
                  <td className="p-4 text-stone-500 font-medium">{req.project_type} ({req.project_domain})</td>
                  <td className="p-4">{getStatusBadge(req.status)}</td>
                  <td className="p-4 text-stone-500 font-mono">
                    {req.submission_date ? new Date(req.submission_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-4 text-stone-500 font-mono">
                    {new Date(req.updated_at || req.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <Link 
                      href={`/${locale}/dashboard/project-services/${req.id}`}
                      className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#7c3aed] hover:text-[#6d28d9]"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Ticket
                    </Link>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-400">
                    <FolderKanban className="w-8 h-8 mx-auto text-stone-300 mb-3" />
                    <p className="text-sm font-semibold">No project requests found</p>
                    <p className="text-xs text-stone-400 mt-1">Submit a requirement wizard to get guided by industry experts.</p>
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
