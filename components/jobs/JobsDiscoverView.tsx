'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import {
    Search, MapPin, Filter,
    ChevronLeft, ChevronRight, Loader2,
    Globe, GraduationCap, Lock,
    AlertCircle, X
} from '@/components/icons';
import Link from 'next/link';
import { JobApplicationTracker } from '@/components/jobs/JobApplicationTracker';
import { CustomSelect, type CustomSelectOption } from '@/components/ui/CustomSelect';

const REGION_OPTIONS: CustomSelectOption[] = [
    { value: '', label: 'All Regions' },
    { value: 'India', label: 'India' },
    { value: 'United States', label: 'United States' },
];

const LOCATION_OPTIONS: CustomSelectOption[] = [
    { value: '', label: 'Specific City' },
    { value: 'Remote', label: 'Remote Only' },
    { value: 'Bengaluru', label: 'Bengaluru' },
    { value: 'Hyderabad', label: 'Hyderabad' },
    { value: 'Pune', label: 'Pune' },
    { value: 'Delhi', label: 'Delhi NCR' },
    { value: 'San Francisco', label: 'San Francisco' },
    { value: 'New York', label: 'New York' },
];

const EXPERIENCE_OPTIONS: CustomSelectOption[] = [
    { value: '', label: 'All Experience' },
    { value: 'fresher', label: 'Freshers (0-1 yr)' },
    { value: 'intern', label: 'Internships' },
    { value: 'experienced', label: 'Experienced' },
];

const JOB_TYPE_OPTIONS: CustomSelectOption[] = [
    { value: '', label: 'All Job Types' },
    { value: 'Full-time', label: 'Full-time' },
    { value: 'Contract', label: 'Contract' },
    { value: 'Internship', label: 'Internship' },
    { value: 'Part-time', label: 'Part-time' },
];

export interface Job {
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

export function JobsDiscoverView() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams();
    const locale = (params?.locale as string) || 'en-in';

