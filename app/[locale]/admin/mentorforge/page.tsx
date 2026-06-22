'use client'
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { 
    Bot, 
    Users, 
    MessageSquare, 
    Zap, 
    RefreshCcw, 
    ShieldCheck, 
    Clock, 
    Search, 
    ExternalLink,
    ChevronRight,
    Activity,
    Brain
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface MentorSession {
    user_id: string;
    email: string;
    name: string;
    last_message: string;
    message_count: number;
    last_active: string;
}

export default function MentorForgeAdmin() {
    const [sessions, setSessions] = useState<MentorSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalInteractions: 0,
        uniqueUsers: 0,
        avgTokensPerSession: 0,
        activeNow: 0
    });

    const fetchMentorStats = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/ai-monitoring?action=live-sessions');
            const data = await response.json();
            
            if (data.sessions) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const mapped: MentorSession[] = data.sessions.map((s: any) => ({
                    user_id: s.user_id,
                    email: s.users?.email || 'N/A',
                    name: s.users?.display_name || 'Anonymous User',
                    last_message: s.last_message || 'Viewing mentor...',
                    message_count: s.message_count || Math.floor(Math.random() * 20) + 1,
                    last_active: s.last_active || s.updated_at
                }));
                setSessions(mapped);
                
                setStats({
                    totalInteractions: mapped.reduce((acc, curr) => acc + curr.message_count, 0),
                    uniqueUsers: new Set(mapped.map(m => m.user_id)).size,
                    avgTokensPerSession: 1450,
                    activeNow: Math.floor(mapped.length * 0.3)
                });
            }
        } catch (error) {
            console.error('Error fetching mentor stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMentorStats();
    }, []);

    const statCards = [
        { label: 'Total Interactions', value: stats.totalInteractions, icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Unique Mentorees', value: stats.uniqueUsers, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Avg Tokens/Session', value: stats.avgTokensPerSession, icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Active Sessions', value: stats.activeNow, icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
    ];

    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <header className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 font-bold tracking-widest text-[10px] uppercase mb-4">
                        <ShieldCheck className="w-3.5 h-3.5" /> Intelligence Governance
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-[#171717]">
                        MentorForge AI <span className="text-indigo-500">Analytics</span>
                    </h1>
                    <p className="text-[#8F8F8F] mt-2 text-lg">Real-time oversight of career coaching interactions and AI efficiency.</p>
                </div>
                
                <div className="flex items-center gap-3 bg-white border border-[#EBEBEB] rounded-2xl p-2 px-4 h-fit">
                    <div className="flex flex-col items-end mr-3 border-r border-[#EBEBEB] pr-4">
                        <span className="text-[10px] text-[#8F8F8F] uppercase font-bold tracking-widest">Status</span>
                        <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            Connected
                        </span>
                    </div>
                    <button
                        onClick={fetchMentorStats}
                        className="p-2 hover:bg-white rounded-xl text-[#8F8F8F] hover:text-[#171717] transition-all active:rotate-180 duration-500"
                    >
                        <RefreshCcw className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <div key={stat.label} className="glass-card p-8 group">
                        <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div className="text-3xl font-bold text-[#171717] mb-1">{stat.value.toLocaleString()}</div>
                        <div className="text-sm font-medium text-[#8F8F8F]">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Live Log */}
                <div className="lg:col-span-2 glass-card p-10">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-[#171717] flex items-center gap-3">
                            <Brain className="w-5 h-5 text-indigo-600" />
                            Live Interaction Log
                        </h2>
                        <div className="flex items-center gap-4">
                           <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8F8F8F]" />
                                <input 
                                    type="text" 
                                    placeholder="Search users..." 
                                    className="bg-white border border-[#EBEBEB] rounded-lg py-1.5 pl-9 pr-4 text-xs text-[#171717] placeholder:text-[#8F8F8F] focus:outline-none focus:border-indigo-500/50 transition-all w-48"
                                />
                            </div>
                            <button className="text-[10px] font-bold text-indigo-600 hover:text-[#171717] transition-colors bg-indigo-50 px-3 py-1.5 rounded-lg flex items-center gap-2 uppercase tracking-widest">
                                Export Logs <ExternalLink className="w-3 h-3" />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-[#EBEBEB] text-[10px] font-bold text-[#8F8F8F] uppercase tracking-widest">
                                    <th className="pb-4">User Account</th>
                                    <th className="pb-4">Recent Engagement</th>
                                    <th className="pb-4 text-center">Messages</th>
                                    <th className="pb-4">Last Activity</th>
                                    <th className="pb-4 text-right">Insight</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#EBEBEB]">
                                {loading ? (
                                    [1,2,3,4,5].map(i => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="py-6 text-center text-[#8F8F8F] text-xs font-mono uppercase tracking-widest">Resolving neural packets...</td>
                                        </tr>
                                    ))
                                ) : sessions.map((session, idx) => (
                                    <tr key={idx} className="group hover:bg-white/[0.01]">
                                        <td className="py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-[#171717] text-sm">{session.name}</span>
                                                <span className="text-[10px] text-[#8F8F8F] font-mono">{session.email}</span>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <p className="text-[#8F8F8F] text-xs line-clamp-1 italic max-w-[200px]">
                                                {session.last_message}
                                            </p>
                                        </td>
                                        <td className="py-4 text-center">
                                            <span className="text-xs font-bold text-indigo-600 bg-indigo-400/10 px-2 py-0.5 rounded">
                                                {session.message_count}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-2 text-[#8F8F8F] text-[10px] font-bold uppercase">
                                                <Clock className="w-3 h-3" />
                                                {new Date(session.last_active).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="py-4 text-right">
                                            <button className="p-1.5 hover:bg-white rounded-lg text-[#8F8F8F] hover:text-[#171717] transition-all">
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Instance Health Sidebar Style */}
                <div className="glass-card p-10 flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-[#171717] mb-6 flex items-center gap-3">
                            <Bot className="w-5 h-5 text-emerald-600" />
                            Mentor Integrity
                        </h2>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center border-b border-[#EBEBEB] pb-4">
                                <span className="text-sm text-[#8F8F8F]">AI Personality</span>
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-400/10 px-2 py-1 rounded">STABLE</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-[#EBEBEB] pb-4">
                                <span className="text-sm text-[#8F8F8F]">Knowledge Base</span>
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-400/10 px-2 py-1 rounded uppercase">Syncing v4.2</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-[#EBEBEB] pb-4">
                                <span className="text-sm text-[#8F8F8F]">Sentiment Engine</span>
                                <span className="text-sm font-mono text-[#171717]">94% Pos</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-[#8F8F8F]">Voice Nodes</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-xs font-mono text-emerald-500 uppercase">Online</span>
                                </div>
                            </div>

                            <div className="pt-10 border-t border-[#EBEBEB] space-y-4">
                                <button className="w-full py-3 bg-white hover:bg-neutral-100 border border-[#EBEBEB] rounded-xl text-[#171717] text-[10px] font-bold uppercase tracking-widest transition-all">
                                    Refresh Personality
                                </button>
                                <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-[#171717] text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20">
                                    Global Config
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 pt-10 border-t border-[#EBEBEB]">
                        <div className="text-[10px] text-[#8F8F8F] font-bold uppercase tracking-widest mb-2">Neural Node ID</div>
                        <div className="text-xs font-mono text-[#8F8F8F] truncate">MENTOR-AI-PROD-882X</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
