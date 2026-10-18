'use client';

import Link from 'next/link';
import { focusClass, sectionTitleClass } from './design';

export interface NextBestActionItem {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}

interface NextBestActionsProps {
  actions: NextBestActionItem[];
}

const actionIcons: Record<string, string> = {
  create_resume: '/rail/rail-resume.png?v=ice',
  optimize_resume: '/rail/rail-resume.png?v=ice',
  complete_profile: '/rail/rail-account.png?v=ice',
  review_matches: '/rail/rail-jobs.png?v=ice',
  needs_input: '/rail/rail-apps.png?v=ice',
  ready_to_apply: '/rail/rail-apps.png?v=ice',
};

export function NextBestActions({ actions }: NextBestActionsProps) {
  if (!actions?.length) return null;

  return (
    <section aria-labelledby="next-actions-title">
      <h2 id="next-actions-title" className={sectionTitleClass}>Next best actions</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
        {actions.slice(0, 3).map((item, index) => (
          <Link
            key={item.id}
            href={item.ctaHref}
            className={'group flex min-h-[156px] flex-col rounded-2xl border border-[#2a2c33] bg-[#0c0d10] p-4 transition-colors hover:border-[#3a3d46] ' + focusClass}
          >
            <span className="flex items-center justify-between">
              <img
                src={actionIcons[item.id] || '/rail/rail-jobs.png?v=ice'}
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
              />
              <span className="text-[11px] tabular-nums tracking-[0.16em] text-[#9bb4c9]">
                {String(index + 1).padStart(2, '0')}
              </span>
            </span>
            <span className="mt-4 text-sm text-[#f4f5f7]">{item.title}</span>
            <span className="mt-1 line-clamp-2 flex-1 text-xs leading-5 text-[#8b909a]">{item.description}</span>
            <span className="mt-4 text-xs text-[#d7e4f0]">{item.ctaLabel} →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