    // Filters from URL
    const query = searchParams?.get('search') ?? '';
    const location = searchParams?.get('location') ?? '';
    const country = searchParams?.get('country') ?? '';
    const experience = searchParams?.get('experience') ?? searchParams?.get('type') ?? '';
    const jobType = searchParams?.get('job_type') ?? '';
    const remote = (searchParams?.get('remote') ?? '') === 'true';
    const page = parseInt(searchParams?.get('page') ?? '1');
    const jobId = searchParams?.get('id') ?? '';

    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetching, setFetching] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [totalJobs, setTotalJobs] = useState(0);
    const [userPlan, setUserPlan] = useState('free');
    const [detectedCountry, setDetectedCountry] = useState('Other');

    const [searchInput, setSearchInput] = useState(query);
    const [closedNotice, setClosedNotice] = useState<{
        job: Job;
        closureReason?: string;
        replacements: any[];
    } | null>(null);

    const handleApplyClick = async (job: Job) => {
        if (!job.apply_url) return;
        try {
            const res = await fetch(`/api/jobs/verify/${job.id}`);
            const data = await res.json();
            if (data.isClosed) {
                setClosedNotice({
                    job,
                    closureReason: data.verification?.closureReason || 'Position is no longer accepting applications',
                    replacements: data.replacements || [],
                });
                return;
            }
        } catch {
            // Non-fatal, fallback to direct open
        }

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
    };

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                search: query,
                location: location,
                country: country,
                remote: remote.toString(),
                experience: experience,
                job_type: jobType,
                page: page.toString(),
                limit: '20',
                ...(jobId ? { id: jobId } : {})
            });
            const res = await fetch(`/api/jobs/list?${queryParams.toString()}`);
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
    }, [query, location, country, remote, experience, jobType, page, jobId]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        updateFilters({ search: searchInput, page: '1' });
    };

    const updateFilters = (newFilters: Record<string, string>) => {
        const current = new URLSearchParams(searchParams ? Array.from(searchParams.entries()) : []);
        Object.entries(newFilters).forEach(([key, val]) => {
            if (val) current.set(key, val);
            else current.delete(key);
        });
        router.push(`/${locale}/jobs?${current.toString()}`);
    };

    const triggerRefresh = async () => {
        setFetching(true);
        try {
            await fetch('/api/jobs/fetch?source=all');
            await fetchJobs();
        } catch (e) {
            console.error('Sync failed', e);
        } finally {
            setFetching(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in text-[#F5F5F5]">
            <div className="grid grid-cols-1 gap-3 rounded-2xl border border-[#2a2c33] bg-[#0c0d10] p-4 sm:grid-cols-2 lg:grid-cols-5">
                <form onSubmit={handleSearch} className="relative lg:col-span-1">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b909a]" />
                    <input
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        placeholder="Search roles or companies"
                        className="h-11 w-full rounded-xl border border-[#2a2c33] bg-[#121214] pl-10 pr-4 text-sm text-[#f4f5f7] placeholder:text-[#8b909a] focus:border-[#3a3d46] focus:outline-none"
                    />
                </form>

                <CustomSelect
                    value={country}
                    onChange={val => updateFilters({ country: val, page: '1' })}
                    options={REGION_OPTIONS}
                    placeholder="All Regions"
                    icon={<Globe className="w-4 h-4 text-[#7E7E7E]" />}
                />

                <CustomSelect
                    value={location}
                    onChange={val => updateFilters({ location: val, page: '1' })}
                    options={LOCATION_OPTIONS}
                    placeholder="Specific City"
                    icon={<MapPin className="w-4 h-4 text-[#7E7E7E]" />}
                />

                <CustomSelect
                    value={experience}
                    onChange={val => updateFilters({ experience: val, page: '1' })}
                    options={EXPERIENCE_OPTIONS}
                    placeholder="All Experience"
                    icon={<GraduationCap className="w-4 h-4 text-[#7E7E7E]" />}
                />

                <CustomSelect
                    value={jobType}
                    onChange={val => updateFilters({ job_type: val, page: '1' })}
                    options={JOB_TYPE_OPTIONS}
                    placeholder="All Job Types"
                    icon={<Filter className="w-4 h-4 text-[#7E7E7E]" />}
                />
            </div>

            <div className="flex items-end justify-between gap-4 px-1">
                <p className="text-sm text-[#8b909a]">
                    <span className="mr-2 text-3xl leading-none text-[#d7e4f0]" style={{ fontFamily: 'var(--font-display)' }}>
                        {totalJobs.toLocaleString()}
                    </span>
                    roles · {detectedCountry === 'IN' ? 'India' : detectedCountry === 'US' ? 'United States' : 'Global'}
                </p>
                <div className="flex items-center gap-4">
                    {userPlan === 'free' && (
                        <Link href={`/${locale}/dashboard/billing`} className="text-sm text-[#d7e4f0] hover:text-white">
                            See all roles
                        </Link>
                    )}
                    {userPlan === 'admin' && (
                        <button
                            onClick={triggerRefresh}
                            disabled={fetching}
                            className="cursor-pointer text-sm text-[#8b909a] hover:text-[#f4f5f7] disabled:opacity-50"
                        >
                            {fetching ? 'Refreshing' : 'Refresh'}
                        </button>
                    )}
                </div>
            </div>

            {/* Jobs Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-28">
                    <Loader2 className="h-6 w-6 animate-spin text-[#9bb4c9]" />
                    <p className="mt-3 text-sm text-[#8b909a]">Loading roles</p>
                </div>
            ) : jobs.length === 0 ? (
                <div className="flex flex-col items-center rounded-2xl border border-[#2a2c33] bg-[#0c0d10] px-8 py-16 text-center">
                    <img src="/rail/rail-jobs.png?v=ice" alt="" width={48} height={48} className="h-12 w-12 object-contain" />
                    <h3 className="mt-4 text-2xl font-normal text-[#f4f5f7]" style={{ fontFamily: 'var(--font-display)' }}>No roles</h3>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-[#8b909a]">Try a wider search or another city.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {jobs.map(job => (
                        job.locked ? (
                            <LockedJobCard key={job.id} job={job} />
                        ) : (
                            <JobCardItem key={job.id} job={job} onApplyClick={handleApplyClick} />
                        )
                    ))}
                </div>
            )}

            {/* Closed Notice & Replacement Suggestions Modal */}
            {closedNotice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in">
                    <div className="bg-[#151515] rounded-2xl max-w-xl w-full border border-[#242424] shadow-xl overflow-hidden animate-scale-in">
                        <div className="p-6 border-b border-[#242424] flex items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 text-amber-400 font-mono text-[11px] uppercase tracking-wider mb-1 font-semibold">
                                    <AlertCircle className="w-3.5 h-3.5" /> Position Likely Closed
                                </div>
                                <h3 className="text-base font-semibold text-[#F5F5F5]">
                                    {closedNotice.job.title} at {closedNotice.job.company}
                                </h3>
                                <p className="text-xs text-[#BDBDBD] mt-1">
                                    {closedNotice.closureReason || 'This role appears to no longer accept applications.'} We found these similar active opportunities:
                                </p>
                            </div>
                            <button
                                onClick={() => setClosedNotice(null)}
                                className="p-1.5 rounded-lg text-[#7E7E7E] hover:text-[#F5F5F5] hover:bg-[#242424] transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-3.5 max-h-[55vh] overflow-y-auto">
                            {closedNotice.replacements.length === 0 ? (
                                <p className="text-xs text-[#7E7E7E] text-center py-6">
                                    No direct active replacements found for this vacancy.
                                </p>
                            ) : (
                                closedNotice.replacements.map((item: any) => (
                                    <div
                                        key={item.job.id}
                                        className="p-4 rounded-xl border border-[#242424] hover:border-[#2D2D2D] bg-[#101010] transition-all shadow-xs flex flex-col justify-between gap-3"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h4 className="text-sm font-semibold text-[#F5F5F5]">
                                                    {item.job.title}
                                                </h4>
                                                <p className="text-xs text-[#BDBDBD] font-medium mt-0.5">
                                                    {item.job.company} • <span className="text-[#7E7E7E]">{item.job.location}</span>
                                                </p>
                                            </div>
                                            <span className="px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 text-xs font-mono font-semibold">
                                                {item.relevanceScore}% match
                                            </span>
                                        </div>

                                        <div className="pt-2 border-t border-[#242424] flex items-center justify-between gap-2">
                                            <JobApplicationTracker jobId={item.job.id} />
                                            {item.job.apply_url && (
                                                <a
                                                    href={item.job.apply_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-1.5 bg-[#F5F5F5] hover:bg-white text-black text-xs font-semibold rounded-lg flex items-center gap-1 transition-all"
                                                >
                                                    Apply
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 bg-[#101010] border-t border-[#242424] flex items-center justify-between gap-3">
                            <button
                                onClick={() => {
                                    window.open(closedNotice.job.apply_url || '#', '_blank');
                                    setClosedNotice(null);
                                }}
                                className="text-xs text-[#BDBDBD] hover:text-[#F5F5F5] font-medium underline underline-offset-2"
                            >
                                Open Source Anyway
                            </button>
                            <button
                                onClick={() => setClosedNotice(null)}
                                className="px-4 py-2 bg-[#F5F5F5] hover:bg-white text-black text-xs font-semibold rounded-lg transition-colors"
                            >
                                View More Jobs
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-4">
                    <button
                        disabled={page <= 1}
                        onClick={() => updateFilters({ page: (page - 1).toString() })}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2a2c33] text-[#f4f5f7] disabled:opacity-30"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm text-[#8b909a]">
                        {page} / {totalPages}
                    </span>
                    <button
                        disabled={page >= totalPages}
                        onClick={() => updateFilters({ page: (page + 1).toString() })}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2a2c33] text-[#f4f5f7] disabled:opacity-30"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}

function JobCardItem({
    job,
    onApplyClick
}: {
    job: Job;
    onApplyClick: (job: Job) => void;
}) {
    const postedDate = job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Recent';

    return (
        <div className="flex h-full flex-col rounded-2xl border border-[#2a2c33] bg-[#0c0d10] p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#9bb4c9]/30 bg-[#12161c] text-sm text-[#d7e4f0]">
                    {(job.company?.[0] || 'J').toUpperCase()}
                </div>
                {job.is_mnc && <span className="text-[11px] uppercase tracking-[0.14em] text-[#8b909a]">Large company</span>}
            </div>
            <h3 className="mt-4 line-clamp-2 text-xl font-normal leading-snug text-[#f4f5f7]" style={{ fontFamily: 'var(--font-display)' }}>
                {job.title}
            </h3>
            <p className="mt-1 text-sm text-[#8b909a]">
                {job.company} · {job.location || 'Remote'}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
                {job.job_type && (
                    <span className="rounded-full border border-[#2a2c33] px-2.5 py-1 text-[11px] text-[#b4b8c2]">{job.job_type}</span>
                )}
                <span className="rounded-full border border-[#2a2c33] px-2.5 py-1 text-[11px] text-[#b4b8c2]">{job.level || 'Experienced'}</span>
                {job.salary && (
                    <span className="rounded-full border border-[#2a2c33] px-2.5 py-1 text-[11px] text-[#d7e4f0]">{job.salary}</span>
                )}
            </div>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#b4b8c2]">
                {job.description || `A role at ${job.company}.`}
            </p>
            <div className="mt-auto flex items-center gap-2 pt-5">
                <button
                    onClick={() => onApplyClick(job)}
                    className="h-9 flex-1 cursor-pointer rounded-full bg-[#f4f5f7] text-xs font-medium text-[#0c0d10] hover:bg-white"
                >
                    Apply
                </button>
                <JobApplicationTracker jobId={job.id} compact />
            </div>
            <p className="mt-3 text-xs text-[#8b909a]">
                {job.source || 'Listed'} · {postedDate}
            </p>
        </div>
    );
}

function LockedJobCard({ job }: { job: Job }) {
    const params = useParams();
    const locale = (params?.locale as string) || 'en-in';

    return (
        <div className="relative p-6 bg-[#101010] border border-[#242424] rounded-xl overflow-hidden group h-full shadow-xs">
            <div className="blur-[2px] opacity-25 select-none pointer-events-none space-y-4">
                <div className="flex gap-4 items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[#151515] border border-[#242424]" />
                    <div className="space-y-1.5">
                        <div className="h-4 bg-[#151515] rounded w-36" />
                        <div className="h-3 bg-[#151515] rounded w-24" />
                    </div>
                </div>
                <div className="h-4 bg-[#151515] rounded w-full" />
                <div className="h-3 bg-[#151515] rounded w-4/5" />
                <div className="h-8 bg-[#151515] rounded w-full mt-4" />
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505]/80 p-6 text-center">
                <Lock className="mb-3 h-4 w-4 text-[#9bb4c9]" />
                <h4 className="text-xl font-normal text-[#f4f5f7]" style={{ fontFamily: 'var(--font-display)' }}>On a paid plan</h4>
                <p className="mb-4 mt-2 max-w-[200px] text-sm leading-6 text-[#8b909a]">
                    Open the full list to see this role.
                </p>
                <Link
                    href={`/${locale}/dashboard/billing`}
                    className="rounded-full bg-[#f4f5f7] px-4 py-2 text-xs font-medium text-[#0c0d10] hover:bg-white"
                >
                    See plans
                </Link>
            </div>
        </div>
    );
}
