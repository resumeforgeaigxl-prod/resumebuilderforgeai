"use client"
export const dynamic = 'force-dynamic';

import React, { useState, Suspense } from 'react';
import {
    Wallet,
    TrendingUp,
    ChevronRight,
    Filter,
    Zap,
    Scale,
    Sparkles,
    Loader2,
    CheckCircle2,
    Calculator,
    ShieldCheck,
    FileSearch,
    IndianRupee,
    Briefcase
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ForgeSoftPaywall } from '@/components/auth/ForgeSoftPaywall';

const SALARY_SECTIONS = [
    {
        id: 'negotiator',
        title: 'Offer Negotiator',
        description: 'AI-powered scripts and tactics to increase your total compensation.',
        icon: <Scale className="w-6 h-6" />,
        color: 'emerald'
    },
    {
        id: 'benchmarks',
        title: 'Market Benchmarks',
        description: 'Real-time data on what roles actually pay in your region.',
        icon: <TrendingUp className="w-6 h-6" />,
        color: 'blue'
    },
    {
        id: 'analyzer',
        title: 'Offer Analyzer',
        description: 'Upload your offer letter to detect hidden clauses and "low-ball" signs.',
        icon: <FileSearch className="w-6 h-6" />,
        color: 'purple'
    }
];

function SalaryForgeLogic() {
    const params = useParams() as { locale: string };
    const [isGenerating, setIsGenerating] = useState(false);
    const [showPaywall, setShowPaywall] = useState(false);
    const [selectedRole, setSelectedRole] = useState('Frontend Engineer');

    const [negotiationData, setNegotiationData] = useState<{ script: string; key_points: string[]; market_insight: string } | null>(null);

    const generateNegotiationScript = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch('/api/salaryforge/negotiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    role: selectedRole, 
                    currentOffer: 'Not specified', 
                    targetSalary: 'Market competitive' 
                })
            });
            const data = await res.json();
            if (data.success) {
                setNegotiationData(data.data);
            }
        } catch (err) {
            console.error('SalaryForge Error:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    if (showPaywall) {
        return <ForgeSoftPaywall forgeName="SalaryForge" />;
    }

    return (
        <div className="space-y-12 max-w-5xl mx-auto pb-24">
            {/* Standardized Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1E2A42] pb-8 mb-12">
                <div>
                    <div className="flex items-center gap-2 text-[#00D4A0] font-bold tracking-widest text-[10px] uppercase mb-4">
                        <div className="w-2 h-2 rounded-full bg-[#00D4A0] animate-pulse" />
                        <Wallet className="w-3.5 h-3.5" /> Compensation Intelligence
                    </div>
                    <h1 className="text-4xl font-bold tracking-tighter text-white uppercase">SalaryForge</h1>
                    <p className="text-slate-400 mt-2 text-lg italic">Maximize your earning potential with AI-driven market intelligence.</p>
                </div>

                <div className="flex items-center gap-4">
                    <Button onClick={generateNegotiationScript} disabled={isGenerating} className="px-6 h-12 rounded-xl bg-[#00D4A0] hover:bg-[#00D4A0]/90 text-[#080B16] font-bold text-sm shadow-lg shadow-[#00D4A0]/10 transition-all">
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        Analyze Market Rate
                    </Button>
                    <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0D1220] border border-[#1E2A42]">
                        <div className="text-[10px] text-[#4A5568] uppercase tracking-wider font-semibold">MARKET_SIGNAL</div>
                        <Badge variant="outline" className="border-[#00D4A0]/20 bg-[#00D4A0]/5 text-[#00D4A0] text-[9px] font-bold uppercase">LIVE</Badge>
                    </div>
                </div>
            </header>

            {/* AI Analyzer Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 p-6 rounded-xl border border-[#1E2A42] bg-[#0D1220]/60 space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-base font-bold text-white flex items-center gap-2">
                            <Calculator className="w-4 h-4 text-[#7C5CFC]" />
                            Negotiation Engine
                        </h2>
                        <p className="text-xs text-[#7A8BA8]">Generate a custom script to counter-offer your new role.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Target Role Signal</div>
                        <div className="grid grid-cols-1 gap-2">
                            {['Frontend Engineer', 'Backend Engineer', 'Fullstack Engineer', 'Data Scientist'].map(role => (
                                <button
                                    key={role}
                                    onClick={() => setSelectedRole(role)}
                                    className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all text-left flex items-center justify-between group ${selectedRole === role
                                        ? 'bg-blue-600/10 border-blue-500/50 text-blue-400'
                                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                                        }`}
                                >
                                    {role}
                                    {selectedRole === role && <CheckCircle2 className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button
                        onClick={generateNegotiationScript}
                        disabled={isGenerating}
                        className="w-full h-11 rounded-xl bg-[#00D4A0] hover:bg-[#00D4A0]/90 text-[#080B16] font-bold text-sm"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                        Generate Negotiation Script
                    </Button>
                </div>

                <div className="lg:col-span-2">
                    {negotiationData ? (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-700 space-y-6">
                            <div className="p-8 rounded-xl border border-[#00D4A0]/20 bg-[#0D1220]/60">
                                <div className="flex items-center justify-between mb-6">
                                    <Badge variant="outline" className="px-3 py-1 border-[#00D4A0]/30 text-[#00D4A0] font-bold text-[10px] uppercase">AI GENERATED SCRIPT</Badge>
                                    <div className="text-xs font-semibold text-[#4A5568]">Role: {selectedRole}</div>
                                </div>

                                <div className="p-6 rounded-xl bg-black/40 border border-[#1E2A42] font-serif text-base text-slate-300 leading-relaxed italic mb-8 whitespace-pre-wrap">
                                    "{negotiationData.script}"
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-[#7C5CFC]" /> Key Tactics
                                        </h4>
                                        <ul className="space-y-3">
                                            {negotiationData.key_points.map((point, i) => (
                                                <li key={i} className="flex gap-3 text-xs text-[#7A8BA8] leading-relaxed">
                                                    <span className="shrink-0 w-5 h-5 rounded-full bg-[#00D4A0]/10 text-[#00D4A0] flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                                                    {point}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-[#00D4A0]" /> Market Insight
                                        </h4>
                                        <div className="p-4 rounded-xl bg-white/[0.02] border border-[#1E2A42] text-xs text-[#7A8BA8] leading-relaxed">
                                            {negotiationData.market_insight}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-[#1E2A42] flex items-center justify-between">
                                    <div className="text-[10px] text-[#4A5568] uppercase font-bold tracking-widest flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-[#00D4A0]" />
                                        Verified Strategy
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => setNegotiationData(null)} className="text-xs font-bold border-[#1E2A42] hover:bg-white/5">
                                        Clear Analysis
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-[#1E2A42] bg-transparent">
                            <div className="p-4 rounded-full bg-white/5 text-[#4A5568] mb-4">
                                <IndianRupee className="w-8 h-8" />
                            </div>
                            <h3 className="text-base font-bold text-[#7A8BA8] mb-1">No Analysis Active</h3>
                            <p className="text-sm text-[#4A5568] max-w-sm">Select a role or upload an offer letter to initialize the SalaryForge engine.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Negotiation Modules */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#1E2A42] pb-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Filter className="w-5 h-5 text-[#7C5CFC]" />
                        Intelligence Tracks
                    </h2>
                    <Badge variant="secondary" className="bg-[#0D1220] text-[#4A5568] px-3 py-1 font-semibold text-[10px]">NEGOTIATION MODULES</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {SALARY_SECTIONS.map((section) => (
                        <div
                            key={section.id}
                            className="p-6 rounded-xl border border-[#1E2A42] bg-[#0D1220]/60 hover:border-[#00D4A0]/20 transition-all group h-full flex flex-col cursor-pointer"
                        >
                            <div className="mb-4 p-3 rounded-xl bg-white/5 w-fit text-[#00D4A0] group-hover:scale-105 transition-transform">
                                {section.icon}
                            </div>
                            <h3 className="text-base font-bold text-white mb-2">
                                {section.title}
                            </h3>
                            <p className="text-sm text-[#7A8BA8] leading-relaxed mb-6">
                                {section.description}
                            </p>
                            <div className="mt-auto flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#00D4A0] group-hover:gap-3 transition-all">
                                Open Module <ChevronRight className="w-3.5 h-3.5" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Compensation Tip Section */}
            <section className="p-8 rounded-2xl bg-[#0D1220]/60 border border-[#1E2A42]">
                <div className="max-w-3xl">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-[#F5A623]" />
                        Know Your Value
                    </h2>
                    <p className="text-[#7A8BA8] text-sm leading-relaxed mb-6">
                        Negotiation isn't about being "difficult"—it's about market alignment. A 10% increase in your starting salary can result in hundreds of thousands of dollars in cumulative gains over a career.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-5 rounded-xl border border-[#1E2A42] bg-[#080B16]">
                            <div className="text-[10px] text-[#4A5568] uppercase tracking-wider font-semibold mb-1">Avg. Negotiation Gain</div>
                            <div className="text-xl font-bold text-[#00D4A0]">+15.4%</div>
                        </div>
                        <div className="p-5 rounded-xl border border-[#1E2A42] bg-[#080B16]">
                            <div className="text-[10px] text-[#4A5568] uppercase tracking-wider font-semibold mb-1">Offer Analysis Success</div>
                            <div className="text-xl font-bold text-white">92%</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default function SalaryForgeApp() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-[#070710]">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            </div>
        }>
            <SalaryForgeLogic />
        </Suspense>
    );
}
