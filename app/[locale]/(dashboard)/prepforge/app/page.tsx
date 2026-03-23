"use client";

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

function PrepForgeLogic() {
    const params = useParams() as { locale: string };
    const locale = params.locale || 'en-IN';
    const searchParams = useSearchParams();
    const slug = searchParams?.get('slug');

    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState('Numbers');
    const [generatedQuestion, setGeneratedQuestion] = useState<PrepForgeQuestion | null>(null);
    const [dailyBundle, setDailyBundle] = useState<PrepForgeQuestion[]>([]);

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
            }
        } catch (err) {
            console.error('Daily Gen Error', err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-12 animate-fade-in max-w-7xl mx-auto pb-24">
            {/* Hero / Welcome */}
            <div className="relative p-12 lg:p-16 rounded-[3rem] bg-gradient-to-br from-blue-500/10 via-transparent to-emerald-500/5 border border-white/5 overflow-hidden group shadow-2xl">
                {/* Visual accents */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full group-hover:bg-blue-500/20 transition-all duration-1000" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full group-hover:bg-emerald-500/20 transition-all duration-1000" />

                <div className="relative flex flex-col lg:flex-row items-center justify-between gap-12">
                    <div className="max-w-2xl text-center lg:text-left">
                        <Badge variant="outline" className="px-4 py-1.5 rounded-full border-blue-500/20 bg-blue-500/5 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                            <Zap className="w-3.5 h-3.5 mr-2" />
                            Active Signal: TCS NQT Prep
                        </Badge>
                        <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-[1.05]">
                            Forge Your <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">TCS Success.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed font-medium">
                            Master pattern-based logic for Aptitude, Reasoning, and Coding. Designed specifically for the TCS NQT curriculum.
                        </p>
                        <div className="flex flex-wrap justify-center lg:justify-start gap-5">
                            <Button onClick={() => generateDaily()} disabled={isGenerating} size="lg" className="px-10 h-14 rounded-2xl shadow-xl shadow-blue-500/20 group bg-blue-600 hover:bg-blue-500 text-white border-0">
                                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
                                Daily Protocol (5+2)
                            </Button>
                            <Button variant="outline" size="lg" className="px-10 h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-black">
                                Pattern Roadmap
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 w-full lg:w-80">
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-2 text-center lg:text-left">Quick Patterns</div>
                        {PREVIEW_PROBLEMS.map((item, i) => (
                           <Link key={i} href={`/${locale}/prepforge/coding/${item.slug}`}>
                            <Card glass className="p-4 flex items-center gap-4 border-white/5 bg-white/[0.01] hover:bg-white/[0.05] transition-all cursor-pointer group">
                                <div className="p-2 rounded-lg bg-white/5 text-blue-400 group-hover:scale-110 transition-transform">{item.icon}</div>
                                <div className="text-sm font-bold text-white tracking-tight">{item.title}</div>
                                <ChevronRight className="w-4 h-4 ml-auto text-slate-600 group-hover:text-blue-400 transition-colors" />
                            </Card>
                           </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* AI Generator Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card glass className="lg:col-span-1 p-8 space-y-8 border-white/5 bg-white/[0.01]">
                    <div className="space-y-2">
                        <h2 className="text-xl font-black text-white tracking-tight uppercase italic flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-blue-400" />
                            AI Logic Engine_
                        </h2>
                        <p className="text-xs text-slate-500 font-medium tracking-wide">Generate custom TCS NQT patterns instantly.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Select Topic Signal</div>
                        <div className="grid grid-cols-1 gap-2">
                            {['Numbers', 'Arrays', 'Strings'].map(topic => (
                                <button
                                    key={topic}
                                    onClick={() => setSelectedTopic(topic)}
                                    className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all text-left flex items-center justify-between group ${
                                        selectedTopic === topic 
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
                        className="w-full h-14 rounded-2xl bg-white text-black hover:bg-slate-200 font-black uppercase tracking-widest text-[10px] shadow-xl group"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2 group-hover:scale-125 transition-transform" />}
                        Generate TCS Question
                    </Button>
                </Card>

                <div className="lg:col-span-2">
                    {generatedQuestion ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                             <Card glass className="p-10 border-blue-500/20 bg-blue-500/[0.02]">
                                <div className="flex items-center justify-between mb-8">
                                    <Badge variant="outline" className="px-3 py-1 border-blue-500/30 text-blue-400 font-black text-[10px] uppercase">AI GENERATED PROTOCOL</Badge>
                                    <div className="text-xs font-black text-slate-500 italic uppercase">Topic: {generatedQuestion.topic}</div>
                                </div>
                                
                                <h3 className="text-2xl font-black text-white mb-6 underline decoration-blue-500/50 underline-offset-8 decoration-2 italic">
                                    {generatedQuestion.title || 'The Challenge_'}
                                </h3>
                                <p className="text-slate-300 font-medium leading-relaxed mb-10 text-lg">
                                    {generatedQuestion.problem}
                                </p>

                                {generatedQuestion.input_output && (
                                    <div className="mb-10 p-6 rounded-2xl bg-black/40 border border-white/5 font-mono text-sm text-blue-400">
                                        <div className="text-[10px] uppercase font-black text-slate-500 mb-2">Input / Output Signal</div>
                                        {generatedQuestion.input_output}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                    <div className="space-y-6">
                                        <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                            <Layers className="w-4 h-4 text-blue-400" /> Logical Approach
                                        </h4>
                                        <ul className="space-y-4">
                                            {generatedQuestion.approach.map((step: string, i: number) => (
                                                <li key={i} className="flex gap-4 text-sm text-slate-400 leading-relaxed group">
                                                    <span className="shrink-0 w-6 h-6 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-[10px] font-black">{i+1}</span>
                                                    <span className="group-hover:text-slate-200 transition-colors">{step}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {generatedQuestion.code && (
                                        <div className="space-y-6">
                                            <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                                <Terminal className="w-4 h-4 text-blue-400" /> Java Implementation
                                            </h4>
                                            <div className="p-6 rounded-2xl bg-black/60 border border-white/5 font-mono text-xs text-emerald-400/90 leading-relaxed overflow-x-auto max-h-[400px] custom-scrollbar">
                                                <pre className="whitespace-pre-wrap font-mono">
                                                    {generatedQuestion.code.trim()}
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {generatedQuestion.line_explanation && generatedQuestion.line_explanation.length > 0 && (
                                    <div className="mb-10 p-8 rounded-3xl bg-white/[0.02] border border-white/5">
                                        <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-emerald-400" /> Line-by-Line Breakdown
                                        </h4>
                                        <div className="space-y-3">
                                            {generatedQuestion.line_explanation.map((line: string, i: number) => (
                                                <div key={i} className="text-xs text-slate-500 leading-relaxed flex gap-4 border-b border-white/5 pb-2 last:border-0 italic">
                                                    <span className="text-emerald-500/40 font-black">{i+1}</span>
                                                    {line}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-8 border-t border-white/10 flex items-center justify-between">
                                    <div className="flex flex-col gap-2">
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mastery Variants</div>
                                        <div className="flex flex-wrap gap-2">
                                            {generatedQuestion.variations.map((v: string, i: number) => (
                                                <Badge key={i} variant="secondary" className="bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5">{v}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                    {dailyBundle.length > 0 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setGeneratedQuestion(null)}
                                            className="border-blue-500/20 bg-blue-500/5 text-blue-400 font-black uppercase text-[10px] hover:bg-blue-500/10 hover:border-blue-500/40"
                                        >
                                            <Undo2 className="w-3 h-3 mr-2" /> Back to Bundle
                                        </Button>
                                    )}
                                </div>
                             </Card>
                        </div>
                    ) : dailyBundle.length > 0 ? (
                        <div className="space-y-6 animate-in fade-in duration-700">
                             <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-black text-white italic">Daily Protocol Bundle <span className="text-blue-500">(7 Signals)</span></h3>
                                <Button variant="ghost" size="sm" onClick={() => setDailyBundle([])} className="text-[10px] font-black uppercase text-slate-500 hover:text-white">Clear Bundle</Button>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {dailyBundle.map((q: PrepForgeQuestion, i: number) => (
                                    <Card key={i} glass onClick={() => setGeneratedQuestion(q)} className="p-6 cursor-pointer border-white/5 hover:border-blue-500/30 bg-white/[0.01] hover:bg-white/[0.03] group transition-all relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                                            <Brain className="w-12 h-12" />
                                        </div>
                                        <div className="flex items-center justify-between mb-4 relative z-10">
                                            <Badge className={`uppercase text-[9px] font-black tracking-widest ${q.type === 'coding' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>{q.type}</Badge>
                                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                                        </div>
                                        <h4 className="text-sm font-black text-white mb-2 leading-tight group-hover:text-blue-400 transition-colors uppercase italic tracking-tight">{q.title || 'Signal Entry ' + (i+1)}</h4>
                                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">{q.problem}</p>
                                    </Card>
                                ))}
                             </div>
                        </div>
                    ) : (
                        <Card glass className="h-full flex flex-col items-center justify-center p-20 text-center border-dashed border-white/10 bg-transparent">
                            <div className="p-6 rounded-full bg-white/5 text-slate-600 mb-6">
                                <Sparkles className="w-12 h-12" />
                            </div>
                            <h3 className="text-xl font-black text-slate-400 mb-2 uppercase italic tracking-tighter">Logic Engine Offline</h3>
                            <p className="text-slate-600 text-sm font-medium max-w-sm">Select a topic signal to initialize the AI-powered pattern generator.</p>
                        </Card>
                    )}
                </div>
            </div>

            {/* Preparation Modules */}
            <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3 italic">
                        <Filter className="w-6 h-6 text-blue-500" />
                        Learning Tracks_
                    </h2>
                    <Badge variant="secondary" className="bg-white/5 text-slate-500 px-3 py-1 font-black uppercase tracking-tighter">Preparation Protocol</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {PREP_SECTIONS.map((section) => (
                        <Link
                            key={section.id}
                            href={`/${locale}/prepforge/${section.id}`}
                        >
                            <Card glass className="p-8 group hover:border-white/20 transition-all flex flex-col h-full bg-white/[0.01] hover:bg-white/[0.03]">
                                <div className={`mb-8 p-4 rounded-2xl bg-white/5 w-fit group-hover:scale-110 transition-transform duration-500 shadow-lg text-blue-400`}>
                                    {section.icon}
                                </div>

                                <h3 className="text-xl font-black text-white mb-3 tracking-tighter uppercase italic">
                                    {section.title}
                                </h3>
                                <p className="text-sm text-slate-500 leading-relaxed mb-8 font-medium">
                                    {section.description}
                                </p>

                                <div className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 group-hover:gap-4 transition-all">
                                    Enter Channel <ChevronRight className="w-4 h-4" />
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Motivation Quote / Tip Section */}
            <section className="relative p-12 rounded-[3rem] bg-blue-500/[0.02] border border-white/5 overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5">
                    <Brain className="w-32 h-32" />
                </div>
                
                <div className="max-w-3xl">
                    <h2 className="text-3xl font-black text-white mb-6 tracking-tight flex items-center gap-2">
                        <Zap className="w-6 h-6 text-amber-500" />
                        Master Logic, Not Questions.
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed mb-8 font-medium italic">
                        "The goal of PrepForge is not to help you memorize 1000 questions, but to help you master the 50 underlying logic patterns that can solve any TCS NQT problem."
                    </p>
                    <div className="flex gap-4">
                        <div className="flex-1 p-6 rounded-2xl bg-white/5 border border-white/5">
                            <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Practice Streak</div>
                            <div className="text-2xl font-black text-white">0 Days</div>
                        </div>
                        <div className="flex-1 p-6 rounded-2xl bg-white/5 border border-white/5">
                            <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Patterns Learned</div>
                            <div className="text-2xl font-black text-white">0 / 24</div>
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
