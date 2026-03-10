"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import {
    Search,
    Filter,
    ChevronRight,
    Code2,
    Database,
    Bug,
    Brain,
    Building2,
    CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

interface Question {
    id: string;
    title: string;
    slug: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    type: 'Programming' | 'SQL' | 'Debugging' | 'Logic';
    topic: string;
    coding_companies: { company_name: string }[];
}

export default function QuestionsLibraryPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const params = useParams() as { region: string; lang: string };
    const { region, lang } = params;

    const initialType = searchParams?.get('type') || '';
    const initialCompany = searchParams?.get('company') || '';

    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState(initialType);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('');

    useEffect(() => {
        async function fetchQuestions() {
            setLoading(true);
            try {
                let url = `/api/codingforge/questions?`;
                if (filterType) url += `type=${filterType}&`;
                if (filterDifficulty) url += `difficulty=${filterDifficulty}&`;

                const res = await fetch(url);
                const data = await res.json();

                if (data && !data.error) {
                    let filtered = data;
                    if (initialCompany) {
                        filtered = data.filter((q: Question) =>
                            q.coding_companies?.some(c => c.company_name === initialCompany)
                        );
                    }
                    if (searchQuery) {
                        filtered = filtered.filter((q: Question) =>
                            q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            q.topic.toLowerCase().includes(searchQuery.toLowerCase())
                        );
                    }
                    setQuestions(filtered);
                }
            } catch (err) {
                console.error("Error fetching questions:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchQuestions();
    }, [filterType, filterDifficulty, searchQuery, initialCompany]);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Programming': return <Code2 className="w-4 h-4" />;
            case 'SQL': return <Database className="w-4 h-4" />;
            case 'Debugging': return <Bug className="w-4 h-4" />;
            case 'Logic': return <Brain className="w-4 h-4" />;
            default: return <Code2 className="w-4 h-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-[#070710] text-slate-200">
            <main className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Problem Library</h1>
                        <p className="text-slate-400 font-medium">Explore 100+ high-yield interview questions.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search problems, topics..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all w-full md:w-80 font-medium"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Filters Sidebar */}
                    <aside className="lg:col-span-3 space-y-8">
                        <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-xl">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Filter className="w-4 h-4 text-blue-400" />
                                Filters
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">Category</label>
                                    <div className="space-y-2">
                                        {['', 'Programming', 'SQL', 'Debugging', 'Logic'].map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => setFilterType(t)}
                                                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${filterType === t
                                                        ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20'
                                                        : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/10 hover:text-white'
                                                    }`}
                                            >
                                                {t || 'All Categories'}
                                                {filterType === t && <CheckCircle2 className="w-3.5 h-3.5" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">Difficulty</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['', 'Easy', 'Medium', 'Hard'].map((d) => (
                                            <button
                                                key={d}
                                                onClick={() => setFilterDifficulty(d)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${filterDifficulty === d
                                                        ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20'
                                                        : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/10 hover:text-white'
                                                    }`}
                                            >
                                                {d || 'All'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {initialCompany && (
                            <div className="p-6 rounded-[24px] bg-blue-600/10 border border-blue-500/20">
                                <p className="text-xs font-bold text-blue-400 flex items-center gap-2 mb-1">
                                    <Building2 className="w-3 h-3" /> Filtered by Company
                                </p>
                                <p className="text-sm font-black text-white">{initialCompany}</p>
                                <button
                                    onClick={() => router.push(`/${region}/${lang}/codingforge/questions`)}
                                    className="text-[10px] font-bold text-slate-500 hover:text-white mt-3 uppercase tracking-tighter underline"
                                >
                                    Clear Company Filter
                                </button>
                            </div>
                        )}
                    </aside>

                    {/* Questions Grid */}
                    <div className="lg:col-span-9">
                        {loading ? (
                            <div className="grid grid-cols-1 gap-4">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="h-24 rounded-3xl bg-white/5 animate-pulse border border-white/5"></div>
                                ))}
                            </div>
                        ) : questions.length === 0 ? (
                            <div className="p-20 text-center rounded-[40px] bg-white/5 border border-white/10 border-dashed">
                                <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">No problems found</h3>
                                <p className="text-slate-500">Try adjusting your filters or search query.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {questions.map((q) => (
                                    <Link
                                        key={q.id}
                                        href={`/${region}/${lang}/codingforge/question/${q.slug}`}
                                        className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/[0.08] transition-all flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className={`p-4 rounded-2xl ${q.type === 'Programming' ? 'bg-blue-500/10 text-blue-400' :
                                                    q.type === 'SQL' ? 'bg-purple-500/10 text-purple-400' :
                                                        q.type === 'Debugging' ? 'bg-red-500/10 text-red-400' :
                                                            'bg-green-500/10 text-green-400'
                                                }`}>
                                                {getTypeIcon(q.type)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-extrabold text-white mb-1 group-hover:text-blue-400 transition-colors">
                                                    {q.title}
                                                </h3>
                                                <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                                                    <span className={`${q.difficulty === 'Easy' ? 'text-green-500' :
                                                            q.difficulty === 'Medium' ? 'text-yellow-500' :
                                                                'text-red-500'
                                                        }`}>
                                                        {q.difficulty}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{q.topic}</span>
                                                    {q.coding_companies?.length > 0 && (
                                                        <>
                                                            <span>•</span>
                                                            <div className="flex gap-1">
                                                                {q.coding_companies.slice(0, 2).map((c, i) => (
                                                                    <span key={i} className="bg-white/5 px-1.5 py-0.5 rounded text-[10px] text-slate-400">
                                                                        {c.company_name}
                                                                    </span>
                                                                ))}
                                                                {q.coding_companies.length > 2 && <span className="text-[10px]">+ {q.coding_companies.length - 2}</span>}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0 translate-x-4">
                                                <ChevronRight className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
