'use client'
export const dynamic = 'force-dynamic';
;

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, BookOpen, ChevronRight, Loader2 } from 'lucide-react';

interface Topic {
    id: string;
    title: string;
    slug: string;
    order_index: number;
}

interface LanguageInfo {
    id?: string | null;
    name: string;
    description?: string | null;
}

export default function LanguageTopicListPage() {
    const params = useParams() as { locale: string; language: string };
    const { locale, language } = params;

    const [topics, setTopics] = useState<Topic[]>([]);
    const [languageInfo, setLanguageInfo] = useState<LanguageInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/careerforge/library?language=${language}`)
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    setTopics(Array.isArray(data.topics) ? data.topics : []);
                    setLanguageInfo(data.language || null);
                }
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [language]);

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pt-28 pb-24 px-6 space-y-10">
            <Link
                href={`/${locale}/careerforge/library`}
                className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
            >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Learning Library
            </Link>

            <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 p-10 space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Topic List</span>
                </div>
                <h1 className="text-5xl font-black text-white uppercase tracking-tight">
                    {languageInfo?.name || language}
                </h1>
                <p className="text-slate-400 max-w-2xl font-medium">
                    Select a topic to open its full learning page with overview, explanation, code examples, key points, and practice questions.
                </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[#0a0a16] p-4 md:p-6">
                {topics.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 font-medium">
                        No topics are available yet for this language.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {topics.map((topic) => (
                            <Link
                                key={topic.id}
                                href={`/${locale}/careerforge/library/${language}/${topic.slug}`}
                                className="flex items-center gap-4 rounded-2xl border border-transparent px-4 py-4 text-slate-300 hover:bg-white/5 hover:border-indigo-500/30 transition-all"
                            >
                                <span className="w-10 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    {topic.order_index.toString().padStart(2, '0')}
                                </span>
                                <span className="flex-1 text-sm md:text-base font-bold text-white">{topic.title}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 inline-flex items-center gap-1">
                                    Open Topic <ChevronRight className="w-3.5 h-3.5" />
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
