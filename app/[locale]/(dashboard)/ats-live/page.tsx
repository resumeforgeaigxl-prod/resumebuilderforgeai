"use client"
export const dynamic = 'force-dynamic';

import React, { useState, Suspense } from 'react';
import {
    Zap,
    Target,
    ChevronRight,
    Search,
    Loader2,
    Sparkles,
    FileText,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    LayoutPanelLeft,
    Layers,
    Cpu,
    MousePointer2
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

function AtsLiveLogic() {
    const params = useParams() as { locale: string };
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [jdText, setJdText] = useState('');
    const [score, setScore] = useState<number | null>(null);

    const [analysisData, setAnalysisData] = useState<{
        score: number;
        missing_signals: string[];
        optimization_strategy: string[];
        matching_keywords: string[];
    } | null>(null);

    const runAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            const res = await fetch('/api/ats-live/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    resumeData: { /* Current resume data would go here */ }, 
                    jdText: jdText 
                })
            });
            const data = await res.json();
            if (data.success) {
                setAnalysisData(data.data);
                setScore(data.data.score);
            }
        } catch (err) {
            console.error('AtsLive Error:', err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="space-y-12 max-w-5xl mx-auto pb-24">
            {/* Standardized Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1E2A42] pb-8 mb-12">
                <div>
                    <div className="flex items-center gap-2 text-[#00D4A0] font-bold tracking-widest text-[10px] uppercase mb-4">
                        <div className="w-2 h-2 rounded-full bg-[#00D4A0] animate-pulse" />
                        <Cpu className="w-3.5 h-3.5" /> Silicon Scanning Core
                    </div>
                    <h1 className="text-4xl font-bold tracking-tighter text-white uppercase">AtsLive</h1>
                    <p className="text-slate-400 mt-2 text-lg italic">Real-time semantic alignment between your resume and high-ticket JDs.</p>
                </div>

                <div className="flex items-center gap-4">
                    <Button onClick={runAnalysis} disabled={isAnalyzing || !jdText} className="px-6 h-12 rounded-xl bg-[#00D4A0] hover:bg-[#00D4A0]/90 text-[#080B16] font-bold text-sm shadow-lg shadow-[#00D4A0]/10 transition-all">
                        {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                        Initialize Live Scan
                    </Button>
                    <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0D1220] border border-[#1E2A42]">
                        <div className="text-[10px] text-[#4A5568] uppercase tracking-wider font-semibold">ATS_SIGNAL</div>
                        <Badge variant="outline" className="border-[#00D4A0]/20 bg-[#00D4A0]/5 text-[#00D4A0] text-[9px] font-bold uppercase">SCANNING</Badge>
                    </div>
                </div>
            </header>

            {/* Main Interactive Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Column */}
                <div className="space-y-6">
                    <div className="p-6 rounded-xl border border-[#1E2A42] bg-[#0D1220]/60 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold text-white flex items-center gap-2">
                                <FileText className="w-4 h-4 text-[#7C5CFC]" />
                                Target Job Description
                            </h2>
                            <Badge variant="outline" className="border-[#1E2A42] text-[#4A5568] text-[9px]">RAW INPUT</Badge>
                        </div>
                        <textarea
                            value={jdText}
                            onChange={(e) => setJdText(e.target.value)}
                            placeholder="Paste the job description here to start real-time semantic analysis..."
                            className="w-full h-64 bg-black/40 border border-[#1E2A42] rounded-xl p-4 text-sm text-[#7A8BA8] focus:outline-none focus:border-[#00D4A0]/50 transition-all resize-none custom-scrollbar"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-[#1E2A42] bg-[#0D1220]/60 text-center">
                            <div className="text-[10px] text-[#4A5568] uppercase font-bold mb-1">Keywords Detected</div>
                            <div className="text-xl font-bold text-white">{jdText ? jdText.split(/\W+/).length / 2 : 0}</div>
                        </div>
                        <div className="p-4 rounded-xl border border-[#1E2A42] bg-[#0D1220]/60 text-center">
                            <div className="text-[10px] text-[#4A5568] uppercase font-bold mb-1">Semantic Depth</div>
                            <div className="text-xl font-bold text-[#00D4A0]">High</div>
                        </div>
                    </div>
                </div>

                {/* Analysis Results Column */}
                <div className="space-y-6">
                    {analysisData ? (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-700 space-y-6">
                            <div className="p-8 rounded-xl border border-[#00D4A0]/20 bg-[#0D1220]/60 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Target className="w-24 h-24" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <Badge className="bg-[#00D4A0]/10 text-[#00D4A0] border-[#00D4A0]/20 px-3 py-1 font-bold text-[10px]">ALIGNMENT COMPLETE</Badge>
                                        <span className="text-[10px] text-[#4A5568] font-bold uppercase tracking-widest">Score Vector: {(analysisData.score / 100).toFixed(2)}</span>
                                    </div>

                                    <div className="flex items-end gap-4 mb-8">
                                        <div className="text-7xl font-black text-white tracking-tighter">{analysisData.score}</div>
                                        <div className="mb-2 text-xl font-bold text-[#4A5568]">/ 100</div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-white">Missing Semantic Signals</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {analysisData.missing_signals.map(tag => (
                                                <Badge key={tag} variant="secondary" className="bg-red-500/10 text-red-400 border-red-500/20 px-2.5 py-1 text-[10px] font-bold">
                                                    MISSING: {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-xl border border-[#1E2A42] bg-[#0D1220]/60">
                                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-[#7C5CFC]" />
                                    AI Optimization Strategy
                                </h3>
                                <ul className="space-y-3">
                                    {analysisData.optimization_strategy.map((step, i) => (
                                        <li key={i} className="flex gap-3 text-xs text-[#7A8BA8] leading-relaxed">
                                            <CheckCircle2 className="w-4 h-4 text-[#00D4A0] shrink-0" />
                                            {step}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-[#1E2A42] bg-transparent">
                            <div className="p-4 rounded-full bg-white/5 text-[#4A5568] mb-4">
                                <MousePointer2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-base font-bold text-[#7A8BA8] mb-1">Awaiting Signal</h3>
                            <p className="text-sm text-[#4A5568] max-w-sm">Paste a job description and click "Initialize" to start the real-time ATS alignment scan.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Strategic Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-[#0D1220]/60 border-[#1E2A42] hover:border-[#00D4A0]/20 transition-all">
                    <LayoutPanelLeft className="w-6 h-6 text-[#00D4A0] mb-4" />
                    <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-tight">Keyword Mapping</h3>
                    <p className="text-xs text-[#7A8BA8] leading-relaxed">Identifies exact and semantic keyword matches across all resume sectors.</p>
                </Card>
                <Card className="p-6 bg-[#0D1220]/60 border-[#1E2A42] hover:border-[#00D4A0]/20 transition-all">
                    <Layers className="w-6 h-6 text-[#7C5CFC] mb-4" />
                    <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-tight">Contextual Scoring</h3>
                    <p className="text-xs text-[#7A8BA8] leading-relaxed">Goes beyond simple matching to analyze the context and impact of your skills.</p>
                </Card>
                <Card className="p-6 bg-[#0D1220]/60 border-[#1E2A42] hover:border-[#00D4A0]/20 transition-all">
                    <ShieldCheck className="w-6 h-6 text-[#F5A623] mb-4" />
                    <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-tight">Recruiter-View</h3>
                    <p className="text-xs text-[#7A8BA8] leading-relaxed">Simulates how your resume appears to HR managers in top-tier hiring systems.</p>
                </Card>
            </div>
        </div>
    );
}

export default function AtsLiveApp() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-[#070710]">
                <Loader2 className="w-12 h-12 text-[#00D4A0] animate-spin" />
            </div>
        }>
            <AtsLiveLogic />
        </Suspense>
    );
}
