"use client";

import React, { useState, useEffect } from 'react';
import {
    Code2,
    Database,
    Bug,
    Brain,
    Building2,
    ChevronRight,
    Trophy,
    BookOpen,
    Filter,
    Zap
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const SECTIONS = [
    {
        id: 'languages',
        title: 'Programming Languages',
        description: 'Master core concepts in Java, Python, C++, and more with detailed solutions.',
        icon: <Code2 className="w-6 h-6 text-blue-400" />,
        color: 'blue',
        type: 'Programming'
    },
    {
        id: 'sql',
        title: 'SQL Interview Prep',
        description: 'Solve complex database queries and optimize performance for top tech roles.',
        icon: <Database className="w-6 h-6 text-purple-400" />,
        color: 'purple',
        type: 'SQL'
    },
    {
        id: 'debugging',
        title: 'Debugging Challenges',
        description: 'Find and fix bottlenecks in existing code. Enhance your code review skills.',
        icon: <Bug className="w-6 h-6 text-red-400" />,
        color: 'red',
        type: 'Debugging'
    },
    {
        id: 'logic',
        title: 'Logic Completion',
        description: 'Complete the missing logic in algorithms. Focus on edge cases and patterns.',
        icon: <Brain className="w-6 h-6 text-green-400" />,
        color: 'green',
        type: 'Logic'
    }
];

export default function CodingForgeDashboard() {
    const params = useParams() as { region: string; lang: string };
    const { region, lang } = params;

    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        currentStreak: 3
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/codingforge/questions');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setStats(prev => ({ ...prev, total: data.length }));
                }
            } catch (err) {
                console.error('Error fetching dashboard stats:', err);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="min-h-screen bg-[#070710] text-slate-200">
            {/* Header is handled by (dashboard) layout, but if it needs specific one we can add it */}
            {/* Based on existing code, it adds Header manually? Wait, (dashboard) layout might already have it. */}
            {/* The old code had a Header, but let's check (dashboard)/layout.tsx */}

            <main className="max-w-7xl mx-auto px-4 py-12">
                {/* Hero / Welcome */}
                <div className="relative mb-16 p-10 rounded-[40px] bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/10 border border-white/5 overflow-hidden group">
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full group-hover:bg-blue-500/20 transition-all duration-1000"></div>

                    <div className="relative flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
                                <Zap className="w-3.5 h-3.5" />
                                Interactive Learning System
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
                                Master the <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Coding Interview</span>
                            </h1>
                            <p className="text-xl text-slate-400 mb-8 leading-relaxed">
                                Explore multi-language solutions, AI-powered code walkthroughs, and specialized interview tracks designed by top tech engineers.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link
                                    href={`/${region}/${lang}/codingforge/questions`}
                                    className="px-8 py-4 rounded-2xl bg-white text-black font-extrabold hover:bg-slate-200 transition-all shadow-xl shadow-white/5"
                                >
                                    Browse All Problems
                                </Link>
                                <button className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-extrabold hover:bg-white/10 transition-all">
                                    Roadmap to SDE-1
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Library Size', value: stats.total, icon: <BookOpen className="w-4 h-4 text-blue-400" /> },
                                { label: 'Solved', value: stats.completed, icon: <Trophy className="w-4 h-4 text-yellow-400" /> },
                            ].map((item, i) => (
                                <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl min-w-[140px]">
                                    <div className="mb-4">{item.icon}</div>
                                    <div className="text-2xl font-black text-white">{item.value}+</div>
                                    <div className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">{item.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Categories */}
                <h2 className="text-2xl font-black text-white mb-8 px-2 flex items-center gap-3">
                    <Filter className="w-6 h-6 text-slate-500" />
                    Learning Paths
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {SECTIONS.map((section) => (
                        <Link
                            key={section.id}
                            href={`/${region}/${lang}/codingforge/questions?type=${section.type}`}
                            className="group p-8 rounded-[32px] bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all duration-300 relative overflow-hidden"
                        >
                            <div className={`absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity`}>
                                <ChevronRight className="w-5 h-5" />
                            </div>

                            <div className="mb-6 p-4 rounded-2xl bg-white/5 w-fit group-hover:scale-110 transition-transform duration-500">
                                {section.icon}
                            </div>

                            <h3 className="text-xl font-extrabold text-white mb-3 tracking-tight">
                                {section.title}
                            </h3>
                            <p className="text-sm text-slate-400 leading-relaxed mb-6">
                                {section.description}
                            </p>

                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400 group-hover:gap-3 transition-all">
                                Explore {section.title}
                                <ChevronRight className="w-3.5 h-3.5" />
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Company Tracks */}
                <div className="p-10 rounded-[40px] bg-white/5 border border-white/10 overflow-hidden">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-2xl font-black text-white mb-2">Company Tagged Questions</h2>
                            <p className="text-slate-400">Target your preparation for top-tier tech companies.</p>
                        </div>
                        <Link href={`/${region}/${lang}/codingforge/questions`} className="text-blue-400 font-bold hover:underline">View All</Link>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        {['Google', 'Meta', 'Amazon', 'Microsoft', 'Netflix', 'Uber', 'Airbnb', 'NVIDIA'].map((company) => (
                            <Link
                                key={company}
                                href={`/${region}/${lang}/codingforge/questions?company=${company}`}
                                className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all flex items-center gap-3 font-bold group"
                            >
                                <Building2 className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
                                {company}
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
