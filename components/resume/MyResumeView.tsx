'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { ResumeCard, determineAtsStatus } from '@/components/dashboard/resume-card';
import { CreateResumeButton } from '@/components/dashboard/create-resume-button';
import {
    FileText,
    ChevronLeft,
    ChevronRight,
    HelpCircle,
    Search
} from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface ResumeListItem {
    id: string;
    title: string;
    updated_at: string;
    created_at?: string;
    version_name?: string | null;
    ats_score?: number | null;
    score?: number | null;
    resume_json?: { version_name?: string; targetRole?: string; targetJob?: string; title?: string };
}

// Fixed-size tiles preserve the reference grid at every banner width.
function PrimaryPixelField() {
    const id = React.useId().replace(/:/g, '');
    const patternId = `primary-pixels-${id}`;
    const lightId = `primary-light-${id}`;
    const maskId = `primary-mask-${id}`;

    return (
        <svg aria-hidden="true" focusable="false" className="h-full w-full" width="100%" height="100%">
            <defs>
                <pattern id={patternId} width="6.4" height="19.2" patternUnits="userSpaceOnUse">
                    <rect width="4" height="4" fill="#d7e4f0" opacity="0.22" />
                    <rect y="6.4" width="4" height="4" fill="#d7e4f0" opacity="0.88" />
                    <rect y="12.8" width="4" height="4" fill="#d7e4f0" opacity="0.5" />
                </pattern>
                <linearGradient id={lightId} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="white" stopOpacity="0.34" />
                    <stop offset="62%" stopColor="white" stopOpacity="0.34" />
                    <stop offset="100%" stopColor="white" stopOpacity="1" />
                </linearGradient>
                <mask id={maskId}>
                    <rect width="100%" height="100%" fill={`url(#${lightId})`} />
                </mask>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${patternId})`} mask={`url(#${maskId})`} />
        </svg>
    );
}
interface MyResumeViewProps {
    resumes: ResumeListItem[];
    primaryResume: ResumeListItem | null;
    totalCount: number;
    currentPage: number;
    totalPages: number;
    locale: string;
    error?: string | null;
    onSelectTab?: (tab: string) => void;
}

