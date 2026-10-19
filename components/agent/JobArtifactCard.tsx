'use client';

import { useState } from 'react';
import Link from 'next/link';
import { generateJobSlug } from '@/lib/jobs/slug';
import { cn } from '@/lib/utils';

export interface JobItem {
  id?: string;
  title?: string;
  company?: string;
  location?: string;
  snippet?: string;
  description?: string;
  url?: string;
  apply_url?: string;
  canonical_url?: string;
  source?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  remote_type?: string;
  employment_type?: string;
  matchScore?: number;
  score?: number;
  verifiedActive?: boolean;
  isBlocked?: boolean;
}

export interface JobArtifact {
  success?: boolean;
  tool?: string;
  query?: string;
  jobs?: JobItem[];
  matches?: any[];
  count?: number;
}

interface JobArtifactCardProps {
  artifact: JobArtifact;
  locale: string;
  onTailorResume?: (jobTitle: string, jobDesc?: string) => void;
  onPrepareApplication?: (jobId: string) => void;
}

export function JobArtifactCard({
  artifact,
  locale,
  onTailorResume,
  onPrepareApplication,
}: JobArtifactCardProps) {
  const [expanded, setExpanded] = useState(false);

  const jobs: JobItem[] =
    artifact.jobs && artifact.jobs.length > 0
      ? artifact.jobs
      : ((artifact as any).matches || []).map((m: any) => ({
          id: m.jobId || m.id,
          title: m.jobTitle || m.title,
          company: m.company,
          location: m.location,
          snippet: m.summary || m.snippet,
          matchScore: m.score ?? m.matchScore,
          verifiedActive: true,
          isBlocked: m.isBlocked,
        }));

  const visibleJobs = expanded ? jobs : jobs.slice(0, 3);

  return (
    <section
      className="w-full min-w-0 rounded-xl border border-[#242424] bg-[#0A0A0A] text-[#F5F5F5] overflow-hidden shadow-xs"
      aria-label="Job search results"
    >
      <div className="px-4 py-3 text-[13px] text-[#BDBDBD] border-b border-[#242424] flex items-center justify-between font-mono">
        <span>{jobs.length ? `${jobs.length} jobs in this result set` : 'No active openings found for this search.'}</span>
        {jobs.length > 3 && (
          <span className="text-xs text-[#7E7E7E]">
            {expanded ? `Showing ${jobs.length} of ${jobs.length}` : `Showing 3 of ${jobs.length}`}
          </span>
        )}
      </div>

      <ol className="divide-y divide-[#242424]">
        {visibleJobs.map((job, index) => {
          const external = job.url || job.apply_url || job.canonical_url;
          const href = job.id
            ? `/${locale}/jobs/${generateJobSlug({ ...job, id: job.id })}`
            : external && /^https?:\/\//i.test(external)
            ? external
            : undefined;

          const matchScore = job.matchScore ?? (job as any).score;
          const isBlocked = (job as any).isBlocked;

          return (
            <li key={job.id || index} className="min-w-0 p-3.5 sm:p-4 space-y-2">
              {/* 1. Job title */}
              <h5 className="!font-sans text-[15px] sm:text-[16px] font-semibold leading-snug text-[#F5F5F5] [overflow-wrap:anywhere] break-words">
                {job.title || 'Untitled role'}
              </h5>

              {/* 2. Employer and location */}
              <p className="text-[12px] sm:text-[13px] leading-relaxed text-[#BDBDBD] [overflow-wrap:anywhere]">
                {[job.company, job.location].filter(Boolean).join(' · ') || 'Company details in listing'}
              </p>

              {/* 3. Verified freshness / match information */}
              <div className="flex items-center gap-2 text-[12px] sm:text-[13px] font-mono">
                {isBlocked ? (
                  <span className="text-rose-400 font-semibold">Blocked by policy</span>
                ) : matchScore != null ? (
                  <span
                    className={cn(
                      'font-semibold',
                      matchScore >= 80
                        ? 'text-emerald-400'
                        : matchScore >= 65
                        ? 'text-[#C4B5FD]'
                        : 'text-amber-400'
                    )}
                  >
                    Match: {matchScore}%
                  </span>
                ) : null}
                {matchScore != null && <span className="text-[#565656]">·</span>}
                <span className="text-emerald-400/90 text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 inline-block" />
                  Verified active
                </span>
              </div>

              {/* 4. Actions beneath the information */}
              <div className="flex flex-wrap items-center gap-2 pt-1.5">
                {href && (
                  <Link
                    href={href}
                    className="min-h-[44px] inline-flex items-center justify-center rounded-lg border border-[#242424] bg-[#101010] hover:bg-[#151515] px-3.5 text-[13px] font-medium text-[#F5F5F5] transition-colors"
                  >
                    View Job
                  </Link>
                )}
                {job.id && onPrepareApplication ? (
                  <button
                    type="button"
                    onClick={() => onPrepareApplication(job.id!)}
                    className="min-h-[44px] inline-flex items-center justify-center rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] px-4 text-[13px] font-medium text-white transition-colors cursor-pointer"
                  >
                    Prepare →
                  </button>
                ) : onTailorResume && job.title ? (
                  <button
                    type="button"
                    onClick={() => onTailorResume(job.title!, job.description || job.snippet)}
                    className="min-h-[44px] inline-flex items-center justify-center rounded-lg bg-[#151515] border border-[#242424] hover:bg-[#1E1E1E] px-3.5 text-[13px] font-medium text-[#F5F5F5] transition-colors cursor-pointer"
                  >
                    Tailor Resume
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {jobs.length > 3 && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded(v => !v)}
          className="min-h-[44px] w-full border-t border-[#242424] px-4 py-2.5 text-left text-[13px] font-medium text-[#C4B5FD] hover:text-white hover:bg-[#101010] transition-colors cursor-pointer flex items-center justify-between"
        >
          <span>{expanded ? 'Show fewer' : `Show all ${jobs.length}`}</span>
          <span className="text-xs text-[#7E7E7E] font-mono">{expanded ? '↑' : '↓'}</span>
        </button>
      )}
    </section>
  );
}
