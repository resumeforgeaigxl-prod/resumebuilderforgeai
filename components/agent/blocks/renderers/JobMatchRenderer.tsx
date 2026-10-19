'use client';

import React from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import type { JobMatchBlock } from '../types';
import { cn } from '@/lib/utils';

interface JobMatchRendererProps {
  block: JobMatchBlock;
  locale: string;
  onTailorResume?: (jobTitle: string, jobId?: string) => void;
  onPrepareApplication?: (jobId: string) => void;
  onViewJob?: (jobId: string) => void;
}

export function JobMatchRenderer({
  block,
  locale,
  onTailorResume,
  onPrepareApplication,
  onViewJob,
}: JobMatchRendererProps) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  const activeLocale =
    (params?.locale as string | undefined) ||
    locale ||
    pathname?.split('/').filter(Boolean)[0] ||
    'en-in';

  const score = block.score;
  const isBlocked = Boolean(block.isBlocked);

  const strongMatches = block.strongMatches || [];
  const partialMatches = block.partialMatches || block.underrepresentedSkills || [];
  const missing = block.missingRequirements || [];

  return (
    <div className="my-2.5 w-full rounded-xl border border-[#242424] bg-[#0A0A0A] p-3.5 sm:p-4 space-y-3 text-[#F5F5F5] shadow-xs">
      {/* 1. Job title */}
      <div>
        <h4 className="text-[15px] sm:text-[16px] font-semibold text-[#F5F5F5] tracking-tight leading-snug [overflow-wrap:anywhere] break-words">
          {block.jobTitle || 'Target Role'}
        </h4>

        {/* 2. Employer & location */}
        <p className="text-[12px] sm:text-[13px] text-[#BDBDBD] mt-0.5 [overflow-wrap:anywhere]">
          {[block.company, block.location].filter(Boolean).join(' · ') || 'Company details in listing'}
        </p>

        {/* 3. Verified freshness / match information */}
        <div className="flex items-center gap-2 text-[12px] sm:text-[13px] font-mono mt-1.5">
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
          ) : (
            <span className="text-[#7E7E7E]">Match not evaluated</span>
          )}
          <span className="text-[#565656]">·</span>
          <span className="text-emerald-400/90 text-xs flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 inline-block" />
            Verified active
          </span>
        </div>
      </div>

      {/* Summary if present */}
      {block.summary && (
        <p className="text-[12px] sm:text-[13px] text-[#BDBDBD] leading-relaxed [overflow-wrap:anywhere]">
          {block.summary}
        </p>
      )}

      {/* Breakdown: Strong / Partial / Missing */}
      {(strongMatches.length > 0 || partialMatches.length > 0 || missing.length > 0) && (
        <div className="space-y-2 pt-1 border-t border-[#242424] text-xs">
          {strongMatches.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-[#7E7E7E] w-14 shrink-0 font-mono">Matches:</span>
              <div className="flex flex-wrap gap-1.5">
                {strongMatches.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-[#151515] border border-emerald-800/40 text-emerald-400 font-mono"
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {partialMatches.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-[#7E7E7E] w-14 shrink-0 font-mono">Partial:</span>
              <div className="flex flex-wrap gap-1.5">
                {partialMatches.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-[#151515] border border-[#242424] text-[#BDBDBD] font-mono"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {missing.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-[#7E7E7E] w-14 shrink-0 font-mono">Missing:</span>
              <div className="flex flex-wrap gap-1.5">
                {missing.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-[#151515] border border-rose-900/40 text-rose-400 font-mono"
                  >
                    ! {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Action Buttons beneath the information */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#242424]">
        {block.jobId && onPrepareApplication ? (
          <button
            type="button"
            className="min-h-[44px] text-[13px] font-medium bg-[#8B5CF6] text-white hover:bg-[#7C3AED] px-4 py-2 rounded-lg transition-colors cursor-pointer"
            onClick={() => onPrepareApplication(block.jobId)}
          >
            Prepare Application →
          </button>
        ) : block.jobId && onTailorResume ? (
          <button
            type="button"
            className="min-h-[44px] text-[13px] font-medium text-[#F5F5F5] bg-[#151515] hover:bg-[#1E1E1E] border border-[#242424] px-4 py-2 rounded-lg transition-colors cursor-pointer"
            onClick={() => onTailorResume(block.jobTitle, block.jobId)}
          >
            Tailor Resume
          </button>
        ) : null}

        {block.jobId && (
          <button
            type="button"
            className="min-h-[44px] text-[13px] font-medium text-[#BDBDBD] hover:text-[#F5F5F5] bg-[#101010] hover:bg-[#151515] border border-[#242424] px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
            onClick={() => {
              if (onViewJob) {
                onViewJob(block.jobId);
              } else {
                router.push(`/${activeLocale}/jobs/${block.jobId}`);
              }
            }}
          >
            View Job
          </button>
        )}
      </div>
    </div>
  );
}
