'use client';

import { useState, useEffect } from 'react';
import {
    Compass, Loader2, Send, CheckCircle2,
    Calendar, Clock, Target, Info, Sparkles, BookOpen
} from 'lucide-react';

interface RoadmapStep {
    name: string;
    items: string[];
    estimated_weeks: number;
    resources?: string[];
}

interface RoadmapData {
    id: string;
    target_role: string;
    experience_level: string;
    time_available: string;
    roadmap_json: {
        title: string;
        description: string;
        steps: RoadmapStep[];
        estimated_total_months: number;
    };
    created_at: string;
}

export default function RoadmapGenerator() {
    const [targetRole, setTargetRole] = useState('');
    const [experience, setExperience] = useState('beginner');
    const [time, setTime] = useState('5-10 hours');
    const [loading, setLoading] = useState(false);
    const [roadmaps, setRoadmaps] = useState<RoadmapData[]>([]);
    const [activeRoadmap, setActiveRoadmap] = useState<RoadmapData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setError(null);
        fetch('/api/ai/roadmap/generate')
            .then(r => r.json())
            .then(d => {
                if (d.success) {
                    setRoadmaps(d.roadmaps);
                    if (d.roadmaps.length > 0) setActiveRoadmap(d.roadmaps[0]);
                }
            })
            .catch(err => {
                console.error('Failed to fetch roadmaps', err);
                setError('Failed to load your previously generated roadmaps.');
            });
    }, []);

    const generateRoadmap = async () => {
        if (!targetRole) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/ai/roadmap/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    target_role: targetRole,
                    experience_level: experience,
                    time_available: time
                })
            });
            const data = await res.json();
            if (data.success) {
                setRoadmaps([data.roadmap, ...roadmaps]);
                setActiveRoadmap(data.roadmap);
                setTargetRole('');
            } else {
                setError(data.error || 'Failed to generate roadmap. Please try a different role name.');
            }
        } catch (err) {
            console.error('Failed to generate roadmap', err);
            setError('The AI service is currently overloaded. Please try again in a few seconds.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Compass className="w-6 h-6 text-indigo-400" /> AI Career Roadmap
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Generate a personalized step-by-step learning path for your dream role.</p>
                </div>
                <div className="flex gap-2">
                    {roadmaps.length > 0 && (
                        <select
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            onChange={(e) => setActiveRoadmap(roadmaps.find(r => r.id === e.target.value) || null)}
                            value={activeRoadmap?.id || ''}
                        >
                            {roadmaps.map(r => (
                                <option key={r.id} value={r.id}>{r.target_role}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Input Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Role</label>
                            <input
                                id="roadmap-target-role"
                                name="targetRole"
                                type="text"
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                disabled={loading}
                                autoFocus
                                placeholder="e.g. Senior Frontend Engineer"
                                className="w-full bg-slate-900 border border-white/20 rounded-xl px-4 py-4 text-base text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-bold relative z-30 shadow-2xl"
                                style={{ color: 'white' }}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Experience Level</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['beginner', 'intermediate', 'advanced', 'expert'].map((lvl) => (
                                    <button
                                        key={lvl}
                                        onClick={() => setExperience(lvl)}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold capitalize transition-all border ${experience === lvl
                                            ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                                            : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/10'
                                            }`}
                                    >
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Time Commitment</label>
                            <select
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none font-medium"
                            >
                                <option value="5-10 hours">5-10 hours / week</option>
                                <option value="10-20 hours">10-20 hours / week</option>
                                <option value="20-40 hours">20-40 hours / week</option>
                                <option value="40+ hours">Full-time (40+ hours)</option>
                            </select>
                        </div>

                        <button
                            onClick={generateRoadmap}
                            disabled={loading || !targetRole}
                            className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 group"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5 group-hover:animate-pulse" /> Generate Roadmap</>}
                        </button>
                    </div>

                    {/* Quick Stats if active */}
                    {activeRoadmap && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-1 items-center justify-center text-center">
                                <Calendar className="w-5 h-5 text-emerald-400 mb-1" />
                                <span className="text-xs text-slate-500">Duration</span>
                                <span className="text-lg font-bold text-white">{activeRoadmap.roadmap_json.estimated_total_months} Mo</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-1 items-center justify-center text-center">
                                <Target className="w-5 h-5 text-amber-400 mb-1" />
                                <span className="text-xs text-slate-500">Goal</span>
                                <span className="text-xs font-bold text-white truncate max-w-full px-2">{activeRoadmap.target_role}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Display Panel */}
                <div className="lg:col-span-2">
                    {error && (
                        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-2">
                                <Info className="w-4 h-4" />
                                {error}
                            </div>
                        </div>
                    )}

                    {!activeRoadmap && !loading && (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 rounded-3xl bg-white/5 border border-dashed border-white/10 text-center">
                            <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
                                <BookOpen className="w-10 h-10 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Ready to Level Up?</h3>
                            <p className="text-slate-400 max-w-sm text-sm">Enter your target role and experience to generate a complete learning pathway powered by AI.</p>
                        </div>
                    )}

                    {loading && (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 rounded-3xl bg-white/5 border border-white/10 text-center space-y-4">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-white">Crafting Your Roadmap...</h3>
                                <p className="text-slate-500 text-sm animate-pulse">Our AI is analyzing industry requirements for {targetRole}</p>
                            </div>
                        </div>
                    )}

                    {activeRoadmap && !loading && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 border border-white/10 relative overflow-hidden group">
                                <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] group-hover:bg-indigo-500/20 transition-all duration-1000"></div>

                                <h3 className="text-3xl font-black text-white leading-tight">
                                    {activeRoadmap.roadmap_json.title}
                                </h3>
                                <p className="text-slate-400 mt-2 text-lg">
                                    {activeRoadmap.roadmap_json.description}
                                </p>
                            </div>

                            <div className="space-y-4 relative">
                                {/* Connection line */}
                                <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-indigo-500 via-indigo-500/50 to-transparent opacity-20 hidden sm:block"></div>

                                {activeRoadmap?.roadmap_json?.steps?.map((step, idx) => (
                                    <div key={idx} className="flex gap-4 sm:gap-8 group">
                                        <div className="relative hidden sm:flex flex-col items-center">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center z-10 group-hover:scale-110 group-hover:bg-indigo-600/30 transition-all shadow-[0_0_20px_rgba(99,102,241,0.15)]">
                                                <span className="text-lg font-black text-indigo-400">{idx + 1}</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all hover:bg-white/[0.07] group-hover:translate-x-1 duration-300">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                                                <h4 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors uppercase tracking-tight">{step.name}</h4>
                                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                                    <Clock className="w-3 h-3" /> {step.estimated_weeks} Weeks
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-3">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Send className="w-3 h-3" /> Core Skills</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {step.items.map((item, i) => (
                                                            <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 text-xs text-slate-300 border border-white/5 hover:border-indigo-500/30 transition-colors">
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                                                                {item}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                {step.resources && step.resources.length > 0 && (
                                                    <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/5">
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Info className="w-3 h-3" /> Resources</p>
                                                        <ul className="space-y-2">
                                                            {step.resources.map((res, i) => (
                                                                <li key={i} className="text-xs text-slate-400 flex items-start gap-2 group/item">
                                                                    <div className="w-1 h-1 rounded-full bg-indigo-500/50 mt-1.5 group-hover/item:scale-150 transition-all"></div>
                                                                    {res}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
