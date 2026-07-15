"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, ClipboardCheck, Clock, CheckCircle2, ChevronRight, 
  Search, SlidersHorizontal, Loader2, ArrowLeft, RefreshCw, 
  UserPlus, DollarSign, FileUp, Send, ShieldAlert, Award, 
  Layers, Download, Plus, Settings, Users, CreditCard, Landmark, BookOpen
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

export default function AdminProjectDashboard({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, reqsRes] = await Promise.all([
        fetch('/api/project-services/admin/stats'),
        fetch('/api/project-services/admin')
      ]);

      if (statsRes.ok) {
        const json = await statsRes.json();
        if (json.success) {
          setStats(json.stats);
          setCharts(json.charts);
        }
      }

      if (reqsRes.ok) {
        const json = await reqsRes.json();
        if (json.success) {
          setRequests(json.requests || []);
        }
      }
    } catch (err) {
      console.error('[Admin Dashboard] Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  if (isLoading && !stats) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#7c3aed]" />
      </div>
    );
  }

  const metricList = [
    { label: 'Total Requests', val: stats?.total || 0, color: 'text-stone-700' },
    { label: 'New Requests', val: stats?.new || 0, color: 'text-amber-600' },
    { label: 'Pending Review', val: stats?.pendingReview || 0, color: 'text-blue-600' },
    { label: 'Quotation Sent', val: stats?.quotationSent || 0, color: 'text-indigo-600' },
    { label: 'Awaiting Payment', val: stats?.awaitingPayment || 0, color: 'text-purple-600' },
    { label: 'In Development', val: stats?.inDevelopment || 0, color: 'text-cyan-600' },
    { label: 'Testing', val: stats?.testing || 0, color: 'text-sky-600' },
    { label: 'Delivered', val: stats?.delivered || 0, color: 'text-emerald-600' },
    { label: 'Completed', val: stats?.completed || 0, color: 'text-green-600' },
    { label: 'Cancelled', val: stats?.cancelled || 0, color: 'text-rose-600' },
    { label: 'Total Revenue', val: `₹${stats?.revenue || 0}`, color: 'text-emerald-600' },
    { label: 'Pending Revenue', val: `₹${stats?.pendingRevenue || 0}`, color: 'text-amber-600 font-mono' }
  ];

  const subNavigationList = [
    { name: 'Request Tickets', href: `/${locale}/admin/project-services/requests`, icon: <FileText className="w-4 h-4 text-[#7c3aed]" /> },
    { name: 'Expert roster', href: `/${locale}/admin/project-services/experts`, icon: <Users className="w-4 h-4 text-[#7c3aed]" /> },
    { name: 'Quotations', href: `/${locale}/admin/project-services/quotations`, icon: <BookOpen className="w-4 h-4 text-[#7c3aed]" /> },
    { name: 'Invoices', href: `/${locale}/admin/project-services/invoices`, icon: <Landmark className="w-4 h-4 text-[#7c3aed]" /> },
    { name: 'Payments Ledger', href: `/${locale}/admin/project-services/payments`, icon: <CreditCard className="w-4 h-4 text-[#7c3aed]" /> },
    { name: 'Platform Settings', href: `/${locale}/admin/project-services/settings`, icon: <Settings className="w-4 h-4 text-[#7c3aed]" /> }
  ];

  return (
    <div className="space-y-8 animate-fade-in text-[#171717]">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] bg-stone-150 border border-stone-250 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold text-stone-600">Operations Console</span>
          <h1 className="text-3xl font-bold tracking-tight text-[#171717] mt-2 font-sans">Project Services Admin</h1>
          <p className="text-stone-500 text-xs mt-1">Real-time statistics dashboard, workload analytics, and sub-nav controllers.</p>
        </div>
        <button 
          onClick={fetchData} 
          className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 hover:text-[#171717] transition-all shadow-sm shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Sub Navigation grid link cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {subNavigationList.map((item, idx) => (
          <Link 
            key={idx} 
            href={item.href}
            className="flex flex-col items-center justify-center p-4 border border-stone-200 bg-white rounded-xl hover:border-stone-300 shadow-[0_1px_2px_rgba(0,0,0,0.02)] text-center transition-all select-none"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-50 border border-stone-150 mb-2">
              {item.icon}
            </div>
            <span className="text-[11px] font-semibold text-stone-700 tracking-tight">{item.name}</span>
          </Link>
        ))}
      </div>

      {/* Metric list cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {metricList.map((item, idx) => (
          <Card key={idx} className="bg-white border border-[#EBEBEB] shadow-sm select-none">
            <CardHeader className="pb-1.5 p-4">
              <CardTitle className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-widest leading-none">{item.label}</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className={`text-xl font-bold tracking-tight ${item.color} leading-none`}>{item.val}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Visualization charts row */}
      {charts && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {/* Domain Distribution */}
          <Card className="bg-white border border-[#EBEBEB] shadow-sm">
            <CardHeader className="pb-3 border-b border-[#EBEBEB]">
              <CardTitle className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider">Top Project Domains</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3.5">
              {Object.entries(charts.domainCounts).slice(0, 5).map(([dom, val]: any) => {
                const total = stats.total || 1;
                const pct = Math.round((val / total) * 100);
                return (
                  <div key={dom} className="text-xs space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-stone-600">{dom}</span>
                      <span className="font-mono text-stone-400">{val} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#7c3aed] h-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card className="bg-white border border-[#EBEBEB] shadow-sm">
            <CardHeader className="pb-3 border-b border-[#EBEBEB]">
              <CardTitle className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider">Ticket Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3.5">
              {Object.entries(charts.statusDistribution).map(([status, val]: any) => {
                const total = stats.total || 1;
                const pct = Math.round((val / total) * 100);
                return (
                  <div key={status} className="text-xs space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-stone-600">{status}</span>
                      <span className="font-mono text-stone-400">{val} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#7c3aed] h-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent requests table */}
      <div className="border border-[#EBEBEB] bg-white rounded-xl overflow-hidden shadow-sm text-left">
        <div className="p-4 border-b border-[#EBEBEB] bg-[#fafaf9] flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold text-stone-500 uppercase">Recent Submissions</h3>
          <Link 
            href={`/${locale}/admin/project-services/requests`} 
            className="text-[10px] font-mono font-bold text-[#7c3aed] hover:text-[#6d28d9] flex items-center gap-1"
          >
            All Requests <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50/50 border-b border-[#EBEBEB] text-[#8F8F8F] font-mono uppercase tracking-wider">
                <th className="p-4 font-bold">Project ID</th>
                <th className="p-4 font-bold">Student Name</th>
                <th className="p-4 font-bold">College</th>
                <th className="p-4 font-bold">Project Type</th>
                <th className="p-4 font-bold">Domain</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBEBEB]">
              {requests.slice(0, 5).map((req) => (
                <tr key={req.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="p-4 font-mono font-bold text-[#7c3aed]">{req.project_id}</td>
                  <td className="p-4 font-semibold text-[#171717]">{req.full_name}</td>
                  <td className="p-4 text-stone-500 font-medium truncate max-w-[150px]">{req.college}</td>
                  <td className="p-4 text-stone-500 font-medium">{req.project_type}</td>
                  <td className="p-4 font-medium text-stone-500">{req.project_domain}</td>
                  <td className="p-4">{getStatusBadge(req.status)}</td>
                  <td className="p-4 text-right">
                    <Link 
                      href={`/${locale}/admin/project-services/requests/${req.id}`}
                      className="text-xs font-mono font-bold text-[#7c3aed] hover:text-[#6d28d9]"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-400 font-medium">
                    No submitted requests recorded.
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
