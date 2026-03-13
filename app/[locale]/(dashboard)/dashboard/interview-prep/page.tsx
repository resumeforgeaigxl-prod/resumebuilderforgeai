'use client';

import { useState } from 'react';
import { ShieldCheck, Building2, Briefcase, Zap, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface PrepQuestion {
    question: string;
    topic: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    frequency: 'High' | 'Medium' | 'Low';
    answer_coach: {
        ideal_structure: string[];
        example_answer: string;
        common_mistakes: string[];
    };
}

interface PrepRound {
    round_name: string;
    details: string;
    expected_difficulty: string;
}

interface PrepData {
    company: string;
    role: string;
    difficulty_level: string;
    hiring_process: PrepRound[];
    top_questions: PrepQuestion[];
    prep_roadmap: Array<{ day: number, topics: string[], tasks: string[] }>;
}

import { useParams } from 'next/navigation';

export default function InterviewPrepGenerator() {
    const { locale } = useParams() as { locale: string };

    const [company, setCompany] = useState('');
    const [role, setRole] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<PrepData | null>(null);
    const [error, setError] = useState('');

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!company.trim() || !role.trim()) return;

        setLoading(true);
        setError('');
        setData(null);

        try {
            const res = await fetch('/api/interview-prep/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ company, role })
            });

            const json = await res.json();
            if (json.success) {
                setData(json.data);
            } else {
                setError(json.error || 'Failed to generate insight.');
            }
        } catch {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30 overflow-x-hidden">
            {/* Hero & Input Section */}
            <div className="relative pt-32 pb-24 px-4 sm:px-8">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full -z-10" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8"
                    >
                        <ShieldCheck className="w-4 h-4" /> AI + Web Search Intelligence
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl sm:text-7xl font-black text-white tracking-tighter mb-8 italic outline-none leading-[0.9]"
                    >
                        Generate <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Targeted</span> Prep
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-12 font-medium"
                    >
                        Enter your target company and role. Our AI will search the web for the most frequently asked, realistic interview questions tailored exactly for your upcoming process.
                    </motion.p>

                    <motion.form
                        onSubmit={handleGenerate}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white/5 border border-white/10 p-6 rounded-[2rem] sm:flex items-end gap-4 max-w-3xl mx-auto backdrop-blur-xl shadow-2xl"
                    >
                        <div className="flex-1 text-left mb-4 sm:mb-0">
                            <label className="block text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2">Target Company</label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    value={company}
                                    onChange={e => setCompany(e.target.value)}
                                    placeholder="e.g. Amazon"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-white/10 focus:border-indigo-500 rounded-xl outline-none transition-colors"
                                />
                            </div>
                        </div>
                        <div className="flex-1 text-left mb-6 sm:mb-0">
                            <label className="block text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2">Target Role</label>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    value={role}
                                    onChange={e => setRole(e.target.value)}
                                    placeholder="e.g. SDE Intern"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-white/10 focus:border-indigo-500 rounded-xl outline-none transition-colors"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !company || !role}
                            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Zap className="w-5 h-5" /> Generate</>}
                        </button>
                    </motion.form>

                    {error && (
                        <p className="mt-4 text-rose-400 font-bold text-sm bg-rose-500/10 py-2 px-4 rounded-lg inline-block">
                            {error}
                        </p>
                    )}
                </div>
            </div>

            {/* Results Section */}
            <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-32">
                <AnimatePresence>
                    {loading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-24 text-center border border-white/5 rounded-3xl bg-white/[0.02]">
                            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-6" />
                            <h3 className="text-2xl font-black text-white italic">Scraping the Web...</h3>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">
                                Extracting real interview experiences for {company || 'your target'}...
                            </p>
                        </motion.div>
                    )}

                    {!loading && data && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                            <div className="text-center mb-12 border-b border-white/5 pb-12">
                                <h2 className="text-4xl font-black text-white italic tracking-tighter mb-4">{data.company} - {data.role}</h2>
                                <p className="text-slate-400 font-medium">Here is the extracted interview process and commonly asked questions based on recent web data.</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-8">
                                    <h3 className="text-xl font-black text-indigo-400 italic flex items-center gap-2">
                                        <Building2 className="w-5 h-5" /> Hiring Process
                                    </h3>
                                    {data.hiring_process?.map((round, rIndex) => (
                                        <div key={rIndex} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 relative group border-l-4 border-l-indigo-500">
                                            <h4 className="text-lg font-black text-white mb-2">{round.round_name}</h4>
                                            <p className="text-slate-400 text-sm mb-2 leading-relaxed">{round.details}</p>
                                            <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded italic">Difficulty: {round.expected_difficulty}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-8">
                                    <h3 className="text-xl font-black text-purple-400 italic flex items-center gap-2">
                                        <Zap className="w-5 h-5" /> Top Questions
                                    </h3>
                                    <div className="grid gap-4">
                                        {data.top_questions?.map((q, qIndex) => (
                                            <div key={qIndex} className="bg-slate-900 border border-white/10 p-6 rounded-2xl hover:border-indigo-500/50 transition-colors">
                                                <div className="flex justify-between items-start gap-4 mb-3">
                                                    <h4 className="text-white font-bold text-sm italic pr-8">&quot;{q.question}&quot;</h4>
                                                    <div className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest shrink-0 ${q.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                                                        q.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                                                        }`}>
                                                        {q.difficulty}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
                                                    <span className="bg-white/5 px-2 py-0.5 rounded">{q.topic}</span>
                                                    <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded">{q.frequency} Frequency</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Roadmap Preview */}
                            {data.prep_roadmap && (
                                <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-10 mt-12">
                                    <h3 className="text-xl font-black text-emerald-400 italic mb-8 flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5" /> 4-Day Intensity Plan
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        {data.prep_roadmap.map((day, i) => (
                                            <div key={i} className="bg-black/20 p-5 rounded-2xl border border-white/5">
                                                <div className="text-emerald-500 text-[10px] font-black uppercase mb-3">Day {day.day}</div>
                                                <p className="text-white text-xs font-bold mb-2">{day.topics[0]}</p>
                                                <p className="text-[10px] text-slate-500 leading-relaxed italic">{day.tasks[0]}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-20 p-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem]">
                                <div className="bg-slate-900 rounded-[2.4rem] p-10 sm:p-14 flex flex-col items-center text-center gap-6">
                                    <h3 className="text-3xl font-black text-white italic tracking-tighter">Ready to ace this interview?</h3>
                                    <p className="text-slate-400 font-medium max-w-xl">
                                        Use our AI mock interview simulator to practice these exact questions in a realistic environment.
                                    </p>
                                    <Link href={`/${locale}/company-prep-interview?role=${encodeURIComponent(company + ' - ' + role)}`} className="px-10 py-4 bg-white text-slate-950 font-black rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2">
                                        Try Mock Interview <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
