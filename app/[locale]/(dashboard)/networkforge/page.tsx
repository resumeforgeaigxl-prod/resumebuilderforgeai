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
    Loader2,
    CheckCircle2,
    MessageSquareText,
    Target,
    Search,
    Globe,
    ExternalLink
, Wand2 } from 'lucide-react';
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
        <div className="space-y-12 max-w-5xl mx-auto pb-24 text-[#171717] animate-premium-in">
            {/* Standardized Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#EBEBEB] pb-8 mb-12">
                <div>
                    <div className="flex items-center gap-2 text-[#8F8F8F] font-bold tracking-wider text-[10px] uppercase mb-3 font-mono">
                        <Share2 className="w-3.5 h-3.5 text-[#171717]" /> Relationship Intelligence
                    </div>
                    <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#171717]">NetworkForge</h1>
                    <p className="text-[#4D4D4D] mt-2 text-sm md:text-base">Build a high-authority professional network with AI-optimized outreach and profile SEO.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button onClick={generateOutreach} disabled={isGenerating} className="px-5 h-10 rounded-md bg-[#171717] hover:bg-[#333333] text-white font-semibold text-xs uppercase tracking-wider transition-all">
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Linkedin className="w-4 h-4 mr-2" />}
                        Scan LinkedIn Profile
                    </Button>
                </div>
            </header>

            {/* AI Generator Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 p-6 rounded-xl border border-[#EBEBEB] bg-[#FFFFFF] space-y-6 shadow-sm">
                    <div className="space-y-2">
                        <h2 className="text-sm font-semibold text-[#171717] flex items-center gap-2">
                            <Target className="w-4 h-4 text-[#171717]" />
                            Outreach Engine
                        </h2>
                        <p className="text-xs text-[#4D4D4D]">Generate hyper-personalized messages for your target network.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="text-[10px] font-bold text-[#8F8F8F] uppercase tracking-wider pl-1 font-mono">Outreach Signal</div>
                        <div className="grid grid-cols-1 gap-2">
                            {['Recruiter Outreach', 'Referral Request', 'Alumni Connection', 'Mentorship Ask'].map(target => (
                                <button
                                    key={target}
                                    onClick={() => setSelectedTarget(target)}
                                    className={`px-4 py-3 rounded-lg border text-xs font-semibold transition-all text-left flex items-center justify-between group ${selectedTarget === target
                                        ? 'bg-[#171717]/5 border-[#171717] text-[#171717]'
                                        : 'bg-[#FFFFFF] border-[#EBEBEB] text-[#4D4D4D] hover:bg-[#FAFAFA]'
                                        }`}
                                >
                                    {target}
                                    {selectedTarget === target && <CheckCircle2 className="w-4 h-4 text-[#171717]" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button
                        onClick={generateOutreach}
                        disabled={isGenerating}
                        className="w-full h-10 rounded-md bg-[#171717] hover:bg-[#333333] text-white font-semibold text-xs uppercase tracking-wider transition-all"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                        Generate Outreach
                    </Button>
                </div>

                <div className="lg:col-span-2">
                    <div className="h-full min-h-[320px] flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-[#EBEBEB] bg-[#FAFAFA]">
                        <div className="p-4 rounded-full bg-[#FFFFFF] border border-[#EBEBEB] text-[#8F8F8F] mb-4 shadow-sm">
                            <Globe className="w-6 h-6 text-[#171717]" />
                        </div>
                        <h3 className="text-sm font-semibold text-[#171717] mb-1">No Active Campaign</h3>
                        <p className="text-xs text-[#8F8F8F] max-w-xs leading-relaxed font-medium">Initialize the Outreach Engine to generate high-conversion networking signals.</p>
                    </div>
                </div>
            </div>

            {/* Preparation Modules */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-4">
                    <h2 className="text-sm font-semibold text-[#171717] flex items-center gap-2">
                        <Filter className="w-4.5 h-4.5 text-[#171717]" />
                        Growth Tracks
                    </h2>
                    <Badge variant="outline" className="border-[#EBEBEB] bg-[#FFFFFF] text-[#8F8F8F] px-3 py-1 font-bold text-[9px] uppercase font-mono">NETWORKING MODULES</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {NETWORK_SECTIONS.map((section) => (
                        <div
                            key={section.id}
                            className="p-6 rounded-xl border border-[#EBEBEB] bg-[#FFFFFF] hover:border-[#171717]/25 transition-all group h-full flex flex-col cursor-pointer shadow-sm"
                        >
                            <div className="mb-4 p-3 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] w-fit text-[#171717] group-hover:scale-105 transition-transform">
                                {section.icon}
                            </div>
                            <h3 className="text-sm font-semibold text-[#171717] mb-2">
                                {section.title}
                            </h3>
                            <p className="text-xs text-[#4D4D4D] leading-relaxed mb-6">
                                {section.description}
                            </p>
                            <div className="mt-auto flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#171717] group-hover:gap-3 transition-all">
                                Initialize Track <ChevronRight className="w-3.5 h-3.5" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* LinkedIn Strategy Section */}
            <section className="p-8 rounded-xl bg-[#FFFFFF] border border-[#EBEBEB] shadow-sm">
                <div className="max-w-3xl">
                    <h2 className="text-sm font-semibold text-[#171717] mb-4 flex items-center gap-2">
                        <ExternalLink className="w-4.5 h-4.5 text-[#171717]" />
                        The Referral Advantage
                    </h2>
                    <p className="text-[#4D4D4D] text-xs leading-relaxed mb-6">
                        Statistically, 85% of jobs are filled through networking. A single high-quality referral is worth 100 cold applications. NetworkForge helps you bridge the gap between "Applying" and "Landing."
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 rounded-xl border border-[#EBEBEB] bg-[#FAFAFA]">
                            <div className="text-[9px] text-[#8F8F8F] uppercase tracking-wider font-bold font-mono mb-1">Outreach Conversion</div>
                            <div className="text-xl font-bold text-[#171717]">22.5%</div>
                        </div>
                        <div className="p-5 rounded-xl border border-[#EBEBEB] bg-[#FAFAFA]">
                            <div className="text-[9px] text-[#8F8F8F] uppercase tracking-wider font-bold font-mono mb-1">LinkedIn Visibility</div>
                            <div className="text-xl font-bold text-[#171717]">+340%</div>
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
            <div className="flex items-center justify-center min-h-screen bg-[#FAFAFA]">
                <Loader2 className="w-12 h-12 text-[#171717] animate-spin" />
            </div>
        }>
            <NetworkForgeLogic />
        </Suspense>
    );
}
