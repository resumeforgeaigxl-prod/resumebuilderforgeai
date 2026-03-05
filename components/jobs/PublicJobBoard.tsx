'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Search, MapPin,
    ChevronLeft, ChevronRight, Loader2,
    AlertCircle, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

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

interface PublicJobBoardProps {
    initialRole?: string;
    initialLocation?: string;
    region?: string;
    lang?: string;
}

export default function PublicJobBoard({ initialRole = '', initialLocation = '', region = 'in', lang = 'en' }: PublicJobBoardProps) {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [searchInput, setSearchInput] = useState(initialRole);
    const [locationInput, setLocationInput] = useState(initialLocation);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                search: searchInput,
                location: locationInput,
                page: page.toString(),
                limit: '20'
            });
            const res = await fetch(`/api/jobs/list?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setJobs(data.jobs);
                setTotalPages(data.totalPages);

            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [searchInput, locationInput, page]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchJobs();
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 py-12">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                    {initialRole ? `${initialRole} Jobs` : 'Explore Tech Jobs'}
                    {initialLocation ? ` in ${initialLocation}` : ''}
                </h1>
                <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto">
                    Search and apply for the latest opportunities curated by ResumeForgeAI.
                </p>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-md shadow-2xl">
                <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        placeholder="Job title or skills..."
                        className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-white/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white"
                    />
                </form>

                <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                    <input
                        value={locationInput}
                        onChange={e => setLocationInput(e.target.value)}
                        placeholder="City or Remote..."
                        className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-white/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white"
                    />
                </div>

                <button
                    onClick={handleSearch}
                    className="py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                >
                    Search Jobs
                </button>
            </div>

            {/* Jobs Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
                    <p className="text-slate-500 font-medium animate-pulse">Finding the best matches...</p>
                </div>
            ) : jobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {jobs.map(job => (
                        <JobCard key={job.id} job={job} region={region} lang={lang} />
                    ))}
                </div>
            ) : (
                <div className="py-24 text-center bg-white/[0.02] border border-white/5 rounded-[3rem]">
                    <AlertCircle className="w-16 h-16 text-slate-800 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-400">No jobs found</h3>
                    <p className="text-slate-600 mt-2 max-w-xs mx-auto text-sm">Try adjusting your search criteria.</p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-8">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 disabled:opacity-30 transition-all"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <span className="text-slate-400 font-bold">Page {page} of {totalPages}</span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 disabled:opacity-30 transition-all"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            )}
        </div>
    );
}

function JobCard({ job, region, lang }: { job: Job, region: string, lang: string }) {
    const slug = `${job.title.toLowerCase().replace(/ /g, '-')}-${job.company.toLowerCase().replace(/ /g, '-')}-${job.id.slice(0, 8)}`;

    return (
        <div className="group relative p-8 bg-slate-900/40 border border-white/5 rounded-[2.5rem] hover:bg-slate-900/60 hover:border-indigo-500/30 transition-all duration-500 flex flex-col h-full">
            <div className="flex gap-5 items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <span className="text-xl font-black text-indigo-400 uppercase">{job.company?.charAt(0)}</span>
                </div>
                <div className="min-w-0 flex-1">
                    <Link href={`/${region}/${lang}/job/${slug}`}>
                        <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors truncate tracking-tight">{job.title}</h3>
                    </Link>
                    <p className="text-sm text-slate-400 font-medium flex items-center gap-2 mt-1">
                        <span className="truncate">{job.company}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                        <MapPin className="w-3.5 h-3.5 text-indigo-500/60" />
                        <span className="truncate">{job.location}</span>
                    </p>
                </div>
            </div>

            <p className="text-sm text-slate-500 leading-relaxed mb-8 flex-1 line-clamp-2">
                {job.description || "Exciting opportunity to join the " + job.company + " team."}
            </p>

            <Link
                href={`/${region}/${lang}/job/${slug}`}
                className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
            >
                View Details <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
    );
}
