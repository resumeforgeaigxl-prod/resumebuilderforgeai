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
        <div className="space-y-12 max-w-5xl mx-auto pb-24 text-[#171717]">
            {/* Standardized Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#EBEBEB] pb-8 mb-12">
                <div>
                    <div className="flex items-center gap-2 text-[#8F8F8F] font-semibold tracking-wider text-[10px] uppercase mb-4 font-mono">
                        <Wallet className="w-3.5 h-3.5 text-[#171717]" /> Compensation Intelligence
                    </div>
                    <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#171717]">SalaryForge</h1>
                    <p className="text-[#4D4D4D] mt-2 text-base">Maximize your earning potential with AI-driven market intelligence.</p>
                </div>

                <div className="flex items-center gap-4">
                    <Button onClick={generateNegotiationScript} disabled={isGenerating} className="px-6 h-10 rounded-md bg-[#171717] hover:bg-[#333333] text-white font-medium text-xs shadow-sm transition-all">
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        Analyze Market Rate
                    </Button>
                    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#EBEBEB] shadow-sm">
                        <div className="text-[10px] text-[#8F8F8F] uppercase tracking-wider font-semibold">MARKET_SIGNAL</div>
                        <Badge variant="outline" className="border-emerald-100 bg-emerald-50 text-emerald-700 text-[9px] font-semibold uppercase">LIVE</Badge>
                    </div>
                </div>
            </header>

            {/* AI Analyzer Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 p-6 rounded-xl border border-[#EBEBEB] bg-white shadow-sm space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-base font-semibold text-[#171717] flex items-center gap-2">
                            <Calculator className="w-4 h-4 text-[#171717]" />
                            Negotiation Engine
                        </h2>
                        <p className="text-xs text-[#8F8F8F]">Generate a custom script to counter-offer your new role.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="text-[10px] font-semibold text-[#8F8F8F] uppercase tracking-wider pl-1 font-mono">Target Role Signal</div>
                        <div className="grid grid-cols-1 gap-2">
                            {['Frontend Engineer', 'Backend Engineer', 'Fullstack Engineer', 'Data Scientist'].map(role => (
                                <button
                                    key={role}
                                    onClick={() => setSelectedRole(role)}
                                    className={`px-4 py-3 rounded-lg border text-sm font-semibold transition-all text-left flex items-center justify-between group ${selectedRole === role
                                        ? 'bg-blue-50 border-blue-100 text-[#0070F3]'
                                        : 'bg-[#FFFFFF] border-[#EBEBEB] text-[#4D4D4D] hover:bg-[#FAFAFA]'
                                        }`}
                                >
                                    {role}
                                    {selectedRole === role && <CheckCircle2 className="w-4 h-4 text-[#0070F3]" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button
                        onClick={generateNegotiationScript}
                        disabled={isGenerating}
                        className="w-full h-10 rounded-md bg-[#171717] hover:bg-[#333333] text-white font-medium text-xs"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                        Generate Script
                    </Button>
                </div>

                <div className="lg:col-span-2">
                    {negotiationData ? (
                        <div className="animate-in fade-in duration-300 space-y-6">
                            <div className="p-8 rounded-xl border border-[#EBEBEB] bg-white shadow-sm">
                                <div className="flex items-center justify-between mb-6 border-b border-[#EBEBEB] pb-4">
                                    <Badge variant="outline" className="px-3 py-1 border-blue-100 text-[#0070F3] bg-blue-50 font-semibold text-[10px] uppercase">AI GENERATED SCRIPT</Badge>
                                    <div className="text-xs font-semibold text-[#8F8F8F]">Role: {selectedRole}</div>
                                </div>

                                <div className="p-6 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] font-serif text-base text-[#171717] leading-relaxed italic mb-8 whitespace-pre-wrap">
                                    "{negotiationData.script}"
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-semibold text-[#171717] flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-[#171717]" /> Key Tactics
                                        </h4>
                                        <ul className="space-y-3">
                                            {negotiationData.key_points.map((point, i) => (
                                                <li key={i} className="flex gap-3 text-xs text-[#4D4D4D] leading-relaxed">
                                                    <span className="shrink-0 w-5 h-5 rounded-full bg-blue-50 border border-blue-100 text-[#0070F3] flex items-center justify-center text-[10px] font-semibold">{i + 1}</span>
                                                    {point}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-semibold text-[#171717] flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-[#171717]" /> Market Insight
                                        </h4>
                                        <div className="p-4 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] text-xs text-[#4D4D4D] leading-relaxed font-normal">
                                            {negotiationData.market_insight}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-[#EBEBEB] flex items-center justify-between">
                                    <div className="text-[10px] text-[#8F8F8F] uppercase font-semibold tracking-wider flex items-center gap-2 font-mono">
                                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                        Verified Strategy
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => setNegotiationData(null)} className="text-xs font-semibold border-[#EBEBEB] hover:bg-[#FAFAFA] h-8 rounded-md bg-white text-[#171717]">
                                        Clear Analysis
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-[#EBEBEB] bg-white shadow-sm">
                            <div className="p-4 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] text-[#8F8F8F] mb-4 shadow-sm">
                                <IndianRupee className="w-8 h-8" />
                            </div>
                            <h3 className="text-base font-semibold text-[#171717] mb-1">No Analysis Active</h3>
                            <p className="text-sm text-[#8F8F8F] max-w-sm">Select a role or analyze market rate to initialize the SalaryForge engine.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Negotiation Modules */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-4">
                    <h2 className="text-lg font-semibold text-[#171717] flex items-center gap-2">
                        <Filter className="w-5 h-5 text-[#8F8F8F]" />
                        Intelligence Tracks
                    </h2>
                    <Badge variant="outline" className="bg-[#FFFFFF] border-[#EBEBEB] text-[#171717] px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono">NEGOTIATION MODULES</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {SALARY_SECTIONS.map((section) => (
                        <div
                            key={section.id}
                            className="p-6 rounded-xl border border-[#EBEBEB] bg-white hover:border-[#171717]/25 hover:shadow-sm transition-all group h-full flex flex-col cursor-pointer"
                        >
                            <div className="mb-4 p-3 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] w-fit text-[#171717] group-hover:scale-105 transition-transform">
                                {section.icon}
                            </div>
                            <h3 className="text-base font-semibold text-[#171717] mb-2">
                                {section.title}
                            </h3>
                            <p className="text-sm text-[#4D4D4D] leading-relaxed mb-6">
                                {section.description}
                            </p>
                            <div className="mt-auto flex items-center gap-2 text-xs font-semibold text-[#8F8F8F] group-hover:text-[#0070F3] transition-all">
                                Open Module <ChevronRight className="w-3.5 h-3.5" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Compensation Tip Section */}
            <section className="p-8 rounded-xl bg-white border border-[#EBEBEB] shadow-sm">
                <div className="max-w-3xl">
                    <h2 className="text-xl font-semibold text-[#171717] mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-[#171717]" />
                        Know Your Value
                    </h2>
                    <p className="text-[#4D4D4D] text-sm leading-relaxed mb-6">
                        Negotiation isn't about being "difficult"—it's about market alignment. A 10% increase in your starting salary can result in hundreds of thousands of dollars in cumulative gains over a career.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 rounded-lg border border-[#EBEBEB] bg-[#FAFAFA]">
                            <div className="text-[10px] text-[#8F8F8F] uppercase tracking-wider font-semibold mb-1 font-mono">Avg. Negotiation Gain</div>
                            <div className="text-xl font-bold text-emerald-600">+15.4%</div>
                        </div>
                        <div className="p-5 rounded-lg border border-[#EBEBEB] bg-[#FAFAFA]">
                            <div className="text-[10px] text-[#8F8F8F] uppercase tracking-wider font-semibold mb-1 font-mono">Offer Analysis Success</div>
                            <div className="text-xl font-bold text-[#171717]">92%</div>
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
            <div className="flex items-center justify-center min-h-screen bg-[#FAFAFA]">
                <Loader2 className="w-12 h-12 text-[#171717] animate-spin" />
            </div>
        }>
            <SalaryForgeLogic />
        </Suspense>
    );
}
