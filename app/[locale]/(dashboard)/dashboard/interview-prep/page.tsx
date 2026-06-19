'use client'
export const dynamic = 'force-dynamic';
;

import { useState } from 'react';
import { ShieldCheck, Building2, Briefcase, Zap, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';

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
        <div className="min-h-screen bg-[#FAFAFA] text-[#171717] overflow-x-hidden pb-20">
            {/* Hero & Input Section */}
            <div className="relative pt-24 pb-16 px-4 sm:px-8">
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0070F3]/5 border border-[#0070F3]/10 text-[#0070F3] text-[10px] font-bold uppercase tracking-wider mb-6"
                    >
                        <ShieldCheck className="w-4 h-4 text-[#0070F3]" /> AI + Web Search Intelligence
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl sm:text-6xl font-semibold tracking-tight text-[#171717] mb-6 leading-tight font-sans"
                    >
                        Generate <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0070F3] to-[#7928ca]">Targeted</span> Prep
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-[#4D4D4D] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10 font-medium"
                    >
                        Enter your target company and role. Our AI will search the web for the most frequently asked, realistic interview questions tailored exactly for your upcoming process.
                    </motion.p>

                    <motion.form
                        onSubmit={handleGenerate}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-[#FFFFFF] border border-[#EBEBEB] p-6 rounded-xl sm:flex items-end gap-4 max-w-3xl mx-auto shadow-sm"
                    >
                        <div className="flex-1 text-left mb-4 sm:mb-0">
                            <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8F8F8F] mb-2 font-mono">Target Company</label>
                            <div className="relative">
                                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F8F8F]" />
                                <input
                                    value={company}
                                    onChange={e => setCompany(e.target.value)}
                                    placeholder="e.g. Amazon"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 bg-[#FFFFFF] border border-[#EBEBEB] focus:border-[#171717] rounded-md outline-none transition-colors text-sm text-[#171717]"
                                />
                            </div>
                        </div>
                        <div className="flex-1 text-left mb-6 sm:mb-0">
                            <label className="block text-[10px] uppercase font-bold tracking-wider text-[#8F8F8F] mb-2 font-mono">Target Role</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F8F8F]" />
                                <input
                                    value={role}
                                    onChange={e => setRole(e.target.value)}
                                    placeholder="e.g. SDE Intern"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 bg-[#FFFFFF] border border-[#EBEBEB] focus:border-[#171717] rounded-md outline-none transition-colors text-sm text-[#171717]"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !company || !role}
                            className="w-full sm:w-auto px-6 py-2.5 bg-[#171717] hover:bg-[#333333] text-white font-semibold rounded-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <><Zap className="w-4 h-4" /> Generate</>}
                        </button>
                    </motion.form>

                    {error && (
                        <p className="mt-4 text-red-600 font-semibold text-xs bg-red-50 border border-red-200 py-2 px-4 rounded-lg inline-block">
                            {error}
                        </p>
                    )}
                </div>
            </div>

            {/* Results Section */}
            <div className="max-w-6xl mx-auto px-4 sm:px-8">
                <AnimatePresence>
                    {loading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-24 text-center border border-[#EBEBEB] rounded-xl bg-[#FFFFFF] shadow-sm">
                            <Loader2 className="w-10 h-10 text-[#171717] animate-spin mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-[#171717]">Scraping the Web...</h3>
                            <p className="text-[#8F8F8F] font-bold uppercase tracking-wider text-[10px] mt-2 font-mono">
                                Extracting real interview experiences for {company || 'your target'}...
                            </p>
                        </motion.div>
                    )}

                    {!loading && data && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                            <div className="text-center mb-12 border-b border-[#EBEBEB] pb-8">
                                <h2 className="text-3xl font-semibold text-[#171717] tracking-tight mb-2">{data.company} - {data.role}</h2>
                                <p className="text-[#4D4D4D] text-sm">Here is the extracted interview process and commonly asked questions based on recent web data.</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <h3 className="text-base font-semibold text-[#0070F3] flex items-center gap-2">
                                        <Building2 className="w-4.5 h-4.5" /> Hiring Process
                                    </h3>
                                    {data.hiring_process?.map((round, rIndex) => (
                                        <div key={rIndex} className="bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl p-6 relative group border-l-4 border-l-[#171717] shadow-sm">
                                            <h4 className="text-base font-semibold text-[#171717] mb-2">{round.round_name}</h4>
                                            <p className="text-[#4D4D4D] text-sm mb-3 leading-relaxed">{round.details}</p>
                                            <span className="text-[10px] font-bold uppercase text-[#8F8F8F] bg-[#FAFAFA] border border-[#EBEBEB] px-2 py-0.5 rounded italic">Difficulty: {round.expected_difficulty}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-base font-semibold text-purple-600 flex items-center gap-2">
                                        <Zap className="w-4.5 h-4.5" /> Top Questions
                                    </h3>
                                    <div className="grid gap-4">
                                        {data.top_questions?.map((q, qIndex) => (
                                            <div key={qIndex} className="bg-[#FFFFFF] border border-[#EBEBEB] p-6 rounded-xl hover:border-[#171717]/30 transition-all shadow-sm">
                                                <div className="flex justify-between items-start gap-4 mb-3">
                                                    <h4 className="text-[#171717] font-semibold text-sm italic">&quot;{q.question}&quot;</h4>
                                                    <div className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider shrink-0 ${q.difficulty === 'Easy' ? 'bg-green-50 text-green-700 border-green-200' :
                                                        q.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'
                                                        }`}>
                                                        {q.difficulty}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-[#8F8F8F]">
                                                    <span className="bg-[#FAFAFA] border border-[#EBEBEB] px-2 py-0.5 rounded">{q.topic}</span>
                                                    <span className="bg-[#0070F3]/5 text-[#0070F3] border border-[#0070F3]/10 px-2 py-0.5 rounded">{q.frequency} Frequency</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Roadmap Preview */}
                            {data.prep_roadmap && (
                                <div className="bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl p-8 sm:p-10 shadow-sm">
                                    <h3 className="text-lg font-semibold text-emerald-600 mb-6 flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5 text-emerald-600" /> 4-Day Intensity Plan
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        {data.prep_roadmap.map((day, i) => (
                                            <div key={i} className="bg-[#FAFAFA] p-5 rounded-lg border border-[#EBEBEB]">
                                                <div className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider mb-2">Day {day.day}</div>
                                                <p className="text-[#171717] text-xs font-semibold mb-2">{day.topics[0]}</p>
                                                <p className="text-[10px] text-[#8F8F8F] leading-relaxed italic font-medium">{day.tasks[0]}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl p-8 sm:p-12 flex flex-col items-center text-center gap-6 shadow-sm">
                                <h3 className="text-2xl font-semibold text-[#171717] tracking-tight">Ready to ace this interview?</h3>
                                <p className="text-[#4D4D4D] text-sm max-w-xl leading-relaxed">
                                    Use our AI mock interview simulator to practice these exact questions in a realistic environment.
                                </p>
                                <Link href={`/${locale}/company-prep-interview?role=${encodeURIComponent(data.company + ' - ' + data.role)}`} className="px-6 py-2.5 bg-[#171717] hover:bg-[#333333] text-white font-semibold rounded-md transition-all active:scale-[0.98] flex items-center gap-2 text-sm">
                                    Try Mock Interview <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
