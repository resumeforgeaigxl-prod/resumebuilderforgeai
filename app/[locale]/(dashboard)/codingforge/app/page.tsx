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
        <div className="space-y-12 animate-fade-in">
            {/* Hero / Welcome */}
            <div className="relative p-12 lg:p-16 rounded-[3rem] bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/5 border border-white/5 overflow-hidden group shadow-2xl">
                {/* Visual accents */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-1000" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full group-hover:bg-purple-500/20 transition-all duration-1000" />

                <div className="relative flex flex-col lg:flex-row items-center justify-between gap-12">
                    <div className="max-w-2xl text-center lg:text-left">
                        <Badge variant="outline" className="px-4 py-1.5 rounded-full border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                            <Zap className="w-3.5 h-3.5 mr-2" />
                            Active Signal: Interactive Learning
                        </Badge>
                        <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-[1.05]">
                            Evolve Your <br />
                            <span className="text-gradient">Logic Protocol.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed font-medium">
                            Forge specialized interview skills through our multi-language IDE ecosystem and AI-powered architectural walkthroughs.
                        </p>
                        <div className="flex flex-wrap justify-center lg:justify-start gap-5">
                            <Button asChild size="lg" variant="premium" className="px-10 h-14 rounded-2xl shadow-xl shadow-indigo-500/20 group">
                                <Link href={`/${locale}/codingforge/questions`}>
                                    Initialize All Problems <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                                </Link>
                            </Button>
                            <Button variant="outline" size="lg" className="px-10 h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-black">
                                Career Roadmap
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5 w-full lg:w-auto">
                        {[
                            { label: 'Ecosystem Size', value: stats.total, icon: <BookOpen className="w-5 h-5 text-indigo-400" /> },
                            { label: 'Protocol Solved', value: stats.completed, icon: <Trophy className="w-5 h-5 text-amber-400" /> },
                        ].map((item, i) => (
                            <Card glass key={i} className="p-8 min-w-[160px] flex flex-col items-center text-center border-white/5 bg-white/[0.01]">
                                <div className="mb-5 p-3 rounded-xl bg-white/5">{item.icon}</div>
                                <div className="text-3xl font-black text-white tracking-tighter">{item.value}+</div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-2">{item.label}</div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sections */}
            <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3 italic">
                        <Filter className="w-6 h-6 text-indigo-500" />
                        Learning Tracks_
                    </h2>
                    <Badge variant="secondary" className="bg-white/5 text-slate-500 px-3 py-1 font-black">4 PRIMARY CHANNELS</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {SECTIONS.map((section) => (
                        <Link
                            key={section.id}
                            href={`/${locale}/codingforge/questions?type=${section.type}`}
                        >
                            <Card glass className="p-8 group hover:border-white/20 transition-all flex flex-col h-full bg-white/[0.01] hover:bg-white/[0.03]">
                                <div className={`mb-8 p-4 rounded-2xl bg-white/5 w-fit group-hover:scale-110 transition-transform duration-500 shadow-lg text-indigo-400`}>
                                    {section.icon}
                                </div>

                                <h3 className="text-xl font-black text-white mb-3 tracking-tighter uppercase italic">
                                    {section.title}
                                </h3>
                                <p className="text-sm text-slate-500 leading-relaxed mb-8 font-medium">
                                    {section.description}
                                </p>

                                <div className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 group-hover:gap-4 transition-all">
                                    Enter Channel <ChevronRight className="w-4 h-4" />
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Company Hub */}
            <section className="relative p-12 rounded-[3rem] bg-indigo-500/[0.02] border border-white/5 overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5">
                    <Building2 className="w-32 h-32" />
                </div>
                
                <div className="flex flex-col lg:flex-row items-center justify-between gap-10 mb-12">
                    <div>
                        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Organization Signal Hub</h2>
                        <p className="text-slate-500 font-medium">Focus your preparation on specific corporate logic patterns.</p>
                    </div>
                    <Button asChild variant="ghost" className="text-indigo-400 hover:text-indigo-300 font-black uppercase tracking-widest text-[10px]">
                        <Link href={`/${locale}/codingforge/questions`}>View All Targets</Link>
                    </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Google', 'Meta', 'Amazon', 'Microsoft', 'Netflix', 'Uber', 'Airbnb', 'NVIDIA'].map((company) => (
                        <Link
                            key={company}
                            href={`/${locale}/codingforge/questions?company=${company}`}
                        >
                            <Card glass className="p-6 border-white/5 hover:border-indigo-500/30 bg-white/[0.02] hover:bg-white/[0.05] transition-all flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-indigo-400 group-hover:scale-110 transition-all">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-black text-slate-300 group-hover:text-white uppercase tracking-widest">{company}</span>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
