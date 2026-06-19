"use client"
export const dynamic = 'force-dynamic';

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
    };

    return (
        <div className="space-y-12 animate-fade-in max-w-7xl mx-auto pb-24 text-[#171717]">
            {/* Navigation Header */}
            <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-8 mb-12">
                <Link 
                    href={`/${locale}/prepforge/coding`}
                    className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8F8F8F] hover:text-[#171717] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Forge
                </Link>
                <div className="flex gap-4">
                    <Button variant="ghost" size="sm" onClick={copyCode} className="text-xs font-semibold uppercase tracking-wider text-[#4D4D4D] hover:bg-[#FAFAFA] border border-[#EBEBEB] px-6 rounded-md">
                        <Copy className="w-3.5 h-3.5 mr-2" />
                        Copy Code
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs font-semibold uppercase tracking-wider text-[#4D4D4D] hover:bg-[#FAFAFA] border border-[#EBEBEB] px-6 rounded-md">
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
                        <Badge variant="outline" className="px-4 py-1.5 rounded-lg border-blue-100 bg-blue-50 text-blue-700 text-[10px] font-semibold uppercase tracking-wider">
                            {problem.difficulty} CHALLENGE
                        </Badge>
                        <h1 className="text-3xl md:text-4xl font-semibold text-[#171717] tracking-tight">
                            {problem.title}
                        </h1>
                        <div className="text-[#4D4D4D] text-sm leading-relaxed p-6 rounded-xl bg-[#FFFFFF] border border-[#EBEBEB] border-l-4 border-l-[#0070F3] shadow-sm relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform"><HelpCircle className="w-24 h-24 text-[#171717]" /></div>
                           <span className="relative z-10">{problem.question}</span>
                        </div>
                    </div>

                    {/* Approach Section */}
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-[#171717] flex items-center gap-3 uppercase tracking-tight">
                            <BookOpen className="w-5 h-5 text-[#0070F3]" />
                            Logical Approach
                        </h2>
                        <div className="space-y-3">
                            {problem.approach.map((step, i) => (
                                <Card key={i} className="p-5 flex gap-5 border-[#EBEBEB] bg-[#FFFFFF] hover:border-[#171717]/25 hover:shadow-sm transition-all group border-l-2 border-l-transparent hover:border-l-[#0070F3] rounded-xl">
                                    <div className="shrink-0 w-8 h-8 rounded-full bg-blue-50 text-[#0070F3] flex items-center justify-center text-xs font-semibold border border-blue-100 shadow-sm group-hover:scale-110 transition-transform">
                                        {i + 1}
                                    </div>
                                    <span className="text-[#4D4D4D] text-sm leading-relaxed group-hover:text-[#171717] transition-colors">{step}</span>
                                </Card>
                            ))}
                        </div>
                    </div>

                     {/* Variations Section */}
                     <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-[#171717] flex items-center gap-3 uppercase tracking-tight">
                            <Layers className="w-5 h-5 text-amber-600" />
                            Variations Hub
                        </h2>
                        <div className="space-y-3">
                            {problem.variations.map((v, i) => (
                                <div key={i} className="p-5 flex items-center gap-4 rounded-xl bg-amber-50/20 border border-amber-100 group hover:bg-amber-50/40 transition-all cursor-default">
                                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-100 text-[#B76E00] group-hover:rotate-12 transition-transform shadow-sm"><Lightbulb className="w-4 h-4" /></div>
                                    <span className="text-[#4D4D4D] text-xs font-semibold uppercase tracking-wider leading-relaxed group-hover:text-[#B76E00] transition-colors">{v}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Code & Explanation */}
                <div className="lg:col-span-12 xl:col-span-7 space-y-10">
                    {/* Code Section */}
                    <Card className="p-0 overflow-hidden border-[#EBEBEB] shadow-sm bg-[#FFFFFF] rounded-xl">
                        <div className="flex items-center justify-between px-8 py-4 border-b border-[#EBEBEB] bg-[#FAFAFA]">
                            <div className="flex items-center gap-3">
                                <Terminal className="w-4 h-4 text-[#171717]" />
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8F8F8F]">Implementation Protocol</span>
                            </div>
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#EBEBEB]" />
                                <div className="w-2.5 h-2.5 rounded-full bg-[#EBEBEB]" />
                                <div className="w-2.5 h-2.5 rounded-full bg-[#EBEBEB]" />
                            </div>
                        </div>
                        <div className="p-8 pb-10 overflow-x-auto bg-[#FAFAFA] border-t border-[#EBEBEB]">
                            <pre className="text-sm font-mono text-[#171717] leading-relaxed custom-scrollbar whitespace-pre-wrap">
                                {problem.code.trim()}
                            </pre>
                        </div>
                    </Card>

                    {/* Explanation Section */}
                    <div className="p-10 rounded-xl bg-[#FFFFFF] border border-[#EBEBEB] relative overflow-hidden group shadow-sm">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-[#171717]"><Code2 className="w-24 h-24" /></div>
                        <h2 className="text-lg font-semibold text-[#171717] flex items-center gap-3 mb-10 uppercase tracking-tight">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            Line-by-Line Breakdown
                        </h2>
                        <div className="space-y-6">
                            {problem.explanation.map((line, i) => (
                                <div key={i} className="flex gap-6 pb-6 border-b border-[#EBEBEB] last:border-0 group/line">
                                    <div className="shrink-0 text-[10px] font-semibold text-[#8F8F8F] uppercase tracking-wider group-hover/line:text-[#171717] transition-colors">Point {i + 1}</div>
                                    <p className="text-[#4D4D4D] text-sm leading-relaxed group-hover/line:text-[#171717] transition-colors">{line}</p>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-12 p-6 rounded-xl bg-blue-50/20 border border-blue-100 flex flex-col md:flex-row items-center gap-8 group/footer">
                            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-[#0070F3]"><Code2 className="w-6 h-6" /></div>
                            <div>
                                <h4 className="text-base font-semibold text-[#171717] mb-1">Ready to run this code?</h4>
                                <p className="text-[#8F8F8F] text-xs">Execute in the interactive playground for deep analysis.</p>
                            </div>
                            <Button className="ml-auto bg-[#171717] hover:bg-[#333333] text-white border-0 px-6 rounded-md h-10 text-xs font-semibold">
                                Launch Playground
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
