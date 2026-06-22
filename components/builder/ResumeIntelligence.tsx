'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, CheckCircle, TrendingUp, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ResumeAnalysis {
    ats_score: number;
    strengths: string[];
    missing_skills: string[];
    improvements: string[];
}

interface ResumeIntelligenceProps {
    resumeId: string;
    resumeData: unknown;
}

export function ResumeIntelligence({ resumeId, resumeData }: ResumeIntelligenceProps) {
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
    const [showResults, setShowResults] = useState(false);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [stepStates, setStepStates] = useState<Record<number, 'idle' | 'running' | 'finished'>>({
        1: 'idle',
        2: 'idle',
        3: 'idle'
    });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const abortControllerRef = useRef<AbortController | null>(null);

    const handleAnalyze = async () => {
        setAnalyzing(true);
        setShowResults(true);
        setAnalysis(null);
        setStepStates({ 1: 'idle', 2: 'idle', 3: 'idle' });
        setCurrentStep(0);

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const response = await fetch('/api/ai/resume-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeId, resumeData }),
                signal: controller.signal
            });

            if (!response.body) throw new Error('No stream body');
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                let eventType = '';
                for (const line of lines) {
                    if (line.startsWith('event: ')) {
                        eventType = line.slice(7).trim();
                    } else if (line.startsWith('data: ') && eventType) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (eventType === 'progress') {
                                if (data.type === 'tool_start') {
                                    setStepStates(prev => ({ ...prev, [data.step]: 'running' }));
                                    setCurrentStep(data.step);
                                } else if (data.type === 'tool_end') {
                                    setStepStates(prev => ({ ...prev, [data.step]: data.status || 'finished' }));
                                }
                            } else if (eventType === 'result') {
                                if (data.success && data.analysis) {
                                    setAnalysis(data.analysis);
                                }
                            } else if (eventType === 'error') {
                                alert(data.error || 'Analysis failed');
                            }
                        } catch {
                            // ignore parse errors
                        }
                        eventType = '';
                    }
                }
            }
        } catch (err: any) {
            if (err.name === 'AbortError') {
                console.log('[ResumeIntelligence] Analysis aborted.');
            } else {
                console.error('[ResumeIntelligence] Error:', err);
                alert('Failed to analyze resume. Please check your connection.');
                setShowResults(false);
            }
        } finally {
            setAnalyzing(false);
            abortControllerRef.current = null;
        }
    };

    const handleClose = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setShowResults(false);
        setAnalyzing(false);
    };

    const modalContent = (
        <AnimatePresence>
            {showResults && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 md:p-10 overflow-y-auto bg-[#171717]/80 backdrop-blur-md">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-[#FFFFFF] border border-[#EBEBEB] w-full max-w-3xl rounded-xl p-8 md:p-10 shadow-2xl relative my-auto min-h-[420px] flex flex-col justify-between"
                    >
                        <button 
                            onClick={handleClose}
                            className="absolute top-6 right-6 p-3 hover:bg-[#FAFAFA] rounded-full text-[#8F8F8F] hover:text-[#171717] transition-all z-10"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        {analyzing && !analysis ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-12 space-y-8">
                                <div className="text-center space-y-3">
                                    <div className="inline-flex p-3.5 rounded-xl bg-neutral-50 border border-neutral-100">
                                        <Loader2 className="w-8 h-8 text-[#0070f3] animate-spin" />
                                    </div>
                                    <h3 className="text-xl font-black italic uppercase tracking-tight text-[#171717]">Neural Analysis in Progress</h3>
                                    <p className="text-xs text-[#8F8F8F] max-w-sm leading-relaxed mx-auto">
                                        Agentic Intelligence is evaluating your resume sections, assessing technical keywords, and drafting recommendations.
                                    </p>
                                </div>

                                {/* Progress Step List */}
                                <div className="w-full max-w-md border border-[#EBEBEB] rounded-xl bg-white p-6 shadow-sm space-y-4">
                                    {[
                                        { id: 1, label: "Verifying Resume Structural Integrity" },
                                        { id: 2, label: "Scanning Technical Skills & Keywords Density" },
                                        { id: 3, label: "Formulating Strategic ATS Recommendations" }
                                    ].map((step) => {
                                        const state = stepStates[step.id] || 'idle';
                                        return (
                                            <div key={step.id} className="flex items-center justify-between text-xs font-semibold">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all",
                                                        state === 'finished' ? "bg-emerald-50 border-emerald-200 text-emerald-600" :
                                                        state === 'running' ? "bg-blue-50 border-blue-200 text-blue-600" :
                                                        "bg-neutral-50 border-neutral-200 text-neutral-400"
                                                    )}>
                                                        {state === 'finished' ? (
                                                            "✓"
                                                        ) : state === 'running' ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            step.id
                                                        )}
                                                    </div>
                                                    <span className={cn(
                                                        state === 'running' ? "text-[#171717] font-bold" :
                                                        state === 'finished' ? "text-[#4D4D4D]" :
                                                        "text-[#8F8F8F]"
                                                    )}>
                                                        {step.label}
                                                    </span>
                                                </div>
                                                <span className={cn(
                                                    "text-[9px] font-bold uppercase tracking-wider font-mono",
                                                    state === 'finished' ? "text-emerald-600" :
                                                    state === 'running' ? "text-blue-500 animate-pulse" :
                                                    "text-[#8F8F8F]"
                                                )}>
                                                    {state === 'finished' ? "Complete" : state === 'running' ? "Running" : "Pending"}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Visual active loading bar */}
                                <div className="w-full max-w-md h-1.5 bg-neutral-100 rounded-full overflow-hidden relative">
                                    <motion.div 
                                        className="absolute top-0 h-full bg-[#0070f3] rounded-full"
                                        animate={{ 
                                            width: currentStep === 1 ? "33%" : currentStep === 2 ? "66%" : currentStep === 3 ? "95%" : "0%"
                                        }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>
                        ) : analysis ? (
                            <div className="flex-1 flex flex-col">
                                <div className="flex flex-col md:flex-row items-center gap-8 mb-10 pt-4">
                                    <div className="relative w-32 h-32 shrink-0">
                                        <svg className="w-full h-full -rotate-90">
                                            <circle cx="64" cy="64" r="58" className="stroke-[#EBEBEB]" strokeWidth="12" fill="none" />
                                            <motion.circle 
                                                cx="64" cy="64" r="58" 
                                                className="stroke-[#0070f3]" 
                                                strokeWidth="12" 
                                                fill="none" 
                                                strokeDasharray="364"
                                                initial={{ strokeDashoffset: 364 }}
                                                animate={{ strokeDashoffset: 364 - (364 * analysis.ats_score) / 100 }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-4xl font-black text-[#171717] italic">{analysis.ats_score}</span>
                                            <span className="text-[10px] font-black text-[#8F8F8F] uppercase tracking-widest">ATS Score</span>
                                        </div>
                                    </div>
                                    <div className="text-center md:text-left flex-1">
                                        <h2 className="text-3xl font-black text-[#171717] italic tracking-tight mb-2 uppercase">Neural Intelligence Report</h2>
                                        <p className="text-[#4D4D4D] text-sm leading-relaxed max-w-md">Our AI analyzed your resume architecture against industry standards and recruitment algorithms.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
                                    {/* Strengths */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 bg-emerald-50 rounded-md flex items-center justify-center border border-emerald-100">
                                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                                            </div>
                                            <h3 className="text-sm font-black text-[#171717] uppercase tracking-widest italic">Core Strengths</h3>
                                        </div>
                                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                            {analysis.strengths.map((s, i) => (
                                                <div key={i} className="flex gap-3 text-sm text-[#4D4D4D] bg-[#FAFAFA] p-4 rounded-lg border border-[#EBEBEB]">
                                                    <span className="text-emerald-600 font-bold">•</span>
                                                    {s}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
    
                                    {/* Missing Skills */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 bg-[#ffefcf] rounded-md flex items-center justify-center border border-[#f5a623]/20">
                                                <Target className="w-4 h-4 text-[#ab570a]" />
                                            </div>
                                            <h3 className="text-sm font-black text-[#171717] uppercase tracking-widest italic">Missing Arsenal</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                            {analysis.missing_skills.map((s, i) => (
                                                <span key={i} className="px-3 py-1.5 bg-[#FAFAFA] border border-[#EBEBEB] rounded-md text-xs font-bold text-[#4D4D4D] hover:border-[#171717] transition-all">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
    
                                    {/* Improvements */}
                                    <div className="md:col-span-2 space-y-4 pt-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 bg-blue-550/10 bg-blue-50 rounded-md flex items-center justify-center border border-blue-100">
                                                <TrendingUp className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <h3 className="text-sm font-black text-[#171717] uppercase tracking-widest italic">Strategic Improvements</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                            {analysis.improvements.map((s, i) => (
                                                <div key={i} className="flex gap-4 items-start bg-[#FAFAFA] p-5 rounded-lg border border-[#EBEBEB]">
                                                    <div className="w-6 h-6 bg-[#171717] rounded-full flex items-center justify-center shrink-0 text-[10px] font-black text-white">{i+1}</div>
                                                    <p className="text-sm text-[#4D4D4D]">{s}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-center border-t border-[#EBEBEB] pt-6">
                                    <button 
                                        onClick={handleClose}
                                        className="px-8 py-2.5 bg-[#171717] text-white font-semibold rounded-md hover:bg-[#333333] transition-all shadow-sm active:scale-95"
                                    >
                                        Dismiss Report
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return (
        <>
            <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="flex items-center gap-2 px-3 py-2 bg-[#FFFFFF] border border-[#EBEBEB] text-[#171717] hover:bg-[#FAFAFA] rounded-md text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
            >
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                <span className="hidden lg:inline">Resume Intelligence</span>
                <span className="inline lg:hidden">AI Analysis</span>
            </button>
            {mounted && typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null}
        </>
    );
}
