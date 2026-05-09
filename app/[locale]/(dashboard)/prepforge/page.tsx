"use client"
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, Suspense } from 'react';
import {
    Code2,
    Brain,
    ChevronRight,
    Filter,
    Zap,
    ArrowLeftRight,
    RefreshCw,
    Sparkles,
    Loader2,
    CheckCircle2,
    Terminal,
    Layers,
    FileText,
    Undo2,
    Divide,
    Hash,
    Maximize
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/client';
import { PrepForgeQuestion } from '@/lib/prepforge/data';

const PREP_SECTIONS = [
    {
        id: 'aptitude',
        title: 'Aptitude Hub',
        description: 'Quantitative logic and data interpretation for TCS NQT levels.',
        icon: <Divide className="w-6 h-6" />,
        color: 'blue',
        type: 'Aptitude'
    },
    {
        id: 'reasoning',
        title: 'Reasoning Matrix',
        description: 'Logical deductions and abstract reasoning patterns.',
        icon: <Brain className="w-6 h-6" />,
        color: 'purple',
        type: 'Reasoning'
    },
    {
        id: 'coding',
        title: 'Coding Forge',
        description: 'Master core logic patterns for TCS coding questions.',
        icon: <Code2 className="w-6 h-6" />,
        color: 'emerald',
        type: 'Coding'
    }
];

const PREVIEW_PROBLEMS = [
    { title: "Palindrome Check", icon: <ArrowLeftRight className="w-4 h-4" />, slug: "palindrome-number" },
    { title: "Prime Logic", icon: <Hash className="w-4 h-4" />, slug: "prime-number" },
    { title: "Array Maxima", icon: <Maximize className="w-4 h-4" />, slug: "array-maximum" },
    { title: "Number Reversal", icon: <RefreshCw className="w-4 h-4" />, slug: "reverse-number" }
];

import { ForgeSoftPaywall } from '@/components/auth/ForgeSoftPaywall';

function PrepForgeLogic() {
    const params = useParams() as { locale: string };
    const locale = params.locale || 'en-IN';
    const searchParams = useSearchParams();
    const slug = searchParams?.get('slug');

    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState('Numbers');
    const [generatedQuestion, setGeneratedQuestion] = useState<PrepForgeQuestion | null>(null);
    const [dailyBundle, setDailyBundle] = useState<PrepForgeQuestion[]>([]);
    const [showPaywall, setShowPaywall] = useState(false);

    useEffect(() => {
        if (slug) {
            const fetchQuestionBySlug = async () => {
                const supabase = createClient();
                const { data, error } = await supabase
                    .from('prep_forge_questions')
                    .select('*')
                    .eq('slug', slug)
                    .single();

                if (!error && data) {
                    setGeneratedQuestion(data);
                } else {
                    console.error('Error fetching question by slug:', error);
                }
            };
            fetchQuestionBySlug();
        }
    }, [slug]);

    const generateQuestion = async (type = 'coding', topic = selectedTopic) => {
        setIsGenerating(true);
        try {
            const res = await fetch('/api/prepforge/questions/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, topic })
            });
            const data = await res.json();
            if (data.success) {
                setGeneratedQuestion(data.question);
                setDailyBundle([]); // Clear bundle if single gen is triggered
            } else if (data.limitReached) {
                setShowPaywall(true);
            }
        } catch (err) {
            console.error('Gen Error', err);
        } finally {
            setIsGenerating(false);
        }
    };

    const generateDaily = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch('/api/prepforge/questions/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dailyMode: true })
            });
            const data = await res.json();
            if (data.success) {
                setDailyBundle(data.bundle);
                setGeneratedQuestion(null); // Clear single gen
            } else if (data.limitReached) {
                setShowPaywall(true);
            }
        } catch (err) {
            console.error('Daily Gen Error', err);
        } finally {
            setIsGenerating(false);
        }
    };

    if (showPaywall) {
        return <ForgeSoftPaywall forgeName="PrepForge" />;
    }

    return (
        <div className="space-y-12 max-w-5xl mx-auto pb-24">
            {/* Standardized Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1E2A42] pb-8 mb-12">
                <div>
                    <div className="flex items-center gap-2 text-[#00D4A0] font-bold tracking-widest text-[10px] uppercase mb-4">
                        <Zap className="w-3.5 h-3.5" /> Intelligence Core
                    </div>
                    <h1 className="text-4xl font-bold tracking-tighter text-white uppercase">PrepForge</h1>
                    <p className="text-slate-400 mt-2 text-lg">Master pattern-based logic for Aptitude, Reasoning, and Coding. Optimized for TCS NQT.</p>
                </div>

                <div className="flex items-center gap-4">
                    <Button onClick={() => generateDaily()} disabled={isGenerating} className="px-6 h-12 rounded-xl bg-[#00D4A0] hover:bg-[#00D4A0]/90 text-[#080B16] font-bold text-sm shadow-lg shadow-[#00D4A0]/10 transition-all">
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        Initialize Daily Bundle
                    </Button>
                    <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0D1220] border border-[#1E2A42]">
                        <div className="text-[10px] text-[#4A5568] uppercase tracking-wider font-semibold">TCS_SIGNAL</div>
                        <Badge variant="outline" className="border-[#00D4A0]/20 bg-[#00D4A0]/5 text-[#00D4A0] text-[9px] font-bold uppercase">ACTIVE</Badge>
                    </div>
                </div>
            </header>


            {/* AI Generator Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 p-6 rounded-xl border border-[#1E2A42] bg-[#0D1220]/60 space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-base font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#7C5CFC]" />
                            AI Logic Engine
                        </h2>
                        <p className="text-xs text-[#7A8BA8]">Generate custom TCS NQT patterns instantly.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Select Topic Signal</div>
                        <div className="grid grid-cols-1 gap-2">
                            {['Numbers', 'Arrays', 'Strings'].map(topic => (
                                <button
                                    key={topic}
                                    onClick={() => setSelectedTopic(topic)}
                                    className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all text-left flex items-center justify-between group ${selectedTopic === topic
                                        ? 'bg-blue-600/10 border-blue-500/50 text-blue-400'
                                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                                        }`}
                                >
                                    {topic}
                                    {selectedTopic === topic && <CheckCircle2 className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button
                        onClick={() => generateQuestion()}
                        disabled={isGenerating}
                        className="w-full h-11 rounded-xl bg-[#00D4A0] hover:bg-[#00D4A0]/90 text-[#080B16] font-bold text-sm"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                        Generate TCS Question
                    </Button>
                </div>

                <div className="lg:col-span-2">
                    {generatedQuestion ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="p-8 rounded-xl border border-[#7C5CFC]/20 bg-[#0D1220]/60">
                                <div className="flex items-center justify-between mb-6">
                                    <Badge variant="outline" className="px-3 py-1 border-[#7C5CFC]/30 text-[#7C5CFC] font-bold text-[10px] uppercase">AI GENERATED</Badge>
                                    <div className="text-xs font-semibold text-[#4A5568]">Topic: {generatedQuestion.topic}</div>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-4">
                                    {generatedQuestion.title || 'The Challenge'}
                                </h3>
                                <p className="text-sm text-[#7A8BA8] leading-relaxed mb-8">
                                    {generatedQuestion.problem}
                                </p>

                                {generatedQuestion.input_output && (
                                    <div className="mb-8 p-4 rounded-xl bg-black/40 border border-[#1E2A42] font-mono text-sm text-[#00D4A0]">
                                        <div className="text-[10px] uppercase font-semibold text-[#4A5568] mb-2">Input / Output</div>
                                        {generatedQuestion.input_output}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                            <Layers className="w-4 h-4 text-[#7C5CFC]" /> Logical Approach
                                        </h4>
                                        <ul className="space-y-4">
                                            {generatedQuestion.approach.map((step: string, i: number) => (
                                                <li key={i} className="flex gap-3 text-sm text-[#7A8BA8] leading-relaxed group">
                                                    <span className="shrink-0 w-5 h-5 rounded-full bg-[#00D4A0]/10 text-[#00D4A0] flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                                                    <span className="group-hover:text-slate-200 transition-colors">{step}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {generatedQuestion.code && (
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                                <Terminal className="w-4 h-4 text-[#00D4A0]" /> Java Implementation
                                            </h4>
                                            <div className="p-4 rounded-xl bg-black/60 border border-[#1E2A42] font-mono text-xs text-[#00D4A0]/90 leading-relaxed overflow-x-auto max-h-[400px] custom-scrollbar">
                                                <pre className="whitespace-pre-wrap font-mono">
                                                    {generatedQuestion.code.trim()}
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {generatedQuestion.line_explanation && generatedQuestion.line_explanation.length > 0 && (
                                    <div className="mb-8 p-6 rounded-xl bg-white/[0.02] border border-[#1E2A42]">
                                        <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-[#00D4A0]" /> Line-by-Line Breakdown
                                        </h4>
                                        <div className="space-y-2">
                                            {generatedQuestion.line_explanation.map((line: string, i: number) => (
                                                <div key={i} className="text-xs text-[#7A8BA8] leading-relaxed flex gap-3 border-b border-[#1E2A42] pb-2 last:border-0">
                                                    <span className="text-[#00D4A0]/40 font-bold">{i + 1}</span>
                                                    {line}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-6 border-t border-[#1E2A42] flex items-center justify-between">
                                    <div className="flex flex-col gap-2">
                                        <div className="text-[10px] font-semibold text-[#4A5568] uppercase tracking-wider">Mastery Variants</div>
                                        <div className="flex flex-wrap gap-2">
                                            {generatedQuestion.variations.map((v: string, i: number) => (
                                                <Badge key={i} variant="secondary" className="bg-white/5 text-[#7A8BA8] text-[10px] font-semibold px-2.5 py-1">{v}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                    {dailyBundle.length > 0 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setGeneratedQuestion(null)}
                                            className="border-[#00D4A0]/20 bg-[#00D4A0]/5 text-[#00D4A0] font-bold text-xs hover:bg-[#00D4A0]/10"
                                        >
                                            <Undo2 className="w-3 h-3 mr-2" /> Back to Bundle
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : dailyBundle.length > 0 ? (
                        <div className="space-y-4 animate-in fade-in duration-700">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-base font-bold text-white">Daily Bundle <span className="text-[#00D4A0]">(7 Questions)</span></h3>
                                <Button variant="ghost" size="sm" onClick={() => setDailyBundle([])} className="text-xs font-bold text-[#4A5568] hover:text-white">Clear</Button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {dailyBundle.map((q: PrepForgeQuestion, i: number) => (
                                    <div key={i} onClick={() => setGeneratedQuestion(q)} className="p-4 cursor-pointer rounded-xl border border-[#1E2A42] bg-[#0D1220]/60 hover:border-[#00D4A0]/20 group transition-all relative overflow-hidden">
                                        <div className="flex items-center justify-between mb-2 relative z-10">
                                            <Badge className={`text-[9px] font-bold ${q.type === 'coding' ? 'bg-[#00D4A0]/20 text-[#00D4A0]' : 'bg-[#7C5CFC]/20 text-[#7C5CFC]'}`}>{q.type}</Badge>
                                            <ChevronRight className="w-3.5 h-3.5 text-[#4A5568] group-hover:text-[#00D4A0] transition-all" />
                                        </div>
                                        <h4 className="text-sm font-bold text-white mb-1 leading-tight group-hover:text-[#00D4A0] transition-colors">{q.title || 'Question ' + (i + 1)}</h4>
                                        <p className="text-xs text-[#7A8BA8] line-clamp-2 leading-relaxed">{q.problem}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-[#1E2A42] bg-transparent">
                            <div className="p-4 rounded-full bg-white/5 text-[#4A5568] mb-4">
                                <Sparkles className="w-8 h-8" />
                            </div>
                            <h3 className="text-base font-bold text-[#7A8BA8] mb-1">No Questions Yet</h3>
                            <p className="text-sm text-[#4A5568] max-w-sm">Select a topic to generate AI-powered practice questions.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Preparation Modules */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#1E2A42] pb-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Filter className="w-5 h-5 text-[#7C5CFC]" />
                        Learning Tracks
                    </h2>
                    <Badge variant="secondary" className="bg-[#0D1220] text-[#4A5568] px-3 py-1 font-semibold text-[10px]">PREP MODULES</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {PREP_SECTIONS.map((section) => (
                        <Link
                            key={section.id}
                            href={`/${locale}/prepforge/${section.id}`}
                        >
                            <div className="p-6 rounded-xl border border-[#1E2A42] bg-[#0D1220]/60 hover:border-[#00D4A0]/20 transition-all group h-full flex flex-col">
                                <div className="mb-4 p-3 rounded-xl bg-white/5 w-fit text-[#00D4A0] group-hover:scale-105 transition-transform">
                                    {section.icon}
                                </div>
                                <h3 className="text-base font-bold text-white mb-2">
                                    {section.title}
                                </h3>
                                <p className="text-sm text-[#7A8BA8] leading-relaxed mb-6">
                                    {section.description}
                                </p>
                                <div className="mt-auto flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#00D4A0] group-hover:gap-3 transition-all">
                                    Enter Channel <ChevronRight className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Motivation Quote / Tip Section */}
            <section className="p-8 rounded-2xl bg-[#0D1220]/60 border border-[#1E2A42]">
                <div className="max-w-3xl">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-[#F5A623]" />
                        Master Logic, Not Questions
                    </h2>
                    <p className="text-[#7A8BA8] text-sm leading-relaxed mb-6">
                        The goal is not to memorize 1000 questions, but to master the 50 underlying logic patterns that can solve any TCS NQT problem.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-5 rounded-xl border border-[#1E2A42] bg-[#080B16]">
                            <div className="text-[10px] text-[#4A5568] uppercase tracking-wider font-semibold mb-1">Practice Streak</div>
                            <div className="text-xl font-bold text-white">0 Days</div>
                        </div>
                        <div className="p-5 rounded-xl border border-[#1E2A42] bg-[#080B16]">
                            <div className="text-[10px] text-[#4A5568] uppercase tracking-wider font-semibold mb-1">Patterns Learned</div>
                            <div className="text-xl font-bold text-white">0 / 24</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default function PrepForgeApp() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-[#070710]">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
        }>
            <PrepForgeLogic />
        </Suspense>
    );
}
