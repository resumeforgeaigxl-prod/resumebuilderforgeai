'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ExternalLink,
  CheckCircle2,
  X,
  ClipboardCheck,
  Bot,
  ArrowRight
} from '@/components/icons';

interface PublicJobActionBarProps {
  job: {
    id: string;
    title: string;
    company: string;
    apply_url: string | null;
    status: string;
  };
  locale: string;
  slug: string;
  isClosed: boolean;
}

export function PublicJobActionBar({
  job,
  locale,
  slug,
  isClosed,
}: PublicJobActionBarProps) {
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [markedApplied, setMarkedApplied] = useState(false);
  const [loadingTrack, setLoadingTrack] = useState(false);

  // Return URLs preserving original job context through signup/login
  const omniRedirectUrl = encodeURIComponent(`/${locale}/jobs/${slug}?intent=APPLY_WITH_OMNI`);
  const matchRedirectUrl = encodeURIComponent(`/${locale}/jobs/${slug}?intent=CHECK_MATCH`);

  const handleManualApply = async () => {
    if (!job.apply_url) return;

    // 1. Immediately open original employer destination
    window.open(job.apply_url, '_blank', 'noopener,noreferrer');

    // 2. Fire-and-forget outbound tracking (non-blocking)
    try {
      fetch('/api/jobs/track-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: job.id,
          job_title: job.title,
          company: job.company,
          apply_url: job.apply_url,
        }),
      }).catch(() => {});
    } catch {
      // Non-blocking
    }

    // 3. Show follow-up prompt for tracking
    setShowTrackModal(true);
  };

  const confirmApplied = async (didApply: boolean) => {
    if (!didApply) {
      setShowTrackModal(false);
      return;
    }

    setLoadingTrack(true);
    try {
      await fetch('/api/jobs/track-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: job.id,
          job_title: job.title,
          company: job.company,
          apply_url: job.apply_url,
          mark_applied: true,
          status: 'applied',
        }),
      });
      setMarkedApplied(true);
    } catch (err) {
      console.warn('[TrackApply] Failed to record applied status', err);
    } finally {
      setLoadingTrack(false);
      setTimeout(() => setShowTrackModal(false), 2000);
    }
  };

  if (isClosed) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <button
          disabled
          className="px-6 py-3.5 bg-slate-100 text-slate-400 font-semibold text-xs uppercase tracking-wider rounded-xl cursor-not-allowed border border-slate-200"
        >
          Position Closed
        </button>
        <Link
          href={`/${locale}/jobs`}
          className="px-6 py-3.5 bg-white hover:bg-slate-50 text-[#171717] font-semibold text-xs uppercase tracking-wider rounded-xl border border-[#EBEBEB] transition-all"
        >
          Browse Active Roles
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3.5 pt-2">
        {/* Primary CTA: Apply with Omni */}
        <Link
          href={`/${locale}/omni?jobId=${job.id}&action=prepare`}
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#171717] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-[0.98]"
        >
          <Bot className="w-4 h-4 text-violet-400" />
          Apply with Omni
        </Link>

        {/* Free Manual Outbound Apply */}
        <button
          onClick={handleManualApply}
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-[#171717] text-xs font-semibold uppercase tracking-wider rounded-xl border border-[#EBEBEB] transition-all shadow-2xs active:scale-[0.98]"
        >
          <ExternalLink className="w-4 h-4 text-slate-500" />
          Apply Manually (Free)
        </button>

        {/* Check My Match */}
        <Link
          href={`/${locale}/resumes?matchJobId=${job.id}`}
          className="inline-flex items-center gap-2 px-5 py-3.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold uppercase tracking-wider rounded-xl border border-purple-200/60 transition-all active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          Check My Match
        </Link>
      </div>

      {/* Manual Outbound Application Tracking Prompt */}
      {showTrackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-scale-up">
            <button
              onClick={() => setShowTrackModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <ClipboardCheck className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-[#171717] mb-1.5">
              Did you submit your application?
            </h3>
            <p className="text-xs text-[#4D4D4D] leading-relaxed mb-6">
              Track your progress with {job.company}. We will save this role to your Applications dashboard.
            </p>

            {markedApplied ? (
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Application tracked! Visible in your Applications workspace.
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  disabled={loadingTrack}
                  onClick={() => confirmApplied(true)}
                  className="flex-1 py-3 bg-[#171717] hover:bg-black text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-50"
                >
                  {loadingTrack ? 'Saving...' : 'Yes, I Applied'}
                </button>
                <button
                  disabled={loadingTrack}
                  onClick={() => confirmApplied(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
                >
                  Not Yet
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
