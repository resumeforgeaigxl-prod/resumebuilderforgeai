'use client';

import Link from 'next/link';
import { focusClass, sectionTitleClass, textLinkClass } from './design';

export interface PipelineStageCounts {
  saved: number;
  preparing: number;
  needs_input: number;
  ready: number;
  applied: number;
  interviewing: number;
  offered: number;
}

interface ApplicationPipelineProps {
  counts: PipelineStageCounts;
  locale: string;
}

const stages: { key: keyof PipelineStageCounts; label: string }[] = [
  { key: 'saved', label: 'Saved' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'needs_input', label: 'Needs input' },
  { key: 'ready', label: 'Ready' },
  { key: 'applied', label: 'Applied' },
  { key: 'interviewing', label: 'Interview' },
  { key: 'offered', label: 'Offer' },
];

export function ApplicationPipeline({ counts, locale }: ApplicationPipelineProps) {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const active = stages.filter((stage) => (counts[stage.key] || 0) > 0);

  if (total === 0) {
    return (
      <section
        className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#2a2c33] bg-[#0c0d10] px-5 py-4"
        aria-labelledby="pipeline-title"
      >
        <div className="flex items-center gap-3">
          <img src="/rail/rail-apps.png?v=ice" alt="" width={36} height={36} className="h-9 w-9 object-contain" />
          <div>
            <h2 id="pipeline-title" className={sectionTitleClass}>Applications</h2>
            <p className="mt-1 text-sm text-[#8b909a]">Nothing in progress yet.</p>
          </div>
        </div>
        <Link href={'/' + locale + '/jobs'} className={textLinkClass + ' text-sm'}>
          Explore jobs <span aria-hidden="true">→</span>
        </Link>
      </section>
    );
  }

  return (
    <section aria-labelledby="pipeline-title">
      <div className="flex items-center justify-between gap-4">
        <h2 id="pipeline-title" className={sectionTitleClass + ' flex items-center gap-2'}>
          <img src="/rail/rail-apps.png?v=ice" alt="" width={28} height={28} className="h-7 w-7 object-contain" />
          Applications
        </h2>
        <Link href={'/' + locale + '/applications'} className={textLinkClass}>
          View all <span aria-hidden="true">→</span>
        </Link>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {active.map((stage) => (
          <Link
            key={stage.key}
            href={'/' + locale + '/applications?tab=' + stage.key}
            className={'rounded-2xl border border-[#2a2c33] bg-[#0c0d10] px-4 py-3 ' + focusClass}
          >
            <span className="block text-[11px] uppercase tracking-[0.14em] text-[#8b909a]">{stage.label}</span>
            <span
              className="mt-2 block text-3xl leading-none text-[#f4f5f7]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {counts[stage.key]}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
