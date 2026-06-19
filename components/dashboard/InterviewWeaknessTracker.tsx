'use client';

import { useState, useEffect } from 'react';
import {
    BarChart3, TrendingUp, AlertCircle, CheckCircle2,
    ChevronRight, Zap, Target, Brain, MessageSquare, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

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
            <Loader2 className="animate-spin h-6 w-6 text-[#171717]" />
        </div>
    );

    if (scores.length === 0) return (
        <Card className="p-12 border-dashed border-[#EBEBEB] text-center bg-white rounded-xl shadow-sm space-y-4 max-w-5xl mx-auto">
            <div className="w-14 h-14 rounded-full bg-[#FAFAFA] border border-[#EBEBEB] flex items-center justify-center mx-auto shadow-sm">
                <BarChart3 className="w-6 h-6 text-[#8F8F8F]" />
            </div>
            <div>
                <h3 className="text-[#171717] font-semibold text-sm">No Interview Data Yet</h3>
                <p className="text-[#8F8F8F] text-xs mt-1">Complete a mock interview to see your skill breakdown.</p>
            </div>
        </Card>
    );

    const latest = scores[0];
    const categories = [
        { name: 'Technical', score: latest.technical_score, icon: Brain },
        { name: 'Communication', score: latest.communication_score, icon: MessageSquare },
        { name: 'Confidence', score: latest.confidence_score, icon: Zap },
        { name: 'Problem Solving', score: latest.problem_solving_score, icon: Target },
    ];

    return (
        <div className="space-y-6 text-[#171717] max-w-5xl mx-auto">
            <div className="flex items-center justify-between pb-6 border-b border-[#EBEBEB]">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-[#171717] flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[#171717]" /> Interview Intelligence
                    </h2>
                    <p className="text-[#8F8F8F] text-xs mt-1">Detailed analysis of your latest mock session.</p>
                </div>
                <div className="px-4 py-2 rounded-md bg-[#171717] text-white font-semibold text-base shadow-sm text-center">
                    {latest.overall_readiness}% <span className="text-[9px] uppercase block leading-none opacity-80 mt-0.5">Readiness</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Skill Breakdown */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-semibold text-[#8F8F8F] uppercase tracking-wider flex items-center gap-1.5 ml-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#171717]" /> Core Competencies
                    </h3>
                    <div className="space-y-3">
                        {categories.map((cat, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-white border border-[#EBEBEB] hover:border-[#171717] transition-all shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-8 h-8 rounded bg-[#FAFAFA] border border-[#EBEBEB] flex items-center justify-center text-[#171717]">
                                            <cat.icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-semibold text-[#171717]">{cat.name}</span>
                                    </div>
                                    <span className="text-xs font-semibold text-[#171717]">{cat.score}/10</span>
                                </div>
                                <div className="h-1.5 w-full bg-[#EBEBEB] rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${cat.score * 10}%` }}
                                        transition={{ duration: 1, delay: idx * 0.1 }}
                                        className="h-full bg-[#171717]"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Suggestions / Weaknesses */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-semibold text-[#8F8F8F] uppercase tracking-wider flex items-center gap-1.5 ml-1">
                        <AlertCircle className="w-3.5 h-3.5 text-[#171717]" /> Areas for Growth
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        {latest.suggestions?.slice(0, 4).map((tip, idx) => (
                            <div key={idx} className="p-3.5 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] flex gap-3.5 items-start hover:bg-white transition-colors shadow-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#171717] mt-1.5 shrink-0" />
                                <p className="text-xs text-[#4D4D4D] leading-normal italic">{tip}</p>
                            </div>
                        ))}
                    </div>

                    <button className="w-full h-10 rounded-md bg-white border border-[#EBEBEB] text-[#171717] text-xs font-semibold uppercase tracking-wider hover:bg-[#FAFAFA] transition-all flex items-center justify-center gap-2 shadow-sm">
                        View Full History <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
