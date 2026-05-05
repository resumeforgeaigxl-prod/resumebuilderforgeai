"use client"
export const dynamic = 'force-dynamic';

import React, { useState, Suspense } from 'react';
import {
    Share2,
    Linkedin,
    ChevronRight,
    Filter,
    Zap,
    Users,
    Sparkles,
    Loader2,
    CheckCircle2,
    MessageSquareText,
    Target,
    Search,
    Globe,
    ExternalLink
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ForgeSoftPaywall } from '@/components/auth/ForgeSoftPaywall';

const NETWORK_SECTIONS = [
    {
        id: 'linkedin-seo',
        title: 'LinkedIn SEO Audit',
        description: 'Analyze your profile for keyword density and recruiter visibility.',
        icon: <Search className="w-6 h-6" />,
        color: 'blue'
    },
    {
        id: 'outreach-gen',
        title: 'Outreach Generator',
        description: 'Generate high-conversion cold messages for referrals and networking.',
        icon: <MessageSquareText className="w-6 h-6" />,
        color: 'emerald'
    },
    {
        id: 'tracker',
        title: 'Network Tracker',
        description: 'CRM-style tracking for your high-value professional connections.',
        icon: <Users className="w-6 h-6" />,
        color: 'purple'
    }
];

function NetworkForgeLogic() {
    const params = useParams() as { locale: string };
    const [isGenerating, setIsGenerating] = useState(false);
    const [showPaywall, setShowPaywall] = useState(false);
    const [selectedTarget, setSelectedTarget] = useState('Recruiter Outreach');

    const generateOutreach = async () => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
        }, 1500);
    };

    if (showPaywall) {
        return <ForgeSoftPaywall forgeName="NetworkForge" />;
    }

    return (
        <div className="space-y-12 max-w-5xl mx-auto pb-24">
            {/* Standardized Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1E2A42] pb-8 mb-12">
                <div>
                    <div className="flex items-center gap-2 text-[#00D4A0] font-bold tracking-widest text-[10px] uppercase mb-4">
                        <Share2 className="w-3.5 h-3.5" /> Relationship Intelligence
                    </div>
                    <h1 className="text-4xl font-bold tracking-tighter text-white uppercase">NetworkForge</h1>
                    <p className="text-slate-400 mt-2 text-lg">Build a high-authority professional network with AI-optimized outreach and profile SEO.</p>
                </div>

                <div className="flex items-center gap-4">
                    <Button onClick={generateOutreach} disabled={isGenerating} className="px-6 h-12 rounded-xl bg-[#00D4A0] hover:bg-[#00D4A0]/90 text-[#080B16] font-bold text-sm shadow-lg shadow-[#00D4A0]/10 transition-all">
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Linkedin className="w-4 h-4 mr-2" />}
                        Scan LinkedIn Profile
                    </Button>
                </div>
            </header>

            {/* AI Generator Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 p-6 rounded-xl border border-[#1E2A42] bg-[#0D1220]/60 space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-base font-bold text-white flex items-center gap-2">
                            <Target className="w-4 h-4 text-[#7C5CFC]" />
                            Outreach Engine
                        </h2>
                        <p className="text-xs text-[#7A8BA8]">Generate hyper-personalized messages for your target network.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Outreach Signal</div>
                        <div className="grid grid-cols-1 gap-2">
                            {['Recruiter Outreach', 'Referral Request', 'Alumni Connection', 'Mentorship Ask'].map(target => (
                                <button
                                    key={target}
                                    onClick={() => setSelectedTarget(target)}
                                    className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all text-left flex items-center justify-between group ${selectedTarget === target
                                        ? 'bg-blue-600/10 border-blue-500/50 text-blue-400'
                                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                                        }`}
                                >
                                    {target}
                                    {selectedTarget === target && <CheckCircle2 className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button
                        onClick={generateOutreach}
                        disabled={isGenerating}
                        className="w-full h-11 rounded-xl bg-[#00D4A0] hover:bg-[#00D4A0]/90 text-[#080B16] font-bold text-sm"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                        Generate Outreach
                    </Button>
                </div>

                <div className="lg:col-span-2">
                    <div className="h-full flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-[#1E2A42] bg-transparent">
                        <div className="p-4 rounded-full bg-white/5 text-[#4A5568] mb-4">
                            <Globe className="w-8 h-8" />
                        </div>
                        <h3 className="text-base font-bold text-[#7A8BA8] mb-1">No Active Campaign</h3>
                        <p className="text-sm text-[#4A5568] max-w-sm">Initialize the Outreach Engine to generate high-conversion networking signals.</p>
                    </div>
                </div>
            </div>

            {/* Preparation Modules */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#1E2A42] pb-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Filter className="w-5 h-5 text-[#7C5CFC]" />
                        Growth Tracks
                    </h2>
                    <Badge variant="secondary" className="bg-[#0D1220] text-[#4A5568] px-3 py-1 font-semibold text-[10px]">NETWORKING MODULES</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {NETWORK_SECTIONS.map((section) => (
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
                                Initialize Track <ChevronRight className="w-3.5 h-3.5" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* LinkedIn Strategy Section */}
            <section className="p-8 rounded-2xl bg-[#0D1220]/60 border border-[#1E2A42]">
                <div className="max-w-3xl">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <ExternalLink className="w-5 h-5 text-[#7C5CFC]" />
                        The Referral Advantage
                    </h2>
                    <p className="text-[#7A8BA8] text-sm leading-relaxed mb-6">
                        Statistically, 85% of jobs are filled through networking. A single high-quality referral is worth 100 cold applications. NetworkForge helps you bridge the gap between "Applying" and "Landing."
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-5 rounded-xl border border-[#1E2A42] bg-[#080B16]">
                            <div className="text-[10px] text-[#4A5568] uppercase tracking-wider font-semibold mb-1">Outreach Conversion</div>
                            <div className="text-xl font-bold text-white">22.5%</div>
                        </div>
                        <div className="p-5 rounded-xl border border-[#1E2A42] bg-[#080B16]">
                            <div className="text-[10px] text-[#4A5568] uppercase tracking-wider font-semibold mb-1">LinkedIn Visibility</div>
                            <div className="text-xl font-bold text-[#7C5CFC]">+340%</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default function NetworkForgeApp() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-[#070710]">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
        }>
            <NetworkForgeLogic />
        </Suspense>
    );
}
