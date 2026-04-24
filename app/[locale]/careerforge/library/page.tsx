'use client'
export const dynamic = 'force-dynamic';
;

import { useState, useEffect, useMemo, type ComponentType } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    BookOpen, GraduationCap, Loader2, Search, ArrowRight,
    Code2, Braces, Terminal, Layers, Cpu, Globe
} from 'lucide-react';
import { getCareerForgeLanguageCards } from '@/lib/careerforge-library';

interface Language {
    id?: string | null;
    name: string;
    slug: string;
    description: string;
    topicCount: number;
}

const DEFAULT_LANGUAGES: Language[] = getCareerForgeLanguageCards();

const LANGUAGE_ICONS: Record<string, ComponentType<{ className?: string }>> = {
    'java': CoffeeIcon,
    'python': SnakeIcon,
    'javascript': Braces,
    'c': Terminal,
    'c-plus-plus': Cpu,
    'react': Layers,
    'nodejs': Globe,
    'sql': Search,
    'default': Code2
};

function CoffeeIcon(props: { className?: string }) {
    return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></svg>;
}

function SnakeIcon(props: { className?: string }) {
    return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" /><path d="M12 7a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3z" /></svg>;
}

function mergeLanguages(apiLanguages: Language[]): Language[] {
    const bySlug = new Map(apiLanguages.map((language) => [language.slug, language]));

    return DEFAULT_LANGUAGES.map((fallback) => {
        const fromApi = bySlug.get(fallback.slug);
        return {
            id: fromApi?.id || null,
            name: fromApi?.name || fallback.name,
            slug: fallback.slug,
            description: fromApi?.description || fallback.description,
            topicCount: fromApi?.topicCount && fromApi.topicCount > 0 ? fromApi.topicCount : fallback.topicCount,
        };
    });
}

export default function LearningLibrary() {
    const [languages, setLanguages] = useState<Language[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const params = useParams() as { locale: string };
    const { locale } = params;

    useEffect(() => {
        fetch('/api/careerforge/library')
            .then(r => r.json())
            .then(data => {
                if (data.success && Array.isArray(data.languages)) {
                    setLanguages(mergeLanguages(data.languages));
                } else {
                    setLanguages(DEFAULT_LANGUAGES);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch languages', err);
                setLanguages(DEFAULT_LANGUAGES);
                setLoading(false);
            });
    }, []);

    const displayedLanguages = useMemo(() => {
        const source = languages.length > 0 ? languages : DEFAULT_LANGUAGES;
        const filtered = source.filter(l =>
            l.name.toLowerCase().includes(search.toLowerCase())
        );
        return filtered.length > 0 ? filtered : source;
    }, [languages, search]);

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20 pt-32 px-6">
            {/* Hero Section */}
            <div className="relative p-12 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/20 via-transparent to-purple-500/10 border border-white/10 overflow-hidden group">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] group-hover:bg-indigo-500/20 transition-all duration-1000"></div>

                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
                        <GraduationCap className="w-4 h-4 text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Learning Library</span>
                    </div>
                    <h1 className="text-5xl font-black text-white leading-tight mb-6">
                        Master the Core of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Modern Engineering</span>
                    </h1>
                    <p className="text-xl text-slate-400 leading-relaxed mb-8">
                        A documentation-style programming library with ordered topics for each language and reusable AI-generated explanations.
                    </p>

                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search languages (e.g. Java, Python...)"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Language Grid */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <BookOpen className="w-6 h-6 text-indigo-400" /> Programming Languages
                    </h2>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{displayedLanguages.length} Available</span>
                </div>

                {loading ? (
                    <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 bg-white/5 border border-white/10 rounded-3xl">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                        <p className="text-slate-500 font-bold animate-pulse text-xs uppercase tracking-widest">Scanning the archives...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedLanguages.map((l) => {
                            const Icon = LANGUAGE_ICONS[l.slug] || LANGUAGE_ICONS.default;
                            return (
                                <Link
                                    key={l.slug}
                                    href={`/${locale}/careerforge/library/${l.slug}`}
                                    className="group p-8 rounded-[2rem] bg-[#0a0a16] border border-white/5 hover:border-indigo-500/30 transition-all duration-500 hover:translate-y-[-4px] relative overflow-hidden flex flex-col h-full"
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                        <ArrowRight className="w-5 h-5 text-indigo-400" />
                                    </div>

                                    <div className="flex items-start justify-between mb-8">
                                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 group-hover:bg-indigo-500/20 shadow-lg shadow-black/20">
                                            <Icon className="w-8 h-8 text-indigo-400" />
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Chapters</span>
                                            <span className="text-xl font-black text-white">{l.topicCount}</span>
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-2xl font-black text-white mb-3 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{l.name}</h3>
                                        <p className="text-slate-500 text-sm leading-relaxed font-medium line-clamp-2 mb-8">{l.description}</p>
                                    </div>

                                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] group-hover:tracking-[0.3em] transition-all">Open Topic List</span>
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                                            <ArrowRight className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
