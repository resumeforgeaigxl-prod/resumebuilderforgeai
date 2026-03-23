"use client";

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
        <div className="space-y-12 animate-fade-in max-w-7xl mx-auto">
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
                        Reasoning <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-emerald-400">Matrix_</span>
                    </h1>
                    <p className="text-slate-400 text-lg font-medium max-w-2xl">
                        Master the logical deduction and abstract reasoning patterns frequently tested in the TCS NQT curriculum.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                     <Badge variant="outline" className="px-6 py-2 rounded-xl border-purple-500/20 bg-purple-500/5 text-purple-400 font-black">
                        {questions.length} MODULES DEPLOYED
                    </Badge>
                </div>
            </div>

            {isLoading ? (
                <div className="p-20 flex flex-col items-center justify-center text-center">
                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                    <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Syncing with Reasoning Matrix...</p>
                </div>
            ) : questions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {questions.map((q) => (
                        <Link key={q.id} href={`/${locale}/prepforge/app?slug=${q.slug}`}>
                            <Card glass className="p-8 h-full flex flex-col border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-purple-500/30 transition-all duration-300 group">
                                <div className="flex items-start justify-between mb-8">
                                    <div className="p-4 rounded-2xl bg-white/5 text-purple-400 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                                        <CircuitBoard className="w-6 h-6" />
                                    </div>
                                    <Badge variant="outline" className="px-3 py-1 font-black text-[10px] uppercase tracking-widest text-purple-400 border-purple-500/20 bg-purple-500/5">
                                        {q.topic}
                                    </Badge>
                                </div>
                                <h3 className="text-2xl font-black text-white mb-4 tracking-tight group-hover:text-purple-400 transition-colors uppercase italic leading-none">
                                    {q.title}
                                </h3>
                                <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-8 font-medium">
                                    {q.problem}
                                </p>
                                <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <Target className="w-3.5 h-3.5 text-purple-500" />
                                        Pattern Study
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition-all" />
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <Card glass className="p-20 flex flex-col items-center text-center space-y-8 bg-purple-500/[0.02] border-white/5">
                    <div className="p-10 rounded-full bg-purple-500/10 text-purple-400">
                        <Construction className="w-20 h-20" />
                    </div>
                    <div>
                    <h2 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase italic">Reasoning Logic Offline</h2>
                    <p className="text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
                        Generate some reasoning signals in the <Link href={`/${locale}/prepforge/app`} className="text-purple-400 underline underline-offset-4">Logic Engine</Link> to start filling your track.
                    </p>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-30 pointer-events-none grayscale">
                {['Blood Relations', 'Syllogism', 'Seating Arrangement'].map((topic) => (
                    <Card key={topic} glass className="p-8 border-white/5 bg-white/[0.01]">
                        <div className="p-4 rounded-xl bg-white/5 w-fit mb-6 text-slate-500"><Brain className="w-6 h-6" /></div>
                        <h3 className="text-xl font-black text-white mb-2 tracking-tighter uppercase italic">{topic}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed mb-6 font-medium">Initializing matrix...</p>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600">Locked</div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
