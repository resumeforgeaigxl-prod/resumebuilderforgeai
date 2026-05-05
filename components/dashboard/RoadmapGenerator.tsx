'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    Compass, Loader2, CheckCircle2,
    Clock, Target, Info, Sparkles, BookOpen,
    ChevronRight,
    Map
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

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

interface MappedSkillItem {
    item_index: number;
    skill: string;
    confidence: number;
    topic: {
        id: string;
        title: string;
        slug: string;
        language_name: string;
        language_slug: string;
    };
}

interface MappedStep {
    step_index: number;
    step_name: string;
    items: MappedSkillItem[];
}

export default function RoadmapGenerator() {
    const params = useParams() as { locale: string };
    const locale = params?.locale || 'en-IN';

    const [targetRole, setTargetRole] = useState('');
    const [experience, setExperience] = useState('beginner');
    const [time, setTime] = useState('5-10 hours');
    const [loading, setLoading] = useState(false);
    const [roadmaps, setRoadmaps] = useState<RoadmapData[]>([]);
    const [activeRoadmap, setActiveRoadmap] = useState<RoadmapData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [mappingLoading, setMappingLoading] = useState(false);
    const [skillTopicMap, setSkillTopicMap] = useState<Record<string, MappedSkillItem>>({});

    useEffect(() => {
        fetchRoadmaps();
    }, []);

    useEffect(() => {
        if (activeRoadmap) {
            mapSkillsToTopics();
        }
    }, [activeRoadmap]);

    const fetchRoadmaps = async () => {
        try {
            const res = await fetch('/api/ai/roadmap/list');
            const data = await res.json();
            if (data.success) {
                setRoadmaps(data.roadmaps);
                if (data.roadmaps.length > 0) {
                    setActiveRoadmap(data.roadmaps[0]);
                }
            }
        } catch (err) {
            console.error('Failed to fetch roadmaps', err);
        }
    };

    const mapSkillsToTopics = async () => {
        if (!activeRoadmap) return;
        setMappingLoading(true);
        try {
            const res = await fetch('/api/ai/roadmap/map-skills', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roadmap: activeRoadmap.roadmap_json })
            });
            const data = await res.json();
            if (data.success && data.mapped_steps) {
                const newMap: Record<string, MappedSkillItem> = {};
                data.mapped_steps.forEach((step: MappedStep) => {
                    step.items.forEach((item: MappedSkillItem) => {
                        newMap[`${step.step_index}:${item.item_index}`] = item;
                    });
                });
                setSkillTopicMap(newMap);
            }
        } catch (err) {
            console.error('Failed to map skills', err);
        } finally {
            setMappingLoading(false);
        }
    };

    const generateRoadmap = async () => {
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
        <div className="space-y-12 animate-fade-in max-w-7xl mx-auto py-6">
            {/* Standardized Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1E2A42] pb-8 mb-12">
                <div>
                    <div className="flex items-center gap-2 text-[#00D4A0] font-bold tracking-widest text-[10px] uppercase mb-4">
                        <Target className="w-3.5 h-3.5" /> Intelligence Core
                    </div>
                    <h1 className="text-4xl font-bold tracking-tighter text-white uppercase">RoadmapForge</h1>
                    <p className="text-slate-400 mt-2 text-lg">Neural career path synthesis based on market intelligence and personal skill data.</p>
                </div>

                {roadmaps.length > 0 && (
                    <div className="w-full lg:w-72">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Active Trajectory</label>
                         <div className="relative group">
                            <select
                                className="w-full bg-[#0D1220] border border-[#1E2A42] rounded-xl px-4 py-3 text-sm text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#00D4A0]/20 transition-all appearance-none cursor-pointer"
                                onChange={(e) => setActiveRoadmap(roadmaps.find(r => r.id === e.target.value) || null)}
                                value={activeRoadmap?.id || ''}
                            >
                                {roadmaps.map(r => (
                                    <option key={r.id} value={r.id} className="bg-[#080B16]">{r.target_role.toUpperCase()}</option>
                                ))}
                            </select>
                            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5568] rotate-90 pointer-events-none" />
                         </div>
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Input Panel */}
                <div className="lg:col-span-4 space-y-8">
                    <Card glass className="p-10 border-white/5 bg-white/[0.01]">
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Trajectory Goal</label>
                                <Input
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                    disabled={loading}
                                    placeholder="e.g. SYSTEMS ARCHITECT"
                                    className="h-16 rounded-2xl bg-white/[0.03] border-white/10 text-white font-black italic placeholder:text-slate-700 uppercase"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Seniority level</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['beginner', 'intermediate', 'advanced', 'expert'].map((lvl) => (
                                        <button
                                            key={lvl}
                                            onClick={() => setExperience(lvl)}
                                            className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${experience === lvl
                                                ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40 shadow-xl shadow-indigo-500/10'
                                                : 'bg-white/5 text-slate-500 border-white/5 hover:border-white/10'
                                                }`}
                                        >
                                            {lvl}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Temporal Commitment</label>
                                <div className="relative">
                                    <select
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-xs text-white font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500/30 appearance-none transition-all cursor-pointer shadow-inner"
                                    >
                                        <option value="5-10 hours" className="bg-[#0a0a1a]">Standard (5-10h)</option>
                                        <option value="10-20 hours" className="bg-[#0a0a1a]">Accelerated (10-20h)</option>
                                        <option value="20-40 hours" className="bg-[#0a0a1a]">Hyper (20-40h)</option>
                                        <option value="40+ hours" className="bg-[#0a0a1a]">Absolute (40+h)</option>
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
                                        <ChevronRight className="w-4 h-4 rotate-90" />
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={generateRoadmap}
                                disabled={loading || !targetRole}
                                variant="premium"
                                className="w-full h-16 rounded-[1.8rem] font-black uppercase tracking-widest group shadow-2xl shadow-indigo-500/10"
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Sparkles className="w-5 h-5 mr-3 group-hover:animate-pulse" /> Initialize Synthesis</>}
                            </Button>
                        </div>
                    </Card>

                    {/* Quick Stats */}
                    {activeRoadmap && (
                        <div className="grid grid-cols-2 gap-4">
                            <Card glass className="p-6 border-white/5 bg-white/[0.01] flex flex-col items-center justify-center text-center">
                                <Clock className="w-6 h-6 text-emerald-400 mb-3" />
                                <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Timeline</span>
                                <span className="text-xl font-black text-white italic">{activeRoadmap.roadmap_json.estimated_total_months} MO</span>
                            </Card>
                            <Card glass className="p-6 border-white/5 bg-white/[0.01] flex flex-col items-center justify-center text-center">
                                <Compass className="w-6 h-6 text-indigo-400 mb-3" />
                                <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Phases</span>
                                <span className="text-xl font-black text-white italic">{activeRoadmap.roadmap_json.steps.length} UNIT</span>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Display Panel */}
                <div className="lg:col-span-8">
                    {error && (
                        <Card glass className="p-6 border-rose-500/20 bg-rose-500/[0.02] mb-8 flex items-center gap-3 animate-shake">
                            <Badge variant="destructive" className="font-black">CORE_ERR</Badge>
                            <span className="text-sm font-bold text-rose-400 uppercase tracking-tight">{error}</span>
                        </Card>
                    )}

                    {!activeRoadmap && !loading && (
                        <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-20 rounded-[4rem] border-2 border-dashed border-white/5 bg-white/[0.01] text-center">
                            <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-500/5 flex items-center justify-center mb-8 border border-white/5 shadow-2xl">
                                <Map className="w-12 h-12 text-slate-800" />
                            </div>
                            <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Trajectory Offline</h3>
                            <p className="text-slate-500 max-w-md text-lg font-medium">Input your career parameters to synthesize a tactical learning roadmap powered by the Forge intelligence engine.</p>
                        </div>
                    )}

                    {loading && (
                        <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-20 rounded-[4rem] border border-white/5 bg-white/[0.02] text-center space-y-8">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles className="w-10 h-10 text-indigo-400 animate-pulse" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Synthesizing Path_</h3>
                                <p className="text-slate-500 text-lg font-medium animate-pulse italic">Mapping high-fidelity industry requirements for {targetRole.toUpperCase()}</p>
                            </div>
                        </div>
                    )}

                    {activeRoadmap && !loading && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            <Card glass className="p-12 border-white/5 bg-gradient-to-br from-indigo-500/[0.03] to-transparent relative overflow-hidden group rounded-[3.5rem]">
                                <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px] group-hover:bg-indigo-500/20 transition-all duration-1000" />
                                <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-400 font-black px-4 py-1.5 rounded-full mb-6">INTEL_LOG_01</Badge>
                                <h3 className="text-4xl font-black text-white leading-tight uppercase italic tracking-tighter mb-4">
                                    {activeRoadmap.roadmap_json.title}
                                </h3>
                                <p className="text-slate-400 text-xl font-medium leading-relaxed max-w-2xl">
                                    {activeRoadmap.roadmap_json.description}
                                </p>
                            </Card>

                            <div className="space-y-6 relative ml-4 sm:ml-0">
                                {/* Connection line */}
                                <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-gradient-to-b from-indigo-500 via-indigo-500/20 to-transparent opacity-20 hidden sm:block" />

                                {activeRoadmap?.roadmap_json?.steps?.map((step, idx) => (
                                    <div key={idx} className="flex gap-6 sm:gap-12 group/step items-start">
                                        <div className="relative hidden sm:flex flex-col items-center">
                                            <div className="w-16 h-16 rounded-[2rem] bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center z-10 group-hover/step:scale-110 group-hover/step:bg-indigo-600/20 group-hover/step:border-indigo-500/50 transition-all shadow-xl italic font-black text-xl text-indigo-400">
                                                0{idx + 1}
                                            </div>
                                        </div>
                                        <Card glass className="flex-1 p-10 border-white/5 hover:border-white/20 transition-all bg-white/[0.01] hover:bg-white/[0.03] rounded-[3rem] group-hover/step:translate-x-4 duration-500">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-white/5">
                                                <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter group-hover/step:text-indigo-400 transition-colors">{step.name}</h4>
                                                <Badge variant="outline" className="h-10 px-5 rounded-2xl bg-indigo-500/5 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] border-indigo-500/20 flex items-center gap-2">
                                                    <Clock className="w-4 h-4" /> {step.estimated_weeks} WEEK CYCLE
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                                <div className="space-y-5">
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2">
                                                        <Sparkles className="w-3.5 h-3.5" /> Logical Nodes
                                                    </div>
                                                    {mappingLoading && (
                                                        <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500/50 uppercase tracking-widest animate-pulse">
                                                            <Loader2 className="w-3 h-3 animate-spin" /> Mapping Nodes...
                                                        </div>
                                                    )}
                                                    <div className="flex flex-wrap gap-2.5">
                                                        {step.items.map((item, i) => (
                                                            (() => {
                                                                const mapped = skillTopicMap[`${idx}:${i}`];
                                                                if (!mapped?.topic) {
                                                                    return (
                                                                        <div key={i} className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 text-[11px] font-black text-slate-400 border border-white/5 hover:border-indigo-500/20 transition-all italic uppercase">
                                                                            <CheckCircle2 className="w-4 h-4 text-slate-800" />
                                                                            {item}
                                                                        </div>
                                                                    );
                                                                }
                                                                return (
                                                                    <Link
                                                                        key={i}
                                                                        href={`/${locale}/careerforge/library/${mapped.topic.language_slug}/${mapped.topic.slug}`}
                                                                        className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-indigo-500/5 text-[11px] font-black text-indigo-300 border border-indigo-500/20 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all italic uppercase shadow-xl"
                                                                    >
                                                                        <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                                                                        {item}
                                                                        <BookOpen className="w-4 h-4 text-indigo-400 ml-1" />
                                                                    </Link>
                                                                );
                                                            })()
                                                        ))}
                                                    </div>
                                                </div>

                                                {step.resources && step.resources.length > 0 && (
                                                    <div className="space-y-5 bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group/res">
                                                        <div className="absolute top-0 right-0 p-4 opacity-5">
                                                            <Info className="w-20 h-20 text-indigo-500" />
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2">
                                                            <Info className="w-3.5 h-3.5" /> Protocol Assets
                                                        </div>
                                                        <ul className="space-y-4">
                                                            {step.resources.map((res, i) => (
                                                                <li key={i} className="text-xs text-slate-500 flex items-start gap-4 group/item">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 group-hover/item:scale-150 transition-all shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                                                                    <span className="font-medium group-hover/item:text-slate-300 transition-colors uppercase tracking-tight">{res}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
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
