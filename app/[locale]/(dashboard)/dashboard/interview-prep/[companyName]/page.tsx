'use client';

import { useState, useEffect } from 'react';
import {
    Zap, ShieldCheck, ChevronRight,
    Users, HelpCircle, ArrowRight,
    Trophy, Share2, Loader2, Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionCard } from '@/components/interview-prep/QuestionCard';
import Link from 'next/link';

interface Round {
    id: string;
    type: string;
    questions: Array<{
        id: string;
        text: string;
        difficulty: 'Easy' | 'Medium' | 'Hard';
        frequency: number;
        date: string;
    }>;
}

interface RoleData {
    id: string;
    name: string;
    rounds: Round[];
}

export default function CompanyPrepPage({ params }: { params: { companyName: string, region: string, lang: string } }) {
    const [roles, setRoles] = useState<RoleData[]>([]);
    const [selectedRole, setSelectedRole] = useState<RoleData | null>(null);
    const [activeRound, setActiveRound] = useState<Round | null>(null);
    const [loading, setLoading] = useState(true);

    const name = decodeURIComponent(params.companyName).toUpperCase();

    useEffect(() => {
        fetch(`/api/interview-prep/company/${params.companyName}`)
            .then(r => r.json())
            .then(d => {
                if (d.success) {
                    setRoles(d.data);
                    setSelectedRole(d.data[0]);
                    setActiveRound(d.data[0]?.rounds[0]);
                }
            })
            .finally(() => setLoading(false));
    }, [params.companyName]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-xs">Loading Intelligence...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
            {/* Header / Company Branding */}
            <div className="relative border-b border-white/5 bg-white/[0.02] pt-32 pb-16 px-4 sm:px-8">
                <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-indigo-600/10 blur-[150px] -z-10" />

                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-end justify-between gap-12">
                    <div className="flex-1">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-6"
                        >
                            <ShieldCheck className="w-4 h-4" /> Core Verified Intelligence
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-6xl sm:text-8xl font-black text-white italic tracking-tighter leading-tight"
                        >
                            {name} <br />
                            <span className="text-slate-500">Mastery</span>
                        </motion.h1>
                    </div>

                    <div className="flex flex-wrap gap-6 mb-4">
                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl min-w-[140px]">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                <Users className="w-3 h-3 text-emerald-400" /> Active Roles
                            </div>
                            <div className="text-3xl font-black text-white">{roles.length}</div>
                        </div>
                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl min-w-[140px]">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                <Zap className="w-3 h-3 text-indigo-400" /> Total Context
                            </div>
                            <div className="text-3xl font-black text-white">
                                {roles.reduce((s, r) => s + r.rounds.reduce((sr, rd) => sr + rd.questions.length, 0), 0)}
                            </div>
                        </div>
                        <button className="h-full px-8 py-6 rounded-3xl bg-indigo-500 hover:bg-indigo-400 text-white font-black transition-all shadow-lg hover:shadow-indigo-500/30 active:scale-95 flex flex-col justify-center items-center">
                            <Share2 className="w-6 h-6 mb-2" />
                            <span className="text-[10px] uppercase tracking-widest">Share Context</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Logic */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

                    {/* Left Sidebar: Role Selection */}
                    <aside className="lg:col-span-1 border-r border-white/5 pr-8">
                        <h3 className="text-xs font-black text-slate-600 uppercase tracking-[0.2em] mb-8 italic">Available Roles</h3>
                        <div className="space-y-3">
                            {roles.map(r => (
                                <button
                                    key={r.id}
                                    onClick={() => { setSelectedRole(r); setActiveRound(r.rounds[0]); }}
                                    className={`w-full p-4 rounded-2xl flex items-center justify-between text-left transition-all group ${selectedRole?.id === r.id ? 'bg-indigo-500 text-white ring-8 ring-indigo-500/10' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                                >
                                    <div className="font-bold text-sm tracking-tight">{r.name}</div>
                                    <ChevronRight className={`w-4 h-4 transition-transform ${selectedRole?.id === r.id ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                                </button>
                            ))}
                        </div>

                        <div className="mt-16 p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                                <Trophy className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h4 className="text-sm font-black text-white mb-2">Wanna build a legacy?</h4>
                            <p className="text-[10px] text-slate-500 leading-relaxed mb-6 font-bold uppercase tracking-widest">Contribute to the collective intelligence bank.</p>
                            <button onClick={() => window.location.href = '/dashboard/interview-prep/share'} className="w-full py-3 bg-white/5 border border-white/10 hover:border-indigo-500/50 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-400 transition-all">
                                Submit Experience
                            </button>
                        </div>
                    </aside>

                    {/* Main Content: Rounds & Questions */}
                    <main className="lg:col-span-3">
                        {selectedRole ? (
                            <>
                                <div className="mb-12">
                                    <h2 className="text-4xl font-black text-white italic tracking-tighter mb-4">{selectedRole.name} Interview Process</h2>
                                    <p className="text-slate-500 font-medium">Verified questions sorted by frequency of appearance.</p>
                                </div>

                                {/* Round Selection Tabs */}
                                <div className="flex flex-wrap gap-4 mb-16">
                                    {selectedRole.rounds.map(round => (
                                        <button
                                            key={round.id}
                                            onClick={() => setActiveRound(round)}
                                            className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${activeRound?.id === round.id ? 'bg-white text-slate-950 border-white' : 'bg-transparent text-slate-500 border-white/10 hover:bg-white/5'}`}
                                        >
                                            {round.type} ({round.questions.length})
                                        </button>
                                    ))}
                                </div>

                                {/* Question List */}
                                <div className="grid gap-6 pr-4">
                                    <AnimatePresence mode="wait">
                                        {activeRound?.questions.map((q, i) => (
                                            <motion.div
                                                key={q.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                            >
                                                <QuestionCard
                                                    question={q.text}
                                                    difficulty={q.difficulty}
                                                    frequency={q.frequency}
                                                    verified={true}
                                                    date={q.date}
                                                />
                                            </motion.div>
                                        ))}
                                        {activeRound?.questions.length === 0 && (
                                            <div className="py-20 text-center">
                                                <HelpCircle className="w-16 h-16 text-white/5 mx-auto mb-4" />
                                                <p className="text-slate-600 font-black uppercase tracking-widest text-xs italic">No verified questions found for this round yet.</p>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Practice Mode CTA */}
                                <div className="mt-20 p-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem]">
                                    <div className="bg-slate-900 rounded-[2.4rem] p-10 sm:p-14 flex flex-col md:flex-row items-center gap-12">
                                        <div className="flex-1 text-center md:text-left">
                                            <h3 className="text-3xl sm:text-4xl font-black text-white italic tracking-tighter mb-4">Start Simulated Practice</h3>
                                            <p className="text-slate-400 text-lg leading-relaxed font-medium">
                                                Confront these exact questions in a realistic interview environment. Get AI-powered feedback on your delivery and content.
                                            </p>
                                        </div>
                                        <Link href={`/${params.region}/${params.lang}/company-prep-interview?role=${encodeURIComponent(name + ' - ' + (selectedRole?.name || ''))}`} className="group relative px-12 py-7 bg-white text-slate-950 font-black rounded-3xl transition-all shadow-xl hover:shadow-indigo-500/20 active:scale-95 flex items-center gap-3">
                                            Start Practice Mode <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                            <div className="absolute -top-3 -right-3 px-3 py-1.5 bg-indigo-500 text-white text-[10px] uppercase font-black rounded-lg animate-bounce">
                                                Premium
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[400px]">
                                <Briefcase className="w-16 h-16 text-slate-800 mb-6" />
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Pick a role to see questions.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
