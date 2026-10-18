'use client';

import Link from 'next/link';
import { focusClass } from './design';

interface DashboardHeaderProps {
  displayName: string;
  locale: string;
  omniSummary: string;
  matchCount: number;
}

export function DashboardHeader({ displayName, locale, omniSummary, matchCount }: DashboardHeaderProps) {
  return (
    <header className="grid items-end gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#8b909a]">Overview</p>
        <h1
          className="mt-3 !text-[40px] font-normal leading-[0.95] tracking-tight text-[#f4f5f7] md:!text-[56px]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Welcome back,
          <br />
          {displayName}
        </h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-[#b4b8c2]">{omniSummary}</p>
      </div>

      <div className="rounded-2xl border border-[#2a2c33] bg-[#0c0d10] p-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#8b909a]">Today</p>
          <img src="/rail/rail-jobs.png?v=ice" alt="" width={28} height={28} className="h-7 w-7 object-contain" />
        </div>
        <p
          className="mt-2 text-[52px] leading-none text-[#d7e4f0]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {matchCount}
        </p>
        <p className="mt-1 text-xs text-[#8b909a]">{matchCount === 1 ? 'match ready' : 'matches ready'}</p>
        <Link
          href={'/' + locale + '/omni'}
          className={'mt-5 flex h-9 items-center justify-center rounded-full bg-[#f4f5f7] text-sm font-medium text-[#0c0d10] ' + focusClass}
        >
          Ask Omni
        </Link>
        <Link
          href={'/' + locale + '/jobs'}
          className={'mt-3 block text-center text-xs text-[#8b909a] hover:text-[#f4f5f7] ' + focusClass}
        >
          Find jobs
        </Link>
      </div>
    </header>
  );
}
