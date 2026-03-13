'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Loader2, RotateCcw,
    Code2, BarChart3, Zap, Mic, Trophy,
    Send, Star, Play, ClipboardList
} from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
    id: string;
    question_number: number;
    category: string;
    difficulty: string;
    question: string;
    options: string[] | null;
    correct_answer: string | null;
    explanation: string | null;
    gated: boolean;
}

interface MockTest {
    id: string;
    job_title: string;
    job_description: string;
    total_questions: number;
    created_at: string;
}

interface Evaluation {
    score: number;
    strengths: string[];
    weaknesses: string[];
    suggestion: string;
    model_answer: string;
}

type Mode = 'LOBBY' | 'INTERVIEW' | 'RESULTS';

export default function MockTestPage() {
    const { id } = useParams() as { id: string };
    const { locale, region } = useTranslation();
    const router = useRouter();

    const [test, setTest] = useState<MockTest | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [mode, setMode] = useState<Mode>('LOBBY');
    const [currentIdx, setCurrentIdx] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
    const [evaluations, setEvaluations] = useState<Record<string, Evaluation>>({});
    const [loading, setLoading] = useState(true);
    const [evaluating, setEvaluating] = useState(false);
    const [gated, setGated] = useState(false);


    const loadTest = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/mock-test/${id}`);
            if (!res.ok) { router.push(`/${locale}-${region}/mock-test`); return; }
            const data = await res.json();
            setTest(data.test);
            setQuestions(data.questions);
            setGated(data.gated);

        } catch {
            router.push(`/${locale}-${region}/mock-test`);
        } finally {
            setLoading(false);
        }
    }, [id, router, region, locale]);

    useEffect(() => { loadTest(); }, [loadTest]);

    const handleAnswer = async (answer: string) => {
        setUserAnswers(prev => ({ ...prev, [questions[currentIdx].id]: answer }));

        // If it's an interview question, evaluate it
        if (questions[currentIdx].category === 'interview') {
            setEvaluating(true);
            try {
                const res = await fetch('/api/mock-test/evaluate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        question: questions[currentIdx].question,
                        answer,
                        jobTitle: test?.job_title
                    })
                });
                const data = await res.json();
                if (data.success) {
                    setEvaluations(prev => ({ ...prev, [questions[currentIdx].id]: data.evaluation }));
                }
            } catch (err) {
                console.error('Eval error:', err);
            } finally {
                setEvaluating(false);
            }
        }

        // Auto advance for MCQs if not last
        if (questions[currentIdx].category !== 'interview') {
            if (currentIdx < questions.length - 1) {
                setTimeout(() => setCurrentIdx(prev => prev + 1), 600);
            } else {
                setMode('RESULTS');
            }
        }
    };

    const nextQuestion = () => {
        if (currentIdx < questions.length - 1) {
            setCurrentIdx(prev => prev + 1);
        } else {
            setMode('RESULTS');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#070710] flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
    );

    if (!test) return null;

    return (
        <div className="min-h-screen bg-[#070710] text-slate-200">
            {mode === 'LOBBY' && (
                <div className="max-w-3xl mx-auto px-6 py-20 text-center">
                    <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-500/20 shadow-2xl shadow-blue-500/10">
                        <ClipboardList className="w-10 h-10 text-blue-400" />
                    </div>
                    <h1 className="text-4xl font-black mb-4 tracking-tight">{test.job_title} Mock Interview</h1>
                    <p className="text-slate-400 text-lg mb-12 leading-relaxed">
                        We&apos;ve generated {questions.length} tailored questions based on your job description.
                        This includes Technical, Aptitude, Verbal, and Behavioral rounds.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                            <Code2 className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tech</p>
                            <p className="text-lg font-black">{questions.filter(q => q.category === 'technical').length}</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                            <BarChart3 className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Aptitude</p>
                            <p className="text-lg font-black">{questions.filter(q => q.category === 'aptitude').length}</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                            <Zap className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Logical</p>
                            <p className="text-lg font-black">{questions.filter(q => q.category === 'logical').length}</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                            <Mic className="w-5 h-5 text-red-400 mx-auto mb-2" />
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Interview</p>
                            <p className="text-lg font-black">{questions.filter(q => q.category === 'interview').length}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setMode('INTERVIEW')}
                        className="px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center gap-3 mx-auto"
                    >
                        Start Mock Test <Play className="w-5 h-5 fill-current" />
                    </button>

                    {gated && (
                        <p className="mt-6 text-xs text-slate-500 font-medium">✨ Premium feature: Free users get 5 questions preview.</p>
                    )}
                </div>
            )}

            {mode === 'INTERVIEW' && questions[currentIdx] && (
                <div className="max-w-4xl mx-auto px-6 py-12">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-blue-400">
                                {currentIdx + 1}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Question {currentIdx + 1} of {questions.length}</h3>
                                <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">{questions[currentIdx].category} Round</p>
                            </div>
                        </div>
                        <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 transition-all duration-500"
                                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIdx}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl"
                        >
                            <h2 className="text-2xl md:text-3xl font-black mb-10 leading-tight text-white italic">
                                &quot;{questions[currentIdx].question}&quot;
                            </h2>

                            {questions[currentIdx].category === 'interview' ? (
                                <div className="space-y-6">
                                    <textarea
                                        placeholder="Type your answer here... provide details and use the STAR method if possible."
                                        rows={6}
                                        className="w-full bg-black/40 border border-white/10 rounded-[2rem] p-6 text-slate-200 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all resize-none"
                                        value={userAnswers[questions[currentIdx].id] || ''}
                                        onChange={(e) => setUserAnswers(prev => ({ ...prev, [questions[currentIdx].id]: e.target.value }))}
                                    />

                                    {evaluations[questions[currentIdx].id] ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-3xl"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-black text-blue-400 uppercase text-xs tracking-widest">AI FEEDBACK</h4>
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 text-amber-400 fill-current" />
                                                    <span className="font-black text-white">{evaluations[questions[currentIdx].id].score}/10</span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-300 mb-4">{evaluations[questions[currentIdx].id].suggestion}</p>
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={nextQuestion}
                                                    className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-black uppercase transition-all"
                                                >
                                                    Next Question
                                                </button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => handleAnswer(userAnswers[questions[currentIdx].id] || '')}
                                                disabled={evaluating || !userAnswers[questions[currentIdx].id]}
                                                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black uppercase rounded-2xl flex items-center gap-2 transition-all"
                                            >
                                                {evaluating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Submit Answer</>}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {questions[currentIdx].options?.map((opt, i) => {
                                        const letter = ['A', 'B', 'C', 'D'][i];
                                        const isSelected = userAnswers[questions[currentIdx].id] === letter;
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => handleAnswer(letter)}
                                                className={`p-6 text-left rounded-[2rem] border transition-all text-sm font-bold flex items-center gap-4 group ${isSelected ? 'bg-blue-600 border-blue-400 text-white shadow-xl shadow-blue-500/20' : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10 text-slate-400'}`}
                                            >
                                                <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${isSelected ? 'bg-white/20 border-white/30 text-white' : 'bg-white/5 border-white/10 text-slate-500 group-hover:text-slate-300'}`}>
                                                    {letter}
                                                </span>
                                                {opt.replace(/^[A-D]\.\s*/, '')}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            )}

            {mode === 'RESULTS' && (
                <div className="max-w-4xl mx-auto px-6 py-20">
                    <div className="bg-slate-900/40 border border-white/5 rounded-[3.5rem] p-12 text-center mb-12 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                        <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
                            <Trophy className="w-12 h-12 text-emerald-400" />
                        </div>
                        <h1 className="text-4xl font-black mb-4">Interview Report</h1>
                        <p className="text-slate-400 mb-8 max-w-lg mx-auto">Awesome job completing the mock interview! Based on your performance across all rounds, here is your breakdown.</p>

                        <div className="flex items-center justify-center gap-12">
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Overall Score</p>
                                <p className="text-5xl font-black text-white">
                                    {Math.round((Object.values(evaluations).reduce((acc, curr) => acc + curr.score, 0) / (questions.filter(q => q.category === 'interview').length || 1)) * 10)}
                                    <span className="text-xl text-slate-500">/100</span>
                                </p>
                            </div>
                            <div className="w-px h-16 bg-white/10" />
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Time Spent</p>
                                <p className="text-5xl font-black text-white">12<span className="text-xl text-slate-500">m</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                            <h3 className="text-lg font-black mb-6 text-emerald-400 uppercase tracking-widest">Strengths</h3>
                            <ul className="space-y-4">
                                {Object.values(evaluations).flatMap(e => e.strengths).slice(0, 4).map((s, i) => (
                                    <li key={i} className="flex items-center gap-4 text-slate-300 text-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                            <h3 className="text-lg font-black mb-6 text-amber-400 uppercase tracking-widest">Areas for Improvement</h3>
                            <ul className="space-y-4">
                                {Object.values(evaluations).flatMap(e => e.weaknesses).slice(0, 4).map((w, i) => (
                                    <li key={i} className="flex items-center gap-4 text-slate-300 text-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                        {w}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest rounded-2xl transition-all border border-white/10 flex items-center justify-center gap-2"
                        >
                            <RotateCcw className="w-5 h-5" /> Retake Test
                        </button>
                        <Link
                            href={`/${locale}-${region}/dashboard`}
                            className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2"
                        >
                            Back to Dashboard <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

function ArrowRight({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
    );
}
