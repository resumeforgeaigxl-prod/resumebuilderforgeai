'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    Loader2, ArrowLeft, Target, Clock, BookOpen, GraduationCap
} from 'lucide-react';

interface Skill {
    id: string;
    title: string;
    topic_id: string | null;
    learning_topic?: {
        id: string;
        title: string;
        slug: string;
        language_slug: string;
    } | null;
}

interface Step {
    id: string;
    title: string;
    description: string;
    roadmap_skills: Skill[];
}

interface Roadmap {
    id: string;
    title: string;
    description: string;
    estimated_duration: string;
    roadmap_steps: Step[];
}

export default function RoadmapView() {
    const params = useParams() as { locale: string; slug: string };
    const { locale, slug } = params;

    const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/careerforge/roadmaps?slug=${slug}`)
            .then(r => r.json())
            .then(data => {
                if (data.success) setRoadmap(data.roadmap);
                setLoading(false);
            });
    }, [slug]);

    if (loading) return (
        <div className="min-h-[70vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
    );

    if (!roadmap) return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold text-white">Roadmap not found</h1>
            <Link href={`/${locale}/careerforge/roadmaps`} className="text-indigo-400 mt-4 underline">Back to Explorer</Link>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto py-12 px-6 space-y-16 pb-32">
            {/* Header */}
            <div className="space-y-8">
                <Link href={`/${locale}/careerforge/roadmaps`} className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em] group">
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Back to Roadmaps
                </Link>

                <div className="relative p-12 rounded-[3rem] bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 border border-white/10 overflow-hidden group">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] group-hover:bg-indigo-500/20 transition-all duration-1000"></div>

                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/30">
                                Official Path
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                <Clock className="w-3.5 h-3.5" /> {roadmap.estimated_duration}
                            </div>
                        </div>

                        <h1 className="text-6xl font-black text-white leading-none uppercase tracking-tight">{roadmap.title}</h1>
                        <p className="text-xl text-slate-400 max-w-2xl font-medium leading-relaxed">
                            {roadmap.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="space-y-12 relative">
                {/* Vertical Line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-indigo-500/50 to-transparent opacity-20" />

                {roadmap.roadmap_steps.map((step, idx) => (
                    <div key={step.id} className="relative pl-24 group animate-in slide-in-from-left-4 duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
                        {/* Circle Indicator */}
                        <div className="absolute left-4 top-0 w-8 h-8 rounded-full bg-[#070710] border-2 border-indigo-500 flex items-center justify-center z-10 group-hover:scale-125 transition-transform duration-500">
                            <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        </div>

                        <div className="space-y-8">
                            {/* Step Header */}
                            <div className="space-y-2">
                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Phase {idx + 1}</span>
                                <h2 className="text-4xl font-black text-white uppercase tracking-tight">{step.title}</h2>
                                <p className="text-slate-500 font-medium max-w-xl">{step.description}</p>
                            </div>

                            {/* Skill Path */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {step.roadmap_skills.map((skill) => (
                                    <div
                                        key={skill.id}
                                        className="group/skill p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.08] transition-all duration-300 flex flex-col justify-between h-full"
                                    >
                                        <div className="space-y-4">
                                            <span className="inline-flex items-center rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-indigo-400">
                                                Skill Path
                                            </span>
                                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center group-hover/skill:scale-110 transition-transform">
                                                <Target className="w-5 h-5 text-indigo-400" />
                                            </div>
                                            <h4 className="text-lg font-bold text-white group-hover/skill:text-indigo-400 transition-colors uppercase tracking-tight">{skill.title}</h4>
                                        </div>

                                        {skill.learning_topic ? (
                                            <Link
                                                href={`/${locale}/careerforge/library/${skill.learning_topic.language_slug}/${skill.learning_topic.slug}`}
                                                className="mt-6 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-[10px] font-black text-white uppercase tracking-widest transition-all group-hover/skill:translate-y-[-2px]"
                                            >
                                                <BookOpen className="w-3.5 h-3.5" /> Open Learning Topic
                                            </Link>
                                        ) : (
                                            <div className="mt-6 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-slate-600 uppercase tracking-widest cursor-not-allowed">
                                                Topic Mapping Pending
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Completion Marker */}
                <div className="relative pl-24 pt-12">
                    <div className="absolute left-2 top-12 w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                        <GraduationCap className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-emerald-400 uppercase tracking-tight">Certification Ready</h3>
                        <p className="text-slate-500 font-medium">Complete all phases to unlock industry-recognized certification paths.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
