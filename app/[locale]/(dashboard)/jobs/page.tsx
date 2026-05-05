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
        <div className="space-y-8 max-w-7xl mx-auto">
            <PaymentSuccessBanner />

            {/* Standardized Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1E2A42] pb-8 mb-12">
                <div>
                    <div className="flex items-center gap-2 text-[#00D4A0] font-bold tracking-widest text-[10px] uppercase mb-4">
                        <Briefcase className="w-3.5 h-3.5" /> Intelligence Core
                    </div>
                    <h1 className="text-4xl font-bold tracking-tighter text-white uppercase">JobForge</h1>
                    <p className="text-slate-400 mt-2 text-lg">Discover global tech opportunities curated by AI across neural networks.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#0D1220] border border-[#1E2A42] rounded-xl text-[10px] font-black uppercase text-slate-500 tracking-widest whitespace-nowrap">
                        <Globe className="w-3 h-3 text-[#00D4A0]" />
                        Region: <span className="text-[#00D4A0]">{detectedCountry === 'IN' ? 'India' : detectedCountry === 'US' ? 'United States' : 'Global'}</span>
                    </div>
                    {userPlan === 'admin' && (
                        <button
                            onClick={triggerRefresh}
                            disabled={fetching}
                            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-bold transition-all disabled:opacity-50"
                        >
                            {fetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 text-[#00D4A0]" />}
                            {fetching ? 'Syncing...' : 'Refresh Board'}
                        </button>
                    )}
                </div>
            </header>


            {/* Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-md shadow-2xl">
                <form onSubmit={handleSearch} className="lg:col-span-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        placeholder="Search jobs..."
                        className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-white/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white"
                    />
                </form>

                <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                    <select
                        value={country}
                        onChange={e => updateFilters({ country: e.target.value, page: '1' })}
                        className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-white/10 rounded-2xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white cursor-pointer"
                    >
                        <option value="" className="bg-slate-900 text-white">All Regions</option>
                        <option value="India" className="bg-slate-900 text-white">India</option>
                        <option value="United States" className="bg-slate-900 text-white">United States</option>
                    </select>
                </div>

                <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                    <select
                        value={location}
                        onChange={e => updateFilters({ location: e.target.value, page: '1' })}
                        className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-white/10 rounded-2xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white cursor-pointer"
                    >
                        <option value="" className="bg-slate-900 text-white">Specific City</option>
                        <option value="Remote" className="bg-slate-900 text-white">Remote Only</option>
                        <option value="Bengaluru" className="bg-slate-900 text-white">Bengaluru</option>
                        <option value="Hyderabad" className="bg-slate-900 text-white">Hyderabad</option>
                        <option value="Pune" className="bg-slate-900 text-white">Pune</option>
                        <option value="Delhi" className="bg-slate-900 text-white">Delhi NCR</option>
                        <option value="San Francisco" className="bg-slate-900 text-white">San Francisco</option>
                        <option value="New York" className="bg-slate-900 text-white">New York</option>
                    </select>
                </div>

                <div className="relative">
                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                    <select
                        value={experience}
                        onChange={e => updateFilters({ experience: e.target.value, page: '1' })}
                        className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-white/10 rounded-2xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white cursor-pointer"
                    >
                        <option value="" className="bg-slate-900 text-white">All Experience</option>
                        <option value="fresher" className="bg-slate-900 text-white">Freshers (0-1 yr)</option>
                        <option value="intern" className="bg-slate-900 text-white">Internships</option>
                        <option value="experienced" className="bg-slate-900 text-white">Experienced</option>
                    </select>
                </div>

                <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                    <select
                        value={jobType}
                        onChange={e => updateFilters({ job_type: e.target.value, page: '1' })}
                        className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-white/10 rounded-2xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white cursor-pointer"
                    >
                        <option value="" className="bg-slate-900 text-white">All Job Types</option>
                        <option value="Full-time" className="bg-slate-900 text-white">Full-time</option>
                        <option value="Contract" className="bg-slate-900 text-white">Contract</option>
                        <option value="Internship" className="bg-slate-900 text-white">Internship</option>
                        <option value="Part-time" className="bg-slate-900 text-white">Part-time</option>
                    </select>
                </div>
            </div>

            {/* Results Info */}
            <div className="flex items-center justify-between px-2">
                <p className="text-sm text-slate-500">
                    Found <span className="text-indigo-400 font-bold">{totalJobs}</span> matching opportunities
                </p>
                {userPlan === 'free' && (
                    <Link href="/billing" className="text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Upgrade to unlock all {totalJobs} jobs
                    </Link>
                )}
            </div>

            {/* Jobs Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
                    <p className="text-slate-500 font-medium animate-pulse">Scanning the globe for jobs...</p>
                </div>
            ) : jobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {jobs.map(job => (
                        job.locked ? <LockedJobCard key={job.id} job={job} /> : <JobCard key={job.id} job={job} />
                    ))}
                </div>
            ) : (
                <div className="py-24 text-center bg-white/[0.02] border border-white/5 rounded-[3rem]">
                    <AlertCircle className="w-16 h-16 text-slate-800 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-400">Not found anywhere in our records</h3>
                    <p className="text-slate-600 mt-2 max-w-xs mx-auto text-sm">Try broadening your filters or syncing live jobs from our partners.</p>
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-8">
                    <button
                        disabled={page === 1}
                        onClick={() => updateFilters({ page: (page - 1).toString() })}
                        className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-2">
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
                                    className={`w-12 h-12 rounded-xl text-sm font-black transition-all border
                                        ${page === p
                                            ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
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
                        className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            )}
        </div>
    );
}

function JobCard({ job }: { job: Job }) {
    const postedDate = new Date(job.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

    return (
        <div className="group relative p-8 bg-slate-900/40 border border-white/5 rounded-[2.5rem] hover:bg-slate-900/60 hover:border-indigo-500/30 transition-all duration-500 flex flex-col h-full">
            <div className="absolute top-6 right-8 flex gap-2">
                <span className={`px-2 py-1 bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1 shadow-sm`}>
                    <Globe className="w-3 h-3 text-indigo-400" />
                    {job.country === 'India' ? 'IN' : 'US'}
                </span>
                {job.is_mnc && (
                    <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-widest rounded-lg">MNC</span>
                )}
            </div>

            <div className="flex gap-5 items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <span className="text-xl font-black text-indigo-400 uppercase">{job.company?.charAt(0)}</span>
                </div>
                <div className="min-w-0 pr-16">
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors truncate tracking-tight Otros">{job.title}</h3>
                    <p className="text-sm text-slate-400 font-medium flex items-center gap-2 mt-1">
                        <span className="truncate">{job.company}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                        <MapPin className="w-3.5 h-3.5 text-indigo-500/60" />
                        <span className="truncate">{job.location}</span>
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-white/[0.03] border border-white/5 rounded-full text-[10px] font-bold text-slate-400">{job.job_type}</span>
                {job.level === 'fresher' ? (
                    <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold text-emerald-400 tracking-tight">Fresher</span>
                ) : job.level === 'intern' ? (
                    <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-bold text-blue-400 tracking-tight">Internship</span>
                ) : (
                    <span className="px-3 py-1 bg-white/[0.03] border border-white/5 rounded-full text-[10px] font-bold text-slate-400 tracking-tight">Experienced</span>
                )}
                <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold text-indigo-400">{job.salary}</span>
            </div>

            <p className="text-sm text-slate-500 leading-relaxed mb-8 flex-1 line-clamp-3">
                {job.description || "Exciting opportunity to join the " + job.company + " team. This role offers high impact and professional growth in a dynamic environment."}
            </p>

            <div className="flex gap-4">
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
                    className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                >
                    Apply Now <ArrowRight className="w-4 h-4" />
                </button>
                <JobApplicationTracker jobId={job.id} />
            </div>

            <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">via {job.source}</span>
                <span className="text-[10px] font-bold text-slate-500">{postedDate}</span>
            </div>
        </div>
    );
}

function LockedJobCard({ job }: { job: Job }) {
    return (
        <div className="relative p-8 bg-slate-900/20 border border-white/5 rounded-[2.5rem] overflow-hidden group h-full">
            <div className="blur-md opacity-20 select-none pointer-events-none space-y-4">
                <div className="flex gap-5 items-start mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800" />
                    <div>
                        <div className="h-5 bg-slate-800 rounded w-48 mb-2" />
                        <div className="h-4 bg-slate-800 rounded w-32" />
                    </div>
                </div>
                <div className="h-4 bg-slate-800 rounded w-full" />
                <div className="h-4 bg-slate-800 rounded w-4/5" />
                <div className="h-10 bg-slate-800 rounded w-full" />
            </div>

            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-b from-transparent to-black/90">
                <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
                    <Lock className="w-8 h-8 text-amber-500" />
                </div>
                <h4 className="text-xl font-black text-white mb-2 uppercase tracking-tighter Otros">Premium Listing</h4>
                <p className="text-xs text-slate-400 mb-8 max-w-[240px] leading-relaxed">This {job.location} based role is available for Career plan members. Unlock 1000+ top-tier tech jobs.</p>
                <Link href="/billing" className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-2xl shadow-amber-500/30 active:scale-95">
                    Upgrade Account
                </Link>
            </div>
        </div>
    );
}
