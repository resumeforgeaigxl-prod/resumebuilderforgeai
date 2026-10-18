'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from '@/components/icons';
import { buttonClass, cardClass, cardTitleClass } from './design';

export interface ProfileReadinessData {
  completenessPercentage: number;
  readinessStatus: 'READY' | 'READY_WITH_CONFIRMATION' | 'NOT_READY';
  summary?: string;
  missingCritical: string[];
  missingRecommended: string[];
  sections: {
    identity: boolean;
    career: boolean;
    preferences: boolean;
    protectedLegal: boolean;
  };
}

interface ProfileReadinessCardProps {
  data: ProfileReadinessData;
  locale: string;
}

export function ProfileReadinessCard({ data, locale }: ProfileReadinessCardProps) {
  const percentage = Math.min(100, Math.max(0, data.completenessPercentage));
  const missing = Array.from(new Set([...data.missingCritical, ...data.missingRecommended]));

  return (
    <section className={cardClass + ' space-y-4'} aria-labelledby="profile-title">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="profile-title" className={cardTitleClass + ' flex items-center gap-2.5'}>
          <img src="/rail/rail-account.png?v=ice" alt="" width={28} height={28} className="h-7 w-7 object-contain" />
          Application profile
        </h2>
        <span
          className="text-3xl leading-none text-[#d7e4f0]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {percentage}%
        </span>
      </div>
      <div role="progressbar" aria-label="Profile completeness" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100} className="h-1 overflow-hidden rounded-full bg-[#1c2128]">
        <div className="h-full rounded-full bg-[#9bb4c9]" style={{ width: percentage + '%' }} />
      </div>
      <ul className="space-y-2">
        <SectionItem label="Identity" complete={data.sections.identity} />
        <SectionItem label="Career & Skills" complete={data.sections.career} />
        <SectionItem label="Preferences" complete={data.sections.preferences} />
        <SectionItem label="Legal / Auth" complete={data.sections.protectedLegal} />
      </ul>
      {missing.length > 0 && (
        <p className="line-clamp-2 text-xs leading-5 text-[#7E7E7E]" title={missing.join(' · ')}>
          Missing: {missing.slice(0, 3).join(' · ')}{missing.length > 3 ? ' · +' + (missing.length - 3) + ' more' : ''}
        </p>
      )}
      <Link href={'/' + locale + '/account'} className={buttonClass}>
        {percentage >= 100 ? 'Edit Profile' : 'Complete Profile'}
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </section>
  );
}

function SectionItem({ label, complete }: { label: string; complete: boolean }) {
  return (
    <li className="flex items-center gap-2 text-sm text-[#BDBDBD]">
      {complete ? (
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden="true" />
      ) : (
        <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center text-[#7E7E7E]" aria-hidden="true">○</span>
      )}
      {label}<span className="sr-only">{complete ? ': Complete' : ': Incomplete'}</span>
    </li>
  );
}
