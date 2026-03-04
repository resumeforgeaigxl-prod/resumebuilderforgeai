'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Briefcase, MapPin, ExternalLink, Sparkles,
    Loader2, Info, AlertCircle, Star, RefreshCw, Globe, GraduationCap,
    Lock, Crown, Zap
} from 'lucide-react';
import Link from 'next/link';

interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string | null;
    apply_url: string | null;
    employment_type: string;
    posted_at: string;
    source: string;
    is_mnc: boolean;
    level: string;
    locked?: boolean;
}

interface JobsResponse {
    success: boolean;
    jobs: Job[];
    lockedJobs: Job[];
    totalJobs: number;
    visibleCount: number;
    lockedCount: number;
    userPlan: string;
    planLimit: number | null;
}

const SOURCE_COLOR: Record<string, string> = {
    JSearch: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Adzuna: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    Remotive: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
};

// ─── Locked Job Card ─────────────────────────────────────────────────────────
function LockedJobCard({ job }: { job: Job }) {
    return (
        <div className="relative p-6 bg-white/[0.015] border border-white/8 rounded-[2rem] overflow-hidden group cursor-not-allowed select-none">
            {/* Blurred content layer */}
            <div className="blur-[3px] pointer-events-none opacity-40">
                <div className="flex gap-3 items-start mb-3 pr-20">
                    <div className="w-11 h-11 shrink-0 rounded-2xl bg-gradient-to-br from-slate-700/30 to-slate-600/20 border border-white/5 flex items-center justify-center">
                        <span className="text-slate-500 font-black text-base uppercase">
                            {job.company?.charAt(0) || '?'}
                        </span>
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-[15px] text-slate-300 truncate leading-snug">{job.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {job.company} · {job.location}
                        </p>
                    </div>
                </div>
                <div className="h-3 bg-slate-700/40 rounded-full mb-2 w-full" />
                <div className="h-3 bg-slate-700/40 rounded-full mb-2 w-4/5" />
                <div className="h-3 bg-slate-700/40 rounded-full w-3/5" />
            </div>

            {/* Lock overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black/60 via-black/70 to-black/80 rounded-[2rem]">
                <div className="w-12 h-12 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-amber-500/10">
                    <Lock className="w-5 h-5 text-amber-400" />
                </div>
                <p className="text-xs font-black text-amber-300 uppercase tracking-widest mb-1">Premium Job</p>
                <p className="text-[11px] text-slate-400 text-center max-w-[150px] leading-relaxed">
                    Upgrade to Premium to unlock this job
                </p>
            </div>
        </div>
    );
}

// ─── Job Card ───────────────────────────────────────────────────────────────
function JobCard({ job }: { job: Job }) {
    const postedDate = (() => {
        try {
            return new Date(job.posted_at).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric'
            });
        } catch { return '—'; }
    })();

    const shortDesc = (job.description || '').trim().slice(0, 200) + (job.description && job.description.length > 200 ? '…' : '');

    const handleATSMatch = () => {
        alert(
            `To check ATS Match:\n\n` +
            `1. Open your Resume Builder.\n` +
            `2. Scroll to the "JD Matcher" panel.\n` +
            `3. Paste this Job Description:\n\n"${job.title} at ${job.company}"`
        );
    };

    const handleCoverLetter = () => {
        alert(
            `To generate a Cover Letter:\n\n` +
            `1. Open your Resume Builder.\n` +
            `2. Click "Generate Cover Letter" in the sidebar.\n` +
            `3. Fill Role: "${job.title}", Company: "${job.company}".\n` +
            `4. Paste the job description and generate.`
        );
    };

    return (
        <div className="p-6 bg-white/[0.025] border border-white/10 rounded-[2rem] hover:bg-white/[0.04] hover:border-white/20 transition-all group flex flex-col relative overflow-hidden">
            {/* Badges row */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5">
                {job.level === 'fresher' && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/15 border border-green-500/25 rounded-lg text-[10px] font-bold text-green-400 uppercase tracking-wider">
                        <GraduationCap className="w-3 h-3" /> Fresher
                    </span>
                )}
                {job.is_mnc && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/15 border border-amber-500/25 rounded-lg text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                        <Star className="w-3 h-3" /> MNC
                    </span>
                )}
            </div>

            {/* Header */}
            <div className="flex gap-3 items-start mb-3 pr-24">
                <div className="w-11 h-11 shrink-0 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 flex items-center justify-center">
                    <span className="text-blue-300 font-black text-base uppercase">
                        {job.company?.charAt(0) || '?'}
                    </span>
                </div>
                <div className="min-w-0">
                    <h3 className="font-bold text-[15px] text-slate-100 truncate leading-snug">{job.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <span className="font-semibold text-slate-300 truncate max-w-[120px]">{job.company}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700 shrink-0" />
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{job.location}</span>
                    </p>
                </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-500 leading-relaxed mb-5 flex-1">{shortDesc}</p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                <button
                    type="button"
                    onClick={() => {
                        fetch('/api/jobs/track-apply', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                job_id: job.id,
                                job_title: job.title,
                                company: job.company,
                                apply_url: job.apply_url
                            })
                        }).catch(() => { });
                        window.open(job.apply_url || '#', '_blank', 'noreferrer');
                    }}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-blue-900/20"
                >
                    <ExternalLink className="w-3.5 h-3.5" /> Apply Now
                </button>
                <button
                    onClick={handleATSMatch}
                    className="px-3 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold rounded-xl transition-all"
                    title="Check ATS Match"
                >
                    ATS Match
                </button>
                <button
                    onClick={handleCoverLetter}
                    className="px-3 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/20 text-purple-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                    title="Generate Cover Letter"
                >
                    <Sparkles className="w-3.5 h-3.5" /> Cover Letter
                </button>
            </div>

            {/* Footer */}
            <div className="mt-3 flex items-center justify-between">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${SOURCE_COLOR[job.source] || 'bg-white/5 text-slate-500 border-white/10'}`}>
                    via {job.source}
                </span>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-600 uppercase tracking-widest font-bold">
                    <Globe className="w-3 h-3" />
                    {job.employment_type || 'Fulltime'}
                    <span className="w-1 h-1 rounded-full bg-slate-800" />
                    {postedDate}
                </div>
            </div>
        </div>
    );
}

// ─── Load More Button ────────────────────────────────────────────────────────
function LoadMoreButton({ remaining, color, onClick }: { remaining: number; color: string; onClick: () => void }) {
    return (
        <div className="flex justify-center mt-5">
            <button
                type="button"
                onClick={onClick}
                className={`px-6 py-2.5 ${color} text-xs font-bold rounded-xl transition-all`}
            >
                Load More ({remaining} remaining)
            </button>
        </div>
    );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyState({ label }: { label: string }) {
    return (
        <div className="col-span-full py-16 flex flex-col items-center justify-center text-center space-y-3 bg-white/[0.02] border border-white/10 rounded-[2rem]">
            <Info className="w-10 h-10 text-slate-700" />
            <h4 className="font-bold text-slate-400">No {label} found yet</h4>
            <p className="text-xs text-slate-600 max-w-xs">
                Click <span className="text-blue-400 font-semibold">Refresh Feed</span> to pull live listings from JSearch &amp; Adzuna.
            </p>
        </div>
    );
}

// ─── Plan Banner ─────────────────────────────────────────────────────────────
function PlanBanner({
    visible, total, plan, lockedCount
}: {
    visible: number; total: number; plan: string; lockedCount: number;
}) {
    const isPaid = plan !== 'free';
    const bgClass = isPaid
        ? 'bg-emerald-500/5 border-emerald-500/15'
        : 'bg-amber-500/8 border-amber-500/20';

    return (
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border ${bgClass} mb-5`}>
            <div className="flex items-center gap-3">
                {isPaid
                    ? <Crown className="w-4 h-4 text-emerald-400 shrink-0" />
                    : <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                }
                <div>
                    <p className="text-sm font-bold text-white">
                        Showing <span className={isPaid ? 'text-emerald-400' : 'text-amber-400'}>{visible}</span> of <span className="text-white">{total}</span> jobs
                    </p>
                    {!isPaid && lockedCount > 0 && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                            🔒 {lockedCount} jobs locked — Upgrade to Premium to unlock more jobs
                        </p>
                    )}
                </div>
            </div>
            {!isPaid && lockedCount > 0 && (
                <Link
                    href="/billing"
                    className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/20"
                >
                    <Crown className="w-3.5 h-3.5" /> Upgrade to Premium
                </Link>
            )}
        </div>
    );
}

