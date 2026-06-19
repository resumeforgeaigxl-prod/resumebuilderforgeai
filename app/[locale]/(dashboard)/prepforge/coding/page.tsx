"use client"
export const dynamic = 'force-dynamic';

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
        <div className="space-y-10 max-w-5xl mx-auto text-[#171717]">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#EBEBEB] pb-8">
                <div className="space-y-3">
                    <Link 
                        href={`/${locale}/prepforge`}
                        className="flex items-center gap-2 text-xs font-semibold text-[#8F8F8F] hover:text-[#171717] transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Hub
                    </Link>
                    <h1 className="text-3xl font-semibold tracking-tight text-[#171717]">
                        CodingForge
                    </h1>
                    <p className="text-[#4D4D4D] mt-2 text-sm md:text-base">
                        Master the most frequent TCS NQT coding patterns with line-by-line logic walkthroughs.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                     <Badge variant="outline" className="px-4 py-1.5 rounded-lg border-[#EBEBEB] bg-[#FFFFFF] text-[#171717] font-semibold text-[10px]">
                        {allProblems.length} PROBLEMS
                    </Badge>
                </div>
            </div>

            {isLoading ? (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                    <Loader2 className="w-8 h-8 text-[#171717] animate-spin mb-3" />
                    <p className="text-[#8F8F8F] font-semibold text-xs">Loading problems...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allProblems.map((problem: UIProblem) => (
                        <Link 
                            key={problem.id} 
                            href={problem.isDynamic ? `/${locale}/prepforge?slug=${problem.slug}` : `/${locale}/prepforge/coding/${problem.slug}`}
                            className="group animate-fade-in"
                        >
                            <div className="p-6 h-full flex flex-col rounded-xl border border-[#EBEBEB] bg-[#FFFFFF] hover:border-[#171717]/25 hover:shadow-[0_2px_4px_rgba(0,0,0,0.02),0_8px_16px_rgba(0,0,0,0.04)] transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] text-[#171717] group-hover:scale-105 transition-transform">
                                        <Code2 className="w-5 h-5" />
                                    </div>
                                    <Badge variant="outline" className={`px-2.5 py-1 font-semibold text-[10px] ${
                                        problem.difficulty === 'Easy' ? 'text-emerald-700 border-emerald-100 bg-emerald-50' :
                                        problem.difficulty === 'Medium' ? 'text-amber-700 border-amber-100 bg-amber-50' :
                                        'text-rose-700 border-rose-100 bg-rose-50'
                                    }`}>
                                        {problem.difficulty}
                                        {problem.isDynamic && " (AI)"}
                                    </Badge>
                                </div>
                                
                                <h3 className="text-base font-semibold text-[#171717] mb-2 group-hover:text-[#0070F3] transition-colors">
                                    {problem.title}
                                </h3>
                                
                                <p className="text-sm text-[#4D4D4D] leading-relaxed line-clamp-2 mb-6">
                                    {problem.question}
                                </p>

                                <div className="mt-auto pt-4 border-t border-[#EBEBEB] flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-[10px] font-semibold text-[#8F8F8F] uppercase tracking-wider">
                                        <Target className="w-3.5 h-3.5 text-[#171717]" />
                                        {problem.approach.length} Steps
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] font-semibold text-[#8F8F8F] uppercase tracking-wider ml-auto">
                                        <ChevronRight className="w-3.5 h-3.5 group-hover:text-[#0070F3] transition-all" />
                                        View
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Pattern Focus Tip */}
            <div className="p-8 rounded-xl bg-[#FFFFFF] border border-[#EBEBEB] shadow-sm">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="shrink-0 p-4 rounded-lg bg-amber-50 border border-amber-100 text-[#B76E00]">
                        <Flame className="w-8 h-8" />
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-[#171717] mb-2">Pro Tip: The Symmetry Pattern</h4>
                        <p className="text-sm text-[#4D4D4D] leading-relaxed max-w-3xl border-l-2 border-[#171717]/40 pl-4">
                           Notice how Palindrome, Armstrong, and Reverse Number all share the same atomic logic—extracting digits using modulo and building a new number using division. Master this one pattern, and you've solved 30% of TCS NQT coding problems.
                        </p>
                    </div>
                    <Button variant="ghost" className="ml-auto text-xs font-semibold text-[#171717] hover:bg-[#FAFAFA] border border-[#EBEBEB] px-4 h-9 rounded-md">
                        View More Tips
                    </Button>
                </div>
            </div>
        </div>
    );
}
