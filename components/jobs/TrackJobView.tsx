'use client';

import { useEffect } from 'react';

interface TrackJobViewProps {
    job: {
        id: string;
        title: string;
        company: string;
    };
}

export default function TrackJobView({ job }: TrackJobViewProps) {
    useEffect(() => {
        const trackView = async () => {
            try {
                // Internal tracking
                await fetch('/api/jobs/track-view', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        job_id: job.id,
                        job_title: job.title,
                        company: job.company
                    })
                });

                // PostHog Tracking
                const posthog = (await import('@/lib/posthog')).default;
                posthog.capture('job_page_viewed', {
                    job_id: job.id,
                    job_role: job.title,
                    company_name: job.company
                });
            } catch (e) {
                console.error('Failed to track job view:', e);
            }
        };

        trackView();
    }, [job.id, job.title, job.company]);

    return null; // Side effect component
}