// ─── Upgrade Gate (shown after locked jobs) ───────────────────────────────────
function UpgradeGate({ count, plan }: { count: number; plan: string }) {
    if (plan !== 'free' || count === 0) return null;
    return (
        <div className="mt-6 p-6 rounded-[2rem] bg-gradient-to-br from-amber-500/10 via-orange-500/8 to-rose-500/5 border border-amber-500/20 text-center relative overflow-hidden">
            {/* Glow */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="w-14 h-14 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 relative">
                <Crown className="w-7 h-7 text-amber-400" />
            </div>
            <h4 className="text-lg font-black text-white mb-2">
                🔒 {count} More Jobs Available
            </h4>
            <p className="text-sm text-slate-400 mb-5 max-w-md mx-auto">
                You&apos;re on the <span className="text-amber-400 font-bold">Free Plan</span>. Upgrade to Premium to unlock all {count} remaining jobs and apply instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                    href="/billing"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-xl shadow-amber-500/20"
                >
                    <Crown className="w-4 h-4" /> Upgrade to Premium
                </Link>
                <Link
                    href="/billing"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm rounded-2xl transition-all"
                >
                    View Plans
                </Link>
            </div>
        </div>
    );
}

// ─── Section ─────────────────────────────────────────────────────────────────
interface SectionData {
    jobs: Job[];
    lockedJobs: Job[];
    totalJobs: number;
    visibleCount: number;
    lockedCount: number;
    userPlan: string;
    planLimit: number | null;
}

function JobSection({
    icon,
    title,
    accentClass,
    bgAccent,
    loaderColor,
    moreColor,
    loading,
    data,
    visible,
    onLoadMore,
}: {
    icon: React.ReactNode;
    title: string;
    accentClass: string;
    bgAccent: string;
    loaderColor: string;
    moreColor: string;
    loading: boolean;
    data: SectionData | null;
    visible: number;
    onLoadMore: () => void;
}) {
    const allDisplayJobs = [...(data?.jobs || []), ...(data?.lockedJobs || [])];
    const visibleDisplayJobs = allDisplayJobs.slice(0, visible);
    const remainingVisible = allDisplayJobs.length - visibleDisplayJobs.length;

    return (
        <section>
            <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 ${bgAccent} rounded-lg`}>{icon}</div>
                <h3 className={`text-lg font-bold ${accentClass}`}>{title}</h3>
                <span className={`px-2 py-0.5 ${bgAccent} border border-white/10 rounded-md text-[11px] font-bold ${accentClass}`}>
                    {data ? data.totalJobs : '—'}
                </span>
            </div>

            {/* Plan banner */}
            {data && data.lockedCount > 0 && (
                <PlanBanner
                    visible={data.visibleCount}
                    total={data.totalJobs}
                    plan={data.userPlan}
                    lockedCount={data.lockedCount}
                />
            )}

            {loading ? (
                <div className={`flex items-center justify-center py-12 opacity-50`}>
                    <Loader2 className={`w-8 h-8 animate-spin ${loaderColor}`} />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {allDisplayJobs.length === 0
                            ? <EmptyState label={title} />
                            : visibleDisplayJobs.map(job =>
                                job.locked
                                    ? <LockedJobCard key={job.id} job={job} />
                                    : <JobCard key={job.id} job={job} />
                            )
                        }
                    </div>
                    {/* Load more for visible (non-locked) portion */}
                    {remainingVisible > 0 && (
                        <LoadMoreButton
                            remaining={remainingVisible}
                            color={moreColor}
                            onClick={onLoadMore}
                        />
                    )}
                    {/* Upgrade gate after locked jobs */}
                    {data && <UpgradeGate count={data.lockedCount} plan={data.userPlan} />}
                </>
            )}
        </section>
    );
}


// ─── Main Board ──────────────────────────────────────────────────────────────
export function JobBoard() {
    const [mncData, setMncData] = useState<SectionData | null>(null);
    const [fresherData, setFresherData] = useState<SectionData | null>(null);
    const [latestData, setLatestData] = useState<SectionData | null>(null);
    const [loadingMnc, setLoadingMnc] = useState(true);
    const [loadingFresher, setLoadingFresher] = useState(true);
    const [loadingLatest, setLoadingLatest] = useState(true);
    const [fetching, setFetching] = useState(false);

    // Visible counts — start at 10, Load More adds 10
    const [visibleMnc, setVisibleMnc] = useState(10);
    const [visibleFresher, setVisibleFresher] = useState(10);
    const [visibleLatest, setVisibleLatest] = useState(10);

    const fetchSection = useCallback(async (section: string): Promise<SectionData | null> => {
        const res = await fetch(`/api/jobs/list?section=${section}`);
        const data: JobsResponse = await res.json();
        if (!data.success) return null;
        return {
            jobs: data.jobs || [],
            lockedJobs: data.lockedJobs || [],
            totalJobs: data.totalJobs ?? 0,
            visibleCount: data.visibleCount ?? 0,
            lockedCount: data.lockedCount ?? 0,
            userPlan: data.userPlan ?? 'free',
            planLimit: data.planLimit ?? null,
        };
    }, []);

    const loadMnc = useCallback(async () => {
        setLoadingMnc(true);
        try { setMncData(await fetchSection('mnc')); }
        catch (e) { console.error('MNC load error:', e); }
        finally { setLoadingMnc(false); }
    }, [fetchSection]);

    const loadFresher = useCallback(async () => {
        setLoadingFresher(true);
        try { setFresherData(await fetchSection('fresher')); }
        catch (e) { console.error('Fresher load error:', e); }
        finally { setLoadingFresher(false); }
    }, [fetchSection]);

    const loadLatest = useCallback(async () => {
        setLoadingLatest(true);
        try { setLatestData(await fetchSection('latest')); }
        catch (e) { console.error('Latest load error:', e); }
        finally { setLoadingLatest(false); }
    }, [fetchSection]);

    useEffect(() => {
        loadMnc();
        loadFresher();
        loadLatest();
    }, [loadMnc, loadFresher, loadLatest]);

    const triggerFetch = async () => {
        setFetching(true);
        try {
            const res = await fetch('/api/jobs/fetch');
            const data = await res.json();
            if (data.success) {
                await Promise.all([loadMnc(), loadFresher(), loadLatest()]);
            } else {
                alert(data.message || data.error || 'Fetch failed — check API keys.');
            }
        } catch (e) {
            console.error('Trigger fetch error:', e);
        } finally {
            setFetching(false);
        }
    };

    return (
        <div className="space-y-14">
            {/* Board Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-blue-400" />
                        Job Board
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">
                        Powered by JSearch · Adzuna · Updated Daily
                    </p>
                </div>
                <button
                    onClick={triggerFetch}
                    disabled={fetching}
                    className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                    {fetching
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <RefreshCw className="w-3.5 h-3.5 text-blue-400" />}
                    {fetching ? 'Fetching…' : 'Refresh Feed'}
                </button>
            </div>

            {/* ── Section 1: Featured MNC Jobs ──────────────────────────────── */}
            <JobSection
                icon={<Star className="w-4 h-4 text-amber-400" />}
                title="Featured MNC Jobs"
                accentClass="text-amber-200"
                bgAccent="bg-amber-500/15"
                loaderColor="text-amber-400"
                moreColor="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400"
                loading={loadingMnc}
                data={mncData}
                visible={visibleMnc}
                onLoadMore={() => setVisibleMnc(v => v + 10)}
            />

            {/* ── Section 2: Fresher & Intern Jobs ────────────────────────────── */}
            <JobSection
                icon={<GraduationCap className="w-4 h-4 text-green-400" />}
                title="Fresher & Intern Jobs"
                accentClass="text-green-200"
                bgAccent="bg-green-500/15"
                loaderColor="text-green-400"
                moreColor="bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400"
                loading={loadingFresher}
                data={fresherData}
                visible={visibleFresher}
                onLoadMore={() => setVisibleFresher(v => v + 10)}
            />

            {/* ── Section 3: Latest Tech Jobs ──────────────────────────────── */}
            <JobSection
                icon={<Briefcase className="w-4 h-4 text-blue-400" />}
                title="Latest Tech Jobs"
                accentClass=""
                bgAccent="bg-blue-500/15"
                loaderColor="text-blue-400"
                moreColor="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400"
                loading={loadingLatest}
                data={latestData}
                visible={visibleLatest}
                onLoadMore={() => setVisibleLatest(v => v + 10)}
            />

            {/* Disclaimer */}
            <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-yellow-500/50 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-500 leading-relaxed italic">
                    <span className="font-bold text-yellow-500/60 uppercase not-italic">Disclaimer: </span>
                    Jobs are aggregated via licensed third-party APIs (JSearch by RapidAPI, Adzuna). ResumeForgeAI is not affiliated with listed companies. Apply links redirect to official external career pages.
                </p>
            </div>
        </div>
    );
}
