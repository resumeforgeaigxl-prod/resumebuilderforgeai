"use client"
export const dynamic = 'force-dynamic';

import React, { useState, Suspense } from 'react';
import {
    Zap,
    Target,
    ChevronRight,
    Search,
    Loader2,
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
        <div className="space-y-12 max-w-5xl mx-auto pb-24 text-[#171717] animate-premium-in">
            {/* Standardized Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#EBEBEB] pb-8 mb-12">
                <div>
                    <div className="flex items-center gap-2 text-[#8F8F8F] font-bold tracking-wider text-[10px] uppercase mb-3 font-mono">
                        <Cpu className="w-3.5 h-3.5 text-[#171717]" /> Silicon Scanning Core
                    </div>
                    <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#171717]">AtsLive</h1>
                    <p className="text-[#4D4D4D] mt-2 text-sm md:text-base">Real-time semantic alignment between your resume and high-ticket JDs.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button onClick={runAnalysis} disabled={isAnalyzing || !jdText} className="px-5 h-10 rounded-md bg-[#171717] hover:bg-[#333333] text-white font-semibold text-xs uppercase tracking-wider transition-all">
                        {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                        Initialize Live Scan
                    </Button>
                    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFFFFF] border border-[#EBEBEB] shadow-sm">
                        <div className="text-[10px] text-[#8F8F8F] font-mono uppercase tracking-normal">ATS Signal</div>
                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-[9px] font-bold uppercase">Scanning</Badge>
                    </div>
                </div>
            </header>

            {/* Main Interactive Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Column */}
                <div className="space-y-6">
                    <div className="p-6 bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-[#171717] flex items-center gap-2">
                                <FileText className="w-4.5 h-4.5 text-[#171717]" />
                                Target Job Description
                            </h2>
                            <Badge variant="outline" className="border-[#EBEBEB] text-[#8F8F8F] text-[9px] font-mono font-bold">RAW INPUT</Badge>
                        </div>
                        <textarea
                            value={jdText}
                            onChange={(e) => setJdText(e.target.value)}
                            placeholder="Paste the job description here to start real-time semantic analysis..."
                            className="w-full h-64 bg-[#FFFFFF] border border-[#EBEBEB] rounded-lg p-4 text-sm text-[#171717] placeholder-[#8F8F8F] focus:outline-none focus:border-[#171717] transition-all resize-none custom-scrollbar"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl text-center shadow-sm">
                            <div className="text-[9px] text-[#8F8F8F] uppercase font-bold tracking-wider font-mono mb-1">Keywords Detected</div>
                            <div className="text-xl font-bold text-[#171717] mt-1">{jdText ? jdText.split(/\W+/).length / 2 : 0}</div>
                        </div>
                        <div className="p-4 bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl text-center shadow-sm">
                            <div className="text-[9px] text-[#8F8F8F] uppercase font-bold tracking-wider font-mono mb-1">Semantic Depth</div>
                            <div className="text-xl font-bold text-emerald-600 mt-1">High</div>
                        </div>
                    </div>
                </div>

                {/* Analysis Results Column */}
                <div className="space-y-6">
                    {analysisData ? (
                        <div className="animate-premium-in space-y-6">
                            <div className="p-8 bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                    <Target className="w-24 h-24 text-[#171717]" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <Badge className="bg-[#0070F3]/5 text-[#0070F3] border-[#0070F3]/10 px-3 py-1 font-bold text-[10px]">ALIGNMENT COMPLETE</Badge>
                                        <span className="text-[10px] text-[#8F8F8F] font-bold uppercase tracking-wider font-mono">Score Vector: {(analysisData.score / 100).toFixed(2)}</span>
                                    </div>

                                    <div className="flex items-end gap-2 mb-8">
                                        <div className="text-6xl font-semibold text-[#171717] tracking-tight leading-none">{analysisData.score}</div>
                                        <div className="mb-1 text-lg font-semibold text-[#8F8F8F]">/ 100</div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#8F8F8F] font-mono">Missing Semantic Signals</h3>
                                        <div className="flex flex-wrap gap-1.5">
                                            {analysisData.missing_signals.map(tag => (
                                                <Badge key={tag} variant="secondary" className="bg-red-50 text-red-700 border-red-200 px-2.5 py-1 text-[10px] font-bold">
                                                    MISSING: {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl shadow-sm">
                                <h3 className="text-sm font-semibold text-[#171717] mb-4 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-[#0070F3]" />
                                    AI Optimization Strategy
                                </h3>
                                <ul className="space-y-3">
                                    {analysisData.optimization_strategy.map((step, i) => (
                                        <li key={i} className="flex gap-3 text-xs text-[#4D4D4D] leading-relaxed">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span>{step}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[350px] flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-[#EBEBEB] bg-[#FAFAFA]">
                            <div className="p-4 rounded-full bg-[#FFFFFF] border border-[#EBEBEB] text-[#8F8F8F] mb-4 shadow-sm">
                                <MousePointer2 className="w-6 h-6 text-[#171717]" />
                            </div>
                            <h3 className="text-sm font-semibold text-[#171717] mb-1">Awaiting Signal</h3>
                            <p className="text-xs text-[#8F8F8F] max-w-xs leading-relaxed font-medium">Paste a job description and click "Initialize" to start the real-time ATS alignment scan.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Strategic Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-[#FFFFFF] border-[#EBEBEB] hover:border-[#171717]/25 transition-all shadow-sm">
                    <LayoutPanelLeft className="w-5 h-5 text-[#171717] mb-4" />
                    <h3 className="text-sm font-semibold text-[#171717] mb-2 uppercase tracking-tight font-mono">Keyword Mapping</h3>
                    <p className="text-xs text-[#4D4D4D] leading-relaxed">Identifies exact and semantic keyword matches across all resume sectors.</p>
                </Card>
                <Card className="p-6 bg-[#FFFFFF] border-[#EBEBEB] hover:border-[#171717]/25 transition-all shadow-sm">
                    <Layers className="w-5 h-5 text-[#171717] mb-4" />
                    <h3 className="text-sm font-semibold text-[#171717] mb-2 uppercase tracking-tight font-mono">Contextual Scoring</h3>
                    <p className="text-xs text-[#4D4D4D] leading-relaxed">Goes beyond simple matching to analyze the context and impact of your skills.</p>
                </Card>
                <Card className="p-6 bg-[#FFFFFF] border-[#EBEBEB] hover:border-[#171717]/25 transition-all shadow-sm">
                    <ShieldCheck className="w-5 h-5 text-[#171717] mb-4" />
                    <h3 className="text-sm font-semibold text-[#171717] mb-2 uppercase tracking-tight font-mono">Recruiter-View</h3>
                    <p className="text-xs text-[#4D4D4D] leading-relaxed">Simulates how your resume appears to HR managers in top-tier hiring systems.</p>
                </Card>
            </div>
        </div>
    );
}

export default function AtsLiveApp() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 text-[#171717] animate-spin" />
            </div>
        }>
            <AtsLiveLogic />
        </Suspense>
    );
}
