'use client';

import Link from 'next/link';
import { buttonClass, cardClass, focusClass, sectionTitleClass, textLinkClass } from './design';

export interface DashboardJobMatch {
  id: string;
  title: string;
  company: string;
  location?: string;
  remoteType?: string;
  score: number;
  confidence?: string;
  skills?: string[];
  salaryFormatted?: string;
}

interface BestJobMatchesProps {
  matches: DashboardJobMatch[];
  locale: string;
}

export function BestJobMatches({ matches, locale }: BestJobMatchesProps) {
  return (
    <section className={cardClass + ' !p-0'} aria-labelledby="job-matches-title">
      <div className="flex items-center justify-between gap-4 border-b border-[#2a2c33] px-5 py-4">
        <div className="flex items-center gap-3">
          <img src="/rail/rail-jobs.png?v=ice" alt="" width={36} height={36} className="h-9 w-9 object-contain" />
          <div>
          <h2 id="job-matches-title" className={sectionTitleClass}>Best job matches</h2>
          <p className="mt-1 text-xs text-[#8b909a]">
            {matches.length === 0 ? 'No roles ranked yet' : matches.length + ' roles ranked for you'}
          </p>
          </div>
        </div>
        <Link href={'/' + locale + '/jobs'} className={textLinkClass}>
          View all <span aria-hidden="true">→</span>
        </Link>
      </div>
      {matches.length === 0 ? (
        <div className="px-5 py-8">
          <p className="text-sm text-[#8b909a]">Add your target roles and skills to see matches.</p>
          <Link href={'/' + locale + '/jobs'} className={buttonClass + ' mt-4'}>Explore jobs</Link>
        </div>
      ) : (
        <div>
          {matches.slice(0, 4).map((job) => (
            <div key={job.id} className="flex items-center gap-4 border-b border-[#2a2c33] px-5 py-4 last:border-b-0">
              <div
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#9bb4c9]/30 bg-[#12161c] text-sm text-[#d7e4f0]"
              >
                {job.company?.charAt(0).toUpperCase() || 'J'}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[15px] text-[#f4f5f7]" title={job.title}>
                  {job.title}
                </h3>
                <p className="mt-0.5 truncate text-xs text-[#8b909a]" title={[job.company, job.location].filter(Boolean).join(' · ')}>
                  {[job.company, job.location].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="hidden w-14 shrink-0 text-right sm:block">
                <p
                  className="text-2xl leading-none text-[#d7e4f0]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {job.score}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[#8b909a]">Match</p>
              </div>
              <Link
                href={'/' + locale + '/jobs?jobId=' + job.id}
                aria-label={'View ' + job.title + ' at ' + job.company}
                className={'hidden text-xs text-[#8b909a] hover:text-[#f4f5f7] sm:inline ' + focusClass}
              >
                View
              </Link>
              <Link
                href={'/' + locale + '/applications?prepareJobId=' + job.id}
                aria-label={'Prepare application for ' + job.title + ' at ' + job.company}
                className={'inline-flex h-8 items-center rounded-full bg-[#f4f5f7] px-3.5 text-xs font-medium text-[#0c0d10] ' + focusClass}
              >
                Prepare
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
