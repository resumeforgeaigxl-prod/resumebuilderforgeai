'use client';

import React from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import type { JobMatchBlock } from '../types';
import { Button } from '@/components/ui/Button';
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

  const score = block.score ?? 85;
  const isBlocked = Boolean(block.isBlocked);

  const strongMatches = block.strongMatches || [];
  const partialMatches = block.partialMatches || block.underrepresentedSkills || [];
  const missing = block.missingRequirements || [];

  return (
    <div className="my-2.5 w-full rounded-xl border border-[#242424] bg-[#101010] p-4 space-y-3 text-[#F5F5F5]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-[#242424]">
        <div>
          <h4 className="text-sm font-semibold text-[#F5F5F5] tracking-tight">
            {block.jobTitle || 'Target Role'}
          </h4>
          <p className="text-xs text-[#7E7E7E] mt-0.5">
            {block.company}{block.location ? ` · ${block.location}` : ''}
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-xs font-semibold text-[#C4B5FD] font-mono">
            {isBlocked ? 'Blocked' : `${score}% match`}
          </span>
        </div>
      </div>

      {/* Summary if present */}
      {block.summary && (
        <p className="text-xs text-[#BDBDBD] leading-relaxed">
          {block.summary}
        </p>
      )}

      {/* Breakdown: Strong / Partial / Missing */}
      {(strongMatches.length > 0 || partialMatches.length > 0 || missing.length > 0) && (
        <div className="space-y-2 pt-1 text-xs">
          {strongMatches.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-[#7E7E7E] w-14 shrink-0">Matches:</span>
              <div className="flex flex-wrap gap-1.5">
                {strongMatches.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-[#151515] border border-emerald-800/40 text-emerald-400"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {partialMatches.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-[#7E7E7E] w-14 shrink-0">Partial:</span>
              <div className="flex flex-wrap gap-1.5">
                {partialMatches.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-[#151515] border border-[#242424] text-[#BDBDBD]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {missing.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-[#7E7E7E] w-14 shrink-0">Missing:</span>
              <div className="flex flex-wrap gap-1.5">
                {missing.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-[#151515] border border-rose-900/40 text-rose-400"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#242424]">
        <button
          type="button"
          className="text-xs font-medium bg-[#8B5CF6] text-white hover:bg-[#7C3AED] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          onClick={() => {
            if (onPrepareApplication) {
              onPrepareApplication(block.jobId);
            }
          }}
        >
          Prepare Application
        </button>

        <button
          type="button"
          className="text-xs font-medium text-[#F5F5F5] bg-[#151515] hover:bg-[#1E1E1E] border border-[#242424] px-3 py-1.5 rounded-md transition-colors cursor-pointer"
          onClick={() => {
            if (onTailorResume) {
              onTailorResume(block.jobTitle, block.jobId);
            }
          }}
        >
          Tailor Resume
        </button>

        <button
          type="button"
          className="text-xs text-[#7E7E7E] hover:text-white ml-auto transition-colors cursor-pointer"
          onClick={() => {
            if (onViewJob) {
              onViewJob(block.jobId);
            } else {
              router.push(`/${activeLocale}/jobs/${block.jobId}`);
            }
          }}
        >
          View Job ↗
        </button>
      </div>
    </div>
  );
}
