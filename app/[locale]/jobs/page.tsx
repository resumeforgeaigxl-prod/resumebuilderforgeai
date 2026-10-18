export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';
import { PublicJobsLanding } from '@/components/jobs/PublicJobsLanding';
import { UnifiedJobsWorkspace } from '@/components/jobs/UnifiedJobsWorkspace';
import { Sidebar } from '@/components/ui/Sidebar';
import { SidebarProvider } from '@/hooks/use-sidebar';

interface PageProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const canonicalUrl = `https://resumeforgeai.in/${params.locale}/jobs`;

  return {
    title: 'Explore Tech Jobs & Verified Career Openings | ResumeForge',
    description:
      'Discover verified tech jobs curated by AI across top companies. Apply manually for free or let Omni tailor your resume and application.',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: 'Explore Tech Jobs & Verified Career Openings | ResumeForge',
      description:
        'Discover verified tech jobs curated by AI across top companies. Free job search and AI application preparation.',
      url: canonicalUrl,
      type: 'website',
      siteName: 'ResumeForgeAI',
    },
  };
}

export default async function JobsRoutePage({ params }: PageProps) {
  const { locale } = params;
  const session = await getSession();

  // If authenticated: render full personalized dashboard workspace with sidebar
  if (session?.userId) {
    return (
      <SidebarProvider>
        <div className="min-h-screen bg-[#050505] text-[#F5F5F5] flex overflow-hidden relative product-dark">
          <Sidebar locale={locale} />
          <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-[80px]">
            <main className="h-screen overflow-y-auto overflow-x-hidden custom-scrollbar bg-[#050505] p-4 md:p-8">
              <UnifiedJobsWorkspace />
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  // If anonymous / search crawler: fetch canonical ACTIVE jobs server-side and render public SEO portal
  const supabase = await createClient();
  const { data: activeJobs, count } = await supabase
    .from('jobs')
    .select(
      'id, title, company, location, city, remote_type, employment_type, salary_min, salary_max, salary_currency, salary_period, skills, slug, created_at, posted_at, source',
      { count: 'exact' }
    )
    .eq('status', 'ACTIVE')
    .order('last_seen_at', { ascending: false })
    .limit(30);

  return (
    <PublicJobsLanding
      initialJobs={activeJobs || []}
      totalCount={count || 0}
      locale={locale}
    />
  );
}
