'use client';

import { useState } from 'react';
import {
    Mic, MicOff, Send, MessageSquare,
    Zap, RotateCcw, Trophy,
    ShieldHalf, Loader2, Award} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PracticeProps {
    question: string;
    onClose: () => void;
}

export default function InterviewPracticeView({ question, onClose }: PracticeProps) {
    const [answer, setAnswer] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [feedback, setFeedback] = useState<{ score: number; qualitative: string; model_answer: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const submitAnswer = async () => {
        if (!answer.trim()) return;
        setLoading(true);
        try {
            const res = await fetch('/api/interview-prep/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question, answer })
            });
            const result = await res.json();
            if (result.success) setFeedback(result.feedback);
        } catch {
            console.error('Evaluation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-white font-black italic uppercase tracking-widest text-sm">Practice Mode Suite</h2>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                            <ShieldHalf className="w-3 h-3" /> Reality Simulation
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="p-3 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                    <RotateCcw className="w-5 h-5" />
                </button>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-12">
                <div className="max-w-4xl mx-auto space-y-12">

                    {/* The Interviewer UI */}
                    <div className="flex items-start gap-6">
                        <div className="w-16 h-16 rounded-[2rem] bg-indigo-500 flex items-center justify-center shrink-0 shadow-[0_0_50px_-10px_rgba(99,102,241,0.5)]">
                            <MessageSquare className="w-8 h-8 text-white" />
                        </div>
                        <div className="bg-white/5 border border-white/10 p-8 sm:p-10 rounded-[2.5rem] relative">
                            <div className="absolute -left-2 top-8 w-4 h-4 bg-white/5 rotate-45 border-l border-b border-white/10" />
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4 block">Question</label>
                            <p className="text-2xl sm:text-3xl font-black text-white italic tracking-tight leading-snug">
                                &ldquo;{question}&rdquo;
                            </p>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {!feedback ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-8"
                            >
                                <div className="relative">
                                    <textarea
                                        value={answer}
                                        onChange={e => setAnswer(e.target.value)}
                                        placeholder="Think out loud... what's your answer? Type it here or use voice input."
                                        rows={8}
                                        className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-8 text-lg font-medium text-white outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all placeholder:text-slate-600 resize-none"
                                    />

                                    <div className="absolute bottom-6 right-6 flex items-center gap-3">
                                        <button
                                            onClick={() => setIsRecording(!isRecording)}
                                            className={`p-4 rounded-full transition-all ${isRecording ? 'bg-rose-500 animate-pulse text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                                        >
                                            {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                                        </button>
                                        <button
                                            onClick={submitAnswer}
                                            disabled={loading || !answer.trim()}
                                            className="flex items-center gap-3 px-8 py-4 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-lg hover:shadow-indigo-500/20"
                                        >
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Analyze Answer</>}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-center">
                                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest text-center max-w-sm">
                                        Your answer will be evaluated on technical accuracy, structure, and delivery using ResumeForgeAI&apos;s evaluation engine.
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-8"
                            >
                                {/* Feedback Card */}
                                <div className="bg-slate-900 border border-white/10 rounded-[3rem] p-10 sm:p-12 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] -z-10" />

                                    <div className="flex flex-col lg:flex-row gap-12">
                                        <div className="lg:w-1/3 text-center lg:text-left">
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-6">
                                                Analysis Complete
                                            </div>
                                            <div className="text-8xl font-black text-white italic tracking-tighter mb-4">
                                                {feedback.score}<span className="text-slate-700">/10</span>
                                            </div>
                                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Confidence Score</p>
                                        </div>

                                        <div className="flex-1 space-y-8">
                                            <div>
                                                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 block italic">Qualitative Feedback</label>
                                                <p className="text-xl text-slate-200 leading-relaxed font-medium">
                                                    {feedback.qualitative}
                                                </p>
                                            </div>

                                            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5">
                                                <div className="flex items-center gap-2 text-[10px] font-black text-amber-400 uppercase tracking-widest mb-4">
                                                    <Award className="w-4 h-4" /> The Gold Standard (Model Answer)
                                                </div>
                                                <p className="text-sm text-slate-400 leading-relaxed italic">
                                                    &ldquo;{feedback.model_answer}&rdquo;
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-12 pt-12 border-t border-white/5 flex flex-wrap gap-4 justify-center lg:justify-start">
                                        <button
                                            onClick={() => setFeedback(null)}
                                            className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl transition-all border border-white/10"
                                        >
                                            Try Again
                                        </button>
                                        <button
                                            onClick={onClose}
                                            className="px-10 py-5 bg-indigo-500 hover:bg-indigo-400 text-white font-black rounded-2xl transition-all"
                                        >
                                            Done Preparation
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-2 text-indigo-400">
                                    <Trophy className="w-6 h-6 animate-bounce" />
                                    <span className="font-black italic text-sm tracking-tighter uppercase">Preparation Milestone Achieved</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Micro background decorations */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-pulse" />
        </div>
    );
}
