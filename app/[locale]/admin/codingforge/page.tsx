'use client'
export const dynamic = 'force-dynamic';
;

import React, { useState, useEffect } from 'react';
import {
    BrainCircuit,
    Sparkles,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Database,
    Zap,
    Plus,
    RefreshCcw,
    Code2,
    Bug,
    Layout
} from 'lucide-react';

interface QuestionStatsItem {
    type?: string;
}

export default function CodingForgeAdmin() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<{ success: boolean, message: string } | null>(null);
    const [count, setCount] = useState(5);
    const [stats, setStats] = useState({ total: 0, programming: 0, sql: 0, logic: 0, debugging: 0 });
    const [loadingStats, setLoadingStats] = useState(true);

    const fetchStats = async () => {
        setLoadingStats(true);
        try {
            // Using existing question detail API or similar? Actually I'll just check total count from library if available
            // For now, let's assume we have a simple stats endpoint or just fetch count.
            const res = await fetch(`/api/codingforge/questions?t=${Date.now()}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                const qs = data as QuestionStatsItem[];
                setStats({
                    total: qs.length,
                    programming: qs.filter((q) => q.type === 'Programming').length,
                    sql: qs.filter((q) => q.type === 'SQL').length,
                    logic: qs.filter((q) => q.type === 'Logic').length,
                    debugging: qs.filter((q) => q.type === 'Debugging').length,
                });
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setResult(null);
        try {
            const res = await fetch('/api/admin/codingforge/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count })
            });
            const data = await res.json();
            setResult({
                success: data.success,
                message: data.message || data.error || 'Generation complete.'
            });
            if (data.success) {
                fetchStats();
            }
        } catch {
            setResult({ success: false, message: 'Failed to trigger generator.' });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <BrainCircuit className="w-8 h-8 text-indigo-500" />
                        CodingForge <span className="text-indigo-500">AI Management</span>
                    </h1>
                    <p className="text-slate-400 mt-1 font-medium">Control the AI generator and monitor question library health.</p>
                </div>

                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 px-4">
                    <div className="flex flex-col items-end mr-3 border-r border-white/10 pr-4">
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Status</span>
                        <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            Connected
                        </span>
                    </div>
                    <button
                        onClick={fetchStats}
                        className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all active:rotate-180 duration-500"
                    >
                        <RefreshCcw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex flex-col justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Total Library</span>
                    <div className="text-3xl font-black text-white">{loadingStats ? '...' : stats.total}</div>
                </div>
                <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl flex flex-col justify-between group hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <Code2 className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Programming</span>
                    </div>
                    <div className="text-3xl font-black text-white">{loadingStats ? '...' : stats.programming}</div>
                </div>
                <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl flex flex-col justify-between group hover:border-blue-500/30 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <Database className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">SQL Queries</span>
                    </div>
                    <div className="text-3xl font-black text-white">{loadingStats ? '...' : stats.sql}</div>
                </div>
                <div className="p-6 bg-purple-500/5 border border-purple-500/10 rounded-3xl flex flex-col justify-between group hover:border-purple-500/30 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <Zap className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Logic / Image</span>
                    </div>
                    <div className="text-3xl font-black text-white">{loadingStats ? '...' : stats.logic}</div>
                </div>
                <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-3xl flex flex-col justify-between group hover:border-rose-500/30 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <Bug className="w-4 h-4 text-rose-400" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Debugging</span>
                    </div>
                    <div className="text-3xl font-black text-white">{loadingStats ? '...' : stats.debugging}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Generation Control */}
                <div className="p-8 bg-gradient-to-br from-[#0a0a1a] to-[#070710] border border-white/5 rounded-[40px] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
                        <Sparkles className="w-24 h-24 text-white" />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-indigo-400 fill-indigo-400/20" />
                        Run AI Content Generator
                    </h3>

                    <div className="space-y-6 relative z-10">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Questions per Run</label>
                            <div className="flex gap-2">
                                {[5, 10, 15, 20].map((n) => (
                                    <button
                                        key={n}
                                        onClick={() => setCount(n)}
                                        className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all border ${count === n ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30' : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10'}`}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="w-full py-5 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl text-white font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100 disabled:hover:scale-100 disabled:cursor-not-allowed group"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    AI is Thinking...
                                </>
                            ) : (
                                <>
                                    <Layout className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                    Generate & Update Library
                                </>
                            )}
                        </button>
                    </div>

                    {result && (
                        <div className={`mt-8 p-5 rounded-3xl animate-in fade-in slide-in-from-top-4 duration-500 border ${result.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                            <div className="flex items-center gap-3">
                                {result.success ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                <p className="text-sm font-bold">{result.message}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Generator Info */}
                <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] flex flex-col justify-center">
                    <h3 className="text-xl font-bold text-white mb-6">Generation Quality</h3>
                    <ul className="space-y-4">
                        {[
                            { label: 'Multi-Category Support', desc: 'Generates Programming, SQL, Debugging, and Logic challenges.', icon: Plus },
                            { label: 'Smart Visuals (SVG)', desc: 'Creates custom illustrations for logic patterns and data structures.', icon: Layout },
                            { label: 'Company-Specific Context', desc: 'Adds real interview tags like Google, Meta, and Amazon.', icon: Sparkles },
                            { label: 'Language diversity', desc: 'Each question includes solutions in 9+ languages.', icon: Zap },
                        ].map((item, i) => (
                            <li key={i} className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                                    <item.icon className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm leading-none mb-1">{item.label}</h4>
                                    <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
