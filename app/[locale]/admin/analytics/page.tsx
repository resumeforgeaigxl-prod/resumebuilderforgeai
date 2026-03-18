"use client";

import { useState, useEffect } from 'react';
import { 
    Users, 
    Activity, 
    Zap, 
    TrendingUp, 
    BarChart3, 
    PieChart, 
    Globe, 
    Smartphone, 
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function AnalyticsDashboard() {
    const [stats, setStats] = useState({
        total_users: 0,
        active_users_today: 0,
        ai_requests_today: 0,
        most_used_feature: 'ResumeForge',
        top_pages: [
            { path: '/dashboard', visits: 1205 },
            { path: '/explainforge', visits: 842 },
            { path: '/resume-builder', visits: 654 }
        ]
    });

    useEffect(() => {
        // Fetch real analytics data
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/analytics');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data.stats);
                }
            } catch (err) {
                console.error("Analytics fetch failed", err);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        { title: 'Total Users', value: stats.total_users, trend: '+12%', icon: Users, color: 'emerald' },
        { title: 'Active Today', value: stats.active_users_today, trend: '+5%', icon: Activity, color: 'blue' },
        { title: 'AI Requests Today', value: stats.ai_requests_today, trend: '+42%', icon: Zap, color: 'purple' },
        { title: 'Conversion Rate', value: '8.4%', trend: '-2%', icon: TrendingUp, color: 'amber' }
    ];

    return (
        <div className="p-8 space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">User Intelligence Dashboard</h1>
                    <p className="text-slate-500 font-medium">Real-time behavior tracking and system performance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="glass" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10">
                        <Calendar className="w-4 h-4 mr-2" />
                        Last 7 Days
                    </Button>
                    <Button size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg">
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
                    <Card key={i} glass className="p-6 border-white/5 relative overflow-hidden group hover:scale-[1.02] transition-all">
                        <div className={`absolute -right-6 -top-6 w-24 h-24 bg-${stat.color}-500/10 rounded-full blur-2xl group-hover:bg-${stat.color}-500/20 transition-all`} />
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl bg-${stat.color}-500/10 border border-${stat.color}-500/20`}>
                                <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {stat.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {stat.trend}
                            </div>
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{stat.title}</h3>
                        <p className="text-3xl font-black text-white tracking-tighter italic">{stat.value.toLocaleString()}</p>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Feature Usage Chart (Simulated) */}
                <Card glass className="lg:col-span-2 p-8 border-white/5 flex flex-col h-[500px]">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-500/10"><BarChart3 className="w-5 h-5 text-emerald-500" /></div>
                            <h2 className="font-black italic uppercase tracking-wider text-white">System Feature Usage</h2>
                        </div>
                        <div className="flex gap-2">
                             {['Hourly', 'Daily', 'Monthly'].map(t => (
                                 <button key={t} className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all ${t === 'Daily' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}>{t}</button>
                             ))}
                        </div>
                    </div>
                    
                    <div className="flex-1 flex items-end gap-3 pb-4">
                         {[65, 45, 85, 30, 95, 55, 75, 50, 60, 40, 80, 70].map((h, i) => (
                             <div key={i} className="flex-1 relative group">
                                 <div 
                                    style={{ height: `${h}%` }}
                                    className="w-full bg-gradient-to-t from-emerald-500/20 to-emerald-500/80 rounded-t-lg group-hover:to-emerald-400 transition-all cursor-pointer relative"
                                 >
                                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-slate-950 font-black text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">{h}%</div>
                                 </div>
                             </div>
                         ))}
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-600 pt-4 border-t border-white/5">
                        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                    </div>
                </Card>

                {/* Top Visited Pages */}
                <Card glass className="p-8 border-white/5 flex flex-col h-[500px]">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 rounded-lg bg-purple-500/10"><PieChart className="w-5 h-5 text-purple-500" /></div>
                        <h2 className="font-black italic uppercase tracking-wider text-white">Top Target Pages</h2>
                    </div>

                    <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                        {stats.top_pages.map((p, i) => (
                            <div key={i} className="flex items-center justify-between group cursor-pointer">
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-white uppercase tracking-wider group-hover:text-purple-400 transition-colors">{p.path}</p>
                                    <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div style={{ width: `${(p.visits / stats.top_pages[0].visits) * 100}%` }} className="h-full bg-purple-500 rounded-full" />
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-white italic">{p.visits.toLocaleString()}</p>
                                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest italic">Visits</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button variant="glass" className="w-full mt-6 bg-white/5 border-white/10 hover:bg-white/10 text-[10px] font-black uppercase tracking-[0.2em] italic">View Detailed Traffic</Button>
                </Card>
            </div>

            {/* Bottom Row: User Context & Device Split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card glass className="p-8 border-white/5">
                    <div className="flex items-center justify-between mb-8">
                         <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10"><Globe className="w-5 h-5 text-blue-500" /></div>
                            <h2 className="font-black italic uppercase tracking-wider text-white">Browser / Geo Split</h2>
                        </div>
                        <Button size="sm" variant="glass" className="text-[10px] font-black uppercase tracking-widest text-slate-400">View Map</Button>
                    </div>
                    <div className="space-y-4">
                        {[
                            { name: 'Chrome / India', pct: 65, color: 'blue' },
                            { name: 'Safari / US', pct: 20, color: 'emerald' },
                            { name: 'Edge / Europe', pct: 10, color: 'purple' },
                            { name: 'Other', pct: 5, color: 'slate' }
                        ].map((b, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest italic text-slate-500">
                                    <span>{b.name}</span>
                                    <span className="text-white">{b.pct}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div style={{ width: `${b.pct}%` }} className={`h-full bg-${b.color}-500 rounded-full`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card glass className="p-8 border-white/5">
                    <div className="flex items-center justify-between mb-8">
                         <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-500/10"><Smartphone className="w-5 h-5 text-amber-500" /></div>
                            <h2 className="font-black italic uppercase tracking-wider text-white">Device Breakdown</h2>
                        </div>
                        <Button size="sm" variant="glass" className="text-[10px] font-black uppercase tracking-widest text-slate-400">View Network</Button>
                    </div>
                    <div className="flex justify-around items-center h-40">
                         <div className="text-center group cursor-pointer">
                             <div className="w-16 h-16 rounded-[1.5rem] bg-amber-500/10 flex items-center justify-center mx-auto mb-4 border border-amber-500/20 group-hover:scale-110 transition-all shadow-lg group-hover:shadow-amber-500/20">
                                 <Smartphone className="w-6 h-6 text-amber-500" />
                             </div>
                             <p className="text-lg font-black text-white italic">72%</p>
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Mobile</p>
                         </div>
                         <div className="text-center group cursor-pointer">
                             <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500/10 flex items-center justify-center mx-auto mb-4 border border-indigo-500/20 group-hover:scale-110 transition-all shadow-lg group-hover:shadow-indigo-500/20">
                                 <MonitorIcon className="w-6 h-6 text-indigo-500" />
                             </div>
                             <p className="text-lg font-black text-white italic">28%</p>
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Desktop</p>
                         </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

const MonitorIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="20" height="14" x="2" y="3" rx="2" />
        <line x1="8" x2="16" y1="21" y2="21" />
        <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
);
