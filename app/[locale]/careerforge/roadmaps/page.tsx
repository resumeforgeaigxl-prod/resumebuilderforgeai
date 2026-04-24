'use client'
export const dynamic = 'force-dynamic';
;

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Compass, Map, Clock, ArrowRight, Loader2, Target, Sparkles } from 'lucide-react';

interface Roadmap {
    id: string;
    title: string;
    slug: string;
    description: string;
    estimated_duration: string;
}

export default function RoadmapsExplorer() {
    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
    const [loading, setLoading] = useState(true);
    const params = useParams() as { locale: string };
    const { locale } = params;

    useEffect(() => {
        fetch('/api/careerforge/roadmaps')
            .then(r => r.json())
            .then(data => {
                if (data.success) setRoadmaps(data.roadmaps);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch roadmaps', err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20 pt-32 px-6">
            {/* Header */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-2">
                    <Compass className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Career Explorer</span>
                </div>
                <h1 className="text-5xl font-black text-white uppercase tracking-tight">Architect Your <span className="text-indigo-500">Future</span></h1>
                <p className="text-slate-500 max-w-2xl mx-auto font-medium">
                    Choose a professionally curated career roadmap. Each path links directly to the Learning Library so every step leads to a concrete topic.
                </p>
            </div>

            {loading ? (
                <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    <p className="text-slate-500 font-bold animate-pulse text-xs uppercase tracking-widest">Calculating optimal paths...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {roadmaps.map((r) => (
                        <Link
                            key={r.id}
                            href={`/${locale}/careerforge/roadmaps/${r.slug}`}
                            className="group relative p-10 rounded-[2.5rem] bg-[#0a0a16] border border-white/5 hover:border-indigo-500/30 transition-all duration-500 overflow-hidden"
                        >
                            {/* Decorative Background */}
                            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] group-hover:bg-indigo-500/15 transition-all duration-1000"></div>

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-start justify-between mb-8">
                                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                        <Map className="w-8 h-8 text-indigo-400" />
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{r.estimated_duration}</span>
                                    </div>
                                </div>

                                <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tight leading-none group-hover:text-indigo-400 transition-colors">{r.title}</h3>
                                <p className="text-slate-500 font-medium mb-8 flex-1 leading-relaxed">
                                    {r.description}
                                </p>

                                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-[#0a0a16] flex items-center justify-center">
                                                    <Target className="w-3.5 h-3.5 text-slate-500" />
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Industry Standard</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-indigo-400 font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                                        View Roadmap <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}

                    <Link
                        href={`/${locale}/roadmap`}
                        className="group relative p-10 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 border-dashed hover:border-indigo-500/50 transition-all duration-500 flex flex-col items-center justify-center text-center space-y-6"
                    >
                        <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                            <Sparkles className="w-10 h-10 text-indigo-400 animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">AI Roadmap</h3>
                            <p className="text-slate-400 text-sm max-w-xs font-medium">
                                Generate a personalized AI roadmap and open each mapped skill directly in the Learning Library.
                            </p>
                        </div>
                        <div className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-black text-white uppercase tracking-widest group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-all">
                            Open AI Roadmap
                        </div>
                    </Link>

                </div>
            )}
        </div>
    );
}
