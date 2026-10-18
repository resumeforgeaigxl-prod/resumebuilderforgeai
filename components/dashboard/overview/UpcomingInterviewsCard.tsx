'use client';

import { format } from 'date-fns';
import { cardClass, cardTitleClass } from './design';

export interface ScheduledEventItem {
  id: string;
  title: string;
  company?: string;
  event_date: string;
  status?: string;
}

interface UpcomingInterviewsCardProps {
  events: ScheduledEventItem[];
  locale: string;
}

export function UpcomingInterviewsCard({ events }: UpcomingInterviewsCardProps) {
  if (!events?.length) return null;

  return (
    <section className={cardClass} aria-labelledby="interviews-title">
      <h2 id="interviews-title" className={cardTitleClass}>Upcoming interviews</h2>
      <ul className="mt-4 divide-y divide-[#242424]">
        {events.map((event) => {
          let dateLabel = event.event_date;
          try {
            dateLabel = format(new Date(event.event_date), 'MMM d, h:mm a');
          } catch {
            // Keep the supplied date if it cannot be formatted.
          }
          return (
            <li key={event.id} className="space-y-1 py-4 first:pt-0 last:pb-0">
              <h3 className="font-sans truncate text-sm font-medium text-[#F5F5F5]" title={event.title}>{event.title}</h3>
              {event.company && <p className="truncate text-xs text-[#7E7E7E]">{event.company}</p>}
              <time dateTime={event.event_date} className="block text-xs text-[#BDBDBD]">{dateLabel}</time>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
