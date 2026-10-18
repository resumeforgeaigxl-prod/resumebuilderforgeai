export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  MapPin,
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from '@/components/icons';
import { extractJobIdFromSlug, getCanonicalJobUrl, generateJobSlug } from '@/lib/jobs/slug';
import { isJobIndexable, buildJobPostingJsonLd } from '@/lib/jobs/indexability';
import { findReplacementJobs } from '@/lib/jobs/replacement';
import { PublicJobActionBar } from '@/components/jobs/PublicJobActionBar';

interface PageProps {
  params: {
    locale: string;
    slug: string;
  };
}

async function fetchJobData(slug: string) {
  const supabase = await createClient();
  const jobId = extractJobIdFromSlug(slug);

  let query = supabase.from('jobs').select('*');

  if (jobId) {
    query = query.eq('id', jobId);
  } else {
    query = query.eq('slug', slug);
  }

  const { data: job } = await query.maybeSingle();
  return job;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const job = await fetchJobData(params.slug);

  if (!job) {
    return {
      title: 'Job Opening Not Found | ResumeForge',
      robots: { index: false, follow: false },
    };
  }

  const isClosed = job.status === 'CLOSED';
  const { eligible: isEligible } = isJobIndexable(job);
  const canonicalUrl = getCanonicalJobUrl(job, params.locale);

  const cleanDescription = (job.description || '')
    .replace(/[#*`\n\r]/g, ' ')
    .trim()
    .slice(0, 155);

  const metaTitle = isClosed
    ? `${job.title} at ${job.company} [Closed] | ResumeForge`
    : `${job.title} at ${job.company} — ${job.city || job.location || 'Tech'} | ResumeForge`;

  return {
    title: metaTitle,
    description: cleanDescription || `Explore ${job.title} at ${job.company}. Build an ATS-optimized resume and apply with Omni.`,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: !isClosed && isEligible,
      follow: true,
    },
    openGraph: {
      title: metaTitle,
      description: cleanDescription,
      url: canonicalUrl,
      type: 'article',
      siteName: 'ResumeForgeAI',
    },
  };
}

export default async function PublicJobDetailPage({ params }: PageProps) {
  const { locale, slug } = params;
  const job = await fetchJobData(slug);

  if (!job) {
    notFound();
  }

  const isClosed = job.status === 'CLOSED';
  const canonicalUrl = getCanonicalJobUrl(job, locale);

  // 1. Structured Data: Only ACTIVE, indexable jobs emit schema.org/JobPosting
  const jsonLd = !isClosed ? buildJobPostingJsonLd(job, canonicalUrl) : null;

  // 2. Fetch Replacements if Closed
  let replacements: any[] = [];
  if (isClosed) {
    try {
      const repResult = await findReplacementJobs({ jobId: job.id, limit: 4 });
      replacements = repResult.replacements || [];
    } catch {
      replacements = [];
    }
  }

  // 3. Fetch Similar Active Roles if Active
  let similarJobs: any[] = [];
  if (!isClosed) {
    try {
      const supabase = await createClient();
      const { data: similar } = await supabase
        .from('jobs')
        .select('id, title, company, location, remote_type, slug, salary_min, salary_max, salary_currency')
        .eq('status', 'ACTIVE')
        .neq('id', job.id)
        .order('last_seen_at', { ascending: false })
        .limit(3);

      similarJobs = similar || [];
    } catch {
      similarJobs = [];
    }
  }

  // Formatting helpers
  const postedDate = job.posted_at
    ? new Date(job.posted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : new Date(job.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  // Salary display — ONLY if genuine numeric values exist
  const hasSalary = (job.salary_min && job.salary_min > 0) || (job.salary_max && job.salary_max > 0);
  const salaryDisplay = hasSalary
    ? `${job.salary_currency || '₹'} ${job.salary_min ? job.salary_min.toLocaleString() : ''}${
        job.salary_min && job.salary_max ? ' - ' : ''
      }${job.salary_max ? job.salary_max.toLocaleString() : ''} / ${job.salary_period || 'yr'}`
    : null;

  // Experience display — ONLY if genuine numeric values exist
  const hasExperience = typeof job.experience_min === 'number' || typeof job.experience_max === 'number';
  const experienceDisplay = hasExperience
    ? `${job.experience_min ?? 0}${job.experience_max ? `-${job.experience_max}` : '+'} years`
    : null;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#171717]">
      {/* Schema.org / JobPosting structured data (Suppressed for CLOSED jobs) */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* Top Public Header */}
      <header className="border-b border-[#EBEBEB] bg-white sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2.5 font-bold tracking-tight text-sm">
            <span className="w-8 h-8 rounded-lg bg-[#171717] text-white flex items-center justify-center font-mono text-xs">
              RF
            </span>
            <span>ResumeForge</span>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href={`/${locale}/jobs`}
              className="text-xs font-medium text-[#4D4D4D] hover:text-[#171717] px-3 py-1.5 rounded-lg transition-colors"
            >
              Explore Jobs
            </Link>
            <Link
              href={`/${locale}/login`}
              className="text-xs font-semibold text-[#171717] border border-[#EBEBEB] hover:bg-slate-50 px-3.5 py-1.5 rounded-xl transition-all"
            >
              Sign In
            </Link>
            <Link
              href={`/${locale}/signup`}
              className="text-xs font-semibold text-white bg-[#171717] hover:bg-black px-4 py-1.5 rounded-xl transition-all shadow-xs"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-[#8F8F8F] mb-6 font-medium">
          <Link href={`/${locale}/jobs`} className="hover:text-[#171717]">
            Jobs
          </Link>
          <span>/</span>
          <span className="truncate max-w-[200px] sm:max-w-none text-[#4D4D4D]">{job.company}</span>
          <span>/</span>
          <span className="truncate max-w-[200px] sm:max-w-none text-[#171717]">{job.title}</span>
        </nav>

        {/* Closed Vacancy Notice */}
        {isClosed && (
          <div className="mb-8 p-6 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 flex items-start gap-4 shadow-2xs">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold text-sm text-amber-900 mb-1">
                Applications Closed
              </h2>
              <p className="text-xs text-amber-800 leading-relaxed mb-3">
                This position at {job.company} is no longer accepting applications ({job.closure_reason || 'Requisition expired or filled'}).
                ResumeForge has identified active matching opportunities below.
              </p>
              <Link
                href={`/${locale}/jobs`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 underline hover:text-amber-700"
              >
                View all active tech openings <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Vacancy Header Card */}
        <div className="bg-white border border-[#EBEBEB] rounded-2xl p-6 sm:p-8 mb-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-[#EBEBEB]">
            <div className="flex gap-4 items-start">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-[#EBEBEB] flex items-center justify-center text-xl font-bold text-[#171717] shrink-0">
                {job.company?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717]">
                    {job.title}
                  </h1>
                  {isClosed ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold">
                      Closed
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[11px] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[#4D4D4D] font-medium">
                  <span className="flex items-center gap-1.5 font-semibold text-[#171717]">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    {job.company}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {job.city || job.location || 'Remote'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 text-[#8F8F8F]">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Posted {postedDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Freshness Badge */}
            <div className="text-right sm:self-start">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                Verified via {job.source || 'Direct Source'}
              </span>
            </div>
          </div>

          {/* Key Attributes Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-[#EBEBEB]">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#8F8F8F] block mb-1">
                Workplace
              </span>
              <span className="text-xs font-semibold text-[#171717]">
                {job.remote_type === 'REMOTE' ? 'Fully Remote' : job.remote_type === 'HYBRID' ? 'Hybrid' : 'On-Site'}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#8F8F8F] block mb-1">
                Type
              </span>
              <span className="text-xs font-semibold text-[#171717]">
                {job.employment_type || job.job_type || 'Full-time'}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#8F8F8F] block mb-1">
                Experience
              </span>
              <span className="text-xs font-semibold text-[#171717]">
                {experienceDisplay || 'Not specified'}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#8F8F8F] block mb-1">
                Compensation
              </span>
              <span className="text-xs font-semibold text-[#171717]">
                {salaryDisplay || 'Competitive'}
              </span>
            </div>
          </div>

          {/* Action Bar (Apply with Omni, Manual Apply, Match Check) */}
          <div className="pt-4">
            <PublicJobActionBar
              job={{
                id: job.id,
                title: job.title,
                company: job.company,
                apply_url: job.apply_url || job.source_url,
                status: job.status,
              }}
              locale={locale}
              slug={slug}
              isClosed={isClosed}
            />
          </div>
        </div>

        {/* Similar Active Replacements (Shown prominently when Closed) */}
        {isClosed && replacements.length > 0 && (
          <div className="mb-10 bg-white border border-[#EBEBEB] rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2 text-violet-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" /> Similar Opportunities
            </div>
            <h2 className="text-lg font-bold text-[#171717] mb-4">
              Active Roles Matching {job.title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {replacements.map((item: any) => {
                const repSlug = item.job.slug || generateJobSlug(item.job);
                return (
                  <div
                    key={item.job.id}
                    className="p-5 rounded-xl border border-[#EBEBEB] hover:border-slate-300 transition-all flex flex-col justify-between bg-[#FAFAFA]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="font-semibold text-xs text-[#171717] line-clamp-1">
                          {item.job.title}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-bold">
                          {item.relevanceScore}% match
                        </span>
                      </div>
                      <p className="text-xs text-[#4D4D4D] mb-4">
                        {item.job.company} • {item.job.city || item.job.location || 'Remote'}
                      </p>
                    </div>
                    <Link
                      href={`/${locale}/jobs/${repSlug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 hover:text-violet-900"
                    >
                      View Role <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Job Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Description Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white border border-[#EBEBEB] rounded-2xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-lg font-bold text-[#171717] mb-4">
                About the Role
              </h2>
              <div className="prose prose-slate max-w-none text-xs sm:text-sm text-[#4D4D4D] leading-relaxed whitespace-pre-line font-sans">
                {job.description || 'No detailed description provided by the employer.'}
              </div>
            </div>

            {/* Requirements if present */}
            {job.requirements && (
              <div className="bg-white border border-[#EBEBEB] rounded-2xl p-6 sm:p-8 shadow-xs">
                <h2 className="text-lg font-bold text-[#171717] mb-4">
                  Key Requirements
                </h2>
                <div className="prose prose-slate max-w-none text-xs sm:text-sm text-[#4D4D4D] leading-relaxed whitespace-pre-line font-sans">
                  {job.requirements}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info Column */}
          <div className="space-y-6">
            {/* Conversion Promo Card */}
            <div className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-sm mb-1.5">
                Check Your ATS Match
              </h3>
              <p className="text-xs text-white/80 leading-relaxed mb-4">
                Omni can analyze your experience against this job and tailor your resume bullets specifically for {job.company}.
              </p>
              <Link
                href={`/${locale}/resumes?matchJobId=${job.id}`}
                className="w-full py-2.5 bg-white text-[#171717] hover:bg-slate-50 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-2xs"
              >
                Scan Resume Match <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Skills Card */}
            {Array.isArray(job.skills) && job.skills.length > 0 && (
              <div className="bg-white border border-[#EBEBEB] rounded-2xl p-6 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8F8F8F] mb-3">
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Origin & Transparency Card */}
            <div className="bg-white border border-[#EBEBEB] rounded-2xl p-6 shadow-xs text-xs text-[#8F8F8F] space-y-2.5">
              <h3 className="font-bold uppercase tracking-wider text-[11px] text-[#171717]">
                Transparency
              </h3>
              <p className="leading-relaxed">
                Source: <span className="text-[#4D4D4D] font-medium">{job.source || 'Company Careers'}</span>
              </p>
              <p className="leading-relaxed">
                ResumeForge canonicalizes vacancies across verified employer boards to provide candidate-first career intelligence.
              </p>
            </div>
          </div>
        </div>

        {/* Similar Active Opportunities (When Job is Active) */}
        {!isClosed && similarJobs.length > 0 && (
          <section className="mt-12 pt-8 border-t border-[#EBEBEB]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#171717]">
                  Similar Active Jobs
                </h2>
                <p className="text-xs text-[#4D4D4D] mt-0.5">
                  Other live opportunities in tech and engineering
                </p>
              </div>
              <Link
                href={`/${locale}/jobs`}
                className="text-xs font-semibold text-violet-700 hover:text-violet-900 flex items-center gap-1"
              >
                View all jobs <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {similarJobs.map((simJob: any) => {
                const simSlug = simJob.slug || generateJobSlug(simJob);
                return (
                  <Link
                    key={simJob.id}
                    href={`/${locale}/jobs/${simSlug}`}
                    className="p-5 rounded-2xl bg-white border border-[#EBEBEB] hover:border-slate-300 transition-all shadow-2xs group flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="text-xs font-bold text-[#171717] group-hover:text-violet-700 transition-colors line-clamp-1 mb-1">
                        {simJob.title}
                      </h3>
                      <p className="text-xs text-[#4D4D4D] mb-3">
                        {simJob.company} • {simJob.location || 'Remote'}
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-violet-700 flex items-center gap-1">
                      View opening <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EBEBEB] bg-white py-12 mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8F8F8F]">
          <p>© {new Date().getFullYear()} ResumeForgeAI. Free public vacancy discovery.</p>
          <div className="flex items-center gap-6">
            <Link href={`/${locale}/privacy`} className="hover:text-[#171717]">Privacy</Link>
            <Link href={`/${locale}/terms`} className="hover:text-[#171717]">Terms</Link>
            <Link href={`/${locale}/jobs`} className="hover:text-[#171717]">All Jobs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
