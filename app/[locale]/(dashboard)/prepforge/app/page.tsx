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
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#EBEBEB] pb-8 mb-12">
                <div>
                    <div className="flex items-center gap-2 text-[#8F8F8F] font-medium tracking-normal text-xs uppercase mb-3 font-mono">
                        <Zap className="w-3.5 h-3.5" /> Intelligence Core
                    </div>
                    <h1 className="text-3xl md:text-4xl font-semibold tracking-tighter text-[#171717]">PrepForge</h1>
                    <p className="text-[#4D4D4D] mt-2 text-base">Master pattern-based logic for Aptitude, Reasoning, and Coding. Optimized for TCS NQT.</p>
                </div>

                <div className="flex items-center gap-4">
                    <Button onClick={() => generateDaily()} disabled={isGenerating} className="px-4 py-2 rounded-md bg-[#171717] hover:bg-[#333333] text-white text-sm font-medium transition-all shadow-sm">
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                        Initialize Daily Bundle
                    </Button>
                    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#EBEBEB] shadow-sm">
                        <div className="text-[10px] text-[#8F8F8F] uppercase tracking-wider font-mono">TCS_SIGNAL</div>
                        <Badge variant="outline" className="border-[#EBEBEB] bg-[#FAFAFA] text-[#4D4D4D] text-[9px] font-semibold uppercase">ACTIVE</Badge>
                    </div>
                </div>
            </header>


            {/* AI Generator Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 p-6 rounded-xl border border-[#EBEBEB] bg-[#FFFFFF] space-y-6 shadow-sm">
                    <div className="space-y-2">
                        <h2 className="text-base font-semibold text-[#171717] flex items-center gap-2">
                            <Zap className="w-4 h-4 text-[#171717]" />
                            AI Logic Engine
                        </h2>
                        <p className="text-xs text-[#8F8F8F]">Generate custom TCS NQT patterns instantly.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="text-[10px] font-mono text-[#8F8F8F] uppercase tracking-wider pl-1">Select Topic Signal</div>
                        <div className="grid grid-cols-1 gap-2">
                            {['Numbers', 'Arrays', 'Strings'].map(topic => (
                                <button
                                    key={topic}
                                    onClick={() => setSelectedTopic(topic)}
                                    className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all text-left flex items-center justify-between group ${selectedTopic === topic
                                        ? 'bg-[#FAFAFA] border-[#171717] text-[#171717] font-semibold'
                                        : 'bg-[#FFFFFF] border-[#EBEBEB] text-[#4D4D4D] hover:bg-[#FAFAFA]'
                                        }`}
                                >
                                    {topic}
                                    {selectedTopic === topic && <CheckCircle2 className="w-4 h-4 text-[#171717]" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button
                        onClick={() => generateQuestion()}
                        disabled={isGenerating}
                        className="w-full h-10 rounded-md bg-[#171717] hover:bg-[#333333] text-white font-medium text-sm transition-all"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                        Generate TCS Question
                    </Button>
                </div>

                <div className="lg:col-span-2">
                    {generatedQuestion ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="p-8 rounded-xl border border-[#EBEBEB] bg-[#FFFFFF] shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <Badge variant="outline" className="px-2.5 py-0.5 border-[#EBEBEB] bg-[#FAFAFA] text-[#4D4D4D] font-medium text-[10px] uppercase">AI GENERATED</Badge>
                                    <div className="text-xs font-medium text-[#8F8F8F]">Topic: {generatedQuestion.topic}</div>
                                </div>

                                <h3 className="text-xl font-semibold text-[#171717] mb-4">
                                    {generatedQuestion.title || 'The Challenge'}
                                </h3>
                                <p className="text-sm text-[#4D4D4D] leading-relaxed mb-8">
                                    {generatedQuestion.problem}
                                </p>

                                {generatedQuestion.input_output && (
                                    <div className="mb-8 p-4 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] font-mono text-sm text-[#171717]">
                                        <div className="text-[10px] uppercase font-mono text-[#8F8F8F] mb-2">Input / Output</div>
                                        {generatedQuestion.input_output}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-semibold text-[#171717] flex items-center gap-2">
                                            <Layers className="w-4 h-4 text-[#8F8F8F]" /> Logical Approach
                                        </h4>
                                        <ul className="space-y-4">
                                            {generatedQuestion.approach.map((step: string, i: number) => (
                                                <li key={i} className="flex gap-3 text-sm text-[#4D4D4D] leading-relaxed group">
                                                    <span className="shrink-0 w-5 h-5 rounded-full bg-[#171717]/5 text-[#171717] flex items-center justify-center text-[10px] font-semibold">{i + 1}</span>
                                                    <span className="group-hover:text-[#171717] transition-colors">{step}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {generatedQuestion.code && (
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-semibold text-[#171717] flex items-center gap-2">
                                                <Terminal className="w-4 h-4 text-[#171717]" /> Java Implementation
                                            </h4>
                                            <div className="p-4 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] font-mono text-xs text-[#171717] leading-relaxed overflow-x-auto max-h-[400px]">
                                                <pre className="whitespace-pre-wrap font-mono">
                                                    {generatedQuestion.code.trim()}
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {generatedQuestion.line_explanation && generatedQuestion.line_explanation.length > 0 && (
                                    <div className="mb-8 p-6 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB]">
                                        <h4 className="text-sm font-semibold text-[#171717] mb-4 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-[#171717]" /> Line-by-Line Breakdown
                                        </h4>
                                        <div className="space-y-2">
                                            {generatedQuestion.line_explanation.map((line: string, i: number) => (
                                                <div key={i} className="text-xs text-[#4D4D4D] leading-relaxed flex gap-3 border-b border-[#EBEBEB] pb-2 last:border-0">
                                                    <span className="text-[#171717]/40 font-mono font-semibold">{i + 1}</span>
                                                    {line}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-6 border-t border-[#EBEBEB] flex items-center justify-between">
                                    <div className="flex flex-col gap-2">
                                        <div className="text-[10px] font-mono text-[#8F8F8F] uppercase tracking-wider">Mastery Variants</div>
                                        <div className="flex flex-wrap gap-2">
                                            {generatedQuestion.variations.map((v: string, i: number) => (
                                                <Badge key={i} variant="outline" className="bg-[#FAFAFA] border-[#EBEBEB] text-[#4D4D4D] text-[10px] font-medium px-2 py-0.5 rounded">{v}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                    {dailyBundle.length > 0 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setGeneratedQuestion(null)}
                                            className="border-[#EBEBEB] bg-[#FFFFFF] text-[#171717] font-medium text-xs hover:bg-[#FAFAFA] h-8 rounded"
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
                                <h3 className="text-base font-semibold text-[#171717]">Daily Bundle <span className="text-[#8F8F8F] font-normal">({dailyBundle.length} Questions)</span></h3>
                                <Button variant="ghost" size="sm" onClick={() => setDailyBundle([])} className="text-xs font-semibold text-[#8F8F8F] hover:text-[#171717]">Clear</Button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {dailyBundle.map((q: PrepForgeQuestion, i: number) => (
                                    <div key={i} onClick={() => setGeneratedQuestion(q)} className="p-4 cursor-pointer rounded-xl border border-[#EBEBEB] bg-[#FFFFFF] hover:border-[#171717] hover:shadow-[0_2px_4px_rgba(0,0,0,0.02),0_8px_16px_rgba(0,0,0,0.04)] group transition-all relative overflow-hidden">
                                        <div className="flex items-center justify-between mb-2 relative z-10">
                                            <Badge className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${q.type === 'coding' ? 'bg-[#EFF6FF] text-[#1E40AF]' : 'bg-[#F3E8FF] text-[#6B21A8]'}`}>{q.type}</Badge>
                                            <ChevronRight className="w-3.5 h-3.5 text-[#8F8F8F] group-hover:text-[#171717] transition-all" />
                                        </div>
                                        <h4 className="text-sm font-semibold text-[#171717] mb-1 leading-tight group-hover:text-[#0070F3] transition-colors">{q.title || 'Question ' + (i + 1)}</h4>
                                        <p className="text-xs text-[#8F8F8F] line-clamp-2 leading-relaxed">{q.problem}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-[#EBEBEB] bg-[#FFFFFF] shadow-sm">
                            <div className="p-4 rounded-full bg-[#FAFAFA] border border-[#EBEBEB] text-[#8F8F8F] mb-4">
                                <Zap className="w-8 h-8" />
                            </div>
                            <h3 className="text-base font-semibold text-[#171717] mb-1">No Questions Yet</h3>
                            <p className="text-sm text-[#8F8F8F] max-w-sm">Select a topic to generate AI-powered practice questions.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Preparation Modules */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-4">
                    <h2 className="text-lg font-semibold text-[#171717] flex items-center gap-2">
                        <Filter className="w-5 h-5 text-[#8F8F8F]" />
                        Learning Tracks
                    </h2>
                    <Badge variant="outline" className="bg-[#FFFFFF] border-[#EBEBEB] text-[#4D4D4D] px-2.5 py-0.5 rounded-full text-xs font-medium">PREP MODULES</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {PREP_SECTIONS.map((section) => (
                        <Link
                            key={section.id}
                            href={`/${locale}/prepforge/${section.id}`}
                        >
                            <div className="p-6 rounded-xl border border-[#EBEBEB] bg-[#FFFFFF] hover:border-[#171717] hover:shadow-[0_2px_4px_rgba(0,0,0,0.02),0_8px_16px_rgba(0,0,0,0.04)] transition-all group h-full flex flex-col">
                                <div className="mb-4 p-3 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] w-fit text-[#171717] group-hover:scale-105 transition-transform">
                                    {section.icon}
                                </div>
                                <h3 className="text-base font-semibold text-[#171717] mb-2">
                                    {section.title}
                                </h3>
                                <p className="text-sm text-[#4D4D4D] leading-relaxed mb-6">
                                    {section.description}
                                </p>
                                <div className="mt-auto flex items-center gap-2 text-xs font-medium text-[#171717] group-hover:gap-3 transition-all">
                                    Enter Channel <ChevronRight className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Motivation Quote / Tip Section */}
            <section className="p-8 rounded-xl bg-[#FFFFFF] border border-[#EBEBEB] shadow-sm relative overflow-hidden">
                <div className="max-w-3xl">
                    <h2 className="text-xl font-semibold text-[#171717] mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-[#B76E00]" />
                        Master Logic, Not Questions
                    </h2>
                    <p className="text-[#4D4D4D] text-sm leading-relaxed mb-6">
                        The goal is not to memorize 1000 questions, but to master the 50 underlying logic patterns that can solve any TCS NQT problem.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-5 rounded-lg border border-[#EBEBEB] bg-[#FAFAFA]">
                            <div className="text-[10px] text-[#8F8F8F] font-mono uppercase tracking-wider mb-1">Practice Streak</div>
                            <div className="text-xl font-semibold text-[#171717]">0 Days</div>
                        </div>
                        <div className="p-5 rounded-lg border border-[#EBEBEB] bg-[#FAFAFA]">
                            <div className="text-[10px] text-[#8F8F8F] font-mono uppercase tracking-wider mb-1">Patterns Learned</div>
                            <div className="text-xl font-semibold text-[#171717]">0 / 24</div>
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
            <div className="flex items-center justify-center min-h-screen bg-[#FAFAFA]">
                <Loader2 className="w-12 h-12 text-[#171717] animate-spin" />
            </div>
        }>
            <PrepForgeLogic />
        </Suspense>
    );
}
