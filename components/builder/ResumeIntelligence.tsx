'use client';

import { useState } from 'react';
import { Loader2, CheckCircle, TrendingUp, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

    const handleAnalyze = async () => {
        setAnalyzing(true);
        try {
            const res = await fetch('/api/ai/resume-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeId, resumeData }),
            });
            const data = await res.json();
            if (data.success) {
                setAnalysis(data.analysis);
                setShowResults(true);
            } else {
                alert(data.message || 'Analysis failed');
            }
        } catch (err) {
            console.error('Analysis error:', err);
            alert('Failed to analyze resume. Please check your connection.');
        } finally {
            setAnalyzing(false);
        }
    };

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

            <AnimatePresence>
                {showResults && analysis && (
                    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 md:p-10 overflow-y-auto bg-[#171717]/80 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-[#FFFFFF] border border-[#EBEBEB] w-full max-w-3xl rounded-xl p-8 md:p-10 shadow-2xl relative my-auto"
                        >
                            <button 
                                onClick={() => setShowResults(false)}
                                className="absolute top-6 right-6 p-3 hover:bg-[#FAFAFA] rounded-full text-[#8F8F8F] hover:text-[#171717] transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>

                            <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Strengths */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 bg-emerald-50 rounded-md flex items-center justify-center border border-emerald-100">
                                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <h3 className="text-sm font-black text-[#171717] uppercase tracking-widest italic">Core Strengths</h3>
                                    </div>
                                    <div className="space-y-3">
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
                                    <div className="flex flex-wrap gap-2">
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {analysis.improvements.map((s, i) => (
                                            <div key={i} className="flex gap-4 items-start bg-[#FAFAFA] p-5 rounded-lg border border-[#EBEBEB]">
                                                <div className="w-6 h-6 bg-[#171717] rounded-full flex items-center justify-center shrink-0 text-[10px] font-black text-white">{i+1}</div>
                                                <p className="text-sm text-[#4D4D4D]">{s}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 flex justify-center">
                                <button 
                                    onClick={() => setShowResults(false)}
                                    className="px-8 py-2.5 bg-[#171717] text-white font-semibold rounded-md hover:bg-[#333333] transition-all shadow-sm active:scale-95"
                                >
                                    Dismiss Report
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