export function MyResumeView({
    resumes,
    primaryResume,
    totalCount,
    currentPage,
    totalPages,
    locale,
    error,
    onSelectTab
}: MyResumeViewProps) {
    const searchParams = useSearchParams();
    const query = searchParams?.get('q') || '';
    const sort = searchParams?.get('sort') || 'updated';
    const atsStatus = determineAtsStatus(primaryResume?.ats_score ?? primaryResume?.score);
    const pageHref = (page: number) => {
        const params = new URLSearchParams(searchParams?.toString());
        params.set('page', String(page));
        return '/' + locale + '/resumes?' + params.toString();
    };

    return (
        <div className="space-y-6 animate-fade-in text-[#F5F5F5]">
            {/* Primary / Canonical Resume Spotlight */}
            {primaryResume && (
                <div className="relative overflow-hidden rounded-2xl border border-[#2a2c33] bg-[#0c0d10]">
                    <div className="pointer-events-none absolute inset-0">
                        <PrimaryPixelField />
                    </div>
                    <div className="relative flex items-center gap-3 px-5 py-3">
                        <img src="/rail/rail-resume.png?v=ice" alt="" width={40} height={40} className="h-10 w-10 shrink-0 object-contain" />
                        <div
                            className="min-w-0 rounded-lg"
                            style={{
                                backgroundColor: 'rgba(12, 13, 16, 0.78)',
                                boxShadow: '0 0 18px 14px rgba(12, 13, 16, 0.78)',
                            }}
                        >
                            <p className="text-[11px] uppercase tracking-[0.18em] text-[#8b909a]">Primary</p>
                            <h2
                                className="mt-1 truncate text-[26px] font-normal leading-none text-[#f4f5f7]"
                                style={{ fontFamily: 'var(--font-display)' }}
                            >
                                {primaryResume.title}
                            </h2>
                            <p className="mt-1.5 text-xs text-[#8b909a]">
                                Updated {formatDistanceToNow(new Date(primaryResume.updated_at), { addSuffix: true })}
                                {primaryResume.version_name ? ` · ${primaryResume.version_name}` : ''}
                                {` · ${atsStatus.label}`}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Error banner */}
            {error && (
                <div className="p-8 text-center border border-rose-900/40 bg-rose-950/20 text-rose-400 rounded-xl">
                    <p className="font-semibold text-sm">Failed to sync resume repository.</p>
                </div>
            )}

            {/* Empty State */}
            {!error && !primaryResume && !query && resumes.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-center bg-[#101010] border border-[#242424] rounded-xl shadow-sm">
                    <div className="w-16 h-16 mb-6 rounded-xl bg-[#151515] border border-[#242424] flex items-center justify-center text-[#F5F5F5] shadow-sm">
                        <FileText className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#F5F5F5] mb-2 tracking-tight">Create your first resume</h3>
                    <p className="text-[#A3A3A3] mb-8 max-w-sm mx-auto text-sm leading-relaxed font-normal">
                        Build a resume to start checking your ATS score and tailoring it for jobs.
                    </p>
                    <CreateResumeButton variant="secondary" />
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#242424]">
                        <div>
                            <h3 className="text-sm font-semibold text-[#F5F5F5] tracking-tight">
                                Your resumes ({totalCount})
                            </h3>
                            <p className="text-xs text-[#A3A3A3]">
                                Manage your main resume and versions tailored for different roles.
                            </p>
                        </div>
                        <CreateResumeButton />
                    </div>

                    <form action={'/' + locale + '/resumes'} className="flex flex-col gap-3 sm:flex-row sm:items-end" key={query + sort}>
                        <label className="flex-1 text-xs text-[#BDBDBD]">
                            Search by title
                            <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-[#2a2c33] bg-[#0c0d10] px-3 focus-within:border-[#3a3d46]">
                                <Search className="h-4 w-4 shrink-0 text-[#A3A3A3]" aria-hidden="true" />
                                <input name="q" defaultValue={query} maxLength={100} placeholder="Search resumes…" className="h-10 min-w-0 w-full bg-transparent text-sm text-white outline-none" />
                            </div>
                        </label>
                        <label className="text-xs text-[#BDBDBD]">
                            Sort by
                            <select name="sort" defaultValue={sort} className="mt-1.5 block h-10 w-full rounded-xl border border-[#2a2c33] bg-[#0c0d10] px-3 text-sm text-white focus:border-[#3a3d46] sm:w-44">
                                <option value="updated">Recently updated</option>
                                <option value="oldest">Oldest updated</option>
                                <option value="title">Title A–Z</option>
                            </select>
                        </label>
                        <Button type="submit" variant="outline" className="h-10 border-[#303030] text-[#F5F5F5]">Apply</Button>
                        {query && <Link href={'/' + locale + '/resumes'} className="py-2.5 text-sm text-[#9bb4c9]">Clear</Link>}
                    </form>
                    {resumes.length === 0 && !error && <p className="py-8 text-sm text-[#BDBDBD]" role="status">No resumes match your search. Try a different title.</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pt-2">
                        {resumes.map((resume) => (
                            <ResumeCard
                                key={resume.id}
                                id={resume.id}
                                title={resume.title}
                                updatedAt={resume.updated_at}
                                createdAt={resume.created_at}
                                versionName={resume.version_name ?? resume.resume_json?.version_name ?? undefined}
                                atsScore={resume.ats_score ?? resume.score ?? null}
                                isPrimary={resume.id === primaryResume?.id}
                                targetRole={resume.resume_json?.targetRole || resume.resume_json?.targetJob || resume.resume_json?.title}
                                onTailor={() => onSelectTab?.('tailor')}
                            />
                        ))}

                        {/* Support Card */}
                        <Link href={`/${locale}/support`} className="group h-full">
                            <div className="bg-[#101010] border border-[#242424] rounded-xl p-5 hover:border-[#2D2D2D] hover:bg-[#131313] transition-all h-full min-h-[250px] flex flex-col items-center justify-center text-center">
                                <div className="w-10 h-10 rounded-lg bg-[#151515] border border-[#242424] flex items-center justify-center mb-3 group-hover:border-[#2D2D2D] transition-all">
                                    <HelpCircle className="w-5 h-5 text-[#A3A3A3] group-hover:text-[#F5F5F5] transition-colors" />
                                </div>
                                <h4 className="font-semibold text-[#F5F5F5] mb-1 tracking-tight text-sm">Need Help?</h4>
                                <p className="text-xs text-[#A3A3A3] font-normal max-w-[180px]">
                                    Ecosystem documentation, guides & support
                                </p>
                            </div>
                        </Link>
                    </div>
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-12 border-t border-[#242424]">
                    <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className={`rounded-lg border border-[#242424] bg-[#101010] text-[#A3A3A3] ${currentPage <= 1 ? 'opacity-30 pointer-events-none' : 'hover:bg-[#151515] hover:text-[#F5F5F5]'}`}
                    >
                        <Link href={pageHref(currentPage - 1)} aria-label="Previous page">
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                    </Button>

                    <div className="flex items-center gap-1.5">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <Link
                                key={p}
                                href={pageHref(p)} aria-current={currentPage === p ? "page" : undefined}
                                className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-medium transition-all border
                                    ${currentPage === p
                                        ? 'bg-[#151515] border-[#2D2D2D] text-[#F5F5F5] font-semibold'
                                        : 'bg-[#101010] border-[#242424] text-[#A3A3A3] hover:bg-[#151515] hover:text-[#F5F5F5]'
                                    }`}
                            >
                                {p}
                            </Link>
                        ))}
                    </div>

                    <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className={`rounded-lg border border-[#242424] bg-[#101010] text-[#A3A3A3] ${currentPage >= totalPages ? 'opacity-30 pointer-events-none' : 'hover:bg-[#151515] hover:text-[#F5F5F5]'}`}
                    >
                        <Link href={pageHref(currentPage + 1)} aria-label="Next page">
                            <ChevronRight className="w-5 h-5" />
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
