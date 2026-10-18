export const dynamic = 'force-dynamic';

import { permanentRedirect } from 'next/navigation';

interface LegacyJobPageProps {
  params: {
    locale: string;
    slug: string;
  };
}

/**
 * Permanent 301 redirect from legacy /job/[slug] to canonical /jobs/[slug].
 * Prevents URL duplication and consolidates SEO authority onto /jobs/[slug].
 */
export default function LegacyJobDetailRedirect({ params }: LegacyJobPageProps) {
  permanentRedirect(`/${params.locale}/jobs/${params.slug}`);
}
