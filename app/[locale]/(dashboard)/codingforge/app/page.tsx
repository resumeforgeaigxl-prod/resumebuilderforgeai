"use client"
export const dynamic = 'force-dynamic';

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
    Filter
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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
        <div className="space-y-12 max-w-5xl mx-auto pb-24 text-[#171717]">
            {/* Standardized Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#EBEBEB] pb-8 mb-12">
                <div>
                    <div className="flex items-center gap-2 text-[#8F8F8F] font-medium tracking-normal text-xs uppercase mb-3 font-mono">
                        <Code2 className="w-3.5 h-3.5" /> Intelligence Core
                    </div>
                    <h1 className="text-3xl md:text-4xl font-semibold tracking-tighter text-[#171717]">CodingForge</h1>
                    <p className="text-[#4D4D4D] mt-2 text-base">Master algorithms and system patterns through our multi-language IDE ecosystem.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-[#FFFFFF] border border-[#EBEBEB] shadow-sm">
                        <BookOpen className="w-5 h-5 text-[#171717]" />
                        <div>
                            <p className="text-[10px] font-mono uppercase tracking-wider text-[#8F8F8F]">Repository</p>
                            <p className="text-sm font-semibold text-[#171717]">{stats.total}+ Problems</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-[#FFFFFF] border border-[#EBEBEB] shadow-sm">
                        <Trophy className="w-5 h-5 text-[#B76E00]" />
                        <div>
                            <p className="text-[10px] font-mono uppercase tracking-wider text-[#8F8F8F]">Performance</p>
                            <p className="text-sm font-semibold text-[#171717]">{stats.completed} Solved</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Sections */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-4">
                    <h2 className="text-lg font-semibold text-[#171717] flex items-center gap-2">
                        <Filter className="w-5 h-5 text-[#8F8F8F]" />
                        Learning Tracks
                    </h2>
                    <Badge variant="outline" className="bg-[#FFFFFF] border-[#EBEBEB] text-[#4D4D4D] px-2.5 py-0.5 rounded-full text-xs font-medium">4 CHANNELS</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {SECTIONS.map((section) => (
                        <Link
                            key={section.id}
                            href={`/${locale}/codingforge/questions?type=${section.type}`}
                        >
                            <div className="p-6 rounded-xl border border-[#EBEBEB] bg-[#FFFFFF] hover:border-[#171717] hover:shadow-[0_2px_4px_rgba(0,0,0,0.02),0_8px_16px_rgba(0,0,0,0.04)] transition-all group h-full flex flex-col">
                                <div className="mb-4 p-3 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] w-fit text-[#171717] group-hover:scale-105 transition-transform">
                                    {section.icon}
                                </div>
                                <h3 className="text-base font-semibold text-[#171717] mb-2">
                                    {section.title}
                                </h3>
                                <p className="text-sm text-[#4D4D4D] leading-relaxed mb-6">
                                    {section.description}
                                </p>
                                <div className="mt-auto flex items-center gap-2 text-xs font-medium text-[#171717] group-hover:gap-3 transition-all">
                                    Enter Channel <ChevronRight className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Company Hub */}
            <section className="relative p-8 rounded-xl bg-[#FFFFFF] border border-[#EBEBEB] overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                    <Building2 className="w-20 h-20 text-[#171717]" />
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-xl font-semibold text-[#171717] mb-1">Company Preparation Hub</h2>
                        <p className="text-sm text-[#4D4D4D]">Focus your preparation on specific corporate patterns.</p>
                    </div>
                    <Button asChild variant="ghost" className="text-[#0070F3] hover:bg-[#EFF6FF] font-medium text-xs">
                        <Link href={`/${locale}/codingforge/questions`}>View All</Link>
                    </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['Google', 'Meta', 'Amazon', 'Microsoft', 'Netflix', 'Uber', 'Airbnb', 'NVIDIA'].map((company) => (
                        <Link
                            key={company}
                            href={`/${locale}/codingforge/questions?company=${company}`}
                        >
                            <div className="p-4 rounded-lg border border-[#EBEBEB] bg-[#FAFAFA] hover:bg-[#FFFFFF] hover:border-[#171717] transition-all flex items-center gap-3 group shadow-sm">
                                <div className="w-8 h-8 rounded-md bg-[#FFFFFF] border border-[#EBEBEB] flex items-center justify-center text-[#8F8F8F] group-hover:text-[#171717] transition-colors">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-semibold text-[#4D4D4D] group-hover:text-[#171717] transition-colors">{company}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
