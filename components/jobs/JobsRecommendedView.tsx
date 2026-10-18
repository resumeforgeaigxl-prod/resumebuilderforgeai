'use client';

import React, { useState, useEffect } from 'react';
import {
    Sparkles,
    Target,
    FileText,
    Loader2,
    MapPin,
    ArrowRight,
    CheckCircle2,
    Briefcase,
    Building2,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    ExternalLink,
} from '@/components/icons';
import { JobApplicationTracker } from '@/components/jobs/JobApplicationTracker';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { CandidateJobMatchResult } from '@/lib/matching/types';
import { CustomSelect } from '@/components/ui/CustomSelect';

export function JobsRecommendedView() {
    const params = useParams();
    const locale = (params?.locale as string) || 'en-in';

    const [recommendations, setRecommendations] = useState<CandidateJobMatchResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
    const [filterCategory, setFilterCategory] = useState<string>('ALL');

    const fetchRecommendations = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/jobs/recommended?limit=30&excludeBlocked=true');
            const data = await res.json();
            if (data.success && Array.isArray(data.recommendations)) {
                setRecommendations(data.recommendations);
            } else {
                setError(data.message || 'Unable to compute recommendations');
            }
        } catch (err: any) {
            console.error('Error fetching job recommendations:', err);
            setError(err.message || 'Failed to load recommendations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const filtered = recommendations.filter(rec => {
        if (filterCategory === 'ALL') return true;
        if (filterCategory === 'EXCELLENT') return rec.category === 'EXCELLENT';
        if (filterCategory === 'STRONG') return rec.category === 'STRONG' || rec.category === 'EXCELLENT';
        if (filterCategory === 'HIGH_CONFIDENCE') return rec.confidence === 'HIGH';
        return true;
    });

    const getScoreBadgeClass = (score: number, isBlocked: boolean) => {
        if (isBlocked) return 'bg-rose-950/40 border border-rose-800/40 text-rose-400';
        if (score >= 90) return 'border border-[#9bb4c9]/40 text-[#d7e4f0]';
        if (score >= 80) return 'border border-[#2a2c33] text-[#d7e4f0]';
        if (score >= 70) return 'border border-[#2a2c33] text-[#b4b8c2]';
        return 'bg-[#151515] border border-[#242424] text-[#BDBDBD]';
    };

    const getRecommendationLabel = (rec: CandidateJobMatchResult) => {
        if (rec.isBlocked) return { text: 'Blocked', color: 'text-rose-400 bg-rose-950/40 border border-rose-800/40' };
        switch (rec.recommendation) {
            case 'EXCELLENT_APPLY':
                return { text: 'Strong fit', color: 'text-[#d7e4f0] border border-[#2a2c33]' };
            case 'STRONG_APPLY':
                return { text: 'Good fit', color: 'text-[#d7e4f0] border border-[#2a2c33]' };
            case 'APPLY_IF_INTERESTED':
                return { text: 'Worth Considering', color: 'text-amber-300 bg-amber-950/40 border border-amber-800/40' };
            case 'LOW_PRIORITY':
                return { text: 'Low Priority', color: 'text-[#7E7E7E] bg-[#151515] border border-[#242424]' };
            case 'SKIP':
                return { text: 'Skip', color: 'text-[#565656] bg-[#151515] border border-[#242424]' };
            default:
                return { text: 'Evaluated', color: 'text-[#BDBDBD] bg-[#151515] border border-[#242424]' };
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedMatchId(prev => (prev === id ? null : id));
    };

    return (
        <div className="space-y-6 animate-fade-in text-[#F5F5F5]">
            {/* Header & Controls */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <h2 className="text-[28px] font-normal leading-none text-[#f4f5f7]" style={{ fontFamily: 'var(--font-display)' }}>
                        Recommended
                    </h2>
                    <p className="mt-2 max-w-xl text-sm text-[#8b909a]">
                        Roles that fit your profile.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="min-w-[190px]">
                        <CustomSelect
                            value={filterCategory}
                            onChange={val => setFilterCategory(val)}
                            options={[
                                { value: 'ALL', label: `All Matches (${recommendations.length})` },
                                { value: 'EXCELLENT', label: '90%+ Matches' },
                                { value: 'STRONG', label: '80%+ Matches' },
                                { value: 'HIGH_CONFIDENCE', label: 'High Confidence Only' },
                            ]}
                            className="h-9"
                        />
                    </div>

                    <button
                        onClick={fetchRecommendations}
                        disabled={loading}
                        className="h-9 cursor-pointer rounded-full border border-[#2a2c33] px-4 text-xs text-[#f4f5f7] hover:bg-[#16171b]"
                    >
                        {loading ? 'Refreshing' : 'Refresh'}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="rounded-2xl border border-[#2a2c33] bg-[#0c0d10] py-24 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#9bb4c9]" />
                    <p className="mt-3 text-sm text-[#8b909a]">Ranking roles for you</p>
                </div>
            ) : error ? (
                <div className="p-16 text-center bg-[#101010] border border-[#242424] rounded-xl shadow-xs">
                    <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                    <h3 className="text-base font-semibold text-[#F5F5F5]">Evaluation Notice</h3>
                    <p className="text-xs text-[#7E7E7E] max-w-sm mx-auto mt-1 mb-4">
                        {error}
                    </p>
                    <Link href={`/${locale}/account`}>
                        <button className="px-4 py-2 bg-[#F5F5F5] hover:bg-white text-black text-xs font-semibold rounded-lg">
                            Complete Candidate Profile
                        </button>
                    </Link>
                </div>
            ) : filtered.length === 0 ? (
                <div className="p-16 text-center bg-[#101010] border border-[#242424] rounded-xl shadow-xs">
                    <Briefcase className="w-10 h-10 text-[#7E7E7E] mx-auto mb-3 opacity-50" />
                    <h3 className="text-base font-semibold text-[#F5F5F5]">No Matching Jobs Available</h3>
                    <p className="text-xs text-[#7E7E7E] max-w-sm mx-auto mt-1 mb-4">
                        We evaluated active canonical jobs, but none met your filter criteria. Try expanding your target roles or updating your preferences.
                    </p>
                    <Link href={`/${locale}/jobs`}>
                        <button className="px-4 py-2 bg-[#F5F5F5] hover:bg-white text-black text-xs font-semibold rounded-lg">
                            Browse All Jobs
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(match => {
                        const job = match.job || ({} as any);
                        const recLabel = getRecommendationLabel(match);
                        const isExpanded = expandedMatchId === match.jobId;

                        return (
                            <div
                                key={match.jobId}
                                className="bg-[#101010] border border-[#242424] hover:border-[#2D2D2D] rounded-xl transition-all overflow-hidden shadow-xs"
                            >
                                {/* Top Job Row */}
                                <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    <div className="flex items-start gap-3.5">
                                        <div className="w-11 h-11 rounded-lg bg-[#151515] border border-[#242424] flex items-center justify-center font-bold text-sm text-[#F5F5F5] uppercase flex-shrink-0">
                                            {job.company?.[0] || 'J'}
                                        </div>

                                        <div>
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-sm text-[#F5F5F5] hover:text-white transition-colors">
                                                    {job.title || 'Software Engineering Vacancy'}
                                                </h3>
                                                <span className="text-xs text-[#7E7E7E]">at</span>
                                                <span className="font-medium text-xs text-[#F5F5F5]">
                                                    {job.company}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3 text-xs text-[#7E7E7E]">
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    {job.location || job.remote_type || 'Location flexible'}
                                                </span>

                                                {job.salary_max ? (
                                                    <span className="text-[#F5F5F5] font-medium font-mono text-[11px]">
                                                        {job.salary_currency || '$'}{job.salary_min ? `${job.salary_min}-` : ''}{job.salary_max}
                                                    </span>
                                                ) : (
                                                    <span className="text-[#7E7E7E] text-[11px]">Comp undisclosed</span>
                                                )}

                                                <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[#7E7E7E]">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                        match.confidence === 'HIGH' ? 'bg-[#8B5CF6]' :
                                                        match.confidence === 'MEDIUM' ? 'bg-amber-400' : 'bg-slate-500'
                                                     }`} />
                                                    {match.confidence} Confidence
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Score & Recommendation Badges */}
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${getScoreBadgeClass(match.score, match.isBlocked)}`}>
                                                    {match.score}% Match
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${recLabel.color}`}>
                                                    {recLabel.text}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => toggleExpand(match.jobId)}
                                                className="text-[11px] text-[#BDBDBD] hover:text-[#F5F5F5] hover:underline flex items-center gap-0.5 mt-1 font-medium"
                                            >
                                                Why this match? {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={async () => {
                                                    if (job.apply_url) window.open(job.apply_url, '_blank');
                                                    try {
                                                         await fetch('/api/jobs/track-apply', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({
                                                                job_id: match.jobId,
                                                                job_title: job.title,
                                                                company: job.company,
                                                                apply_url: job.apply_url,
                                                            }),
                                                        });
                                                    } catch {}
                                                }}
                                                className="px-4 py-2 bg-[#F5F5F5] hover:bg-white text-black text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
                                            >
                                                Apply <ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                            <JobApplicationTracker jobId={match.jobId} />
                                        </div>
                                    </div>
                                </div>

                                {/* Tailoring Opportunity Banner */}
                                {match.explanation.underrepresentedSkills?.length > 0 && (
                                    <div className="px-5 py-2.5 bg-violet-950/25 border-t border-violet-800/40 flex flex-wrap items-center justify-between gap-2 text-xs">
                                        <div className="flex items-center gap-2 text-violet-200">
                                            <Target className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                                            <span>
                                                <strong>Resume Tailoring Opportunity:</strong> You have verified experience in{' '}
                                                <span className="font-semibold underline decoration-violet-400">
                                                    {match.explanation.underrepresentedSkills.slice(0, 3).join(', ')}
                                                </span>
                                                , but it isn&apos;t prominent in your active resume.
                                            </span>
                                        </div>
                                        <Link href={`/${locale}/resumes?tab=tailor`}>
                                            <span className="text-[11px] font-semibold text-violet-300 hover:text-violet-100 underline cursor-pointer">
                                                Tailor Resume &rarr;
                                            </span>
                                        </Link>
                                    </div>
                                )}

                                {/* Interactive Explainability Drawer */}
                                {isExpanded && (
                                    <div className="p-5 bg-[#0A0A0A] border-t border-[#242424] text-xs space-y-4">
                                        <div>
                                            <h4 className="font-semibold text-xs text-[#F5F5F5] uppercase tracking-wider font-mono mb-1">
                                                Match Explanation Summary
                                            </h4>
                                            <p className="text-[#BDBDBD] leading-relaxed">
                                                {match.explanation.summary}
                                            </p>
                                        </div>

                                        {/* Component Scores Grid */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                            <div className="p-2.5 bg-[#151515] border border-[#242424] rounded-lg">
                                                <div className="text-[10px] text-[#7E7E7E] font-mono uppercase">Skills Fit (35%)</div>
                                                <div className="text-sm font-semibold text-[#F5F5F5] mt-0.5">
                                                    {match.componentScores.skillsFit}%
                                                </div>
                                            </div>
                                            <div className="p-2.5 bg-[#151515] border border-[#242424] rounded-lg">
                                                <div className="text-[10px] text-[#7E7E7E] font-mono uppercase">Experience (20%)</div>
                                                <div className="text-sm font-semibold text-[#F5F5F5] mt-0.5">
                                                    {match.componentScores.experienceFit}%
                                                </div>
                                            </div>
                                            <div className="p-2.5 bg-[#151515] border border-[#242424] rounded-lg">
                                                <div className="text-[10px] text-[#7E7E7E] font-mono uppercase">Role Alignment (15%)</div>
                                                <div className="text-sm font-semibold text-[#F5F5F5] mt-0.5">
                                                    {match.componentScores.roleFit}%
                                                </div>
                                            </div>
                                            <div className="p-2.5 bg-[#151515] border border-[#242424] rounded-lg">
                                                <div className="text-[10px] text-[#7E7E7E] font-mono uppercase">Location (10%)</div>
                                                <div className="text-sm font-semibold text-[#F5F5F5] mt-0.5">
                                                    {match.componentScores.locationFit}%
                                                </div>
                                            </div>
                                        </div>

                                        {/* Breakdown Columns */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Strengths */}
                                            {match.explanation.strongMatches.length > 0 && (
                                                <div className="p-3 bg-[#101010] border border-emerald-800/40 rounded-lg">
                                                    <h5 className="font-semibold text-emerald-400 mb-1.5 flex items-center gap-1.5">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Confirmed Strengths
                                                    </h5>
                                                    <ul className="space-y-1 text-[#BDBDBD] text-[11px]">
                                                        {match.explanation.strongMatches.map((item, idx) => (
                                                            <li key={idx} className="flex items-start gap-1.5">
                                                                <span className="text-emerald-400 font-bold">•</span>
                                                                <span>{item}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Missing / Gaps */}
                                            {match.explanation.missingRequirements.length > 0 && (
                                                <div className="p-3 bg-[#101010] border border-amber-800/40 rounded-lg">
                                                    <h5 className="font-semibold text-amber-400 mb-1.5 flex items-center gap-1.5">
                                                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Missing Requirements
                                                    </h5>
                                                    <p className="text-[11px] text-[#7E7E7E] mb-2">
                                                        Zero documented candidate evidence found for:
                                                    </p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {match.explanation.missingRequirements.map((req, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="px-2 py-0.5 bg-[#151515] border border-[#242424] text-[#BDBDBD] rounded text-[10px] font-medium"
                                                            >
                                                                {req}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Unknowns / Neutral items */}
                                        {match.explanation.unknowns.length > 0 && (
                                            <div className="text-[11px] text-[#7E7E7E]">
                                                <span className="font-medium text-[#BDBDBD]">Data completeness notes (neutral to score):</span>{' '}
                                                {match.explanation.unknowns.join(' • ')}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
