'use client';

import Link from 'next/link';
import { Plus } from '@/components/icons';
import { formatDistanceToNow } from 'date-fns';
import { buttonClass, cardClass, cardTitleClass, focusClass, textLinkClass } from './design';

export interface PrimaryResumeData {
  id: string;
  title: string;
  updated_at: string;
  ats_score?: number | null;
  targetRole?: string | null;
  completenessPercentage?: number;
  healthChecks?: Array<{
    label: string;
    passed: boolean;
  }>;
}

interface ResumeHealthCardProps {
  resume: PrimaryResumeData | null;
  locale: string;
}

export function ResumeHealthCard({ resume, locale }: ResumeHealthCardProps) {
  return (
    <section className={cardClass + ' flex min-h-[220px] flex-col space-y-4'} aria-labelledby="resume-health-title">
      <h2 id="resume-health-title" className={cardTitleClass + ' flex items-center gap-2.5'}>
        <img src="/rail/rail-resume.png?v=ice" alt="" width={28} height={28} className="h-7 w-7 object-contain" />
        Resume health
      </h2>
      {resume ? (
        <>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h3 className="font-sans truncate text-base font-medium" title={resume.title}>{resume.title}</h3>
              <p className="mt-1 truncate text-xs text-[#7E7E7E]">
                {resume.updated_at ? 'Updated ' + formatDistanceToNow(new Date(resume.updated_at), { addSuffix: true }) : 'Primary resume'}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xl font-medium tabular-nums text-[#f4f5f7]">{resume.ats_score ?? '—'}</p>
              <p className="text-xs text-[#7E7E7E]">ATS score</p>
            </div>
          </div>
          {resume.healthChecks && (
            <ul className="space-y-2">
              {resume.healthChecks.slice(0, 3).map((item) => (
                <li key={item.label} className="text-sm text-[#BDBDBD]">{item.passed ? '✓' : '○'} {item.label}</li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap items-center gap-4">
            <Link href={'/' + locale + '/resumes?tab=edit'} className={buttonClass}>Open Editor</Link>
            <Link href={'/' + locale + '/resumes?tab=ats'} className={textLinkClass}>ATS Scan →</Link>
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col">
          <p
            className="text-3xl leading-none text-[#f4f5f7]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            No resume yet
          </p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-[#8b909a]">
            A master resume unlocks matching, ATS, and tailoring.
          </p>
          <Link href={'/' + locale + '/resumes'} className={'mt-6 inline-flex h-9 w-fit items-center gap-2 rounded-full bg-[#f4f5f7] px-4 text-sm font-medium text-[#0c0d10] ' + focusClass}>
            <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
            Create resume
          </Link>
        </div>
      )}
    </section>
  );
}
