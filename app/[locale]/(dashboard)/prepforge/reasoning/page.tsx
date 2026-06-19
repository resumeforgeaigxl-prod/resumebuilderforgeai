"use client"
export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
    ChevronRight, 
    Brain, 
    ArrowLeft, 
    Construction,
    Loader2,
    CircuitBoard,
    Target
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/client';
import { PrepForgeQuestion } from '@/lib/prepforge/data';

export default function ReasoningForge() {
    const params = useParams() as { locale: string };
    const locale = params.locale || 'en-IN';
    const [questions, setQuestions] = useState<PrepForgeQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchQuestions = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('prep_forge_questions')
                .select('*')
                .eq('type', 'reasoning')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setQuestions(data);
            }
            setIsLoading(false);
        };
        fetchQuestions();
    }, []);

    return (
        <div className="space-y-10 max-w-5xl mx-auto text-[#171717]">
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
                        ReasoningForge
                    </h1>
                    <p className="text-[#4D4D4D] mt-2 text-sm md:text-base">
                        Master the logical deduction and abstract reasoning patterns frequently tested in the TCS NQT curriculum.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                     <Badge variant="outline" className="px-4 py-1.5 rounded-lg border-[#EBEBEB] bg-[#FFFFFF] text-[#171717] font-semibold text-[10px]">
                        {questions.length} MODULES
                     </Badge>
                </div>
            </div>

            {isLoading ? (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                    <Loader2 className="w-8 h-8 text-[#171717] animate-spin mb-3" />
                    <p className="text-[#8F8F8F] font-semibold text-xs">Loading questions...</p>
                </div>
            ) : questions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {questions.map((q) => (
                        <Link key={q.id} href={`/${locale}/prepforge/app?slug=${q.slug}`} className="group">
                            <div className="p-6 h-full flex flex-col rounded-xl border border-[#EBEBEB] bg-[#FFFFFF] hover:border-[#171717]/25 hover:shadow-[0_2px_4px_rgba(0,0,0,0.02),0_8px_16px_rgba(0,0,0,0.04)] transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] text-[#171717] group-hover:scale-105 transition-transform">
                                        <CircuitBoard className="w-5 h-5" />
                                    </div>
                                    <Badge variant="outline" className="px-2.5 py-1 font-semibold text-[10px] text-blue-700 border-blue-100 bg-blue-50">
                                        {q.topic}
                                    </Badge>
                                </div>
                                <h3 className="text-base font-semibold text-[#171717] mb-2 group-hover:text-[#0070F3] transition-colors">
                                    {q.title}
                                </h3>
                                <p className="text-sm text-[#4D4D4D] leading-relaxed line-clamp-2 mb-6">
                                    {q.problem}
                                </p>
                                <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#EBEBEB]">
                                    <div className="flex items-center gap-2 text-[10px] font-semibold text-[#8F8F8F] uppercase tracking-wider">
                                        <Target className="w-3.5 h-3.5 text-[#171717]" />
                                        Pattern Study
                                    </div>
                                    <ChevronRight className="w-3.5 h-3.5 text-[#8F8F8F] group-hover:text-[#0070F3] transition-all" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="p-12 rounded-xl flex flex-col items-center text-center space-y-6 bg-[#FFFFFF] border border-[#EBEBEB] shadow-sm animate-fade-in">
                    <div className="p-6 rounded-lg bg-purple-50 border border-purple-100 text-purple-600">
                        <Construction className="w-12 h-12" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-[#171717] mb-2">No Patterns Yet</h2>
                        <p className="text-sm text-[#8F8F8F] max-w-md mx-auto">
                            Generate some reasoning patterns in the <Link href={`/${locale}/prepforge/app`} className="text-[#0070F3] underline underline-offset-4 font-semibold">Logic Engine</Link> to start filling your track.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 opacity-35 pointer-events-none grayscale">
                {['Blood Relations', 'Syllogism', 'Seating Arrangement'].map((topic) => (
                    <div key={topic} className="p-6 rounded-xl border border-[#EBEBEB] bg-[#FFFFFF]">
                        <div className="p-3 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] w-fit mb-4 text-[#8F8F8F]"><Brain className="w-5 h-5" /></div>
                        <h3 className="text-base font-semibold text-[#171717] mb-1">{topic}</h3>
                        <p className="text-xs text-[#8F8F8F] mb-4">Coming soon...</p>
                        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[#8F8F8F]">Locked</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
