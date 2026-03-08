'use client';

import { useState, useEffect } from 'react';
import {
    BarChart3, TrendingUp, AlertCircle, CheckCircle2,
    ChevronRight, Zap, Target, Brain, MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';

interface InterviewScore {
    id: string;
    technical_score: number;
    communication_score: number;
    confidence_score: number;
    problem_solving_score: number;
    overall_readiness: number;
    suggestions: string[];
    created_at: string;
}

export default function InterviewWeaknessTracker() {
    const [scores, setScores] = useState<InterviewScore[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/mock-interview/scores')
            .then(r => r.json())
            .then(d => {
                if (d.success) setScores(d.scores);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="h-48 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
    );

    if (scores.length === 0) return (
        <div className="p-12 rounded-3xl bg-white/5 border border-dashed border-white/10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto">
                <BarChart3 className="w-8 h-8 text-slate-600" />
            </div>
            <div>
                <h3 className="text-white font-bold">No Interview Data Yet</h3>
                <p className="text-slate-500 text-sm">Complete a mock interview to see your skill breakdown.</p>
            </div>
        </div>
    );

    const latest = scores[0];
    const categories = [
        { name: 'Technical', score: latest.technical_score, icon: Brain, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { name: 'Communication', score: latest.communication_score, icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        { name: 'Confidence', score: latest.confidence_score, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-400/10' },
        { name: 'Problem Solving', score: latest.problem_solving_score, icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-indigo-400" /> Interview Intelligence
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Detailed analysis of your latest mock session.</p>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-indigo-500 text-white font-black text-xl shadow-lg shadow-indigo-500/20">
                    {latest.overall_readiness}% <span className="text-[10px] uppercase block leading-none opacity-80">Readiness</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Skill Breakdown */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Core Competencies
                    </h3>
                    <div className="space-y-4">
                        {categories.map((cat, idx) => (
                            <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/5 group hover:border-white/10 transition-all">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg ${cat.bg} flex items-center justify-center ${cat.color}`}>
                                            <cat.icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-bold text-white">{cat.name}</span>
                                    </div>
                                    <span className={`text-sm font-black ${cat.color}`}>{cat.score}/10</span>
                                </div>
                                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${cat.score * 10}%` }}
                                        transition={{ duration: 1, delay: idx * 0.1 }}
                                        className={`h-full bg-current ${cat.color}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Suggestions / Weaknesses */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> Areas for Growth
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        {latest.suggestions?.slice(0, 4).map((tip, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-slate-900/50 border border-white/5 flex gap-4 items-start group hover:bg-slate-900 transition-colors">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0 group-hover:scale-150 transition-transform" />
                                <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors italic">{tip}</p>
                            </div>
                        ))}
                    </div>

                    <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                        View Full History <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
