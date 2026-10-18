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
} from '@/components/icons';
import { PackageReviewModal } from './PackageReviewModal';
import type { ApplicationPackage } from '@/lib/application-engine/types';

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
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [preparingJobId, setPreparingJobId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected package modal state
  const [selectedPackage, setSelectedPackage] = useState<ApplicationPackage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingPackage, setLoadingPackage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    { id: 'ready', label: 'Ready', count: counts.ready || 0, badgeClass: 'bg-emerald-100 text-emerald-800' },
    { id: 'needs_input', label: 'Needs Input', count: counts.needs_input || 0, badgeClass: 'bg-amber-100 text-amber-800' },
    { id: 'preparing', label: 'Preparing', count: counts.preparing || 0 },
    { id: 'saved', label: 'Saved', count: counts.saved || 0 },
    { id: 'applied', label: 'Applied', count: counts.applied || 0 },
    { id: 'interviewing', label: 'Interviewing', count: counts.interviewing || 0 },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-4 text-[#F5F5F5] animate-fade-in">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="flex items-end gap-4">
          <img src="/rail/rail-apps.png?v=ice" alt="" width={48} height={48} className="h-12 w-12 object-contain" />
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#8b909a]">Pipeline</p>
            <h1 className="mt-2 !text-[40px] font-normal leading-none text-[#f4f5f7]" style={{ fontFamily: 'var(--font-display)' }}>
              Applications
            </h1>
            <p className="mt-3 max-w-xl text-sm text-[#8b909a]">
              Prepare and review each application before you send it.
            </p>
          </div>
        </div>

        <button
          onClick={fetchApplications}
          disabled={loading}
          className="self-start md:self-auto px-3.5 py-2 border border-[#242424] bg-[#101010] hover:bg-[#151515] text-[#F5F5F5] rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-2xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-[#9bb4c9] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Applications</span>
        </button>
      </div>

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

      {/* Applications List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#8B5CF6]" />
          <p className="text-xs text-[#7E7E7E]">Loading prepared application packages...</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-[#242424] rounded-2xl bg-[#101010] p-8">
          <Briefcase className="w-10 h-10 mx-auto text-[#7E7E7E] mb-3 stroke-[1.5]" />
          <h3 className="text-sm font-bold text-[#F5F5F5]">No applications in this category</h3>
          <p className="text-xs text-[#7E7E7E] mt-1 max-w-sm mx-auto">
            Discover active canonical jobs and click "Prepare Application" to create a complete, truthful application package.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApplications.map((app) => {
            const isReady = app.preparationStatus === 'READY';
            const isNeedsUser = app.preparationStatus === 'NEEDS_USER';
            const isPreparing = app.preparationStatus === 'PREPARING';
            const isSavedOnly = !app.packageId;

            return (
              <div
                key={app.id}
                className="p-5 rounded-2xl border border-[#242424] bg-[#101010] flex flex-col justify-between space-y-4 hover:border-[#2D2D2D] hover:shadow-xs transition-all"
              >
                <div>
                  {/* Status header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-mono uppercase font-semibold text-[#7E7E7E] truncate">
                      {app.job?.company || 'Company'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border tracking-tight ${
                        isReady
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                          : isNeedsUser
                          ? 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                          : isPreparing
                          ? 'bg-[#8B5CF6]/15 text-[#C4B5FD] border-[#8B5CF6]/30 animate-pulse'
                          : 'bg-[#151515] text-[#BDBDBD] border-[#242424]'
                      }`}
                    >
                      {isReady
                        ? '✓ READY'
                        : isNeedsUser
                        ? `! NEEDS INPUT (${app.missingQuestionsCount})`
                        : isPreparing
                        ? 'PREPARING'
                        : app.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-[#F5F5F5] tracking-tight leading-snug">
                    {app.job?.title || 'Target Role'}
                  </h3>

                  <p className="text-xs text-[#7E7E7E] mt-1">
                    {app.job?.location || 'Location Flexible'} • {app.job?.employment_type || 'Full-time'}
                  </p>

                  {/* Badges / Metrics */}
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

                {/* Actions */}
                <div className="pt-2 flex items-center gap-2">
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
                      onClick={() => handleOpenPackage(app.packageId, app.jobId)}
                      className="flex-1 h-9 bg-[#151515] border border-[#242424] hover:bg-[#202020] text-[#F5F5F5] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <span>View Details</span>
                    </button>
                  )}

                  {app.job?.apply_url && (
                    <a
                      href={app.job.apply_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 border border-[#242424] bg-[#151515] hover:bg-[#202020] rounded-xl text-[#7E7E7E] hover:text-[#F5F5F5] transition-colors"
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

      {/* Package Review Modal */}
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
    </div>
  );
}
