'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Sparkles, Send, AlertCircle, CheckCircle2, ArrowRight, ChevronRight } from '@/components/icons';
import { cardClass, cardTitleClass, focusClass, textLinkClass } from './design';
import { formatDistanceToNow } from 'date-fns';

export interface RecentApplicationItem {
  id: string;
  jobId: string;
  company: string;
  role: string;
  stage: string;
  matchScore?: number | null;
  updatedAt?: string;
  packageId?: string;
}

interface RecentApplicationsCardProps {
  applications: RecentApplicationItem[];
  locale: string;
}

export function RecentApplicationsCard({
  applications,
  locale,
}: RecentApplicationsCardProps) {
  if (!applications.length) return null;

  const getStageBadge = (stage: string) => {
    const s = stage.toLowerCase();
    if (s === 'ready') {
      return {
        label: 'Ready',
        style: 'bg-transparent text-[#b4b8c2] border-[#2a2c33]',
        icon: CheckCircle2,
      };
    }
    if (s === 'needs_input' || s === 'needs_user') {
      return {
        label: 'Needs Input',
        style: 'bg-amber-950/40 text-amber-300 border-amber-800/60',
        icon: AlertCircle,
      };
    }
    if (s === 'preparing') {
      return {
        label: 'Preparing',
        style: 'bg-transparent text-[#b4b8c2] border-[#2a2c33]',
        icon: Clock,
      };
    }
    if (s === 'applied') {
      return {
        label: 'Applied',
        style: 'bg-[#151515] text-[#F5F5F5] border-[#242424]',
        icon: Send,
      };
    }
    if (s === 'interview' || s === 'interviewing') {
      return {
        label: 'Interviewing',
        style: 'bg-transparent text-[#b4b8c2] border-[#2a2c33]',
        icon: Sparkles,
      };
    }
    if (s === 'offer' || s === 'offered') {
      return {
        label: 'Offer',
        style: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60',
        icon: Sparkles,
      };
    }
    return {
      label: stage.replace(/_/g, ' ').toLowerCase().replace(/^./, (letter) => letter.toUpperCase()),
      style: 'bg-[#151515] text-[#BDBDBD] border-[#242424]',
      icon: Clock,
    };
  };

  return (
    <section className={cardClass + ' space-y-4'} aria-labelledby="recent-applications-title">
      <div className="flex items-center justify-between gap-4">
        <h2 id="recent-applications-title" className={cardTitleClass}>Recent Applications</h2>
        <Link href={'/' + locale + '/applications'} className={textLinkClass}>
          View All <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
      <div className="divide-y divide-[#242424]">
        {applications.slice(0, 4).map((app) => {
          const badge = getStageBadge(app.stage);
          const BadgeIcon = badge.icon;
          const updated = app.updatedAt
            ? formatDistanceToNow(new Date(app.updatedAt), { addSuffix: true })
            : '';

          return (
            <Link
              key={app.id}
              href={'/' + locale + '/applications'}
              className={'group flex flex-wrap items-center justify-between gap-4 rounded-[8px] py-3.5 transition-colors hover:bg-[#151515] ' + focusClass}
            >
              <div className="min-w-0 flex-1 basis-[180px] space-y-1">
                <h3 className="truncate font-sans text-base font-semibold text-[#F5F5F5]" title={app.role}>{app.role}</h3>
                <p className="truncate text-xs text-[#7E7E7E]">
                  {app.company}{updated ? ' · ' + updated : ''}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {app.matchScore != null && (
                  <span className="hidden text-xs tabular-nums text-[#BDBDBD] sm:inline">{app.matchScore}%</span>
                )}
                <span className={'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ' + badge.style}>
                  <BadgeIcon className="h-3 w-3" aria-hidden="true" />
                  {badge.label}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-[#7E7E7E]" aria-hidden="true" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
