"use client";

import React from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { 
    Code2, 
    ArrowLeft, 
    Terminal,
    BookOpen,
    HelpCircle,
    Layers,
    Copy,
    Share2,
    CheckCircle2,
    Lightbulb
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PREP_FORGE_CODING_PROBLEMS } from '@/lib/prepforge/data';

export default function CodingProblemDetail() {
    const params = useParams() as { locale: string; slug: string };
    const locale = params.locale || 'en-IN';
    const slug = params.slug;

    const problem = PREP_FORGE_CODING_PROBLEMS.find(p => p.slug === slug);

    if (!problem) {
        notFound();
    }

    const copyCode = () => {
        navigator.clipboard.writeText(problem.code.trim());
        // Toast logic could go here
    };

    return (
        <div className="space-y-12 animate-fade-in max-w-7xl mx-auto pb-24">
            {/* Navigation Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-8 mb-12">
                <Link 
                    href={`/${locale}/prepforge/coding`}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-blue-500 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Forge
                </Link>
                <div className="flex gap-4">
                    <Button variant="ghost" size="sm" onClick={copyCode} className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white border border-white/5 px-6 rounded-xl">
                        <Copy className="w-3.5 h-3.5 mr-2" />
                        Copy Code
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white border border-white/5 px-6 rounded-xl">
                        <Share2 className="w-3.5 h-3.5 mr-2" />
                        Share Logic
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Column: Question & Approach */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-10">
                    {/* Header info */}
                    <div className="space-y-6">
                        <Badge variant="outline" className={`px-4 py-1.5 rounded-full border-blue-500/20 bg-blue-500/5 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]`}>
                            {problem.difficulty} CHALLENGE
                        </Badge>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic">
                            {problem.title}
                        </h1>
                        <p className="text-slate-400 text-lg leading-relaxed font-medium p-6 rounded-3xl bg-white/[0.02] border border-white/5 border-l-4 border-l-blue-500 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform"><HelpCircle className="w-24 h-24" /></div>
                           <span className="relative z-10">{problem.question}</span>
                        </p>
                    </div>

                    {/* Approach Section */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tighter italic">
                            <BookOpen className="w-5 h-5 text-blue-500" />
                            Logical Approach_
                        </h2>
                        <div className="space-y-3">
                            {problem.approach.map((step, i) => (
                                <Card glass key={i} className="p-5 flex gap-5 border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group border-l-2 border-l-transparent hover:border-l-blue-500">
                                    <div className="shrink-0 w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs font-black border border-blue-500/20 shadow-sm group-hover:scale-110 transition-transform">
                                        {i + 1}
                                    </div>
                                    <span className="text-slate-400 text-sm font-medium leading-relaxed group-hover:text-slate-200 transition-colors">{step}</span>
                                </Card>
                            ))}
                        </div>
                    </div>

                     {/* Variations Section */}
                     <div className="space-y-6">
                        <h2 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tighter italic">
                            <Layers className="w-5 h-5 text-amber-500" />
                            Variations Hub_
                        </h2>
                        <div className="space-y-3">
                            {problem.variations.map((v, i) => (
                                <div key={i} className="p-5 flex items-center gap-4 rounded-2xl bg-amber-500/[0.03] border border-amber-500/10 group hover:bg-amber-500/5 transition-all cursor-default">
                                    <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 group-hover:rotate-12 transition-transform shadow-lg"><Lightbulb className="w-4 h-4" /></div>
                                    <span className="text-slate-500 text-xs font-black uppercase tracking-widest leading-relaxed group-hover:text-amber-400 transition-colors uppercase italic">{v}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Code & Explanation */}
                <div className="lg:col-span-12 xl:col-span-7 space-y-10">
                    {/* Code Section */}
                    <Card glass className="p-0 overflow-hidden border-white/10 shadow-2xl bg-[#0d0d1a]">
                        <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-white/[0.03]">
                            <div className="flex items-center gap-3">
                                <Terminal className="w-4 h-4 text-blue-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Implementation Protocol (JS)</span>
                            </div>
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-rose-500/50" />
                                <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                                <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                            </div>
                        </div>
                        <div className="p-8 pb-12 overflow-x-auto selection:bg-blue-500/20">
                            <pre className="text-sm font-mono text-emerald-400/90 leading-relaxed custom-scrollbar whitespace-pre-wrap">
                                {problem.code.trim()}
                            </pre>
                        </div>
                    </Card>

                    {/* Explanation Section */}
                    <div className="p-10 rounded-[2.5rem] bg-emerald-500/[0.02] border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 text-emerald-500"><Code2 className="w-24 h-24" /></div>
                        <h2 className="text-xl font-black text-white flex items-center gap-3 mb-10 uppercase tracking-tighter italic">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            Line-by-Line Breakdown_
                        </h2>
                        <div className="space-y-6">
                            {problem.explanation.map((line, i) => (
                                <div key={i} className="flex gap-6 pb-6 border-b border-white/[0.03] last:border-0 group/line">
                                    <div className="shrink-0 text-[10px] font-black text-emerald-500/40 uppercase tracking-widest group-hover/line:text-emerald-500 transition-colors">Point {i + 1}</div>
                                    <p className="text-slate-400 text-sm font-medium leading-loose group-hover/line:text-slate-200 transition-colors">{line}</p>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-12 p-8 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex flex-col md:flex-row items-center gap-8 group/footer">
                            <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400"><Code2 className="w-8 h-8" /></div>
                            <div>
                                <h4 className="text-lg font-black text-white mb-2 uppercase tracking-tighter italic">Ready to run this code?</h4>
                                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Execute in the interactive playground for deep analysis.</p>
                            </div>
                            <Button className="ml-auto bg-blue-600 hover:bg-blue-500 text-white border-0 px-8 rounded-2xl h-12">
                                Launch Playground
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
