'use client';

import React, { useState } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import {
  Target,
  FileText,
  ArrowRight,
  ExternalLink,
} from '@/components/icons';
import { cn } from '@/lib/utils';
import type { JobMatchArtifact } from './types';

interface JobMatchArtifactCardProps {
  artifact: JobMatchArtifact;
  locale: string;
  onTailorResume?: (jobTitle: string, jobId?: string) => void;
  onPrepareApplication?: (jobId: string) => void;
}

export function JobMatchArtifactCard({
  artifact,
  locale,
  onTailorResume,
  onPrepareApplication,
}: JobMatchArtifactCardProps) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  const activeLocale =
    (params?.locale as string | undefined) ||
    locale ||
    pathname?.split('/').filter(Boolean)[0] ||
    'en-in';

  // If this is a ranked job list from rank_candidate_jobs
  if (artifact.matches && artifact.matches.length > 0) {
    const matches = artifact.matches;
    const visibleMatches = expanded ? matches : matches.slice(0, 3);

    return (
      <section
        className="my-3 w-full min-w-0 rounded-xl border border-[#242424] bg-[#0A0A0A] text-[#F5F5F5] overflow-hidden shadow-xs"
        aria-label="Ranked job matches"
      >
        {/* Header Count Bar */}
        <div className="px-4 py-3 text-[13px] text-[#BDBDBD] border-b border-[#242424] flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#8B5CF6] shrink-0" />
            <span className="font-semibold text-[#F5F5F5]">Top Job Matches</span>
            <span className="text-xs text-[#7E7E7E]">({matches.length})</span>
          </div>
          {matches.length > 3 && (
            <span className="text-xs text-[#7E7E7E]">
              {expanded ? `Showing ${matches.length} of ${matches.length}` : `Showing 3 of ${matches.length}`}
            </span>
          )}
        </div>

        {/* Compact Job Rows with Thin Dividers */}
        <ol className="divide-y divide-[#242424]">
          {visibleMatches.map((match, idx) => {
            const isBlocked = match.isBlocked;
            const score = match.score;

            return (
              <li key={idx} className="min-w-0 p-3.5 sm:p-4 space-y-2">
                {/* 1. Job title */}
                <h5 className="!font-sans text-[15px] sm:text-[16px] font-semibold leading-snug text-[#F5F5F5] [overflow-wrap:anywhere] break-words">
                  {match.jobTitle || `Job #${match.jobId.slice(0, 8)}`}
                </h5>

                {/* 2. Employer & location */}
                <p className="text-[12px] sm:text-[13px] leading-relaxed text-[#BDBDBD] [overflow-wrap:anywhere]">
                  {[match.company, match.location].filter(Boolean).join(' · ') || 'Company details in listing'}
                </p>

                {/* 3. Match / Freshness info */}
                <div className="flex items-center gap-2 text-[12px] sm:text-[13px] font-mono">
                  {isBlocked ? (
                    <span className="text-rose-400 font-semibold">Blocked by policy</span>
                  ) : score != null ? (
                    <span
                      className={cn(
                        'font-semibold',
                        score >= 80
                          ? 'text-emerald-400'
                          : score >= 65
                          ? 'text-[#C4B5FD]'
                          : 'text-amber-400'
                      )}
                    >
                      Match: {score}%
                    </span>
                  ) : null}
                  <span className="text-[#565656]">·</span>
                  <span className="text-emerald-400/90 text-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 inline-block" />
                    Verified active
                  </span>
                </div>

                {/* Summary / Skills */}
                {match.summary && (
                  <p className="text-[12px] text-[#BDBDBD] leading-relaxed line-clamp-2 [overflow-wrap:anywhere]">
                    {match.summary}
                  </p>
                )}

                {/* 4. Actions beneath the information */}
                <div className="flex flex-wrap items-center gap-2 pt-1.5">
                  <button
                    type="button"
                    onClick={() => router.push(`/${activeLocale}/jobs/${match.jobId}`)}
                    className="min-h-[44px] inline-flex items-center justify-center rounded-lg border border-[#242424] bg-[#101010] hover:bg-[#151515] px-3.5 text-[13px] font-medium text-[#F5F5F5] transition-colors cursor-pointer"
                  >
                    View Job
                  </button>

                  {onPrepareApplication ? (
                    <button
                      type="button"
                      onClick={() => onPrepareApplication(match.jobId)}
                      className="min-h-[44px] inline-flex items-center justify-center rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] px-4 text-[13px] font-medium text-white transition-colors cursor-pointer gap-1.5"
                    >
                      <span>Prepare</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : onTailorResume && match.jobTitle ? (
                    <button
                      type="button"
                      onClick={() => onTailorResume(match.jobTitle!, match.jobId)}
                      className="min-h-[44px] inline-flex items-center justify-center rounded-lg bg-[#151515] border border-[#242424] hover:bg-[#1E1E1E] px-3.5 text-[13px] font-medium text-[#F5F5F5] transition-colors cursor-pointer gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#7E7E7E]" />
                      <span>Tailor Resume</span>
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>

        {matches.length > 3 && (
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded(v => !v)}
            className="min-h-[44px] w-full border-t border-[#242424] px-4 py-2.5 text-left text-[13px] font-medium text-[#C4B5FD] hover:text-white hover:bg-[#101010] transition-colors cursor-pointer flex items-center justify-between"
          >
            <span>{expanded ? 'Show fewer' : `Show all ${matches.length}`}</span>
            <span className="text-xs text-[#7E7E7E] font-mono">{expanded ? '↑' : '↓'}</span>
          </button>
        )}
      </section>
    );
  }

  // Single job match card
  const score = artifact.score ?? 78;
  const isBlocked = Boolean(artifact.isBlocked);
  const title = artifact.jobTitle || 'Role Match Analysis';
  const company = artifact.company || 'Canonical Job';

  return (
    <div className="my-3 w-full rounded-xl border border-[#242424] bg-[#0A0A0A] p-3.5 sm:p-4 space-y-3 text-[#F5F5F5] shadow-xs">
      <div>
        <h4 className="text-[15px] sm:text-[16px] font-semibold text-[#F5F5F5] tracking-tight leading-snug [overflow-wrap:anywhere] break-words">
          {title}
        </h4>
        <p className="text-[12px] sm:text-[13px] text-[#BDBDBD] mt-0.5 [overflow-wrap:anywhere]">
          {[company, artifact.location].filter(Boolean).join(' · ')}
        </p>
        <div className="flex items-center gap-2 text-[12px] sm:text-[13px] font-mono mt-1.5">
          {isBlocked ? (
            <span className="text-rose-400 font-semibold">Blocked by policy</span>
          ) : (
            <span
              className={cn(
                'font-semibold',
                score >= 80
                  ? 'text-emerald-400'
                  : score >= 65
                  ? 'text-[#C4B5FD]'
                  : 'text-amber-400'
              )}
            >
              Match: {score}%
            </span>
          )}
          <span className="text-[#565656]">·</span>
          <span className="text-emerald-400/90 text-xs flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 inline-block" />
            Verified active
          </span>
        </div>
      </div>

      {artifact.summary && (
        <p className="text-[12px] sm:text-[13px] text-[#BDBDBD] leading-relaxed [overflow-wrap:anywhere]">
          {artifact.summary}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#242424]">
        {artifact.jobId && (
          <button
            type="button"
            className="min-h-[44px] text-[13px] font-medium text-[#BDBDBD] hover:text-[#F5F5F5] bg-[#101010] hover:bg-[#151515] border border-[#242424] px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
            onClick={() => router.push(`/${activeLocale}/jobs/${artifact.jobId}`)}
          >
            View Job
          </button>
        )}

        {artifact.jobId && onPrepareApplication ? (
          <button
            type="button"
            className="min-h-[44px] text-[13px] font-medium bg-[#8B5CF6] text-white hover:bg-[#7C3AED] px-4 py-2 rounded-lg transition-colors cursor-pointer"
            onClick={() => onPrepareApplication(artifact.jobId!)}
          >
            Prepare Application →
          </button>
        ) : onTailorResume && artifact.jobTitle ? (
          <button
            type="button"
            className="min-h-[44px] text-[13px] font-medium text-[#F5F5F5] bg-[#151515] hover:bg-[#1E1E1E] border border-[#242424] px-4 py-2 rounded-lg transition-colors cursor-pointer"
            onClick={() => onTailorResume(artifact.jobTitle!, artifact.jobId)}
          >
            Tailor Resume
          </button>
        ) : null}
      </div>
    </div>
  );
}
