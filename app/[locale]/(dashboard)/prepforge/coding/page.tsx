"use client";

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
        <div className="space-y-12 animate-fade-in max-w-7xl mx-auto">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-12">
                <div className="space-y-4">
                    <Link 
                        href={`/${locale}/prepforge/app`}
                        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-blue-500 transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Hub
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none italic">
                        Coding <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">Forge_</span>
                    </h1>
                    <p className="text-slate-400 text-lg font-medium max-w-2xl">
                        Master the most frequent TCS NQT coding patterns with line-by-line logic walkthroughs.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                     <Badge variant="outline" className="px-6 py-2 rounded-xl border-blue-500/20 bg-blue-500/5 text-blue-400 font-black">
                        {allProblems.length} PROBLEMS SYNCED
                    </Badge>
                </div>
            </div>

            {isLoading ? (
                <div className="p-20 flex flex-col items-center justify-center text-center">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                    <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Syncing with Coding Matrix...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allProblems.map((problem: UIProblem) => (
                        <Link 
                            key={problem.id} 
                            href={problem.isDynamic ? `/${locale}/prepforge/app?slug=${problem.slug}` : `/${locale}/prepforge/coding/${problem.slug}`}
                            className="group"
                        >
                            <Card glass className="p-8 h-full flex flex-col border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-blue-500/30 transition-all duration-300">
                                <div className="flex items-start justify-between mb-8">
                                    <div className="p-4 rounded-2xl bg-white/5 text-blue-400 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                                        <Code2 className="w-6 h-6" />
                                    </div>
                                    <Badge variant="outline" className={`px-3 py-1 font-black text-[10px] uppercase tracking-widest ${
                                        problem.difficulty === 'Easy' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' :
                                        problem.difficulty === 'Medium' ? 'text-amber-400 border-amber-500/20 bg-amber-500/5' :
                                        'text-rose-400 border-rose-500/20 bg-rose-500/5'
                                    }`}>
                                        {problem.difficulty}
                                        {problem.isDynamic && " (AI)"}
                                    </Badge>
                                </div>
                                
                                <h3 className="text-2xl font-black text-white mb-4 tracking-tight group-hover:text-blue-400 transition-colors uppercase italic leading-none">
                                    {problem.title}
                                </h3>
                                
                                <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-8 font-medium">
                                    {problem.question}
                                </p>

                                <div className="mt-auto space-y-6">
                                    <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <Target className="w-3.5 h-3.5 text-blue-500" />
                                            {problem.approach.length} Logic Steps
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 transition-all" />
                                            Protocol View
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            {/* Pattern Focus Tip */}
            <div className="p-12 rounded-[3rem] bg-gradient-to-r from-blue-500/10 to-transparent border border-white/5">
                <div className="flex flex-col md:flex-row gap-12 items-center">
                    <div className="shrink-0 p-6 rounded-full bg-blue-500/10 text-blue-400 animate-pulse">
                        <Flame className="w-12 h-12" />
                    </div>
                    <div>
                        <h4 className="text-2xl font-black text-white mb-4 tracking-tighter italic">Pro Tip: The Symmetry Pattern</h4>
                        <p className="text-slate-400 font-medium leading-relaxed max-w-3xl border-l-2 border-blue-500/30 pl-6 py-2">
                           Notice how Palindrome, Armstrong, and Reverse Number all share the same atomic logic—extracting digits using modulo and building a new number using division. Master this one pattern, and you've solved 30% of TCS NQT coding problems.
                        </p>
                    </div>
                    <Button variant="ghost" className="ml-auto text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white border border-white/5 px-8 h-12 rounded-xl">
                        View More Tips
                    </Button>
                </div>
            </div>
        </div>
    );
}
