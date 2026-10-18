'use client';

import React from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
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
}

export interface JobArtifact {
  success?: boolean;
  tool?: 'search_job_market' | string;
  query?: string;
  jobs?: JobItem[];
  count?: number;
}

interface JobArtifactCardProps {
  artifact: JobArtifact;
  locale: string;
  onTailorResume?: (jobTitle: string, jobDesc?: string) => void;
}

export function JobArtifactCard({ artifact, locale, onTailorResume }: JobArtifactCardProps) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  const activeLocale =
    (params?.locale as string | undefined) ||
    locale ||
    pathname?.split('/').filter(Boolean)[0] ||
    'en-in';

  const jobs = artifact.jobs || [];

  if (jobs.length === 0) {
    return (
      <div className="my-2 p-4 rounded-xl border border-[#242424] bg-[#0A0A0A] text-xs text-[#7E7E7E]">
        No active job openings found for this search.
      </div>
    );
  }

  return (
    <div className="my-2.5 w-full rounded-xl border border-[#242424] bg-[#0A0A0A] p-4 space-y-3 text-[#F5F5F5] shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#242424]">
        <span className="text-xs font-semibold text-[#F5F5F5] tracking-tight">
          {artifact.query ? `Jobs for "${artifact.query}"` : 'Job Openings'}
        </span>
        <span className="text-[11px] text-[#7E7E7E]">
          {jobs.length} found
        </span>
      </div>

      {/* Clean, Scannable Jobs List */}
      <div className="space-y-2">
        {jobs.slice(0, 5).map((job, idx) => {
          const applyUrl = job.url || job.apply_url || job.canonical_url;
          const metaParts: string[] = [];
          if (job.company) metaParts.push(job.company);
          if (job.location) metaParts.push(job.location);
          if (job.remote_type && job.remote_type !== 'UNKNOWN') {
            metaParts.push(job.remote_type.toLowerCase());
          }

          return (
            <div
              key={job.id || idx}
              className="p-3 rounded-lg border border-[#242424] bg-[#121212] hover:bg-[#161616] hover:border-[#303030] transition-colors flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <h5 className="text-sm font-medium text-[#F5F5F5] truncate">
                  {job.title || 'Software Engineer'}
                </h5>
                {metaParts.length > 0 && (
                  <p className="text-xs text-[#7E7E7E] mt-0.5 truncate">
                    {metaParts.join(' · ')}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (onTailorResume && job.title) {
                      onTailorResume(job.title, job.snippet || job.description);
                    }
                  }}
                  className="text-xs font-medium text-[#F5F5F5] bg-[#1A1A1A] hover:bg-[#222222] border border-[#2E2E2E] hover:border-[#3E3E3E] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Tailor Resume
                </button>

                {applyUrl && (
                  <a
                    href={applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#BDBDBD] hover:text-[#FFFFFF] px-2 py-1.5 transition-colors inline-flex items-center gap-1"
                  >
                    Apply ↗
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quiet Footer */}
      {jobs.length > 5 && (
        <div className="pt-1 flex items-center justify-between text-xs text-[#7E7E7E]">
          <button
            type="button"
            onClick={() => router.push(`/${activeLocale}/jobs?tab=recommended`)}
            className="text-xs font-medium text-[#8B5CF6] hover:text-[#A78BFA] transition-colors cursor-pointer"
          >
            View all {jobs.length} jobs →
          </button>
        </div>
      )}
    </div>
  );
}
