"use client";

import React, { useState, useEffect } from 'react';
import {
    Cpu,
    Sparkles,
    ArrowRight,
    Layers,
    Code,
    Zap,
    Info,
    Terminal,
    Workflow,
    ChevronRight,
    History,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProjectForgeLanding() {
    const params = useParams() as { region: string; lang: string };
    const { region, lang } = params;
    const router = useRouter();

    const [projectIdea, setProjectIdea] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [credits, setCredits] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCredits = async () => {
            try {
                // We'll create a small endpoint to get credits
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

            if (!res.ok) {
                throw new Error(data.error || 'Failed to generate project');
            }

            // Redirect to the project view
            router.push(`/${region}/${lang}/projectforge/${data.projectId}`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#070710] text-slate-200 selection:bg-blue-500/30">
            <main className="max-w-7xl mx-auto px-4 py-20">
                {/* Hero Section */}
                <div className="relative mb-24 text-center">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/10 blur-[120px] rounded-full -z-10"></div>

                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-10 animate-fade-in">
                        <Cpu className="w-4 h-4" />
                        Next-Gen Project Architect
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-none animate-slide-up">
                        Forge Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Vision</span> Into <span className="text-blue-500">Reality</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-xl text-slate-400 leading-relaxed mb-12 animate-slide-up animation-delay-200">
                        Describe your innovative idea and let ProjectForge generate a high-performance starter project, including full architecture, UI components, and complete documentation.
                    </p>

                    {/* Input Area */}
                    <div className="max-w-3xl mx-auto relative group animate-slide-up animation-delay-400">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[32px] blur opacity-25 group-hover:opacity-60 transition duration-1000 group-focus-within:opacity-100"></div>
                        <div className="relative bg-[#0d0d1a] border border-white/10 rounded-[30px] p-2 flex flex-col md:flex-row items-center gap-2">
                            <input
                                type="text"
                                placeholder='e.g., "Build a high-performance E-commerce platform with React, Node.js and Tailwind"'
                                className="flex-1 bg-transparent border-0 focus:ring-0 px-8 py-5 text-white text-lg font-medium placeholder:text-slate-600 outline-none"
                                value={projectIdea}
                                onChange={(e) => setProjectIdea(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                                disabled={isGenerating}
                            />
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !projectIdea.trim()}
                                className="w-full md:w-auto px-10 py-5 rounded-[22px] bg-blue-600 hover:bg-blue-500 text-white font-black text-base transition-all flex items-center justify-center gap-3 overflow-hidden group/btn disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Forging...
                                    </>
                                ) : (
                                    <>
                                        Forge Now
                                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>

                        {error && (
                            <div className="mt-6 flex items-center gap-3 justify-center text-red-400 font-bold text-sm animate-shake">
                                <AlertCircle className="w-5 h-5" />
                                {error}
                            </div>
                        )}

                        <div className="mt-8 flex flex-wrap justify-center gap-8">
                            {[
                                { label: 'Daily Credits', value: `${credits !== null ? credits : '...'} Remaining`, icon: <Zap className="w-4 h-4 text-yellow-400" /> },
                                { label: 'Speed', value: '30s Avg', icon: <Workflow className="w-4 h-4 text-blue-400" /> },
                                { label: 'Model', value: 'Gemini Flash', icon: <Sparkles className="w-4 h-4 text-purple-400" /> }
                            ].map((stat, i) => (
                                <div key={i} className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-default group">
                                    <div className="group-hover:scale-110 transition-transform">{stat.icon}</div>
                                    <div className="flex flex-col items-start leading-none">
                                        <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">{stat.label}</span>
                                        <span className="text-sm font-bold text-white tracking-wide">{stat.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                    {[
                        {
                            title: 'Complete Architecture',
                            description: 'Generate comprehensive folder structures with frontend, backend, and DB schemas.',
                            icon: <Layers className="w-6 h-6 text-blue-400" />,
                            gradient: 'from-blue-500/20 to-transparent'
                        },
                        {
                            title: 'Premium Starter Code',
                            description: 'Clean, modular, and beginner-friendly code implementation following best practices.',
                            icon: <Code className="w-6 h-6 text-purple-400" />,
                            gradient: 'from-purple-500/20 to-transparent'
                        },
                        {
                            title: 'Interactive Preview',
                            description: 'Visualize your UIs instantly with a built-in static HTML/CSS sandbox.',
                            icon: <Terminal className="w-6 h-6 text-green-400" />,
                            gradient: 'from-green-500/20 to-transparent'
                        }
                    ].map((feature, i) => (
                        <div key={i} className="relative group p-10 rounded-[40px] bg-white/5 border border-white/10 hover:border-white/20 transition-all overflow-hidden">
                            <div className={`absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-radial ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity blur-2xl`}></div>
                            <div className="mb-8 p-5 rounded-2xl bg-white/5 w-fit group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{feature.title}</h3>
                            <p className="text-slate-400 leading-relaxed text-lg">{feature.description}</p>
                        </div>
                    ))}
                </div>

                {/* Info Section */}
                <div className="p-12 rounded-[50px] bg-gradient-to-br from-white/5 to-transparent border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[100px] rounded-full"></div>
                    <div className="flex flex-col md:flex-row items-center gap-16 relative">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 rounded-2xl bg-blue-500/20">
                                    <Info className="w-6 h-6 text-blue-400" />
                                </div>
                                <h2 className="text-3xl font-black text-white tracking-tight">AI Forging Engine</h2>
                            </div>
                            <div className="space-y-6">
                                {[
                                    'Architectural Decisions based on prompt complexity',
                                    'Structured JSON Output for easy file navigation',
                                    'Safe sandboxed HTML visualizer for instant feedback',
                                    'Beginner-friendly explanations for every module'
                                ].map((step, i) => (
                                    <div key={i} className="flex items-start gap-4 group">
                                        <div className="mt-1.5 w-5 h-5 rounded-full border-2 border-blue-500/30 flex items-center justify-center text-[10px] font-black text-blue-400 group-hover:border-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                            {i + 1}
                                        </div>
                                        <p className="text-slate-300 font-medium group-hover:text-white transition-colors">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 w-full max-w-lg aspect-square bg-[#0d0d1a] rounded-[40px] border border-white/10 p-8 flex flex-col justify-between group overflow-hidden">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                </div>
                                <div className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-black tracking-widest text-slate-500 flex items-center gap-2">
                                    <History className="w-3 h-3" />
                                    v1.0.0
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-4 bg-white/5 rounded-full w-[80%] animate-pulse"></div>
                                <div className="h-4 bg-white/5 rounded-full w-[60%] animate-pulse animation-delay-200"></div>
                                <div className="h-32 bg-white/5 rounded-[20px] w-full animate-pulse animation-delay-300"></div>
                            </div>
                            <div className="mt-auto pt-8 flex items-center justify-between">
                                <div className="text-xs font-bold text-slate-500 line-clamp-1 italic max-w-[70%]">"Build a fintech dashboard with transaction history..."</div>
                                <ChevronRight className="w-5 h-5 text-blue-500 animate-bounce-x" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// Custom Animations via CSS (Added to tailwind config or a style tag)
const styles = `
@keyframes bounce-x {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(5px); }
}
.animate-bounce-x { animation: bounce-x 2s infinite; }
`;
