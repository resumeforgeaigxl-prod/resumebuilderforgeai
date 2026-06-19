"use client"
export const dynamic = 'force-dynamic';

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
    const params = useParams() as { locale: string };
    const { locale } = params;

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
                let url = `/api/codingforge/questions?t=${Date.now()}&`;
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
        <div className="min-h-screen bg-[#FAFAFA] text-[#171717]">
            <main className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-[#EBEBEB] pb-8">
                    <div>
                        <h1 className="text-3xl font-semibold text-[#171717] mb-2 tracking-tight">Problem Library</h1>
                        <p className="text-[#8F8F8F] font-medium text-sm">Explore 100+ high-yield interview questions.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative group w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F8F8F] group-focus-within:text-[#171717] transition-colors" />
                            <input
                                type="text"
                                placeholder="Search problems, topics..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-11 pr-6 py-2.5 rounded-md bg-[#FFFFFF] border border-[#EBEBEB] text-sm focus:outline-none focus:ring-1 focus:ring-[#171717] focus:border-[#171717] transition-all w-full text-[#171717] font-normal placeholder:text-[#8F8F8F]"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Filters Sidebar */}
                    <aside className="lg:col-span-3 space-y-8">
                        <div className="p-6 rounded-xl bg-[#FFFFFF] border border-[#EBEBEB] shadow-sm">
                            <h3 className="text-xs font-semibold text-[#171717] uppercase tracking-wider mb-6 flex items-center gap-2">
                                <Filter className="w-4 h-4 text-[#171717]" />
                                Filters
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-mono text-[#8F8F8F] uppercase tracking-wider block mb-4">Category</label>
                                    <div className="space-y-2">
                                        {['', 'Programming', 'SQL', 'Debugging', 'Logic'].map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => setFilterType(t)}
                                                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold transition-all border ${filterType === t
                                                        ? 'bg-[#171717] text-[#FFFFFF] border-[#171717] shadow-sm'
                                                        : 'bg-[#FFFFFF] text-[#4D4D4D] border-[#EBEBEB] hover:border-[#171717]/30 hover:bg-[#FAFAFA] hover:text-[#171717]'
                                                    }`}
                                            >
                                                {t || 'All Categories'}
                                                {filterType === t && <CheckCircle2 className="w-3.5 h-3.5" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-mono text-[#8F8F8F] uppercase tracking-wider block mb-4">Difficulty</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['', 'Easy', 'Medium', 'Hard'].map((d) => (
                                            <button
                                                key={d}
                                                onClick={() => setFilterDifficulty(d)}
                                                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all border ${filterDifficulty === d
                                                        ? 'bg-[#171717] text-[#FFFFFF] border-[#171717] shadow-sm'
                                                        : 'bg-[#FFFFFF] text-[#4D4D4D] border-[#EBEBEB] hover:border-[#171717]/30 hover:bg-[#FAFAFA] hover:text-[#171717]'
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
                            <div className="p-5 rounded-xl bg-[#0070F3]/5 border border-[#0070F3]/10">
                                <p className="text-xs font-semibold text-[#0070F3] flex items-center gap-2 mb-1">
                                    <Building2 className="w-3.5 h-3.5" /> Filtered by Company
                                </p>
                                <p className="text-sm font-semibold text-[#171717]">{initialCompany}</p>
                                <button
                                    onClick={() => router.push(`/${locale}/codingforge/questions`)}
                                    className="text-[10px] font-semibold text-[#8F8F8F] hover:text-[#171717] mt-3 uppercase tracking-wider underline"
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
                                    <div key={i} className="h-24 rounded-xl bg-[#FFFFFF] animate-pulse border border-[#EBEBEB]"></div>
                                ))}
                            </div>
                        ) : questions.length === 0 ? (
                            <div className="p-20 text-center rounded-xl bg-[#FFFFFF] border border-dashed border-[#EBEBEB]">
                                <Search className="w-12 h-12 text-[#8F8F8F] mx-auto mb-4" />
                                <h3 className="text-base font-semibold text-[#171717] mb-2">No problems found</h3>
                                <p className="text-[#8F8F8F] text-xs">Try adjusting your filters or search query.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {questions.map((q) => (
                                    <Link
                                        key={q.id}
                                        href={`/${locale}/codingforge/question/${q.slug}`}
                                        className="p-6 rounded-xl bg-[#FFFFFF] border border-[#EBEBEB] hover:border-[#171717]/25 hover:shadow-[0_2px_4px_rgba(0,0,0,0.02),0_8px_16px_rgba(0,0,0,0.04)] transition-all flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className={`p-3.5 rounded-lg border ${
                                                q.type === 'Programming' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                q.type === 'SQL' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                q.type === 'Debugging' ? 'bg-pink-50 text-pink-600 border-pink-100' :
                                                'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            }`}>
                                                {getTypeIcon(q.type)}
                                            </div>
                                            <div>
                                                <h3 className="text-base font-semibold text-[#171717] mb-1 group-hover:text-[#0070F3] transition-colors">
                                                    {q.title}
                                                </h3>
                                                <div className="flex items-center gap-4 text-xs text-[#8F8F8F]">
                                                    <span className={`${
                                                        q.difficulty === 'Easy' ? 'text-emerald-600 font-semibold' :
                                                        q.difficulty === 'Medium' ? 'text-amber-600 font-semibold' :
                                                        'text-rose-600 font-semibold'
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
                                                                    <span key={i} className="bg-[#FAFAFA] border border-[#EBEBEB] px-2 py-0.5 rounded text-[10px] text-[#4D4D4D] font-medium">
                                                                        {c.company_name}
                                                                    </span>
                                                                ))}
                                                                {q.coding_companies.length > 2 && <span className="text-[10px] font-mono text-[#8F8F8F]">+ {q.coding_companies.length - 2}</span>}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="p-2 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0 translate-x-4">
                                                <ChevronRight className="w-4 h-4 text-[#171717]" />
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
