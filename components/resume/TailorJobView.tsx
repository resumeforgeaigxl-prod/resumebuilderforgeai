'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface TailorJobViewProps {
    initialResumeId?: string;
    locale: string;
}

export function TailorJobView({ initialResumeId, locale }: TailorJobViewProps) {
    const [resumes, setResumes] = useState<any[]>([]);
    const [selectedResumeId, setSelectedResumeId] = useState<string>(initialResumeId || '');
    const [jdText, setJdText] = useState('');
    const [loading, setLoading] = useState(false);
    const [optimizing, setOptimizing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [matchResult, setMatchResult] = useState<{
        match_percentage: number;
        missing_keywords: string[];
        present_keywords: string[];
    } | null>(null);
    const [optimizedSummary, setOptimizedSummary] = useState<string | null>(null);

    const supabase = createClient();

    useEffect(() => {
        const fetchResumes = async () => {
            const { data } = await supabase
                .from('resumes')
                .select('id, title, resume_json, score')
                .order('updated_at', { ascending: false });
            if (data) {
                setResumes(data);
                if (!selectedResumeId && data.length > 0) {
                    setSelectedResumeId(initialResumeId || data[0].id);
                }
            }
        };
        fetchResumes();
    }, [initialResumeId]);

    const activeResume = resumes.find(r => r.id === selectedResumeId);

    const handleMatch = async () => {
        if (!selectedResumeId || !activeResume) {
            setError('Please select a base resume.');
            return;
        }
        if (jdText.trim().length < 50) {
            setError('Please provide a complete job description (at least 50 characters).');
            return;
        }

        setLoading(true);
        setError(null);
        setMatchResult(null);
        setOptimizedSummary(null);

        try {
            const res = await fetch('/api/resume/match-jd', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeId: selectedResumeId,
                    resumeData: activeResume.resume_json,
                    jdText: jdText
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setMatchResult(data.analysis);
            } else {
                setError(data.error || 'Failed to analyze job match.');
            }
        } catch (err: any) {
            console.error('Match error:', err);
            setError('Network error occurred during matching.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateOptimization = async () => {
        if (!selectedResumeId || !activeResume || !jdText.trim()) return;

        setOptimizing(true);
        setError(null);

        try {
            const res = await fetch('/api/resume/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeData: activeResume.resume_json,
                    jobDescription: jdText
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setOptimizedSummary(data.optimizedResume?.summary || 'Tailored content generated.');
            } else {
                setError(data.error || 'Failed to generate tailored optimization.');
            }
        } catch (err) {
            console.error('Optimization error:', err);
            setError('Network error occurred during optimization.');
        } finally {
            setOptimizing(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in text-[#F5F5F5]">
            {/* Header / Intro */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div className="flex items-end gap-3">
                    <img src="/rail/rail-jobs.png?v=ice" alt="" width={40} height={40} className="h-10 w-10 object-contain" />
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#8b909a]">Tailor</p>
                        <h2 className="mt-1 text-[28px] font-normal leading-none text-[#f4f5f7]" style={{ fontFamily: 'var(--font-display)' }}>Fit a job</h2>
                        <p className="mt-2 text-sm text-[#8b909a]">See which skills the role asks for, and which ones you already have.</p>
                    </div>
                </div>

                {selectedResumeId && (
                    <Link href={`/${locale}/builder/${selectedResumeId}`} className="text-sm text-[#8b909a] hover:text-[#f4f5f7]">
                        Open editor
                    </Link>
                )}
            </div>

            {/* Input Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    {/* Resume Selector */}
                    <div className="space-y-3 rounded-2xl border border-[#2a2c33] bg-[#0c0d10] p-5">
                        <h3 className="flex items-center gap-2 text-sm text-[#f4f5f7]">
                            <img src="/rail/rail-resume.png?v=ice" alt="" width={28} height={28} className="h-7 w-7 object-contain" />
                            Resume
                        </h3>
                        {resumes.length > 0 ? (
                            <select
                                value={selectedResumeId}
                                onChange={(e) => {
                                    setSelectedResumeId(e.target.value);
                                    setMatchResult(null);
                                    setOptimizedSummary(null);
                                }}
                                className="h-11 w-full cursor-pointer rounded-xl border border-[#2a2c33] bg-[#121214] px-4 text-sm text-[#f4f5f7] focus:border-[#3a3d46] focus:outline-none"
                            >
                                {resumes.map(r => (
                                    <option key={r.id} value={r.id} className="bg-[#121214]">
                                        {r.title || 'Untitled resume'}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <p className="text-sm text-[#8b909a]">Create a resume first, then come back to tailor it.</p>
                        )}
                    </div>

                    {/* Job Description Textarea */}
                    <div className="space-y-3 rounded-2xl border border-[#2a2c33] bg-[#0c0d10] p-5">
                        <div className="flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-sm text-[#f4f5f7]">
                                <img src="/rail/rail-jobs.png?v=ice" alt="" width={28} height={28} className="h-7 w-7 object-contain" />
                                Job description
                            </h3>
                            <span className="text-xs text-[#8b909a]">At least 50 characters</span>
                        </div>
                        <textarea
                            value={jdText}
                            onChange={(e) => setJdText(e.target.value)}
                            placeholder="Paste the job description"
                            className="custom-scrollbar h-64 w-full resize-none rounded-xl border border-[#2a2c33] bg-[#121214] p-4 text-sm text-[#f4f5f7] placeholder:text-[#8b909a] focus:border-[#3a3d46] focus:outline-none"
                        />

                        {error && (
                            <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/20 p-3 rounded-lg border border-rose-900/40">
                                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="flex items-center gap-3 pt-2">
                            <Button
                                onClick={handleMatch}
                                disabled={loading || jdText.trim().length < 50 || !selectedResumeId}
                                className="flex h-9 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#f4f5f7] text-xs font-medium text-[#0c0d10] hover:bg-white disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin text-[#050505]" /> : null}
                                {loading ? 'Checking' : 'Check the fit'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Match Results */}
                <div className="space-y-6">
                    {matchResult ? (
                        <div className="space-y-6 animate-fade-in">
                            {/* Score Card */}
                            <div className="space-y-4 rounded-2xl border border-[#2a2c33] bg-[#0c0d10] p-6">
                                <p className="text-[11px] uppercase tracking-[0.18em] text-[#8b909a]">Fit</p>
                                <div className="flex items-end justify-between">
                                    <span className="text-6xl leading-none text-[#d7e4f0]" style={{ fontFamily: 'var(--font-display)' }}>
                                        {matchResult.match_percentage}
                                    </span>
                                    <span className="text-sm text-[#b4b8c2]">
                                        {matchResult.match_percentage >= 75 ? 'Strong' : matchResult.match_percentage >= 50 ? 'Close' : 'Needs work'}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#16171b]">
                                    <div
                                        className="h-full bg-[#9bb4c9] transition-all duration-500"
                                        style={{ width: `${matchResult.match_percentage}%` }}
                                    />
                                </div>
                            </div>

                            {/* Keywords Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Present Keywords */}
                                <div className="space-y-3 rounded-2xl border border-[#2a2c33] bg-[#0c0d10] p-5">
                                    <h4 className="text-xs text-[#8b909a]">On the resume · {matchResult.present_keywords?.length || 0}</h4>
                                    <div className="flex max-h-48 flex-wrap gap-1.5 overflow-y-auto">
                                        {matchResult.present_keywords?.map((kw, i) => (
                                            <span key={i} className="rounded-full border border-[#2a2c33] px-2.5 py-1 text-[11px] text-[#d7e4f0]">
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3 rounded-2xl border border-[#2a2c33] bg-[#0c0d10] p-5">
                                    <h4 className="text-xs text-[#8b909a]">Missing · {matchResult.missing_keywords?.length || 0}</h4>
                                    <div className="flex max-h-48 flex-wrap gap-1.5 overflow-y-auto">
                                        {matchResult.missing_keywords?.map((kw, i) => (
                                            <span key={i} className="rounded-full border border-[#2a2c33] px-2.5 py-1 text-[11px] text-[#b4b8c2]">
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Tailor Action Box */}
                            <div className="space-y-4 rounded-2xl border border-[#2a2c33] bg-[#0c0d10] p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h4 className="text-sm text-[#f4f5f7]">Rewrite the summary</h4>
                                        <p className="mt-1 text-sm leading-6 text-[#8b909a]">
                                            Bring the missing skills into the summary.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={handleGenerateOptimization}
                                        disabled={optimizing}
                                        className="h-9 shrink-0 cursor-pointer rounded-full bg-[#f4f5f7] px-4 text-xs font-medium text-[#0c0d10] hover:bg-white"
                                    >
                                        {optimizing ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                                        {optimizing ? 'Writing' : 'Rewrite'}
                                    </Button>
                                </div>

                                {optimizedSummary && (
                                    <div className="rounded-xl border border-[#2a2c33] bg-[#121214] p-4">
                                        <p className="mb-1 text-xs text-[#8b909a]">Suggested summary</p>
                                        <p className="whitespace-pre-line text-sm leading-6 text-[#f4f5f7]">{optimizedSummary}</p>
                                        <div className="mt-3 flex justify-end">
                                            <Link href={`/${locale}/builder/${selectedResumeId}`} className="text-sm text-[#d7e4f0] hover:text-white">
                                                Open editor
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-full min-h-[360px] flex-col items-center justify-center rounded-2xl border border-[#2a2c33] bg-[#0c0d10] px-8 text-center">
                            <img src="/rail/rail-jobs.png?v=ice" alt="" width={48} height={48} className="h-12 w-12 object-contain" />
                            <h4 className="mt-4 text-2xl font-normal text-[#f4f5f7]" style={{ fontFamily: 'var(--font-display)' }}>Ready when you are</h4>
                            <p className="mt-2 max-w-xs text-sm leading-6 text-[#8b909a]">Paste a job description, then check the fit.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
