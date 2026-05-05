"use client"
export const dynamic = 'force-dynamic';
;

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
    ChevronRight, 
    Code2, 
    ArrowLeft, 
    Flame,
    Loader2,
    Target
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PREP_FORGE_CODING_PROBLEMS } from '@/lib/prepforge/data';
import { createClient } from '@/lib/supabase/client';
import { PrepForgeQuestion } from '@/lib/prepforge/data';

interface UIProblem {
    id: string;
    title: string;
    slug: string;
    difficulty: string;
    question: string;
    approach: string[];
    variations: string[];
    isDynamic?: boolean;
}

export default function CodingForgeListing() {
    const params = useParams() as { locale: string };
    const locale = params.locale || 'en-IN';
    const [dbQuestions, setDbQuestions] = useState<PrepForgeQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchQuestions = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('prep_forge_questions')
                .select('*')
                .eq('type', 'coding')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setDbQuestions(data);
            }
            setIsLoading(false);
        };
        fetchQuestions();
    }, []);

    // Merge static and dynamic problems, avoiding duplicates by slug
    const allProblems = [
        ...dbQuestions.map(q => ({
            id: q.id,
            title: q.title,
            slug: q.slug,
            difficulty: 'Medium', // Default for AI gen
            question: q.problem,
            approach: q.approach || [],
            variations: q.variations || [],
            isDynamic: true
        })),
        ...PREP_FORGE_CODING_PROBLEMS.filter(p => !dbQuestions.some(q => q.slug === p.slug))
    ];

    return (
        <div className="space-y-10 max-w-5xl mx-auto">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1E2A42] pb-8">
                <div className="space-y-3">
                    <Link 
                        href={`/${locale}/prepforge/app`}
                        className="flex items-center gap-2 text-xs font-bold text-[#4A5568] hover:text-[#00D4A0] transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Hub
                    </Link>
                    <h1 className="text-4xl font-bold tracking-tight text-white">
                        CodingForge
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Master the most frequent TCS NQT coding patterns with line-by-line logic walkthroughs.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                     <Badge variant="outline" className="px-4 py-1.5 rounded-xl border-[#00D4A0]/20 bg-[#00D4A0]/5 text-[#00D4A0] font-bold text-[10px]">
                        {allProblems.length} PROBLEMS
                    </Badge>
                </div>
            </div>

            {isLoading ? (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                    <Loader2 className="w-8 h-8 text-[#00D4A0] animate-spin mb-3" />
                    <p className="text-[#4A5568] font-semibold text-xs">Loading problems...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allProblems.map((problem: UIProblem) => (
                        <Link 
                            key={problem.id} 
                            href={problem.isDynamic ? `/${locale}/prepforge/app?slug=${problem.slug}` : `/${locale}/prepforge/coding/${problem.slug}`}
                            className="group"
                        >
                            <div className="p-6 h-full flex flex-col rounded-xl border border-[#1E2A42] bg-[#0D1220]/60 hover:border-[#00D4A0]/20 transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 rounded-xl bg-white/5 text-[#00D4A0] group-hover:scale-105 transition-transform">
                                        <Code2 className="w-5 h-5" />
                                    </div>
                                    <Badge variant="outline" className={`px-2.5 py-1 font-bold text-[10px] ${
                                        problem.difficulty === 'Easy' ? 'text-[#00D4A0] border-[#00D4A0]/20 bg-[#00D4A0]/5' :
                                        problem.difficulty === 'Medium' ? 'text-[#F5A623] border-[#F5A623]/20 bg-[#F5A623]/5' :
                                        'text-rose-400 border-rose-500/20 bg-rose-500/5'
                                    }`}>
                                        {problem.difficulty}
                                        {problem.isDynamic && " (AI)"}
                                    </Badge>
                                </div>
                                
                                <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#00D4A0] transition-colors">
                                    {problem.title}
                                </h3>
                                
                                <p className="text-sm text-[#7A8BA8] leading-relaxed line-clamp-2 mb-6">
                                    {problem.question}
                                </p>

                                <div className="mt-auto pt-4 border-t border-[#1E2A42] flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-[#4A5568] uppercase tracking-wider">
                                        <Target className="w-3.5 h-3.5 text-[#00D4A0]" />
                                        {problem.approach.length} Steps
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-[#4A5568] uppercase tracking-wider">
                                        <ChevronRight className="w-3.5 h-3.5 group-hover:text-[#00D4A0] transition-all" />
                                        View
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Pattern Focus Tip */}
            <div className="p-8 rounded-2xl bg-[#0D1220]/60 border border-[#1E2A42]">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="shrink-0 p-4 rounded-full bg-[#F5A623]/10 text-[#F5A623]">
                        <Flame className="w-8 h-8" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-white mb-2">Pro Tip: The Symmetry Pattern</h4>
                        <p className="text-sm text-[#7A8BA8] leading-relaxed max-w-3xl border-l-2 border-[#00D4A0]/30 pl-4">
                           Notice how Palindrome, Armstrong, and Reverse Number all share the same atomic logic—extracting digits using modulo and building a new number using division. Master this one pattern, and you've solved 30% of TCS NQT coding problems.
                        </p>
                    </div>
                    <Button variant="ghost" className="ml-auto text-xs font-bold text-[#4A5568] hover:text-white border border-[#1E2A42] px-4 h-9 rounded-xl">
                        View More Tips
                    </Button>
                </div>
            </div>
        </div>
    );
}
