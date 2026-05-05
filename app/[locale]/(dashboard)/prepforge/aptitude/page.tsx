"use client"
export const dynamic = 'force-dynamic';
;

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    ChevronRight,
    Divide,
    ArrowLeft,
    Construction,
    Loader2,
    Calculator,
    Target
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/client';
import { PrepForgeQuestion } from '@/lib/prepforge/data';

export default function AptitudeForge() {
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
                .eq('type', 'aptitude')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setQuestions(data);
            }
            setIsLoading(false);
        };
        fetchQuestions();
    }, []);

    return (
        <div className="space-y-10 max-w-5xl mx-auto">
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
                        AptitudeForge
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Master quantitative analysis and mathematical logic shortcuts for TCS NQT.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Badge variant="outline" className="px-4 py-1.5 rounded-xl border-[#00D4A0]/20 bg-[#00D4A0]/5 text-[#00D4A0] font-bold text-[10px]">
                        {questions.length} PATTERNS
                    </Badge>
                </div>
            </div>

            {isLoading ? (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                    <Loader2 className="w-8 h-8 text-[#00D4A0] animate-spin mb-3" />
                    <p className="text-[#4A5568] font-semibold text-xs">Loading questions...</p>
                </div>
            ) : questions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {questions.map((q) => (
                        <Link key={q.id} href={`/${locale}/prepforge/app?slug=${q.slug}`}>
                            <div className="p-6 h-full flex flex-col rounded-xl border border-[#1E2A42] bg-[#0D1220]/60 hover:border-[#00D4A0]/20 transition-all group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 rounded-xl bg-white/5 text-[#00D4A0] group-hover:scale-105 transition-transform">
                                        <Calculator className="w-5 h-5" />
                                    </div>
                                    <Badge variant="outline" className="px-2.5 py-1 font-bold text-[10px] text-[#7C5CFC] border-[#7C5CFC]/20 bg-[#7C5CFC]/5">
                                        {q.topic}
                                    </Badge>
                                </div>
                                <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#00D4A0] transition-colors">
                                    {q.title}
                                </h3>
                                <p className="text-sm text-[#7A8BA8] leading-relaxed line-clamp-2 mb-6">
                                    {q.problem}
                                </p>
                                <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#1E2A42]">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-[#4A5568] uppercase tracking-wider">
                                        <Target className="w-3.5 h-3.5 text-[#00D4A0]" />
                                        Pattern Study
                                    </div>
                                    <ChevronRight className="w-3.5 h-3.5 text-[#4A5568] group-hover:text-[#00D4A0] transition-all" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="p-12 rounded-2xl flex flex-col items-center text-center space-y-6 bg-[#0D1220]/60 border border-[#1E2A42]">
                    <div className="p-6 rounded-full bg-[#00D4A0]/10 text-[#00D4A0]">
                        <Construction className="w-12 h-12" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2">No Patterns Yet</h2>
                        <p className="text-sm text-[#7A8BA8] max-w-md mx-auto">
                            Generate some aptitude patterns in the <Link href={`/${locale}/prepforge/app`} className="text-[#00D4A0] underline underline-offset-4">Logic Engine</Link> to start filling your track.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 opacity-30 pointer-events-none grayscale">
                {['Time & Work', 'Profit & Loss', 'Percentage'].map((topic) => (
                    <div key={topic} className="p-6 rounded-xl border border-[#1E2A42] bg-[#0D1220]/60">
                        <div className="p-3 rounded-xl bg-white/5 w-fit mb-4 text-[#4A5568]"><Divide className="w-5 h-5" /></div>
                        <h3 className="text-base font-bold text-white mb-1">{topic}</h3>
                        <p className="text-xs text-[#4A5568] mb-4">Coming soon...</p>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#4A5568]">Locked</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
