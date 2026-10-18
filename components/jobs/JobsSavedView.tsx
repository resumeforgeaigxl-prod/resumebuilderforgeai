'use client';

import React, { useState, useEffect } from 'react';
import {
    Save,
    Briefcase,
    Loader2,
    ArrowRight,
    MapPin,
    Trash2,
    CheckCircle2,
    Sparkles,
    X,
    AlertCircle,
    ExternalLink
} from '@/components/icons';
import { JobApplicationTracker } from '@/components/jobs/JobApplicationTracker';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface SavedApplication {
    id: string;
    job_id: string;
    status: string;
    updated_at: string;
    job_title?: string;
    company?: string;
    jobs?: {
        id?: string;
        company_name?: string;
        role_title?: string;
        company?: string;
        title?: string;
        location?: string;
        apply_url?: string;
        salary?: string;
        status?: string;
        closure_reason?: string;
    };
}

interface ReplacementItem {
    job: {
        id: string;
        title: string;
        company: string;
        location: string;
        apply_url: string;
        skills: string[];
    };
    relevanceScore: number;
    matchReasons: string[];
}

export function JobsSavedView() {
    const [savedJobs, setSavedJobs] = useState<SavedApplication[]>([]);
    const [loading, setLoading] = useState(true);

    // Replacements modal state
    const [replacementModalOpen, setReplacementModalOpen] = useState(false);
    const [activeClosedJob, setActiveClosedJob] = useState<{ id: string; title: string; company: string } | null>(null);
    const [replacementsLoading, setReplacementsLoading] = useState(false);
    const [replacementsList, setReplacementsList] = useState<ReplacementItem[]>([]);

    const fetchSavedJobs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/jobs/tracking');
            const data = await res.json();
            if (data.success && data.applications) {
                const saved = data.applications.filter((app: SavedApplication) => app.status === 'Saved');
                setSavedJobs(saved);
            }
        } catch (e) {
            console.error('Error fetching saved jobs:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSavedJobs();
    }, []);

    const handleUnsave = async (jobId: string) => {
        try {
            await fetch('/api/jobs/tracking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobId, status: 'Archived' }),
            });
            setSavedJobs(prev => prev.filter(j => j.job_id !== jobId));
        } catch (err) {
            console.error('Failed to unsave job:', err);
        }
    };

    const handleOpenReplacements = async (jobId: string, title: string, company: string) => {
        setActiveClosedJob({ id: jobId, title, company });
        setReplacementModalOpen(true);
        setReplacementsLoading(true);
        try {
            const res = await fetch(`/api/jobs/replacements/${jobId}?limit=3`);
            const data = await res.json();
            if (data.success && Array.isArray(data.replacements)) {
                setReplacementsList(data.replacements);
            } else {
                setReplacementsList([]);
            }
        } catch (err) {
            console.error('Failed to fetch replacements:', err);
            setReplacementsList([]);
        } finally {
            setReplacementsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in text-[#F5F5F5]">
            {/* Header */}
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h2 className="text-[28px] font-normal leading-none text-[#f4f5f7]" style={{ fontFamily: 'var(--font-display)' }}>Saved</h2>
                    <p className="mt-2 text-sm text-[#8b909a]">Roles you kept for later.</p>
                </div>
                <span className="text-3xl leading-none text-[#d7e4f0]" style={{ fontFamily: 'var(--font-display)' }}>{savedJobs.length}</span>
            </div>

            {loading ? (
                <div className="p-24 text-center bg-[#101010] border border-[#242424] rounded-xl">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#8B5CF6]" />
                    <p className="text-xs text-[#7E7E7E] mt-2 font-mono">Loading saved bookmarks...</p>
                </div>
            ) : savedJobs.length === 0 ? (
                <div className="p-16 text-center bg-[#101010] border border-[#242424] rounded-xl shadow-xs">
                    <Save className="w-10 h-10 text-[#7E7E7E] mx-auto mb-3 opacity-50" />
                    <h3 className="text-base font-semibold text-[#F5F5F5]">No Saved Jobs</h3>
                    <p className="text-xs text-[#7E7E7E] max-w-sm mx-auto mt-1 mb-4">
                        Click the bookmark icon on any position in Discover or Recommended to save it to your pipeline.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {savedJobs.map((app) => {
                        const title = app.job_title || app.jobs?.role_title || app.jobs?.title || 'Saved Position';
                        const company = app.company || app.jobs?.company_name || app.jobs?.company || 'Company';
                        const location = app.jobs?.location || 'Remote';
                        const applyUrl = app.jobs?.apply_url || '#';
                        const isClosed = app.jobs?.status === 'CLOSED';

                        return (
                            <div
                                key={app.id}
                                className={`p-6 bg-[#101010] border ${
                                    isClosed ? 'border-amber-800/40 bg-amber-950/10' : 'border-[#242424] hover:border-[#2D2D2D]'
                                } rounded-xl transition-all flex flex-col justify-between h-full shadow-xs group`}
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-9 h-9 rounded-lg bg-[#151515] border border-[#242424] flex items-center justify-center font-bold text-xs text-[#F5F5F5] uppercase">
                                                {company[0] || 'J'}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-xs text-[#F5F5F5]">
                                                    {company}
                                                </h3>
                                                <p className="text-[11px] text-[#7E7E7E] flex items-center gap-1">
                                                    <MapPin className="w-3 h-3 text-[#7E7E7E]" /> {location}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            {isClosed ? (
                                                <span className="px-2 py-0.5 rounded-full bg-amber-950/40 text-amber-400 border border-amber-800/40 text-[10px] font-mono font-semibold flex items-center gap-1">
                                                    <AlertCircle className="w-2.5 h-2.5 text-amber-400" /> Closed
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded-full bg-[#151515] text-[#BDBDBD] border border-[#242424] text-[10px] font-mono font-semibold">
                                                    Saved
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <h4 className="text-sm font-semibold text-[#F5F5F5] mb-2 leading-snug line-clamp-2">
                                        {title}
                                    </h4>

                                    <p className="text-[11px] text-[#7E7E7E] font-mono mb-4">
                                        Saved {formatDistanceToNow(new Date(app.updated_at), { addSuffix: true })}
                                    </p>
                                </div>

                                <div className="space-y-2 pt-3 border-t border-[#242424]">
                                    <div className="flex items-center gap-2">
                                        {isClosed ? (
                                            <button
                                                onClick={() => handleOpenReplacements(app.job_id, title, company)}
                                                className="flex-1 py-2 bg-[#151515] hover:bg-[#1f1f1f] text-[#F5F5F5] border border-[#242424] text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-xs"
                                            >
                                                Find Similar Roles <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                            </button>
                                        ) : applyUrl && applyUrl !== '#' ? (
                                            <a
                                                href={applyUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 py-2 bg-[#F5F5F5] hover:bg-white text-black text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-xs"
                                            >
                                                Apply Now <ArrowRight className="w-3.5 h-3.5" />
                                            </a>
                                        ) : (
                                            <span className="flex-1 py-2 bg-[#151515] text-[#7E7E7E] text-xs font-medium rounded-lg text-center border border-[#242424]">
                                                Direct Link Unavailable
                                            </span>
                                        )}

                                        <JobApplicationTracker jobId={app.job_id} />
                                    </div>

                                    <button
                                        onClick={() => handleUnsave(app.job_id)}
                                        className="w-full py-1 text-center text-[11px] text-[#7E7E7E] hover:text-rose-400 transition-colors"
                                    >
                                        Remove from Saved
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Replacements Modal */}
            {replacementModalOpen && activeClosedJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in">
                    <div className="bg-[#151515] rounded-2xl max-w-xl w-full border border-[#242424] shadow-xl overflow-hidden animate-scale-in text-[#F5F5F5]">
                        <div className="p-6 border-b border-[#242424] flex items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 text-amber-400 font-mono text-[11px] uppercase tracking-wider mb-1 font-semibold">
                                    <AlertCircle className="w-3.5 h-3.5" /> Vacancy Closed
                                </div>
                                <h3 className="text-base font-semibold text-[#F5F5F5]">
                                    {activeClosedJob.title} at {activeClosedJob.company}
                                </h3>
                                <p className="text-xs text-[#BDBDBD] mt-1">
                                    This posting is no longer accepting applications. We discovered these active alternatives matching your role:
                                </p>
                            </div>
                            <button
                                onClick={() => setReplacementModalOpen(false)}
                                className="p-1.5 rounded-lg text-[#7E7E7E] hover:text-[#F5F5F5] hover:bg-[#242424] transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                            {replacementsLoading ? (
                                <div className="py-12 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#8B5CF6]" />
                                    <p className="text-xs text-[#7E7E7E] font-mono mt-2">Discovering active replacements...</p>
                                </div>
                            ) : replacementsList.length === 0 ? (
                                <div className="py-8 text-center text-xs text-[#7E7E7E]">
                                    No exact replacements currently active in database. Try searching in Discover.
                                </div>
                            ) : (
                                replacementsList.map((item) => (
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
                                            <span className="px-2.5 py-1 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 text-xs font-mono font-semibold">
                                                {item.relevanceScore}% match
                                            </span>
                                        </div>

                                        {item.matchReasons && item.matchReasons.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 text-[10px]">
                                                {item.matchReasons.map((reason, idx) => (
                                                    <span key={idx} className="px-2 py-0.5 rounded-md bg-[#151515] border border-[#242424] text-[#BDBDBD]">
                                                        {reason}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="pt-2 border-t border-[#242424] flex items-center justify-between gap-2">
                                            <JobApplicationTracker jobId={item.job.id} />
                                            {item.job.apply_url && (
                                                <a
                                                    href={item.job.apply_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-1.5 bg-[#F5F5F5] hover:bg-white text-black text-xs font-semibold rounded-lg flex items-center gap-1 transition-all"
                                                >
                                                    Apply Now <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 bg-[#101010] border-t border-[#242424] flex justify-end">
                            <button
                                onClick={() => setReplacementModalOpen(false)}
                                className="px-4 py-2 bg-[#151515] border border-[#242424] hover:bg-[#202020] text-[#F5F5F5] text-xs font-semibold rounded-lg transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
