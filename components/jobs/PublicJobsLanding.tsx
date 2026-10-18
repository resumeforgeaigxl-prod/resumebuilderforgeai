'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Briefcase,
  Sparkles,
  Bot,
  Building2,
  Calendar,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from '@/components/icons';
import { generateJobSlug } from '@/lib/jobs/slug';

interface PublicJobItem {
  id: string;
  title: string;
  company: string;
  location: string;
  city?: string | null;
  remote_type: string;
  employment_type?: string | null;
  job_type?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string | null;
  salary_period?: string | null;
  skills?: string[];
  slug?: string | null;
  created_at: string;
  posted_at?: string | null;
  source?: string | null;
}

interface PublicJobsLandingProps {
  initialJobs: PublicJobItem[];
  totalCount: number;
  locale: string;
}

const POPULAR_ROLES = [
  'Software Engineer',
  'Full Stack Developer',
  'Backend Engineer',
  'Frontend Developer',
  'AI / ML Engineer',
  'DevOps Engineer',
  'Data Scientist',
];

const POPULAR_LOCATIONS = [
  'Remote',
  'Bengaluru',
  'Hyderabad',
  'Pune',
  'Mumbai',
  'Delhi NCR',
];

export function PublicJobsLanding({
  initialJobs,
  totalCount,
  locale,
}: PublicJobsLandingProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedRemote, setSelectedRemote] = useState<string | null>(null);

  // Client-side filtering over initial server-rendered active canonical jobs
  const filteredJobs = initialJobs.filter((job) => {
    const matchesSearch =
      !searchTerm ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.skills || []).some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLocation =
      !locationFilter ||
      (job.city || job.location || '').toLowerCase().includes(locationFilter.toLowerCase());

    const matchesRemote =
      !selectedRemote ||
      (selectedRemote === 'REMOTE' ? job.remote_type === 'REMOTE' : true);

    return matchesSearch && matchesLocation && matchesRemote;
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#171717]">
      {/* Public Header */}
      <header className="border-b border-[#EBEBEB] bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2.5 font-bold tracking-tight text-sm">
            <span className="w-8 h-8 rounded-lg bg-[#171717] text-white flex items-center justify-center font-mono text-xs">
              RF
            </span>
            <span>ResumeForge</span>
          </Link>

          <nav className="flex items-center gap-3">
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

      {/* Hero Section */}
      <section className="bg-white border-b border-[#EBEBEB] py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-200/60 text-violet-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Canonical Tech Opportunities
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#171717]">
            Discover Verified Tech Jobs Curated by AI
          </h1>
          <p className="text-sm sm:text-base text-[#4D4D4D] max-w-2xl mx-auto leading-relaxed">
            Search canonical engineering, AI, and product openings. Explore verified opportunities, apply manually for free, or let Omni prepare tailored applications.
          </p>

          {/* Search Inputs */}
          <div className="pt-6 max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Job title, company, or skills..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-[#EBEBEB] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all text-[#171717]"
              />
            </div>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="City or Remote..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-[#EBEBEB] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all text-[#171717]"
              />
            </div>
          </div>

          {/* Popular Filter Chips */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            <span className="text-xs text-[#8F8F8F] font-medium mr-1">Popular:</span>
            {POPULAR_ROLES.map((role) => (
              <button
                key={role}
                onClick={() => setSearchTerm(searchTerm === role ? '' : role)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  searchTerm === role
                    ? 'bg-[#171717] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {role}
              </button>
            ))}
            {POPULAR_LOCATIONS.map((loc) => (
              <button
                key={loc}
                onClick={() => setLocationFilter(locationFilter === loc ? '' : loc)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  locationFilter === loc
                    ? 'bg-violet-700 text-white shadow-2xs'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Jobs Listing Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#EBEBEB]">
          <div>
            <h2 className="text-xl font-bold text-[#171717]">
              Live Opportunities
            </h2>
            <p className="text-xs text-[#4D4D4D] mt-0.5">
              Showing {filteredJobs.length} active verified openings
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedRemote(selectedRemote === 'REMOTE' ? null : 'REMOTE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                selectedRemote === 'REMOTE'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white text-slate-600 border-[#EBEBEB] hover:bg-slate-50'
              }`}
            >
              Remote Only
            </button>
          </div>
        </div>

        {/* Jobs Grid */}
        {filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredJobs.map((job) => {
              const slug = job.slug || generateJobSlug(job);
              const isRemote = job.remote_type === 'REMOTE' || (job.location || '').toLowerCase().includes('remote');
              const hasSalary = (job.salary_min && job.salary_min > 0) || (job.salary_max && job.salary_max > 0);

              return (
                <div
                  key={job.id}
                  className="bg-white border border-[#EBEBEB] hover:border-slate-300 rounded-2xl p-6 transition-all duration-200 shadow-2xs flex flex-col justify-between group"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 border border-[#EBEBEB] flex items-center justify-center font-bold text-sm text-[#171717] shrink-0">
                        {job.company?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                        {isRemote ? 'Remote' : job.remote_type === 'HYBRID' ? 'Hybrid' : 'On-Site'}
                      </span>
                    </div>

                    {/* Title & Company */}
                    <Link href={`/${locale}/jobs/${slug}`}>
                      <h3 className="font-bold text-sm text-[#171717] group-hover:text-violet-700 transition-colors line-clamp-1 tracking-tight">
                        {job.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-[#4D4D4D] font-medium mt-1 flex items-center gap-1.5">
                      <span className="truncate">{job.company}</span>
                      <span>•</span>
                      <span className="truncate text-slate-500">{job.city || job.location || 'Remote'}</span>
                    </p>

                    {/* Optional Salary */}
                    {hasSalary && (
                      <p className="text-xs font-semibold text-emerald-700 mt-2">
                        {job.salary_currency || '₹'} {job.salary_min ? job.salary_min.toLocaleString() : ''}
                        {job.salary_min && job.salary_max ? ' - ' : ''}
                        {job.salary_max ? job.salary_max.toLocaleString() : ''}
                      </p>
                    )}

                    {/* Skills pills */}
                    {Array.isArray(job.skills) && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {job.skills.slice(0, 3).map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 text-[10px] font-medium border border-slate-100"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions footer */}
                  <div className="pt-5 mt-5 border-t border-[#EBEBEB] flex items-center justify-between">
                    <Link
                      href={`/${locale}/jobs/${slug}`}
                      className="text-xs font-semibold text-[#171717] hover:text-violet-700 inline-flex items-center gap-1"
                    >
                      View Details <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      href={`/${locale}/omni?jobId=${job.id}&action=prepare`}
                      className="px-3 py-1.5 bg-[#171717] hover:bg-black text-white text-[11px] font-semibold rounded-lg transition-all inline-flex items-center gap-1"
                    >
                      <Bot className="w-3 h-3 text-violet-400" />
                      Apply with Omni
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center bg-white border border-[#EBEBEB] rounded-2xl p-8">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#171717] mb-1">
              No matching vacancies found
            </h3>
            <p className="text-xs text-[#4D4D4D] max-w-sm mx-auto mb-4">
              Try broadening your search keywords or clearing location filters.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setLocationFilter('');
                setSelectedRemote(null);
              }}
              className="px-4 py-2 bg-[#171717] text-white text-xs font-semibold rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Conversion Banner */}
        <section className="mt-16 bg-gradient-to-r from-violet-900 to-indigo-900 text-white rounded-3xl p-8 sm:p-12 shadow-sm">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-violet-200 text-xs font-semibold">
              <Bot className="w-3.5 h-3.5" /> Candidate AI Agent
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Let Omni Tailor Your Resume for Every Application
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Upload your experience once into your Candidate Application Profile. Omni analyzes job descriptions, scores ATS match gaps, and drafts targeted resumes.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href={`/${locale}/signup`}
                className="px-6 py-3 bg-white text-[#171717] hover:bg-slate-50 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm"
              >
                Create Free Profile
              </Link>
              <Link
                href={`/${locale}/resumes`}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                Build AI Resume
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EBEBEB] bg-white py-12 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8F8F8F]">
          <p>© {new Date().getFullYear()} ResumeForgeAI. Free public job discovery.</p>
          <div className="flex items-center gap-6">
            <Link href={`/${locale}/privacy`} className="hover:text-[#171717]">Privacy</Link>
            <Link href={`/${locale}/terms`} className="hover:text-[#171717]">Terms</Link>
            <Link href={`/${locale}/jobs`} className="hover:text-[#171717]">Explore Jobs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
