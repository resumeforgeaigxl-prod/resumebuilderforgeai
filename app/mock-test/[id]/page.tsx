'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Loader2, Download, RotateCcw, Lock, Unlock, CheckCircle, XCircle,
    Code2, BarChart3, BookOpen, Zap, Mic, ArrowLeft, Trophy, Ticket
} from 'lucide-react';
import Link from 'next/link';

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

const CATEGORIES = [
    { key: 'technical', label: 'Technical', icon: Code2, color: '#3b82f6' },
    { key: 'aptitude', label: 'Aptitude', icon: BarChart3, color: '#8b5cf6' },
    { key: 'verbal', label: 'Verbal', icon: BookOpen, color: '#10b981' },
    { key: 'logical', label: 'Logical', icon: Zap, color: '#f59e0b' },
    { key: 'interview', label: 'Interview', icon: Mic, color: '#ef4444' },
];

const DIFFICULTY_COLORS: Record<string, string> = {
    easy: 'text-emerald-400 bg-emerald-500/10',
    medium: 'text-yellow-400 bg-yellow-500/10',
    hard: 'text-red-400 bg-red-500/10',
};

export default function MockTestPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();

    const [test, setTest] = useState<MockTest | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [gated, setGated] = useState(false);
    const [freeLimit, setFreeLimit] = useState(5);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('technical');
    const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [couponMsg, setCouponMsg] = useState<{ text: string; ok: boolean } | null>(null);
    const [couponLoading, setCouponLoading] = useState(false);


    const loadTest = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/mock-test/${id}`);
            if (!res.ok) { router.push('/mock-test'); return; }
            const data = await res.json();
            setTest(data.test as MockTest);
            setQuestions(data.questions as Question[]);
            setGated(data.gated);
            setFreeLimit(data.freeLimit ?? 5);
        } catch {
            router.push('/mock-test');
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    useEffect(() => { loadTest(); }, [loadTest]);

    async function redeemCoupon() {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        setCouponMsg(null);
        const res = await fetch('/api/coupon/redeem', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: couponCode }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
            setCouponMsg({ text: data.message, ok: true });
            if (data.hasFullAccess) { loadTest(); }
        } else {
            setCouponMsg({ text: data.error || 'Invalid coupon', ok: false });
        }
        setCouponLoading(false);
    }

    async function handleDownload() {
        setDownloading(true);
        try {
            const res = await fetch(`/api/mock-test/${id}/download`, { method: 'POST' });
            if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = 'mock-test.pdf'; a.click();
                URL.revokeObjectURL(url);
            } else {
                const err = await res.json();
                alert(err.error || 'Download failed');
            }
        } catch { alert('Download error'); } finally { setDownloading(false); }
    }

    const catQuestions = questions.filter(q => q.category === activeCategory);
    const visibleQuestions = catQuestions.filter(q => !q.gated);
    const gatedCount = catQuestions.filter(q => q.gated).length;

    // Score calculation
    const mcqAnswered = Object.keys(userAnswers);
    const correctCount = mcqAnswered.filter(qId => {
        const q = questions.find(x => x.id === qId);
        return q && q.correct_answer && userAnswers[qId] === q.correct_answer;
    }).length;
    const totalMcq = questions.filter(q => q.options && !q.gated).length;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#070710] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-slate-400 text-sm">Loading your mock test…</p>
                </div>
            </div>
        );
    }

    if (!test) return null;

    return (
        <div className="min-h-screen bg-[#070710] text-slate-200">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 py-3">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-center sm:text-left">
                        <Link href="/mock-test" className="p-2 hover:bg-white/5 rounded-xl transition-colors shrink-0">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="font-bold text-base">{test.job_title || 'Mock Interview Test'}</h1>
                            <p className="text-xs text-slate-500">{questions.length} questions generated</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
                        {submitted && !gated && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
                                <Trophy className="w-4 h-4" />
                                Score: {correctCount}/{totalMcq}
                            </div>
                        )}
                        {!gated && (
                            <>
                                <button onClick={() => { setUserAnswers({}); setSubmitted(false); }}
                                    title="Retake"
                                    className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm transition-all">
                                    <RotateCcw className="w-4 h-4" /> Retake
                                </button>
                                <button onClick={handleDownload} disabled={downloading}
                                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all">
                                    {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                    Download PDF
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                {/* Free user banner */}
                {gated && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-purple-600/15 to-blue-600/15 border border-purple-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <Lock className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-semibold text-sm">Free Preview — {freeLimit} of 50 questions visible</p>
                            <p className="text-xs text-slate-400 mt-0.5">Upgrade your plan or enter a coupon to unlock all 50 questions + answers + PDF download.</p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                placeholder="COUPON CODE"
                                className="flex-1 sm:w-36 px-3 py-2 bg-black/30 border border-white/10 rounded-xl text-xs font-mono uppercase focus:ring-2 focus:ring-purple-500/50 outline-none" />
                            <button onClick={redeemCoupon} disabled={couponLoading || !couponCode.trim()}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs rounded-xl font-medium transition-all flex items-center gap-1">
                                {couponLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ticket className="w-3 h-3" />} Apply
                            </button>
                        </div>
                    </div>
                )}
                {couponMsg && (
                    <div className={`mb-4 px-4 py-2.5 rounded-xl text-sm ${couponMsg.ok ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {couponMsg.ok ? <Unlock className="w-4 h-4 inline mr-2" /> : <XCircle className="w-4 h-4 inline mr-2" />}
                        {couponMsg.text}
                    </div>
                )}

                {/* Category Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                    {CATEGORIES.map(cat => {
                        const catQs = questions.filter(q => q.category === cat.key);
                        const isActive = activeCategory === cat.key;
                        return (
                            <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
                                style={{ borderColor: isActive ? cat.color : 'transparent', color: isActive ? cat.color : '' }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap border transition-all ${isActive ? 'bg-white/5' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border-transparent'}`}>
                                <cat.icon className="w-3.5 h-3.5" />
                                {cat.label}
                                <span className="text-xs opacity-70">({catQs.length})</span>
                            </button>
                        );
                    })}
                </div>

                {/* Questions */}
                <div className="space-y-4">
                    {/* Visible questions */}
                    {visibleQuestions.map(q => {
                        const isInterview = q.category === 'interview';
                        const userAnswer = userAnswers[q.id];
                        const isCorrect = submitted && userAnswer === q.correct_answer;
                        const isWrong = submitted && userAnswer && userAnswer !== q.correct_answer;

                        return (
                            <div key={q.id} className={`p-5 bg-white/[0.03] border rounded-2xl transition-all ${isCorrect ? 'border-emerald-500/30' : isWrong ? 'border-red-500/30' : 'border-white/10'}`}>
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <p className="font-medium text-sm leading-relaxed flex-1">
                                        <span className="text-blue-400 font-bold mr-2">Q{q.question_number}.</span>
                                        {q.question}
                                    </p>
                                    <span className={`px-2 py-0.5 rounded-full text-xs shrink-0 ${DIFFICULTY_COLORS[q.difficulty] ?? 'text-slate-500'}`}>
                                        {q.difficulty}
                                    </span>
                                </div>

                                {/* MCQ Options */}
                                {!isInterview && q.options && (
                                    <div className="space-y-2 mb-3">
                                        {q.options.map((opt, i) => {
                                            const letter = ['A', 'B', 'C', 'D'][i];
                                            const isSelected = userAnswer === letter;
                                            const showCorrect = submitted && letter === q.correct_answer;
                                            const showWrong = submitted && isSelected && !showCorrect;

                                            return (
                                                <button key={i} onClick={() => !submitted && setUserAnswers(prev => ({ ...prev, [q.id]: letter }))}
                                                    disabled={submitted}
                                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all border ${showCorrect ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : showWrong ? 'bg-red-500/15 border-red-500/40 text-red-300' : isSelected ? 'bg-blue-500/15 border-blue-500/40 text-blue-300' : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10 text-slate-300'}`}>
                                                    <span className="font-mono font-bold mr-2">{letter}.</span>
                                                    {opt.replace(/^[A-D]\.\s*/, '')}
                                                    {showCorrect && <CheckCircle className="w-4 h-4 inline ml-2 text-emerald-400" />}
                                                    {showWrong && <XCircle className="w-4 h-4 inline ml-2 text-red-400" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Interview question — show model answer always */}
                                {isInterview && q.explanation && (
                                    <div className="mt-3 p-3 bg-blue-500/5 border border-blue-500/15 rounded-xl">
                                        <p className="text-xs text-slate-500 font-semibold mb-1">MODEL ANSWER GUIDELINE</p>
                                        <p className="text-sm text-slate-300">{q.explanation}</p>
                                    </div>
                                )}

                                {/* MCQ Explanation after submit */}
                                {submitted && !isInterview && q.explanation && (
                                    <div className="mt-2 p-3 bg-white/5 border border-white/10 rounded-xl">
                                        <p className="text-xs text-slate-500 font-semibold mb-1">EXPLANATION</p>
                                        <p className="text-xs text-slate-400">{q.explanation}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Blurred gated questions */}
                    {gatedCount > 0 && (
                        <div className="relative rounded-2xl overflow-hidden">
                            {/* Blurred preview */}
                            <div className="space-y-4 filter blur-[5px] pointer-events-none select-none opacity-60">
                                {Array.from({ length: Math.min(gatedCount, 3) }).map((_, i) => (
                                    <div key={i} className="p-5 bg-white/[0.03] border border-white/10 rounded-2xl">
                                        <p className="font-medium text-sm mb-3">
                                            <span className="text-blue-400 font-bold mr-2">Q{(freeLimit + 1) + i}.</span>
                                            This question is locked. Upgrade to see all {gatedCount} remaining questions.
                                        </p>
                                        <div className="space-y-2">
                                            {['A. Option one — answer hidden', 'B. Option two — answer hidden', 'C. Option three — answer hidden', 'D. Option four — answer hidden'].map((opt, j) => (
                                                <div key={j} className="px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/5 text-slate-300">{opt}</div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Overlay CTA */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center bg-slate-950/90 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 max-w-sm mx-4 shadow-2xl">
                                    <Lock className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                                    <h3 className="font-bold text-lg mb-1">{gatedCount} Questions Locked</h3>
                                    <p className="text-slate-400 text-sm mb-5">
                                        Upgrade your plan or use a coupon code to unlock all 50 questions, reveal answers, and download the PDF.
                                    </p>
                                    <div className="flex gap-2 mb-3">
                                        <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                            placeholder="ENTER COUPON CODE"
                                            className="flex-1 px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-sm font-mono uppercase focus:ring-2 focus:ring-purple-500/50 outline-none" />
                                        <button onClick={redeemCoupon} disabled={couponLoading || !couponCode.trim()}
                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm rounded-xl font-medium transition-all">
                                            {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                                        </button>
                                    </div>
                                    {couponMsg && (
                                        <p className={`text-xs ${couponMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>{couponMsg.text}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Submit button (visible questions only, MCQ) */}
                {visibleQuestions.some(q => q.options) && !submitted && (
                    <div className="mt-8 flex justify-center">
                        <button onClick={() => setSubmitted(true)}
                            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" /> Submit & See Answers
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
