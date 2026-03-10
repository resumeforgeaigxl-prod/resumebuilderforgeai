"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import java from 'react-syntax-highlighter/dist/esm/languages/hljs/java';
import cpp from 'react-syntax-highlighter/dist/esm/languages/hljs/cpp';
import sql from 'react-syntax-highlighter/dist/esm/languages/hljs/sql';
import atomOneDark from 'react-syntax-highlighter/dist/esm/styles/hljs/atom-one-dark';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    Code2,
    BookOpen,
    Lightbulb,
    MessageSquare,
    ChevronLeft,
    Sparkles,
    Globe,
    Building2,
    BrainCircuit,
    Timer,
    Layers
} from 'lucide-react';

// Register languages
SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('sql', sql);

interface Solution {
    language: string;
    code: string;
}

interface Company {
    company_name: string;
}

interface Question {
    id: string;
    title: string;
    slug: string;
    description: string;
    approach: string;
    concept_explanation: string;
    interview_tips: string;
    time_complexity: string;
    space_complexity: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    type: 'Programming' | 'SQL' | 'Debugging' | 'Logic';
    topic: string;
    image_svg: string | null;
    coding_solutions: Solution[];
    coding_companies: Company[];
}

export default function QuestionDetailPage() {
    const params = useParams() as { region: string; lang: string; slug: string };
    const router = useRouter();
    const { region, lang, slug } = params;

    const [question, setQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedLang, setSelectedLang] = useState('');
    const [aiExplanation, setAiExplanation] = useState('');
    const [explaining, setExplaining] = useState(false);
    const [activeTab, setActiveTab] = useState<'solution' | 'approach' | 'tips'>('solution');

    useEffect(() => {
        async function fetchDetail() {
            try {
                const res = await fetch(`/api/codingforge/questions/detail?slug=${slug}`);
                const data = await res.json();
                if (data && !data.error) {
                    setQuestion(data);
                    if (data.coding_solutions?.length > 0) {
                        setSelectedLang(data.coding_solutions[0].language);
                    }
                }
            } catch (err) {
                console.error("Error fetching question:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchDetail();
    }, [slug]);

    const handleExplain = async () => {
        if (!question || explaining) return;
        setExplaining(true);
        const currentCode = question.coding_solutions.find(s => s.language === selectedLang)?.code;

        try {
            const res = await fetch('/api/codingforge/explain', {
                method: 'POST',
                body: JSON.stringify({
                    code: currentCode,
                    language: selectedLang,
                    context: `Problem: ${question.title}. Category: ${question.topic}`
                })
            });
            const data = await res.json();
            setAiExplanation(data.explanation || 'Failed to generate explanation.');
        } catch {
            setAiExplanation('Error calling AI service.');
        } finally {
            setExplaining(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );

    if (!question) return (
        <div className="text-white flex flex-col items-center justify-center h-[60vh]">
            <h1 className="text-2xl font-bold mb-4">Question Not Found</h1>
            <button onClick={() => router.back()} className="text-blue-400 hover:underline">Go Back</button>
        </div>
    );

    const currentSolution = question.coding_solutions.find(s => s.language === selectedLang);

    return (
        <div className="min-h-screen bg-[#070710] text-slate-200">
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Navigation & Title */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push(`/${region}/${lang}/codingforge/questions`)}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 group"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Library
                    </button>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-md font-bold ${question.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                    question.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                        'bg-red-500/10 text-red-500 border border-red-500/20'
                                    }`}>
                                    {question.difficulty}
                                </span>
                                <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-md font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    {question.type}
                                </span>
                                <span className="text-xs text-slate-500 font-medium">#{question.topic}</span>
                            </div>
                            <h1 className="text-4xl font-extrabold text-white tracking-tight">{question.title}</h1>
                        </div>

                        {question.coding_companies?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {question.coding_companies.map((c, i) => (
                                    <div key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400">
                                        <Building2 className="w-3 h-3" />
                                        {c.company_name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left: Description & Theory */}
                    <div className="lg:col-span-5 space-y-8">
                        <section className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                            <div className="flex items-center gap-2 mb-4 text-white">
                                <BookOpen className="w-5 h-5 text-blue-400" />
                                <h2 className="text-xl font-bold">Problem Description</h2>
                            </div>
                            <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed prose-code:bg-white/10 prose-code:px-1 prose-code:rounded">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {question.description}
                                </ReactMarkdown>
                            </div>

                            {/* Complexity Badges */}
                            <div className="flex gap-4 mt-6 p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-2">
                                    <Timer className="w-4 h-4 text-indigo-400" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">Time</span>
                                        <span className="text-xs font-bold text-white">{question.time_complexity || 'O(N)'}</span>
                                    </div>
                                </div>
                                <div className="w-px h-8 bg-white/10"></div>
                                <div className="flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-purple-400" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">Space</span>
                                        <span className="text-xs font-bold text-white">{question.space_complexity || 'O(1)'}</span>
                                    </div>
                                </div>
                            </div>

                            {question.image_svg && (
                                <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                    <div
                                        className="w-full h-auto max-w-md mx-auto aspect-video flex items-center justify-center"
                                        dangerouslySetInnerHTML={{ __html: question.image_svg }}
                                    />
                                </div>
                            )}
                        </section>

                        <div className="flex gap-2 p-1 rounded-2xl bg-white/5 border border-white/10 w-fit">
                            <button
                                onClick={() => setActiveTab('solution')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'solution' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <Code2 className="w-3.5 h-3.5 inline mr-2" /> Solution
                            </button>
                            <button
                                onClick={() => setActiveTab('approach')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'approach' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <BrainCircuit className="w-3.5 h-3.5 inline mr-2" /> Approach
                            </button>
                            <button
                                onClick={() => setActiveTab('tips')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'tips' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <Lightbulb className="w-3.5 h-3.5 inline mr-2" /> Interview Tips
                            </button>
                        </div>

                        {activeTab === 'approach' && (
                            <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/20">
                                    <h3 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
                                        <Globe className="w-4 h-4" /> The Strategy
                                    </h3>
                                    <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed prose-code:bg-white/10 prose-code:px-1 prose-code:rounded">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {question.approach}
                                        </ReactMarkdown>
                                    </div>
                                    <div className="mt-6 p-4 rounded-2xl bg-black/40 border border-white/5">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Core Concept</h4>
                                        <div className="prose prose-invert max-w-none text-slate-400 text-sm">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {question.concept_explanation}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {activeTab === 'tips' && (
                            <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="p-6 rounded-3xl bg-yellow-500/5 border border-yellow-500/20">
                                    <h3 className="text-yellow-500 font-bold mb-3 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" /> Pro Interview Tips
                                    </h3>
                                    <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed prose-code:bg-white/10 prose-code:px-1 prose-code:rounded">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {question.interview_tips}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right: Code & AI */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="rounded-3xl bg-[#0d0d1a] border border-white/10 overflow-hidden shadow-2xl">
                            {/* Editor Header */}
                            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                                    {question.coding_solutions.map((s) => (
                                        <button
                                            key={s.language}
                                            onClick={() => setSelectedLang(s.language)}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${selectedLang === s.language
                                                ? 'bg-blue-600 text-white border-blue-500'
                                                : 'bg-white/5 text-slate-500 border-white/5 hover:border-white/10'
                                                }`}
                                        >
                                            {s.language}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={handleExplain}
                                    disabled={explaining}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {explaining ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Analysing...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Sparkles className="w-3.5 h-3.5" /> Explain with AI
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Code View */}
                            <div className="relative group">
                                <SyntaxHighlighter
                                    language={selectedLang.toLowerCase()}
                                    style={atomOneDark}
                                    customStyle={{
                                        margin: 0,
                                        padding: '24px',
                                        fontSize: '13px',
                                        background: 'transparent',
                                        minHeight: '400px'
                                    }}
                                >
                                    {currentSolution?.code || '// No solution available'}
                                </SyntaxHighlighter>
                            </div>
                        </div>

                        {/* AI Explanation Result */}
                        {(explaining || aiExplanation) && (
                            <section className="animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="p-8 rounded-3xl bg-gradient-to-b from-white/10 to-transparent border border-white/10">
                                    <div className="flex items-center gap-2 mb-6 text-white">
                                        <div className="p-2 rounded-xl bg-purple-500/20">
                                            <MessageSquare className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold">AI Analysis</h3>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Powered by Gemini Flash</p>
                                        </div>
                                    </div>
                                    <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed prose-code:text-blue-400 prose-strong:text-white prose-headings:text-indigo-400">
                                        {explaining ? (
                                            <div className="space-y-4">
                                                <div className="h-4 bg-white/5 rounded-full w-3/4 animate-pulse"></div>
                                                <div className="h-4 bg-white/5 rounded-full w-1/2 animate-pulse"></div>
                                                <div className="h-4 bg-white/5 rounded-full w-5/6 animate-pulse"></div>
                                            </div>
                                        ) : (
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {aiExplanation}
                                            </ReactMarkdown>
                                        )}
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
