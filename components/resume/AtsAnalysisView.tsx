'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2 } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';

interface AtsAnalysisViewProps {
    initialResumeId?: string;
}

export function AtsAnalysisView({ initialResumeId }: AtsAnalysisViewProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [jdText, setJdText] = useState('');
    const [resumes, setResumes] = useState<any[]>([]);
    const [selectedResumeId, setSelectedResumeId] = useState<string>(initialResumeId || '');
    const [score, setScore] = useState<number | null>(null);
    const [missingSignals, setMissingSignals] = useState<string[]>([]);
    const [matchingKeywords, setMatchingKeywords] = useState<string[]>([]);
    const [strategyText, setStrategyText] = useState<string>('');

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

    const parseAccumulatedText = (text: string) => {
        // 1. Extract Score
        const scoreMatch = text.match(/\[SCORE\]\s*(\d+)/i);
        if (scoreMatch) {
            const val = parseInt(scoreMatch[1], 10);
            setScore(isNaN(val) ? null : val);
        }

        // 2. Extract Matched Keywords
        const matchedMatch = text.match(/\[MATCHED\]\s*([^\n]+)/i);
        if (matchedMatch) {
            const keywords = matchedMatch[1]
                .split(',')
                .map(s => s.trim())
                .filter(s => s.length > 0 && !s.startsWith('['));
            setMatchingKeywords(keywords);
        }

        // 3. Extract Missing Keywords
        const missingMatch = text.match(/\[MISSING\]\s*([^\n]+)/i);
        if (missingMatch) {
            const keywords = missingMatch[1]
                .split(',')
                .map(s => s.trim())
                .filter(s => s.length > 0 && !s.startsWith('['));
            setMissingSignals(keywords);
        }

        // 4. Extract Strategy Text (everything after [STRATEGY])
        const strategyIdx = text.indexOf('[STRATEGY]');
        if (strategyIdx !== -1) {
            let strategyPart = text.substring(strategyIdx + '[STRATEGY]'.length).trim();
            strategyPart = strategyPart.replace(/\[(SCORE|MATCHED|MISSING|STRATEGY)\][\s\S]*/gi, '').trim();
            setStrategyText(strategyPart);
        }
    };

    const runAnalysis = async () => {
        const selectedResume = resumes.find(r => r.id === selectedResumeId);
        if (!selectedResume) return;

        setIsAnalyzing(true);
        setScore(null);
        setMissingSignals([]);
        setMatchingKeywords([]);
        setStrategyText('');

        let accumulatedText = '';

        try {
            const response = await fetch('/api/ats-live/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeData: selectedResume.resume_json,
                    jdText: jdText
                })
            });

            if (!response.ok || !response.body) {
                throw new Error('Failed to start streaming analysis');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                const chunkValue = decoder.decode(value);
                accumulatedText += chunkValue;
                parseAccumulatedText(accumulatedText);
            }
        } catch (err) {
            console.error('AtsLive Error:', err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getStrategyBullets = () => {
        if (!strategyText) return [];
        return strategyText
            .split('\n')
            .map(line => line.replace(/^[\s\-\*\d\.\:\u2022]+/g, '').trim())
            .filter(line => line.length > 0);
    };

    const hasResults = score !== null || strategyText !== '' || missingSignals.length > 0 || matchingKeywords.length > 0;

    return (
        <div className="space-y-8 animate-fade-in text-[#F5F5F5]">
            {/* Header / Intro */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div className="flex items-end gap-3">
                    <img src="/rail/rail-resume.png?v=ice" alt="" width={40} height={40} className="h-10 w-10 object-contain" />
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#8b909a]">ATS</p>
                        <h2 className="mt-1 text-[28px] font-normal leading-none text-[#f4f5f7]" style={{ fontFamily: 'var(--font-display)' }}>Check the match</h2>
                        <p className="mt-2 text-sm text-[#8b909a]">Compare a resume with a job description.</p>
                    </div>
                </div>
                <Button
                    onClick={runAnalysis}
                    disabled={isAnalyzing || !jdText.trim() || !selectedResumeId}
                    className="h-9 cursor-pointer rounded-full bg-[#f4f5f7] px-4 text-xs font-medium text-[#0c0d10] hover:bg-white disabled:opacity-50"
                >
                    {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isAnalyzing ? 'Scanning' : 'Run scan'}
                </Button>
            </div>

            {/* Main Interactive Section */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="space-y-4">
                    <div className="space-y-3 rounded-2xl border border-[#2a2c33] bg-[#0c0d10] p-5">
                        <h3 className="flex items-center gap-2 text-sm text-[#f4f5f7]">
                            <img src="/rail/rail-resume.png?v=ice" alt="" width={28} height={28} className="h-7 w-7 object-contain" />
                            Resume
                        </h3>
                        {resumes.length > 0 ? (
                            <select
                                value={selectedResumeId}
                                onChange={(e) => setSelectedResumeId(e.target.value)}
                                className="h-11 w-full cursor-pointer rounded-xl border border-[#2a2c33] bg-[#121214] px-4 text-sm text-[#f4f5f7] focus:border-[#3a3d46] focus:outline-none"
                            >
                                {resumes.map(r => (
                                    <option key={r.id} value={r.id} className="bg-[#121214]">
                                        {r.title || 'Untitled resume'}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <p className="text-sm text-[#8b909a]">Create a resume first, then come back to scan it.</p>
                        )}
                    </div>

                    <div className="space-y-3 rounded-2xl border border-[#2a2c33] bg-[#0c0d10] p-5">
                        <h3 className="flex items-center gap-2 text-sm text-[#f4f5f7]">
                            <img src="/rail/rail-jobs.png?v=ice" alt="" width={28} height={28} className="h-7 w-7 object-contain" />
                            Job description
                        </h3>
                        <textarea
                            value={jdText}
                            onChange={(e) => setJdText(e.target.value)}
                            placeholder="Paste the job description"
                            className="custom-scrollbar h-64 w-full resize-none rounded-xl border border-[#2a2c33] bg-[#121214] p-4 text-sm text-[#f4f5f7] placeholder:text-[#8b909a] focus:border-[#3a3d46] focus:outline-none"
                        />
                    </div>
                </div>

                <div>
                    {hasResults ? (
                        <div className="space-y-4">
                            <div className="rounded-2xl border border-[#2a2c33] bg-[#0c0d10] p-6">
                                <p className="text-[11px] uppercase tracking-[0.18em] text-[#8b909a]">
                                    {isAnalyzing ? 'Scanning' : 'Score'}
                                </p>
                                {score !== null && (
                                    <div className="mt-3 flex items-end gap-2">
                                        <span className="text-6xl leading-none text-[#d7e4f0]" style={{ fontFamily: 'var(--font-display)' }}>{score}</span>
                                        <span className="mb-1 text-sm text-[#8b909a]">/ 100</span>
                                    </div>
                                )}
                                {matchingKeywords.length > 0 && (
                                    <div className="mt-6">
                                        <p className="text-xs text-[#8b909a]">On the resume · {matchingKeywords.length}</p>
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {matchingKeywords.map(tag => (
                                                <span key={tag} className="rounded-full border border-[#2a2c33] px-2.5 py-1 text-[11px] text-[#d7e4f0]">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {missingSignals.length > 0 && (
                                    <div className="mt-5">
                                        <p className="text-xs text-[#8b909a]">Missing · {missingSignals.length}</p>
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {missingSignals.map(tag => (
                                                <span key={tag} className="rounded-full border border-[#2a2c33] px-2.5 py-1 text-[11px] text-[#b4b8c2]">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {strategyText && (
                                <div className="rounded-2xl border border-[#2a2c33] bg-[#0c0d10] p-5">
                                    <h4 className="text-sm text-[#f4f5f7]">What to change</h4>
                                    <ul className="mt-3 space-y-2">
                                        {getStrategyBullets().map((step, i) => (
                                            <li key={i} className="flex gap-2 text-sm leading-6 text-[#b4b8c2]">
                                                <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-[#9bb4c9]" />
                                                <span>{step}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex h-full min-h-[360px] flex-col items-center justify-center rounded-2xl border border-[#2a2c33] bg-[#0c0d10] px-8 text-center">
                            <img src="/rail/rail-jobs.png?v=ice" alt="" width={48} height={48} className="h-12 w-12 object-contain" />
                            <h4 className="mt-4 text-2xl font-normal text-[#f4f5f7]" style={{ fontFamily: 'var(--font-display)' }}>Ready when you are</h4>
                            <p className="mt-2 max-w-xs text-sm leading-6 text-[#8b909a]">Paste a job description, then run the scan.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                    ['Keywords', 'The words this job uses, and which ones are already on the resume.'],
                    ['Score', 'How close the resume is to the role, out of 100.'],
                    ['What to change', 'A short list of edits after the scan.'],
                ].map(([title, copy]) => (
                    <div key={title} className="rounded-2xl border border-[#2a2c33] bg-[#0c0d10] p-5">
                        <h4 className="text-base font-normal text-[#f4f5f7]" style={{ fontFamily: 'var(--font-display)' }}>{title}</h4>
                        <p className="mt-2 text-sm leading-6 text-[#8b909a]">{copy}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
