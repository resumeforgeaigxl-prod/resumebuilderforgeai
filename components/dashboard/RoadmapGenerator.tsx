'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    Compass, Loader2, CheckCircle2,
    Clock, Target, Info, BookOpen,
    ChevronRight,
    Map
, Wand2 } from 'lucide-react';
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
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto py-6 text-[#171717]">
            {/* Standardized Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#EBEBEB] pb-6 mb-8">
                <div>
                    <div className="flex items-center gap-2 text-[#8F8F8F] font-mono text-xs uppercase tracking-wider mb-2">
                        <Target className="w-3.5 h-3.5 text-[#171717]" /> Intelligence Core
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight text-[#171717] uppercase">RoadmapForge</h1>
                    <p className="text-[#4D4D4D] mt-1.5 text-base">Neural career path synthesis based on market intelligence and personal skill data.</p>
                </div>

                {roadmaps.length > 0 && (
                    <div className="w-full lg:w-72">
                         <label className="text-[10px] font-semibold text-[#8F8F8F] uppercase tracking-wider mb-1.5 block">Active Trajectory</label>
                         <div className="relative group">
                            <select
                                className="w-full bg-white border border-[#EBEBEB] rounded-md px-3 py-2 text-xs text-[#171717] font-semibold focus:outline-none focus:ring-1 focus:ring-[#171717] focus:border-[#171717] transition-all appearance-none cursor-pointer shadow-sm"
                                onChange={(e) => setActiveRoadmap(roadmaps.find(r => r.id === e.target.value) || null)}
                                value={activeRoadmap?.id || ''}
                            >
                                {roadmaps.map(r => (
                                    <option key={r.id} value={r.id} className="bg-white text-[#171717]">{r.target_role.toUpperCase()}</option>
                                ))}
                            </select>
                            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F8F8F] rotate-90 pointer-events-none" />
                         </div>
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Input Panel */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="p-8 space-y-6 border-[#EBEBEB] bg-white rounded-xl shadow-sm">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold text-[#8F8F8F] uppercase tracking-wider">Trajectory Goal</label>
                                <Input
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                    disabled={loading}
                                    placeholder="e.g. SYSTEMS ARCHITECT"
                                    className="h-12 rounded-md bg-white border-[#EBEBEB] text-[#171717] font-semibold italic placeholder:text-[#8F8F8F] uppercase text-xs"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-semibold text-[#8F8F8F] uppercase tracking-wider">Seniority level</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['beginner', 'intermediate', 'advanced', 'expert'].map((lvl) => (
                                        <button
                                            key={lvl}
                                            onClick={() => setExperience(lvl)}
                                            className={`px-3 py-2 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all border ${experience === lvl
                                                ? 'bg-[#171717] text-white border-[#171717] shadow-sm'
                                                : 'bg-white text-[#4D4D4D] border-[#EBEBEB] hover:bg-[#FAFAFA] hover:text-[#171717]'
                                                }`}
                                        >
                                            {lvl}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold text-[#8F8F8F] uppercase tracking-wider">Temporal Commitment</label>
                                <div className="relative">
                                    <select
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="w-full bg-white border border-[#EBEBEB] rounded-md px-3 py-3 text-xs text-[#171717] font-semibold uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-[#171717] focus:border-[#171717] appearance-none transition-all cursor-pointer shadow-sm"
                                    >
                                        <option value="5-10 hours" className="bg-white text-[#171717]">Standard (5-10h)</option>
                                        <option value="10-20 hours" className="bg-white text-[#171717]">Accelerated (10-20h)</option>
                                        <option value="20-40 hours" className="bg-white text-[#171717]">Hyper (20-40h)</option>
                                        <option value="40+ hours" className="bg-white text-[#171717]">Absolute (40+h)</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#8F8F8F]">
                                        <ChevronRight className="w-4 h-4 rotate-90" />
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={generateRoadmap}
                                disabled={loading || !targetRole}
                                className="w-full h-12 rounded-md bg-[#171717] hover:bg-[#171717]/90 text-white font-medium text-xs shadow-sm flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Wand2 className="w-4 h-4" /> Initialize Synthesis</>}
                            </Button>
                        </div>
                    </Card>

                    {/* Quick Stats */}
                    {activeRoadmap && (
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="p-5 border-[#EBEBEB] bg-white flex flex-col items-center justify-center text-center rounded-xl shadow-sm">
                                <Clock className="w-5 h-5 text-[#171717] mb-2" />
                                <span className="text-[9px] text-[#8F8F8F] uppercase font-mono tracking-wider mb-1">Timeline</span>
                                <span className="text-lg font-semibold text-[#171717]">{activeRoadmap.roadmap_json.estimated_total_months} MO</span>
                            </Card>
                            <Card className="p-5 border-[#EBEBEB] bg-white flex flex-col items-center justify-center text-center rounded-xl shadow-sm">
                                <Compass className="w-5 h-5 text-[#171717] mb-2" />
                                <span className="text-[9px] text-[#8F8F8F] uppercase font-mono tracking-wider mb-1">Phases</span>
                                <span className="text-lg font-semibold text-[#171717]">{activeRoadmap.roadmap_json.steps.length} UNIT</span>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Display Panel */}
                <div className="lg:col-span-8">
                    {error && (
                        <Card className="p-4 border-red-100 bg-red-50 text-red-600 rounded-md mb-6 flex items-center gap-2.5 text-xs font-medium">
                            <Badge variant="destructive" className="font-semibold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded">CORE_ERR</Badge>
                            <span>{error}</span>
                        </Card>
                    )}

                    {!activeRoadmap && !loading && (
                        <div className="h-full min-h-[460px] flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-[#EBEBEB] bg-white text-center shadow-sm">
                            <div className="w-16 h-16 rounded-xl bg-[#FAFAFA] border border-[#EBEBEB] flex items-center justify-center mb-6 shadow-sm">
                                <Map className="w-8 h-8 text-[#171717]" />
                            </div>
                            <h3 className="text-lg font-semibold text-[#171717] uppercase tracking-wider mb-2">Trajectory Offline</h3>
                            <p className="text-[#8F8F8F] max-w-sm text-xs font-normal">Input your career parameters to synthesize a tactical learning roadmap powered by the Forge intelligence engine.</p>
                        </div>
                    )}

                    {loading && (
                        <div className="h-full min-h-[460px] flex flex-col items-center justify-center p-8 rounded-xl border border-[#EBEBEB] bg-white text-center space-y-6 shadow-sm">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full border-4 border-[#EBEBEB] border-t-[#171717] animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Wand2 className="w-6 h-6 text-[#171717] animate-pulse" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-[#171717] uppercase tracking-wider">Synthesizing Path...</h3>
                                <p className="text-[#8F8F8F] text-xs font-medium animate-pulse">Mapping high-fidelity industry requirements for {targetRole.toUpperCase()}</p>
                            </div>
                        </div>
                    )}

                    {activeRoadmap && !loading && (
                        <div className="space-y-8 animate-fade-in">
                            <Card className="p-8 border-[#EBEBEB] bg-white rounded-xl shadow-sm relative overflow-hidden group">
                                <div className="flex items-start justify-between mb-4">
                                    <Badge className="bg-[#FAFAFA] border border-[#EBEBEB] text-[#4D4D4D] font-mono text-[9px] tracking-wider rounded px-2.5 py-0.5">INTEL_LOG_01</Badge>
                                </div>
                                <h3 className="text-2xl font-semibold text-[#171717] leading-tight tracking-tight mb-3">
                                    {activeRoadmap.roadmap_json.title}
                                </h3>
                                <p className="text-[#4D4D4D] text-sm leading-relaxed max-w-2xl font-normal">
                                    {activeRoadmap.roadmap_json.description}
                                </p>
                            </Card>

                            <div className="space-y-6 relative ml-4 sm:ml-0">
                                {/* Connection line */}
                                <div className="absolute left-6 top-10 bottom-10 w-px bg-[#EBEBEB] hidden sm:block" />

                                {activeRoadmap?.roadmap_json?.steps?.map((step, idx) => (
                                    <div key={idx} className="flex gap-4 sm:gap-6 group/step items-start">
                                        <div className="relative hidden sm:flex flex-col items-center">
                                            <div className="w-12 h-12 rounded-full bg-[#FAFAFA] border border-[#EBEBEB] flex items-center justify-center z-10 group-hover/step:bg-[#171717] group-hover/step:text-white transition-all shadow-sm font-semibold text-sm text-[#171717]">
                                                0{idx + 1}
                                            </div>
                                        </div>
                                        <Card className="flex-1 p-8 border-[#EBEBEB] hover:border-[#171717] transition-all bg-white rounded-xl group-hover/step:translate-x-1 duration-300 shadow-sm">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#EBEBEB]">
                                                <h4 className="text-base font-semibold text-[#171717] group-hover/step:text-[#0070F3] transition-colors">{step.name}</h4>
                                                <Badge variant="outline" className="h-8 px-3 rounded-md bg-[#FAFAFA] border-[#EBEBEB] text-[#4D4D4D] text-[9px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-[#8F8F8F]" /> {step.estimated_weeks} WEEK CYCLE
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-1.5 text-[9px] font-semibold text-[#8F8F8F] uppercase tracking-wider mb-1">
                                                        <Wand2 className="w-3 h-3 text-[#171717]" /> Logical Nodes
                                                    </div>
                                                    {mappingLoading && (
                                                        <div className="flex items-center gap-1.5 text-[9px] font-semibold text-[#0070F3] uppercase tracking-wider animate-pulse">
                                                            <Loader2 className="w-3 h-3 animate-spin" /> Mapping Nodes...
                                                        </div>
                                                    )}
                                                    <div className="flex flex-wrap gap-2">
                                                        {step.items.map((item, i) => (
                                                            (() => {
                                                                const mapped = skillTopicMap[`${idx}:${i}`];
                                                                if (!mapped?.topic) {
                                                                    return (
                                                                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#FAFAFA] text-[11px] font-medium text-[#4D4D4D] border border-[#EBEBEB] hover:border-[#171717] transition-all uppercase">
                                                                            <CheckCircle2 className="w-3.5 h-3.5 text-[#8F8F8F]" />
                                                                            {item}
                                                                        </div>
                                                                    );
                                                                }
                                                                return (
                                                                    <Link
                                                                        key={i}
                                                                        href={`/${locale}/careerforge/library/${mapped.topic.language_slug}/${mapped.topic.slug}`}
                                                                        className="flex items-center gap-2 px-3 py-1.5 rounded bg-white text-[#0070F3] border border-[#EBEBEB] hover:border-[#0070F3] hover:bg-[#FAFAFA] transition-all text-[11px] font-medium uppercase shadow-sm"
                                                                    >
                                                                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0070F3]" />
                                                                        {item}
                                                                        <BookOpen className="w-3.5 h-3.5 text-[#0070F3] ml-0.5" />
                                                                    </Link>
                                                                );
                                                            })()
                                                        ))}
                                                    </div>
                                                </div>

                                                {step.resources && step.resources.length > 0 && (
                                                    <div className="space-y-4 bg-[#FAFAFA] p-6 rounded-lg border border-[#EBEBEB] relative overflow-hidden">
                                                        <div className="flex items-center gap-1.5 text-[9px] font-semibold text-[#8F8F8F] uppercase tracking-wider mb-1">
                                                            <Info className="w-3 h-3 text-[#171717]" /> Protocol Assets
                                                        </div>
                                                        <ul className="space-y-2.5">
                                                            {step.resources.map((res, i) => (
                                                                <li key={i} className="text-xs text-[#4D4D4D] flex items-start gap-3">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#171717] mt-1.5 shrink-0" />
                                                                    <span className="font-normal uppercase tracking-tight text-[11px]">{res}</span>
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
