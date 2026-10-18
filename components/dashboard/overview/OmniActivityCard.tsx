'use client';

import Link from 'next/link';
import { Activity, Briefcase, FileText, MessageSquare, Search } from '@/components/icons';
import { cardClass, cardTitleClass, textLinkClass } from './design';

export interface OmniActivityItem {
  id: string;
  title: string;
  timestamp: string;
  type?: 'match' | 'application' | 'resume' | 'chat';
}

interface OmniActivityCardProps {
  activities: OmniActivityItem[];
  locale: string;
}

const activityIcons = {
  match: Search,
  application: Briefcase,
  resume: FileText,
  chat: MessageSquare,
};

export function OmniActivityCard({ activities, locale }: OmniActivityCardProps) {
  if (!activities.length) return null;

  return (
    <section className={cardClass + ' space-y-4'} aria-labelledby="omni-activity-title">
      <div className="flex items-center justify-between gap-4">
        <h2 id="omni-activity-title" className={cardTitleClass + ' flex items-center gap-2.5'}>
          <img src="/rail/rail-omni.png?v=ice" alt="" width={28} height={28} className="h-7 w-7 object-contain" />
          Omni activity
        </h2>
        <Link href={'/' + locale + '/omni'} className={textLinkClass}>Open Omni →</Link>
      </div>
      <ul className="space-y-4">
        {activities.map((item) => {
          const Icon = item.type ? activityIcons[item.type] : Activity;
          return (
            <li key={item.id} className="flex items-start gap-3">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#7E7E7E]" aria-hidden="true" />
              <div className="min-w-0 space-y-1">
                <p className="line-clamp-2 text-sm leading-5 text-[#BDBDBD]">{item.title}</p>
                <p className="text-xs text-[#7E7E7E]">{item.timestamp}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
