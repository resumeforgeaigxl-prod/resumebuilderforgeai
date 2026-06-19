"use client"
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {
    Cpu,
    Sparkles,
    ArrowRight,
    Layers,
    Code,
    Zap,
    Terminal,
    Workflow,
    ChevronRight,
    AlertCircle,
    Loader2,
    Box
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ForgeSoftPaywall } from '@/components/auth/ForgeSoftPaywall';

export default function ProjectForgeLanding() {
    const params = useParams() as { locale: string };
    const locale = params.locale || 'en-IN';
    const router = useRouter();

    const [projectIdea, setProjectIdea] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [credits, setCredits] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showPaywall, setShowPaywall] = useState(false);

    useEffect(() => {
        const fetchCredits = async () => {
            try {
                const res = await fetch('/api/projectforge/credits');
                if (res.ok) {
                    const data = await res.json();
                    setCredits(data.credits);
                }
            } catch (err) {
                console.error("Failed to fetch credits", err);
            }
        };
        fetchCredits();
    }, []);

    const handleGenerate = async () => {
        if (!projectIdea.trim()) return;

        setIsGenerating(true);
        setError(null);

        try {
            const res = await fetch('/api/projectforge/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idea: projectIdea }),
            });

            const data = await res.json();

            if (data.limitReached) {
                setShowPaywall(true);
                return;
            }

            if (!res.ok) {
                throw new Error(data.error || 'Failed to generate project');
            }

            // Redirect to the project view
            router.push(`/${locale}/projectforge/${data.projectId}`);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsGenerating(false);
        }
    };

    if (showPaywall) {
        return <ForgeSoftPaywall forgeName="ProjectForge" />;
    }

    return (
        <div className="space-y-12 max-w-5xl mx-auto pb-24">
            {/* Standardized Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#EBEBEB] pb-8 mb-12">
                <div>
                    <div className="flex items-center gap-2 text-[#8F8F8F] font-medium tracking-normal text-xs uppercase mb-3 font-mono">
                        <Cpu className="w-3.5 h-3.5" /> Intelligence Core
                    </div>
                    <h1 className="text-3xl md:text-4xl font-semibold tracking-tighter text-[#171717]">ProjectForge</h1>
                    <p className="text-[#4D4D4D] mt-2 text-base">Transmit your vision and let the Forge materialize a high-performance system architecture.</p>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-[#FFFFFF] border border-[#EBEBEB] shadow-sm">
                    <Zap className="w-5 h-5 text-[#171717]" />
                    <div>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-[#8F8F8F]">Credits Available</p>
                        <p className="text-sm font-semibold text-[#171717]">{credits !== null ? credits : '0'} Units</p>
                    </div>
                </div>
            </header>

            {/* Input Area */}
            <div className="max-w-3xl mx-auto">
                <div className="relative rounded-lg border border-[#EBEBEB] bg-[#FFFFFF] p-2 flex flex-col sm:flex-row items-stretch gap-2 shadow-sm">
                    <div className="flex-1 flex items-center px-4">
                        <Box className="w-5 h-5 text-[#8F8F8F] mr-3 shrink-0" />
                        <input
                            type="text"
                            placeholder='Describe your system (e.g., "Scalable Fintech API")'
                            className="w-full bg-transparent border-0 focus:ring-0 py-2.5 text-[#171717] text-sm placeholder:text-[#8F8F8F] outline-none"
                            value={projectIdea}
                            onChange={(e) => setProjectIdea(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                            disabled={isGenerating}
                        />
                    </div>
                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating || !projectIdea.trim()}
                        className="sm:w-44 h-10 rounded-md bg-[#171717] hover:bg-[#333333] text-white text-sm font-medium transition-all"
                    >
                        {isGenerating ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <div className="flex items-center gap-2 justify-center">
                                Construct <ArrowRight className="w-4 h-4" />
                            </div>
                        )}
                    </Button>
                </div>

                {error && (
                    <div className="mt-4 flex items-center gap-2 justify-center text-red-500 text-xs">
                        <AlertCircle className="w-3.5 h-3.5" />
                        System Error: {error}
                    </div>
                )}

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                        { label: 'Latency', value: '30ms Cycle', icon: <Workflow className="w-4 h-4 text-[#171717]" /> },
                        { label: 'Engine', value: 'Neural Architect', icon: <Cpu className="w-4 h-4 text-[#171717]" /> },
                        { label: 'Model', value: 'Gemini Prime', icon: <Sparkles className="w-4 h-4 text-[#171717]" /> }
                    ].map((stat, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[#EBEBEB] bg-[#FFFFFF] shadow-sm">
                            <div className="p-2 rounded-md bg-[#FAFAFA] border border-[#EBEBEB]">{stat.icon}</div>
                            <div>
                                <div className="text-[10px] font-mono uppercase text-[#8F8F8F] tracking-wider">{stat.label}</div>
                                <div className="text-xs font-semibold text-[#171717]">{stat.value}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                    {
                        title: 'Macro Architecture',
                        description: 'Generates end-to-end structural maps with integrated DB schema logic.',
                        icon: <Layers className="w-6 h-6 text-[#171717]" />,
                    },
                    {
                        title: 'Pure Implementation',
                        description: 'Clean, modular code patterns synchronized with industry performance metrics.',
                        icon: <Code className="w-6 h-6 text-[#171717]" />,
                    },
                    {
                        title: 'Interactive Sandbox',
                        description: 'Immediate visual feedback through our real-time structural rendering engine.',
                        icon: <Terminal className="w-6 h-6 text-[#171717]" />,
                    }
                ].map((feature, i) => (
                    <div key={i} className="p-6 rounded-xl border border-[#EBEBEB] bg-[#FFFFFF] hover:border-[#171717] hover:shadow-[0_2px_4px_rgba(0,0,0,0.02),0_8px_16px_rgba(0,0,0,0.04)] transition-all group shadow-sm">
                        <div className="mb-4 p-3 rounded-md bg-[#FAFAFA] border border-[#EBEBEB] w-fit group-hover:scale-105 transition-transform">
                            {feature.icon}
                        </div>
                        <h3 className="text-base font-semibold text-[#171717] mb-2">{feature.title}</h3>
                        <p className="text-sm text-[#4D4D4D] leading-relaxed">{feature.description}</p>
                    </div>
                ))}
            </div>

            {/* Info Section */}
            <div className="rounded-xl border border-[#EBEBEB] bg-[#FFFFFF] p-8 lg:p-12 shadow-sm">
                <div className="flex flex-col lg:flex-row items-start gap-12">
                    <div className="flex-1 space-y-8">
                        <div className="space-y-3">
                            <Badge variant="outline" className="bg-[#FAFAFA] border-[#EBEBEB] text-[#4D4D4D] font-medium px-2.5 py-0.5 rounded-full text-[10px]">CORE LOGIC</Badge>
                            <h2 className="text-2xl font-semibold text-[#171717]">Forge Lifecycle</h2>
                        </div>

                        <div className="space-y-4">
                            {[
                                'Intelligent architectural decision mapping',
                                'High-fidelity JSON structural output',
                                'Real-time protocol visualization sandbox',
                                'Context-aware module explanations'
                            ].map((step, i) => (
                                <div key={i} className="flex items-center gap-4 group/item">
                                    <div className="w-8 h-8 rounded-full border border-[#EBEBEB] flex items-center justify-center text-[10px] font-semibold text-[#8F8F8F] group-hover/item:border-[#171717] group-hover/item:text-[#171717] transition-all shrink-0 bg-[#FAFAFA]">
                                        0{i + 1}
                                    </div>
                                    <p className="text-sm text-[#4D4D4D] group-hover/item:text-[#171717] transition-colors">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 w-full max-w-md aspect-[4/3] bg-[#FAFAFA] rounded-xl border border-[#EBEBEB] p-6 flex flex-col justify-between shadow-inner">
                        <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/10 border border-red-200" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/10 border border-yellow-200" />
                                <div className="w-3 h-3 rounded-full bg-green-500/10 border border-green-200" />
                            </div>
                            <span className="text-[9px] text-[#8F8F8F] font-mono">EST_TIME: 14s</span>
                        </div>

                        <div className="space-y-3 my-6">
                            <div className="h-2.5 bg-[#EBEBEB] rounded-full w-[85%]" />
                            <div className="h-2.5 bg-[#EBEBEB] rounded-full w-[65%]" />
                            <div className="h-28 bg-[#FFFFFF] rounded-lg w-full border border-[#EBEBEB] flex items-center justify-center">
                                <Box className="w-8 h-8 text-[#EBEBEB]" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-[#EBEBEB]">
                            <span className="text-[10px] text-[#8F8F8F] font-medium truncate max-w-[80%]">
                                Initializing Neural Core...
                            </span>
                            <div className="w-7 h-7 rounded-full bg-[#171717]/5 flex items-center justify-center">
                                <ChevronRight className="w-3.5 h-3.5 text-[#171717]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
