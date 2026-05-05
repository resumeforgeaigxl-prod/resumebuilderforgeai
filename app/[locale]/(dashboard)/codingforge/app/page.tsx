"use client"
export const dynamic = 'force-dynamic';
;

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
    Zap,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const SECTIONS = [
    {
        id: 'languages',
        title: 'Core Architecture',
        description: 'Master low-level and high-level programming paradigms with industrial solutions.',
        icon: <Code2 className="w-6 h-6" />,
        color: 'indigo',
        type: 'Programming'
    },
    {
        id: 'sql',
        title: 'Data Ecosystems',
        description: 'Complex query optimization and database design for hyper-scale systems.',
        icon: <Database className="w-6 h-6" />,
        color: 'blue',
        type: 'SQL'
    },
    {
        id: 'debugging',
        title: 'Signal Debugging',
        description: 'Advanced troubleshooting protocols for distributed systems and core logic.',
        icon: <Bug className="w-6 h-6" />,
        color: 'pink',
        type: 'Debugging'
    },
    {
        id: 'logic',
        title: 'Neural Logic',
        description: 'Algorithmic completion focusing on extreme edge cases and time complexity.',
        icon: <Brain className="w-6 h-6" />,
        color: 'emerald',
        type: 'Logic'
    }
];

export default function CodingForgeDashboard() {
    const params = useParams() as { locale: string };
    const locale = params.locale || 'en-IN';

    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        currentStreak: 3
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`/api/codingforge/questions?t=${Date.now()}`);
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
        <div className="space-y-12 max-w-5xl mx-auto pb-24">
            {/* Standardized Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1E2A42] pb-8 mb-12">
                <div>
                    <div className="flex items-center gap-2 text-[#00D4A0] font-bold tracking-widest text-[10px] uppercase mb-4">
                        <Code2 className="w-3.5 h-3.5" /> Intelligence Core
                    </div>
                    <h1 className="text-4xl font-bold tracking-tighter text-white uppercase">CodingForge</h1>
                    <p className="text-slate-400 mt-2 text-lg">Master algorithms and system patterns through our multi-language IDE ecosystem.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                        <BookOpen className="w-5 h-5 text-[#00D4A0]" />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Repository</p>
                            <p className="text-xs font-bold text-white uppercase tracking-tight">{stats.total}+ Problems</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                        <Trophy className="w-5 h-5 text-[#F5A623]" />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Performance</p>
                            <p className="text-xs font-bold text-white uppercase tracking-tight">{stats.completed} Solved</p>
                        </div>
                    </div>
                </div>
            </header>


            {/* Sections */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#1E2A42] pb-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Filter className="w-5 h-5 text-[#7C5CFC]" />
                        Learning Tracks
                    </h2>
                    <Badge variant="secondary" className="bg-[#0D1220] text-[#4A5568] px-3 py-1 font-semibold text-[10px]">4 CHANNELS</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {SECTIONS.map((section) => (
                        <Link
                            key={section.id}
                            href={`/${locale}/codingforge/questions?type=${section.type}`}
                        >
                            <div className="p-6 rounded-xl border border-[#1E2A42] bg-[#0D1220]/60 hover:border-[#00D4A0]/20 transition-all group h-full flex flex-col">
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
                                    Enter Channel <ChevronRight className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Company Hub */}
            <section className="p-8 rounded-2xl bg-[#0D1220]/60 border border-[#1E2A42]">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Building2 className="w-20 h-20" />
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-1">Company Preparation Hub</h2>
                        <p className="text-sm text-[#7A8BA8]">Focus your preparation on specific corporate patterns.</p>
                    </div>
                    <Button asChild variant="ghost" className="text-[#00D4A0] hover:text-[#00D4A0]/80 font-bold text-xs">
                        <Link href={`/${locale}/codingforge/questions`}>View All</Link>
                    </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['Google', 'Meta', 'Amazon', 'Microsoft', 'Netflix', 'Uber', 'Airbnb', 'NVIDIA'].map((company) => (
                        <Link
                            key={company}
                            href={`/${locale}/codingforge/questions?company=${company}`}
                        >
                            <div className="p-4 rounded-xl border border-[#1E2A42] bg-[#080B16] hover:border-[#00D4A0]/20 transition-all flex items-center gap-3 group">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#4A5568] group-hover:text-[#00D4A0] transition-colors">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold text-[#7A8BA8] group-hover:text-white transition-colors">{company}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
