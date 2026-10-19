'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Loader2,
  FileText,
  Search,
  Filter,
  RefreshCw,
  Zap,
  Bot,
  ShieldAlert,
  ArrowRight,
} from '@/components/icons';
import { PackageReviewModal } from './PackageReviewModal';
import { ApplicationDetailDrawer } from './ApplicationDetailDrawer';
import type { ApplicationPackage } from '@/lib/application-engine/types';
import { APPLICATION_STATUS_CONFIG, ApplicationStatus } from '@/lib/application-tracker/types';

interface ApplicationItem {
  id: string;
  jobId: string;
  job?: {
    id: string;
    title: string;
    company: string;
    location?: string;
    employment_type?: string;
    apply_url?: string;
    status?: string;
  };
  status: string;
  preparationStatus: string;
  packageId?: string;
  readinessScore: number;
  missingQuestionsCount: number;
  matchScore?: number | null;
  applicationMethod?: string;
  appliedAt?: string;
}

export function ApplicationsHub({ locale = 'en-in' }: { locale?: string }) {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [preparingJobId, setPreparingJobId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected package modal state (Level 12-14)
  const [selectedPackage, setSelectedPackage] = useState<ApplicationPackage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingPackage, setLoadingPackage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Selected detail drawer state (Level 15)
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch('/api/applications/list');
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications || []);
        setCounts(data.counts || {});
      }
    } catch (err: any) {
      console.error('Error fetching applications list:', err);
      setErrorMessage('Could not load applications. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleOpenPackage = async (packageId?: string, jobId?: string) => {
    if (!packageId && !jobId) return;
    try {
      setLoadingPackage(true);
      const url = packageId
        ? `/api/applications/package?id=${packageId}`
        : `/api/applications/package?jobId=${jobId}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.package) {
        setSelectedPackage(data.package);
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error('Error fetching package details:', err);
    } finally {
      setLoadingPackage(false);
    }
  };

  const handleOpenDetail = (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    setIsDrawerOpen(true);
  };

  const handlePrepare = async (jobId: string) => {
    try {
      setPreparingJobId(jobId);
      setErrorMessage(null);
      const res = await fetch('/api/applications/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, userOverride: true }),
      });

      const data = await res.json();
      if (!data.success) {
        if (data.error === 'INSUFFICIENT_CREDITS') {
          setErrorMessage('Insufficient credits to prepare application. Please top up your wallet.');
        } else {
          setErrorMessage(data.message || data.error || 'Failed to prepare application.');
        }
        return;
      }

      await fetchApplications();
      if (data.package) {
        setSelectedPackage(data.package);
        setIsModalOpen(true);
      }
    } catch (err: any) {
      console.error('Error initiating preparation:', err);
      setErrorMessage(err.message || 'Preparation request failed');
    } finally {
      setPreparingJobId(null);
    }
  };

  // Detect unconfirmed submissions (Level 15 Guard)
  const unconfirmedSubmissions = applications.filter(
    (app) =>
      app.status?.toUpperCase() === 'SUBMISSION_PENDING' ||
      app.preparationStatus?.toUpperCase() === 'SUBMISSION_UNKNOWN'
  );

  // Filter list by active tab and search query
  const filteredApplications = applications.filter((app) => {
    const jobTitle = app.job?.title?.toLowerCase() || '';
    const company = app.job?.company?.toLowerCase() || '';
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || jobTitle.includes(q) || company.includes(q);

    if (!matchesSearch) return false;

    if (activeTab === 'all') return true;
    if (activeTab === 'ready') return app.preparationStatus === 'READY';
    if (activeTab === 'needs_input') return app.preparationStatus === 'NEEDS_USER';
    if (activeTab === 'preparing') return app.preparationStatus === 'PREPARING';
    if (activeTab === 'saved') return app.status.toLowerCase() === 'saved';
    if (activeTab === 'applied') return app.status.toLowerCase() === 'applied';
    if (activeTab === 'interviewing') return ['interview', 'interviewing'].includes(app.status.toLowerCase());
    if (activeTab === 'offered') return ['offer', 'offered'].includes(app.status.toLowerCase());
    if (activeTab === 'rejected') return app.status.toLowerCase() === 'rejected';

    return true;
  });

  const TABS = [
    { id: 'all', label: 'All', count: counts.all || 0 },
    { id: 'ready', label: 'Ready', count: counts.ready || 0, badgeClass: 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40' },
    { id: 'needs_input', label: 'Needs Input', count: counts.needs_input || 0, badgeClass: 'bg-amber-950/40 text-amber-400 border border-amber-800/40' },
    { id: 'preparing', label: 'Preparing', count: counts.preparing || 0 },
    { id: 'saved', label: 'Saved', count: counts.saved || 0 },
    { id: 'applied', label: 'Applied', count: counts.applied || 0, badgeClass: 'bg-[#8B5CF6]/15 text-[#C4B5FD] border border-[#8B5CF6]/30' },
    { id: 'interviewing', label: 'Interview', count: counts.interviewing || 0, badgeClass: 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40' },
    { id: 'offered', label: 'Offer', count: counts.offered || 0, badgeClass: 'bg-amber-950/40 text-amber-300 border border-amber-800/40' },
    { id: 'rejected', label: 'Not Selected', count: counts.rejected || 0 },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-4 text-[#F5F5F5] animate-fade-in">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="flex items-end gap-4">
          <img src="/rail/rail-apps.png?v=ice" alt="" width={48} height={48} className="h-12 w-12 object-contain" />
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#7E7E7E] font-mono">Canonical Tracking & Evidence</p>
            <h1 className="mt-1 text-3xl md:text-4xl font-bold tracking-tight text-[#F5F5F5]">
              Applications Pipeline
            </h1>
            <p className="mt-2 max-w-xl text-xs md:text-sm text-[#7E7E7E]">
              Track every employer submission with verifiable receipts, immutable timelines, and candidate attestations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center p-1 rounded-xl bg-[#101010] border border-[#242424]">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#1E1E1E] text-[#F5F5F5]'
                  : 'text-[#7E7E7E] hover:text-[#F5F5F5]'
              }`}
              title="Compact List View"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[#1E1E1E] text-[#F5F5F5]'
                  : 'text-[#7E7E7E] hover:text-[#F5F5F5]'
              }`}
              title="Grid Card View"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
            </button>
          </div>

          <button
            onClick={fetchApplications}
            disabled={loading}
            className="px-3.5 py-2 border border-[#242424] bg-[#101010] hover:bg-[#151515] text-[#F5F5F5] rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-2xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#8B5CF6] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* UNCONFIRMED SUBMISSION ALERT BANNER (Level 15 Guard) */}
      {unconfirmedSubmissions.length > 0 && (
        <div className="p-4 rounded-2xl border border-amber-800/60 bg-amber-950/40 text-amber-200 flex items-start gap-3 shadow-sm">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-amber-300">
              Unconfirmed Submission Warning ({unconfirmedSubmissions.length})
            </h4>
            <p className="text-xs text-amber-200/90 leading-relaxed">
              ResumeForge detected an application submission attempt whose employer confirmation receipt is still pending or uncertain. Under the Level 15 integrity guarantee, these applications are kept in verification mode and will not be reported as Applied until confirmed.
            </p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/40 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Search & Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex overflow-x-auto scrollbar-none gap-2 border-b lg:border-b-0 border-[#242424] pb-2 lg:pb-0">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#151515] text-[#F5F5F5] border border-[#242424] shadow-xs'
                    : 'bg-[#101010] border border-[#242424] text-[#7E7E7E] hover:text-[#F5F5F5] hover:bg-[#151515]'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : tab.badgeClass || 'bg-[#151515] text-[#BDBDBD]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7E7E7E]" />
          <input
            type="text"
            placeholder="Search role or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-xl border border-[#242424] bg-[#101010] text-xs text-[#F5F5F5] placeholder:text-[#7E7E7E] focus:outline-none focus:border-[#8B5CF6]/50"
          />
        </div>
      </div>

      {/* Applications View */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#8B5CF6]" />
          <p className="text-xs text-[#7E7E7E]">Loading tracked applications and evidence records...</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-[#242424] rounded-2xl bg-[#0A0A0A] p-8">
          <Briefcase className="w-10 h-10 mx-auto text-[#7E7E7E] mb-3 stroke-[1.5]" />
          <h3 className="text-sm font-bold text-[#F5F5F5]">No applications found</h3>
          <p className="text-xs text-[#7E7E7E] mt-1 max-w-sm mx-auto">
            Discover active canonical jobs and click "Prepare Application" to begin structured tailoring.
          </p>
        </div>
      ) : viewMode === 'list' ? (
        /* COMPACT LIST VIEW (Min 72px Row) */
        <div className="space-y-2">
          {filteredApplications.map((app) => {
            const isReady = app.preparationStatus === 'READY';
            const isNeedsUser = app.preparationStatus === 'NEEDS_USER';
            const isPreparing = app.preparationStatus === 'PREPARING';
            const isApplied = app.status.toLowerCase() === 'applied';
            const isInterview = ['interview', 'interviewing'].includes(app.status.toLowerCase());
            const isOffer = ['offer', 'offered'].includes(app.status.toLowerCase());
            const isRejected = app.status.toLowerCase() === 'rejected';

            const rawStatus = (app.status || 'SAVED').toUpperCase() as ApplicationStatus;
            const config = APPLICATION_STATUS_CONFIG[rawStatus] || APPLICATION_STATUS_CONFIG.SAVED;

            return (
              <div
                key={app.id}
                onClick={() => handleOpenDetail(app.id)}
                className="min-h-[72px] px-5 py-3.5 rounded-2xl border border-[#242424] bg-[#0A0A0A] hover:bg-[#101010] hover:border-[#2D2D2D] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group shadow-2xs"
              >
                {/* Role & Company */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-[#151515] border border-[#242424] flex items-center justify-center shrink-0 text-[#8B5CF6]">
                    <Briefcase className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#7E7E7E] font-semibold truncate">
                        {app.job?.company || 'Company'}
                      </span>
                      {app.applicationMethod === 'OMNI_BROWSER' && (
                        <span className="p-0.5 rounded bg-[#151515] text-[#8B5CF6]" title="Omni Browser Agent">
                          <Bot className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-[#F5F5F5] tracking-tight group-hover:text-[#C4B5FD] transition-colors truncate">
                      {app.job?.title || 'Target Role'}
                    </h3>
                  </div>
                </div>

                {/* Metrics / Match */}
                <div className="flex items-center gap-4 shrink-0 text-xs text-[#7E7E7E]">
                  {app.matchScore && (
                    <span className="font-semibold text-[#F5F5F5]">
                      {app.matchScore}% Match
                    </span>
                  )}
                  {app.appliedAt && (
                    <span className="font-mono text-[11px]">
                      Applied {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Status Badge */}
                <div className="shrink-0 flex items-center gap-2">
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-tight border uppercase"
                    style={{
                      backgroundColor: isReady
                        ? 'rgba(16, 185, 129, 0.1)'
                        : isNeedsUser
                        ? 'rgba(245, 158, 11, 0.1)'
                        : config.badgeBg,
                      color: isReady
                        ? '#34D399'
                        : isNeedsUser
                        ? '#FBBF24'
                        : config.badgeText,
                      borderColor: isReady
                        ? 'rgba(16, 185, 129, 0.25)'
                        : isNeedsUser
                        ? 'rgba(245, 158, 11, 0.25)'
                        : config.borderColor,
                    }}
                  >
                    {isReady ? 'READY' : isNeedsUser ? `NEEDS INPUT (${app.missingQuestionsCount})` : config.label}
                  </span>
                </div>

                {/* Actions */}
                <div
                  className="flex items-center gap-2 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isNeedsUser ? (
                    <button
                      onClick={() => handleOpenPackage(app.packageId, app.jobId)}
                      className="h-8 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Answer Questions</span>
                    </button>
                  ) : isReady ? (
                    <button
                      onClick={() => handleOpenPackage(app.packageId, app.jobId)}
                      className="h-8 px-3 rounded-xl bg-[#F5F5F5] hover:bg-white text-black font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Review Package</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenDetail(app.id)}
                      className="h-8 px-3 rounded-xl border border-[#242424] bg-[#101010] hover:bg-[#1E1E1E] text-xs font-semibold text-[#BDBDBD] hover:text-[#F5F5F5] flex items-center gap-1.5 transition-colors"
                    >
                      <span>Timeline & Receipt</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#7E7E7E]" />
                    </button>
                  )}

                  {app.job?.apply_url && (
                    <a
                      href={app.job.apply_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 border border-[#242424] bg-[#101010] hover:bg-[#1E1E1E] rounded-xl text-[#7E7E7E] hover:text-[#F5F5F5] transition-colors"
                      title="Open Job Link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* GRID CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApplications.map((app) => {
            const isReady = app.preparationStatus === 'READY';
            const isNeedsUser = app.preparationStatus === 'NEEDS_USER';
            const isPreparing = app.preparationStatus === 'PREPARING';
            const isSavedOnly = !app.packageId;

            const rawStatus = (app.status || 'SAVED').toUpperCase() as ApplicationStatus;
            const config = APPLICATION_STATUS_CONFIG[rawStatus] || APPLICATION_STATUS_CONFIG.SAVED;

            return (
              <div
                key={app.id}
                onClick={() => handleOpenDetail(app.id)}
                className="p-5 rounded-2xl border border-[#242424] bg-[#0A0A0A] hover:bg-[#101010] flex flex-col justify-between space-y-4 hover:border-[#2D2D2D] hover:shadow-xs transition-all cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-mono uppercase font-semibold text-[#7E7E7E] truncate">
                      {app.job?.company || 'Company'}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold border tracking-tight"
                      style={{
                        backgroundColor: isReady
                          ? 'rgba(16, 185, 129, 0.1)'
                          : isNeedsUser
                          ? 'rgba(245, 158, 11, 0.1)'
                          : config.badgeBg,
                        color: isReady
                          ? '#34D399'
                          : isNeedsUser
                          ? '#FBBF24'
                          : config.badgeText,
                        borderColor: isReady
                          ? 'rgba(16, 185, 129, 0.25)'
                          : isNeedsUser
                          ? 'rgba(245, 158, 11, 0.25)'
                          : config.borderColor,
                      }}
                    >
                      {isReady
                        ? '✓ READY'
                        : isNeedsUser
                        ? `! NEEDS INPUT (${app.missingQuestionsCount})`
                        : isPreparing
                        ? 'PREPARING'
                        : config.label.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#F5F5F5] tracking-tight leading-snug group-hover:text-[#C4B5FD] transition-colors">
                    {app.job?.title || 'Target Role'}
                  </h3>

                  <p className="text-xs text-[#7E7E7E] mt-1">
                    {app.job?.location || 'Location Flexible'} • {app.job?.employment_type || 'Full-time'}
                  </p>

                  <div className="flex items-center gap-3 mt-3.5 pt-3 border-t border-[#242424] text-xs">
                    {app.matchScore && (
                      <span className="text-[#F5F5F5] font-semibold">
                        {app.matchScore}% Match
                      </span>
                    )}
                    {app.packageId && (
                      <span className="text-[#7E7E7E]">
                        Readiness: <strong className="text-[#F5F5F5]">{app.readinessScore}%</strong>
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className="pt-2 flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isNeedsUser ? (
                    <button
                      onClick={() => handleOpenPackage(app.packageId, app.jobId)}
                      className="flex-1 h-9 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Answer {app.missingQuestionsCount} Questions</span>
                    </button>
                  ) : isReady ? (
                    <button
                      onClick={() => handleOpenPackage(app.packageId, app.jobId)}
                      className="flex-1 h-9 bg-[#F5F5F5] hover:bg-white text-black font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Review Package</span>
                    </button>
                  ) : isSavedOnly ? (
                    <button
                      onClick={() => handlePrepare(app.jobId)}
                      disabled={preparingJobId === app.jobId}
                      className="flex-1 h-9 bg-[#151515] hover:bg-[#202020] border border-[#242424] disabled:opacity-50 text-[#F5F5F5] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    >
                      {preparingJobId === app.jobId ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8B5CF6]" />
                      ) : (
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>Prepare Package (4 cr)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenDetail(app.id)}
                      className="flex-1 h-9 bg-[#101010] border border-[#242424] hover:bg-[#1E1E1E] text-[#F5F5F5] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <span>Timeline & Receipt</span>
                    </button>
                  )}

                  {app.job?.apply_url && (
                    <a
                      href={app.job.apply_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 border border-[#242424] bg-[#101010] hover:bg-[#1E1E1E] rounded-xl text-[#7E7E7E] hover:text-[#F5F5F5] transition-colors"
                      title="Open Employer Job Link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Package Review Modal (Level 12-14) */}
      <PackageReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        packageData={selectedPackage}
        onAnswersUpdated={() => {
          fetchApplications();
          if (selectedPackage) {
            handleOpenPackage(selectedPackage.id);
          }
        }}
      />

      {/* Application Detail Drawer (Level 15) */}
      <ApplicationDetailDrawer
        applicationId={selectedApplicationId}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onStatusUpdated={fetchApplications}
      />
    </div>
  );
}
