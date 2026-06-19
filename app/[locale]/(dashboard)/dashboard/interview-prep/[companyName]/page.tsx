'use client'
export const dynamic = 'force-dynamic';
;

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

export default function CompanyPrepPage({ params }: { params: { companyName: string, locale: string } }) {
    const { locale } = params;
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
            <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center gap-4 text-[#171717]">
                <Loader2 className="w-10 h-10 text-[#171717] animate-spin" />
                <p className="text-[#8F8F8F] font-semibold animate-pulse uppercase tracking-wider text-[10px] font-mono">Loading Intelligence...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-[#171717] overflow-x-hidden pb-20">
            {/* Header / Company Branding */}
            <div className="relative border-b border-[#EBEBEB] bg-[#FFFFFF] pt-24 pb-12 px-4 sm:px-8">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
                    <div className="flex-1">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0070F3]/5 border border-[#0070F3]/10 text-[#0070F3] text-[10px] font-bold uppercase tracking-wider mb-4"
                        >
                            <ShieldCheck className="w-4 h-4 text-[#0070F3]" /> Core Verified Intelligence
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-4xl sm:text-6xl font-semibold text-[#171717] tracking-tight leading-tight font-sans"
                        >
                            {name} <br />
                            <span className="text-[#8F8F8F]">Mastery</span>
                        </motion.h1>
                    </div>

                    <div className="flex flex-wrap gap-4 mb-2">
                        <div className="p-5 bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl min-w-[130px] shadow-sm">
                            <div className="text-[10px] font-bold text-[#8F8F8F] uppercase tracking-wider mb-1 flex items-center gap-1.5 font-mono">
                                <Users className="w-3.5 h-3.5 text-emerald-600" /> Active Roles
                            </div>
                            <div className="text-2xl font-semibold text-[#171717] mt-1">{roles.length}</div>
                        </div>
                        <div className="p-5 bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl min-w-[130px] shadow-sm">
                            <div className="text-[10px] font-bold text-[#8F8F8F] uppercase tracking-wider mb-1 flex items-center gap-1.5 font-mono">
                                <Zap className="w-3.5 h-3.5 text-[#0070F3]" /> Total Context
                            </div>
                            <div className="text-2xl font-semibold text-[#171717] mt-1">
                                {roles.reduce((s, r) => s + r.rounds.reduce((sr, rd) => sr + rd.questions.length, 0), 0)}
                            </div>
                        </div>
                        <button className="px-6 py-4 rounded-xl bg-[#171717] hover:bg-[#333333] text-white font-semibold transition-all shadow-sm active:scale-[0.98] flex flex-col justify-center items-center">
                            <Share2 className="w-5 h-5 mb-1.5 text-white" />
                            <span className="text-[10px] uppercase tracking-wider font-bold">Share Context</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Logic */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Left Sidebar: Role Selection */}
                    <aside className="lg:col-span-1 border-r border-[#EBEBEB] pr-6">
                        <h3 className="text-xs font-bold text-[#8F8F8F] uppercase tracking-wider mb-6 italic font-mono">Available Roles</h3>
                        <div className="space-y-2">
                            {roles.map(r => (
                                <button
                                    key={r.id}
                                    onClick={() => { setSelectedRole(r); setActiveRound(r.rounds[0]); }}
                                    className={`w-full p-4 rounded-lg flex items-center justify-between text-left transition-all border ${selectedRole?.id === r.id ? 'bg-[#171717]/5 border-[#171717] text-[#171717] font-semibold' : 'bg-[#FFFFFF] text-[#4D4D4D] border-[#EBEBEB] hover:bg-[#FAFAFA]'}`}
                                >
                                    <div className="text-xs font-semibold tracking-tight">{r.name}</div>
                                    <ChevronRight className={`w-4 h-4 text-[#171717] transition-transform ${selectedRole?.id === r.id ? 'translate-x-0.5' : 'opacity-0'}`} />
                                </button>
                            ))}
                        </div>

                        <div className="mt-12 p-6 rounded-xl bg-[#FAFAFA] border border-[#EBEBEB] text-center">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-4">
                                <Trophy className="w-5 h-5 text-[#0070F3]" />
                            </div>
                            <h4 className="text-xs font-bold text-[#171717] mb-2 uppercase tracking-wider font-mono">Wanna build a legacy?</h4>
                            <p className="text-[10px] text-[#8F8F8F] leading-relaxed mb-5 font-bold uppercase tracking-widest font-mono">Contribute to the collective intelligence bank.</p>
                            <button onClick={() => window.location.href = '/dashboard/interview-prep/share'} className="w-full py-2.5 bg-[#FFFFFF] border border-[#EBEBEB] hover:bg-[#FAFAFA] rounded-md text-[10px] font-bold uppercase tracking-wider text-[#0070F3] transition-all">
                                Submit Experience
                            </button>
                        </div>
                    </aside>

                    {/* Main Content: Rounds & Questions */}
                    <main className="lg:col-span-3">
                        {selectedRole ? (
                            <>
                                <div className="mb-8">
                                    <h2 className="text-2xl font-semibold text-[#171717] tracking-tight mb-2">{selectedRole.name} Interview Process</h2>
                                    <p className="text-[#8F8F8F] text-sm font-medium">Verified questions sorted by frequency of appearance.</p>
                                </div>

                                {/* Round Selection Tabs */}
                                <div className="flex flex-wrap gap-2.5 mb-10">
                                    {selectedRole.rounds.map(round => (
                                        <button
                                            key={round.id}
                                            onClick={() => setActiveRound(round)}
                                            className={`px-4 py-2 rounded-md font-bold text-[10px] uppercase tracking-wider border transition-all ${activeRound?.id === round.id ? 'bg-[#171717] text-white border-[#171717]' : 'bg-[#FFFFFF] text-[#4D4D4D] border-[#EBEBEB] hover:bg-[#FAFAFA]'}`}
                                        >
                                            {round.type} ({round.questions.length})
                                        </button>
                                    ))}
                                </div>

                                {/* Question List */}
                                <div className="grid gap-4 pr-2">
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
                                            <div className="py-20 text-center border border-dashed border-[#EBEBEB] rounded-xl bg-[#FFFFFF]">
                                                <HelpCircle className="w-12 h-12 text-[#8F8F8F] mx-auto mb-3" />
                                                <p className="text-[#8F8F8F] font-bold uppercase tracking-wider text-[10px] font-mono italic">No verified questions found for this round yet.</p>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Practice Mode CTA */}
                                <div className="mt-16 bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl p-8 sm:p-10 shadow-sm flex flex-col md:flex-row items-center gap-8">
                                    <div className="flex-1 text-center md:text-left">
                                        <h3 className="text-xl sm:text-2xl font-semibold text-[#171717] tracking-tight mb-2">Start Simulated Practice</h3>
                                        <p className="text-[#4D4D4D] text-sm leading-relaxed font-medium">
                                            Confront these exact questions in a realistic interview environment. Get AI-powered feedback on your delivery and content.
                                        </p>
                                    </div>
                                    <Link href={`/${locale}/company-prep-interview?role=${encodeURIComponent(name + ' - ' + (selectedRole?.name || ''))}`} className="group relative px-6 py-3.5 bg-[#171717] hover:bg-[#333333] text-white font-semibold rounded-md transition-all shadow-sm active:scale-[0.98] flex items-center gap-2 text-xs uppercase tracking-wider text-center shrink-0">
                                        Start Practice Mode <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                        <div className="absolute -top-3 -right-2 px-2.5 py-1 bg-[#0070F3] text-white text-[9px] uppercase font-bold rounded shadow-sm">
                                            Premium
                                        </div>
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[300px] border border-dashed border-[#EBEBEB] rounded-xl bg-[#FFFFFF]">
                                <Briefcase className="w-12 h-12 text-[#8F8F8F] mb-4" />
                                <p className="text-[#8F8F8F] font-bold uppercase tracking-wider text-[10px] font-mono">Pick a role to see questions.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
