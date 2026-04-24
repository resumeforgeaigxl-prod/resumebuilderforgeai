"use client"
export const dynamic = 'force-dynamic';
;

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
        <div className="space-y-24 animate-fade-in py-12">
            {/* Hero Section */}
            <div className="relative text-center max-w-5xl mx-auto">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/10 blur-[120px] rounded-full -z-10 animate-pulse" />

                <Badge variant="outline" className="px-5 py-2 rounded-full border-blue-500/20 bg-blue-500/5 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-10">
                    <Cpu className="w-4 h-4 mr-2" />
                    Neural Architect v2.0
                </Badge>

                <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9] italic">
                    CONSTRUCT YOUR <br />
                    <span className="text-gradient">CONCEPTUAL CORE.</span>
                </h1>

                <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-400 leading-relaxed mb-16 font-medium">
                    Transmit your vision and let the Forge materialize a high-performance system architecture, complete with modular UI and protocol documentation.
                </p>

                {/* Input Area */}
                <div className="max-w-4xl mx-auto relative group">
                    <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3rem] blur opacity-10 group-hover:opacity-30 transition duration-1000 group-focus-within:opacity-40" />
                    
                    <Card glass className="p-3 relative bg-[#0c0c1b]/80 backdrop-blur-3xl border-white/5 rounded-[2.8rem] flex flex-col md:flex-row items-center gap-3">
                        <div className="flex-1 w-full flex items-center px-6">
                            <Box className="w-6 h-6 text-slate-600 mr-4" />
                            <input
                                type="text"
                                placeholder='Describe your system (e.g., "Scaleable Fintech API with Rust")'
                                className="w-full bg-transparent border-0 focus:ring-0 py-6 text-white text-xl font-black placeholder:text-slate-700 outline-none uppercase italic tracking-tight"
                                value={projectIdea}
                                onChange={(e) => setProjectIdea(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                                disabled={isGenerating}
                            />
                        </div>
                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating || !projectIdea.trim()}
                            variant="premium"
                            className="w-full md:w-64 h-20 rounded-[2.2rem] text-lg font-black uppercase tracking-widest group/btn overflow-hidden"
                        >
                            {isGenerating ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <div className="flex items-center gap-3">
                                    CONSTRUCT <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" />
                                </div>
                            )}
                        </Button>
                    </Card>

                    {error && (
                        <div className="mt-8 flex items-center gap-2 justify-center text-red-400 font-black uppercase tracking-widest text-[10px] animate-fade-in">
                            <AlertCircle className="w-4 h-4" />
                            SYTEM ERROR: {error}
                        </div>
                    )}

                    <div className="mt-12 flex flex-wrap justify-center gap-6">
                        {[
                            { label: 'Signal Balance', value: `${credits !== null ? credits : '0'} Protocol Units`, icon: <Zap className="w-4 h-4 text-amber-400" /> },
                            { label: 'Process Speed', value: '30ms Cycle', icon: <Workflow className="w-4 h-4 text-blue-400" /> },
                            { label: 'Oracle Model', value: 'Gemini Prime', icon: <Sparkles className="w-4 h-4 text-purple-400" /> }
                        ].map((stat, i) => (
                            <Card glass key={i} className="flex items-center gap-4 px-6 py-4 border-white/5">
                                <div className="p-2.5 rounded-xl bg-white/5">{stat.icon}</div>
                                <div className="text-left">
                                    <div className="text-[9px] uppercase font-black text-slate-500 tracking-[0.2em] mb-0.5">{stat.label}</div>
                                    <div className="text-xs font-black text-white italic">{stat.value}</div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {[
                    {
                        title: 'Macro Architecture',
                        description: 'Generates end-to-end structural maps with integrated DB schema logic.',
                        icon: <Layers className="w-8 h-8 text-blue-400" />,
                    },
                    {
                        title: 'Pure Implementation',
                        description: 'Clean, modular code patterns synchronized with industry performance metrics.',
                        icon: <Code className="w-8 h-8 text-indigo-400" />,
                    },
                    {
                        title: 'Interactive Sandbox',
                        description: 'Immediate visual feedback through our real-time structural rendering engine.',
                        icon: <Terminal className="w-8 h-8 text-emerald-400" />,
                    }
                ].map((feature, i) => (
                    <Card glass key={i} className="p-12 group hover:border-white/20 transition-all text-left bg-white/[0.01]">
                        <div className="mb-10 p-5 rounded-3xl bg-white/5 w-fit group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-2xl">
                            {feature.icon}
                        </div>
                        <h3 className="text-2xl font-black text-white mb-4 tracking-tighter uppercase italic">{feature.title}</h3>
                        <p className="text-slate-500 leading-relaxed font-medium">{feature.description}</p>
                    </Card>
                ))}
            </div>

            {/* Info Section */}
            <div className="max-w-7xl mx-auto">
                <Card glass className="p-12 lg:p-20 rounded-[4rem] border-white/5 bg-gradient-to-br from-indigo-500/[0.03] to-transparent relative overflow-hidden group">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full group-hover:bg-blue-500/10 transition-all duration-1000" />
                    
                    <div className="flex flex-col lg:flex-row items-center gap-20 relative">
                        <div className="flex-1 space-y-12">
                            <div className="space-y-4">
                                <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-400 font-black px-4 py-1.5 rounded-full">CORE LOGIC</Badge>
                                <h2 className="text-4xl font-black text-white tracking-tight italic uppercase">Forge Lifecycle_</h2>
                            </div>
                            
                            <div className="space-y-8">
                                {[
                                    'Intelligent architectural decision mapping',
                                    'High-fidelity JSON structural output',
                                    'Real-time protocol visualization sandbox',
                                    'Context-aware module explanations'
                                ].map((step, i) => (
                                    <div key={i} className="flex items-center gap-6 group/item">
                                        <div className="w-10 h-10 rounded-full border-2 border-white/5 flex items-center justify-center text-xs font-black text-slate-600 group-hover/item:border-indigo-500 group-hover/item:text-indigo-400 transition-all italic">
                                            0{i + 1}
                                        </div>
                                        <p className="text-lg text-slate-400 font-black uppercase tracking-tight group-hover/item:text-white transition-colors">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 w-full max-w-xl aspect-[4/3] bg-black/40 rounded-[3rem] border border-white/5 p-10 flex flex-col justify-between group/preview shadow-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex gap-2.5">
                                    <div className="w-3.5 h-3.5 rounded-full bg-red-500/20 group-hover/preview:bg-red-500/50 transition-colors" />
                                    <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/20 group-hover/preview:bg-yellow-500/50 transition-colors" />
                                    <div className="w-3.5 h-3.5 rounded-full bg-green-500/20 group-hover/preview:bg-green-500/50 transition-colors" />
                                </div>
                                <Badge variant="outline" className="text-[9px] border-white/5 text-slate-500 uppercase font-black tracking-widest">
                                    EST_TIME: 14s
                                </Badge>
                            </div>
                            
                            <div className="space-y-5">
                                <div className="h-3 bg-white/5 rounded-full w-[85%] animate-pulse" />
                                <div className="h-3 bg-white/5 rounded-full w-[65%] animate-pulse delay-100" />
                                <div className="h-40 bg-white/[0.02] rounded-[2rem] w-full border border-white/5 animate-pulse delay-200 flex items-center justify-center">
                                    <Box className="w-12 h-12 text-slate-800" />
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-8 border-t border-white/5">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic truncate max-w-[80%]">
                                    Initializing Neural Core...
                                </div>
                                <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                                    <ChevronRight className="w-4 h-4 text-indigo-400 animate-bounce-x" />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
