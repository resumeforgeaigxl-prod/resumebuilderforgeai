'use client'
export const dynamic = 'force-dynamic';
;

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Search, MapPin, Briefcase, Filter,
    ChevronLeft, ChevronRight, Loader2,
    RefreshCw, AlertCircle, Globe, GraduationCap, Lock, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { PaymentSuccessBanner } from '@/components/dashboard/payment-success-banner';
import { JobApplicationTracker } from '@/components/jobs/JobApplicationTracker';

interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    country: string;
    description: string | null;
    apply_url: string | null;
    job_type: string;
    salary: string;
    created_at: string;
    source: string;
    is_mnc: boolean;
    level: string;
    locked?: boolean;
}


export default function JobsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Filters from URL
    const query = searchParams?.get('search') ?? '';
    const location = searchParams?.get('location') ?? '';
    const country = searchParams?.get('country') ?? '';
    const experience = searchParams?.get('experience') ?? searchParams?.get('type') ?? '';
    const jobType = searchParams?.get('job_type') ?? '';
    const remote = (searchParams?.get('remote') ?? '') === 'true';
    const page = parseInt(searchParams?.get('page') ?? '1');

    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetching, setFetching] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [totalJobs, setTotalJobs] = useState(0);
    const [userPlan, setUserPlan] = useState('free');
    const [detectedCountry, setDetectedCountry] = useState('Other');

    const [searchInput, setSearchInput] = useState(query);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                search: query,
                location: location,
                country: country,
                remote: remote.toString(),
                experience: experience,
                job_type: jobType,
                page: page.toString(),
                limit: '20'
            });
            const res = await fetch(`/api/jobs/list?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setJobs(data.jobs);
                setTotalPages(data.totalPages);
                setTotalJobs(data.totalJobs);
                setUserPlan(data.userPlan);
                setDetectedCountry(data.userCountry);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [query, location, country, remote, experience, jobType, page]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        updateFilters({ search: searchInput, page: '1' });
    };

    const updateFilters = (newFilters: Record<string, string>) => {
        const current = new URLSearchParams(searchParams ? Array.from(searchParams.entries()) : []);
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value !== undefined) {
                if (value === '') current.delete(key);
                else current.set(key, value);
            }
            // If updating experience, clean up legacy 'type'
            if (key === 'experience') current.delete('type');
        });
        router.push(`/jobs?${current.toString()}`);
    };

    const triggerRefresh = async () => {
        setFetching(true);
        try {
            const res = await fetch('/api/jobs/fetch');
            const data = await res.json();
            if (data.success) {
                await fetchJobs();
            } else {
                alert(data.message || 'Fetch failed');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setFetching(false);
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto animate-premium-in">
            <PaymentSuccessBanner />

            {/* Standardized Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#EBEBEB] pb-8 mb-12">
                <div>
                    <div className="flex items-center gap-2 text-[#8F8F8F] font-medium tracking-normal text-xs uppercase mb-3 font-mono">
                        <Briefcase className="w-3.5 h-3.5" /> Intelligence Core
                    </div>
                    <h1 className="text-3xl md:text-4xl font-semibold tracking-tighter text-[#171717]">JobForge</h1>
                    <p className="text-[#4D4D4D] mt-2 text-base max-w-2xl">Discover global tech opportunities curated by AI across neural networks.</p>
                </div>

                <div className="flex items-center gap-3 md:gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FFFFFF] border border-[#EBEBEB] rounded-lg text-xs font-medium text-[#4D4D4D] whitespace-nowrap shadow-sm">
                        <Globe className="w-3.5 h-3.5 text-[#171717]" />
                        <span className="hidden xs:inline">Region:</span> <span className="text-[#171717] font-semibold">{detectedCountry === 'IN' ? 'India' : detectedCountry === 'US' ? 'United States' : 'Global'}</span>
                    </div>
                    {userPlan === 'admin' && (
                        <button
                            onClick={triggerRefresh}
                            disabled={fetching}
                            className="flex items-center gap-2 px-4 py-2 bg-[#FFFFFF] hover:bg-[#FAFAFA] border border-[#EBEBEB] rounded-md text-sm font-medium text-[#171717] transition-all disabled:opacity-50"
                        >
                            {fetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 text-[#171717]" />}
                            {fetching ? 'Syncing...' : 'Refresh Board'}
                        </button>
                    )}
                </div>
            </header>


            {/* Filters Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 bg-[#FFFFFF] border border-[#EBEBEB] p-4 rounded-xl shadow-sm">
                <form onSubmit={handleSearch} className="lg:col-span-1 relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F8F8F]" />
                    <input
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        placeholder="Search jobs..."
                        className="w-full pl-10 pr-4 py-2 bg-[#FFFFFF] border border-[#EBEBEB] rounded-md text-sm focus:outline-none focus:border-[#171717] transition-all text-[#171717] placeholder-[#8F8F8F]"
                    />
                </form>

                <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F8F8F] pointer-events-none" />
                    <select
                        value={country}
                        onChange={e => updateFilters({ country: e.target.value, page: '1' })}
                        className="w-full pl-10 pr-8 py-2 bg-[#FFFFFF] border border-[#EBEBEB] rounded-md text-sm appearance-none focus:outline-none focus:border-[#171717] transition-all text-[#171717] cursor-pointer"
                    >
                        <option value="">All Regions</option>
                        <option value="India">India</option>
                        <option value="United States">United States</option>
                    </select>
                </div>

                <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F8F8F] pointer-events-none" />
                    <select
                        value={location}
                        onChange={e => updateFilters({ location: e.target.value, page: '1' })}
                        className="w-full pl-10 pr-8 py-2 bg-[#FFFFFF] border border-[#EBEBEB] rounded-md text-sm appearance-none focus:outline-none focus:border-[#171717] transition-all text-[#171717] cursor-pointer"
                    >
                        <option value="">Specific City</option>
                        <option value="Remote">Remote Only</option>
                        <option value="Bengaluru">Bengaluru</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Pune">Pune</option>
                        <option value="Delhi">Delhi NCR</option>
                        <option value="San Francisco">San Francisco</option>
                        <option value="New York">New York</option>
                    </select>
                </div>

                <div className="relative">
                    <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F8F8F] pointer-events-none" />
                    <select
                        value={experience}
                        onChange={e => updateFilters({ experience: e.target.value, page: '1' })}
                        className="w-full pl-10 pr-8 py-2 bg-[#FFFFFF] border border-[#EBEBEB] rounded-md text-sm appearance-none focus:outline-none focus:border-[#171717] transition-all text-[#171717] cursor-pointer"
                    >
                        <option value="">All Experience</option>
                        <option value="fresher">Freshers (0-1 yr)</option>
                        <option value="intern">Internships</option>
                        <option value="experienced">Experienced</option>
                    </select>
                </div>

                <div className="relative">
                    <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F8F8F] pointer-events-none" />
                    <select
                        value={jobType}
                        onChange={e => updateFilters({ job_type: e.target.value, page: '1' })}
                        className="w-full pl-10 pr-8 py-2 bg-[#FFFFFF] border border-[#EBEBEB] rounded-md text-sm appearance-none focus:outline-none focus:border-[#171717] transition-all text-[#171717] cursor-pointer"
                    >
                        <option value="">All Job Types</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                        <option value="Part-time">Part-time</option>
                    </select>
                </div>
            </div>

            {/* Results Info */}
            <div className="flex items-center justify-between px-2">
                <p className="text-sm text-[#8F8F8F]">
                    Found <span className="text-[#171717] font-semibold">{totalJobs}</span> matching opportunities
                </p>
                {userPlan === 'free' && (
                    <Link href="/billing" className="text-sm font-medium text-[#D2750F] hover:underline transition-colors flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> Upgrade to unlock all {totalJobs} jobs
                    </Link>
                )}
            </div>

            {/* Jobs Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-[#171717]" />
                    <p className="text-[#8F8F8F] font-medium animate-pulse">Scanning the globe for jobs...</p>
                </div>
            ) : jobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {jobs.map(job => (
                        job.locked ? <LockedJobCard key={job.id} job={job} /> : <JobCard key={job.id} job={job} />
                    ))}
                </div>
            ) : (
                <div className="py-24 text-center bg-[#FFFFFF] border border-[#EBEBEB] rounded-2xl shadow-sm">
                    <AlertCircle className="w-12 h-12 text-[#8F8F8F] mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-[#171717]">Not found anywhere in our records</h3>
                    <p className="text-[#8F8F8F] mt-2 max-w-xs mx-auto text-sm">Try broadening your filters or syncing live jobs from our partners.</p>
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-8">
                    <button
                        disabled={page === 1}
                        onClick={() => updateFilters({ page: (page - 1).toString() })}
                        className="p-2 bg-[#FFFFFF] border border-[#EBEBEB] rounded-md hover:bg-[#FAFAFA] disabled:opacity-30 disabled:cursor-not-allowed transition-all text-[#171717]"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-1.5">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let p = page;
                            if (totalPages > 5) {
                                if (page <= 3) p = i + 1;
                                else if (page >= totalPages - 2) p = totalPages - 4 + i;
                                else p = page - 2 + i;
                            } else {
                                p = i + 1;
                            }
                            return (
                                <button
                                    key={p}
                                    onClick={() => updateFilters({ page: p.toString() })}
                                    className={`w-9 h-9 rounded-md text-sm font-medium transition-all border
                                        ${page === p
                                            ? 'bg-[#171717] border-[#171717] text-white'
                                            : 'bg-[#FFFFFF] border-[#EBEBEB] text-[#4D4D4D] hover:bg-[#FAFAFA]'
                                        }`}
                                >
                                    {p}
                                </button>
                            );
                        })}
                    </div>
                    <button
                        disabled={page === totalPages}
                        onClick={() => updateFilters({ page: (page + 1).toString() })}
                        className="p-2 bg-[#FFFFFF] border border-[#EBEBEB] rounded-md hover:bg-[#FAFAFA] disabled:opacity-30 disabled:cursor-not-allowed transition-all text-[#171717]"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
}

function JobCard({ job }: { job: Job }) {
    const postedDate = new Date(job.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

    return (
        <div className="relative flex flex-col h-full bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl p-6 hover:shadow-[0_2px_4px_rgba(0,0,0,0.02),0_8px_16px_rgba(0,0,0,0.04)] transition-all duration-300 group">
            <div className="absolute top-4 right-5 flex gap-2">
                <span className="px-2 py-1 bg-[#FAFAFA] border border-[#EBEBEB] text-[10px] font-medium uppercase rounded-md flex items-center gap-1 text-[#4D4D4D]">
                    <Globe className="w-3 h-3 text-[#4D4D4D]" />
                    {job.country === 'India' ? 'IN' : 'US'}
                </span>
                {job.is_mnc && (
                    <span className="px-2 py-1 bg-[#FFF9E6] border border-[#FFE0B2] text-[#B76E00] text-[10px] font-semibold uppercase rounded-md">MNC</span>
                )}
            </div>

            <div className="flex gap-4 items-start mb-5">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] flex items-center justify-center shrink-0">
                    <span className="text-lg md:text-xl font-semibold text-[#171717] uppercase">{job.company?.charAt(0)}</span>
                </div>
                <div className="min-w-0 pr-16">
                    <h3 className="text-base md:text-lg font-semibold text-[#171717] group-hover:text-[#0070f3] transition-colors truncate tracking-tight">{job.title}</h3>
                    <p className="text-xs md:text-sm text-[#4D4D4D] flex items-center gap-1.5 mt-1">
                        <span className="truncate">{job.company}</span>
                        <span className="w-1 h-1 rounded-full bg-[#EBEBEB]" />
                        <MapPin className="w-3.5 h-3.5 text-[#8F8F8F]" />
                        <span className="truncate">{job.location}</span>
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-5">
                <span className="px-2.5 py-0.5 bg-[#FAFAFA] border border-[#EBEBEB] rounded-full text-xs text-[#4D4D4D]">{job.job_type}</span>
                {job.level === 'fresher' ? (
                    <span className="px-2.5 py-0.5 bg-[#ECFDF5] border border-[#D1FAE5] text-[#065F46] rounded-full text-xs font-medium">Fresher</span>
                ) : job.level === 'intern' ? (
                    <span className="px-2.5 py-0.5 bg-[#EFF6FF] border border-[#DBEAFE] text-[#1E40AF] rounded-full text-xs font-medium">Internship</span>
                ) : (
                    <span className="px-2.5 py-0.5 bg-[#FAFAFA] border border-[#EBEBEB] rounded-full text-xs text-[#4D4D4D]">Experienced</span>
                )}
                <span className="px-2.5 py-0.5 bg-[#EEF2FF] border border-[#E0E7FF] text-[#3730A3] rounded-full text-xs font-medium">{job.salary}</span>
            </div>

            <p className="text-sm text-[#4D4D4D] leading-relaxed mb-6 flex-1 line-clamp-3">
                {job.description || "Exciting opportunity to join the " + job.company + " team. This role offers high impact and professional growth in a dynamic environment."}
            </p>

            <div className="flex gap-3">
                <button
                    onClick={async () => {
                        window.open(job.apply_url || '#', '_blank');
                        try {
                            await fetch('/api/jobs/track-apply', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    job_id: job.id,
                                    job_title: job.title,
                                    company: job.company,
                                    apply_url: job.apply_url
                                })
                            });
                        } catch (e) {
                            console.error('Failed to track application:', e);
                        }
                    }}
                    className="flex-1 py-2 bg-[#171717] hover:bg-[#333333] text-white text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    Apply Now <ArrowRight className="w-4 h-4" />
                </button>
                <JobApplicationTracker jobId={job.id} />
            </div>

            <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#EBEBEB]">
                <span className="text-[11px] font-mono text-[#8F8F8F]">via {job.source}</span>
                <span className="text-[11px] text-[#8F8F8F]">{postedDate}</span>
            </div>
        </div>
    );
}

function LockedJobCard({ job }: { job: Job }) {
    return (
        <div className="relative p-6 bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl overflow-hidden group h-full shadow-sm">
            <div className="blur-[2px] opacity-40 select-none pointer-events-none space-y-4">
                <div className="flex gap-5 items-start mb-6">
                    <div className="w-14 h-14 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB]" />
                    <div className="space-y-2">
                        <div className="h-5 bg-[#EBEBEB] rounded w-48" />
                        <div className="h-4 bg-[#EBEBEB] rounded w-32" />
                    </div>
                </div>
                <div className="h-4 bg-[#EBEBEB] rounded w-full" />
                <div className="h-4 bg-[#EBEBEB] rounded w-4/5" />
                <div className="h-10 bg-[#EBEBEB] rounded w-full" />
            </div>

            <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex flex-col items-center justify-center text-center p-6">
                <div className="w-12 h-12 bg-[#FFF9E6] border border-[#FFE0B2] rounded-xl flex items-center justify-center mb-4">
                    <Lock className="w-6 h-6 text-[#B76E00]" />
                </div>
                <h4 className="text-lg font-semibold text-[#171717] mb-1">Premium Listing</h4>
                <p className="text-xs text-[#4D4D4D] mb-6 max-w-[240px] leading-relaxed">This {job.location} based role is available for Career plan members. Unlock 1000+ top-tier tech jobs.</p>
                <Link href="/billing" className="px-6 py-2 bg-[#171717] hover:bg-[#333333] text-white text-xs font-medium rounded-md transition-all shadow-sm active:scale-95">
                    Upgrade Account
                </Link>
            </div>
        </div>
    );
}
