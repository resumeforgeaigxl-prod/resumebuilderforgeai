"use client"
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import java from 'react-syntax-highlighter/dist/esm/languages/hljs/java';
import cpp from 'react-syntax-highlighter/dist/esm/languages/hljs/cpp';
import sql from 'react-syntax-highlighter/dist/esm/languages/hljs/sql';
import atomOneLight from 'react-syntax-highlighter/dist/esm/styles/hljs/atom-one-light';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    ChevronLeft,
    Building2,
    Lightbulb
} from 'lucide-react';
import CodeEditor from '@/components/codingforge/CodeEditor';
import OutputConsole from '@/components/codingforge/OutputConsole';
import type { ExecutionResult } from '@/lib/code-execution';

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

const EXPLANATION_SECTION_ORDER = [
    'Problem Understanding',
    'Intuition & Approach',
    'Code Walkthrough',
    'Complexity Analysis (Time & Space)',
    'Edge Cases & Tips',
] as const;

type ExplanationSectionTitle = (typeof EXPLANATION_SECTION_ORDER)[number];
type StructuredExplanation = Record<ExplanationSectionTitle, string>;

type ExplanationChunk =
    | { type: 'markdown'; content: string }
    | { type: 'code'; language: string; content: string };

function parseStructuredExplanation(markdown: string): StructuredExplanation {
    const sections: StructuredExplanation = {
        'Problem Understanding': '',
        'Intuition & Approach': '',
        'Code Walkthrough': '',
        'Complexity Analysis (Time & Space)': '',
        'Edge Cases & Tips': '',
    };
    
    if (!markdown) return sections;

    const lines = markdown.split('\n');
    let currentSection: ExplanationSectionTitle | null = null;

    for (const line of lines) {
        if (line.startsWith('## ')) {
            const title = line.replace('## ', '').trim() as ExplanationSectionTitle;
            if (EXPLANATION_SECTION_ORDER.includes(title)) {
                currentSection = title;
                continue;
            }
        }
        if (currentSection) {
            sections[currentSection] += line + '\n';
        }
    }

    // Fallback if no headings found
    if (!currentSection) {
        sections['Problem Understanding'] = markdown;
    }

    return sections;
}

function splitMarkdownAndCodeBlocks(markdown: string): ExplanationChunk[] {
    if (!markdown.trim()) return [];
    const chunks: ExplanationChunk[] = [];
    const codeBlockRegex = /```([a-zA-Z0-9_+\-]*)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    while (true) {
        const match = codeBlockRegex.exec(markdown);
        if (!match) break;
        const before = markdown.slice(lastIndex, match.index).trim();
        if (before) chunks.push({ type: 'markdown', content: before });
        chunks.push({ type: 'code', language: match[1] || 'text', content: match[2].trimEnd() });
        lastIndex = codeBlockRegex.lastIndex;
    }
    const trailing = markdown.slice(lastIndex).trim();
    if (trailing) chunks.push({ type: 'markdown', content: trailing });
    return chunks;
}

export default function QuestionDetailPage() {
    const params = useParams() as { locale: string; slug: string };
    const router = useRouter();
    const { locale, slug } = params;

    const [question, setQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(true);
    const [aiExplanation, setAiExplanation] = useState('');
    const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
    const [activeTab, setActiveTab] = useState<'problem' | 'solution' | 'tips'>('problem');

    useEffect(() => {
        async function fetchDetail() {
            try {
                const res = await fetch(`/api/codingforge/questions/detail?slug=${slug}`);
                const data = await res.json();
                if (data && !data.error) {
                    setQuestion(data);
                }
            } catch (err) {
                console.error("Error fetching question:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchDetail();
    }, [slug]);

    if (loading) return (
        <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );

    if (!question) return (
        <div className="text-[#171717] flex flex-col items-center justify-center h-[60vh]">
            <h1 className="text-2xl font-bold mb-4">Question Not Found</h1>
            <button onClick={() => router.back()} className="text-[#0070F3] hover:underline">Go Back</button>
        </div>
    );

    const structuredExplanation = parseStructuredExplanation(aiExplanation);

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-[#171717]">
            <main className="max-w-[1800px] mx-auto px-6 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 border-b border-[#EBEBEB] pb-6">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => router.push(`/${locale}/codingforge/questions`)}
                            className="p-2.5 rounded-lg bg-white border border-[#EBEBEB] hover:bg-[#FAFAFA] transition-all text-[#4D4D4D] hover:text-[#171717]"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                    question.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                    question.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                                    'bg-rose-50 text-rose-700 border-rose-100'
                                }`}>
                                    {question.difficulty}
                                </span>
                                <span className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                                    {question.topic}
                                </span>
                            </div>
                            <h1 className="text-2xl font-semibold text-[#171717] tracking-tight">{question.title}</h1>
                        </div>
                    </div>
                    
                    {question.coding_companies?.length > 0 && (
                        <div className="hidden lg:flex items-center gap-2">
                            {question.coding_companies.slice(0, 3).map((c, i) => (
                                <div key={i} className="px-3 py-1 rounded-md bg-white border border-[#EBEBEB] text-[10px] font-semibold text-[#4D4D4D] flex items-center gap-2">
                                    <Building2 size={12} /> {c.company_name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-180px)]">
                    {/* Left: Problem Statement & AI */}
                    <div className="flex flex-col gap-6 overflow-hidden">
                        <div className="flex gap-2 p-1.5 rounded-lg bg-[#F2F2F2] border border-[#EBEBEB] w-fit">
                            <button onClick={() => setActiveTab('problem')} className={`px-4 py-2 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all ${activeTab === 'problem' ? 'bg-white text-[#171717] shadow-sm font-bold' : 'text-[#4D4D4D] hover:text-[#171717]'}`}>Problem</button>
                            <button onClick={() => setActiveTab('solution')} className={`px-4 py-2 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all ${activeTab === 'solution' ? 'bg-white text-[#171717] shadow-sm font-bold' : 'text-[#4D4D4D] hover:text-[#171717]'}`}>AI Analysis</button>
                            <button onClick={() => setActiveTab('tips')} className={`px-4 py-2 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all ${activeTab === 'tips' ? 'bg-white text-[#171717] shadow-sm font-bold' : 'text-[#4D4D4D] hover:text-[#171717]'}`}>Manual Approach</button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
                            {activeTab === 'problem' && (
                                <section className="space-y-8 animate-in fade-in duration-300">
                                    <div className="prose max-w-none text-[#4D4D4D] text-sm leading-relaxed whitespace-pre-wrap">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{question.description}</ReactMarkdown>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-5 rounded-xl bg-white border border-[#EBEBEB] shadow-sm">
                                            <span className="text-[9px] font-semibold text-[#0070F3] uppercase tracking-wider block mb-2">Time Complexity</span>
                                            <p className="text-sm font-bold text-[#171717]">{question.time_complexity || 'O(N)'}</p>
                                        </div>
                                        <div className="p-5 rounded-xl bg-white border border-[#EBEBEB] shadow-sm">
                                            <span className="text-[9px] font-semibold text-purple-600 uppercase tracking-wider block mb-2">Space Complexity</span>
                                            <p className="text-sm font-bold text-[#171717]">{question.space_complexity || 'O(1)'}</p>
                                        </div>
                                    </div>
                                    
                                    {question.image_svg && (
                                        <div className="rounded-xl bg-white border border-[#EBEBEB] p-8 flex items-center justify-center overflow-hidden shadow-sm" dangerouslySetInnerHTML={{ __html: question.image_svg }} />
                                    )}
                                </section>
                            )}

                            {activeTab === 'solution' && (
                                <section className="space-y-6 animate-in fade-in duration-300">
                                    {!aiExplanation ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
                                                <Lightbulb size={24} />
                                            </div>
                                            <h3 className="text-base font-semibold text-[#171717]">No AI analysis yet</h3>
                                            <p className="max-w-[300px] text-[#8F8F8F] text-xs leading-relaxed font-normal">Use the "AI Explain" button in the editor to generate a detailed breakdown of your solution or the problem.</p>
                                        </div>
                                    ) : (
                                        EXPLANATION_SECTION_ORDER.map((sectionTitle, index) => {
                                            const content = structuredExplanation[sectionTitle];
                                            if (!content) return null;
                                            const chunks = splitMarkdownAndCodeBlocks(content);
                                            return (
                                                <div key={sectionTitle} className="p-6 rounded-xl bg-white border border-[#EBEBEB] space-y-4 shadow-sm">
                                                    <h4 className="text-[10px] font-semibold text-[#0070F3] uppercase tracking-wider">{index + 1}. {sectionTitle}</h4>
                                                    <div className="space-y-4">
                                                        {chunks.map((chunk, i) => chunk.type === 'code' ? (
                                                            <div key={i} className="rounded-lg border border-[#EBEBEB] overflow-hidden bg-[#FAFAFA]">
                                                                <div className="px-3 py-1.5 bg-[#F2F2F2] border-b border-[#EBEBEB] text-[9px] font-semibold uppercase text-[#4D4D4D]">{chunk.language}</div>
                                                                <SyntaxHighlighter language={chunk.language.toLowerCase()} style={atomOneLight} customStyle={{ background: 'transparent', padding: '1rem', margin: 0 }}>{chunk.content}</SyntaxHighlighter>
                                                            </div>
                                                        ) : (
                                                            <div key={i} className="prose max-w-none text-sm leading-relaxed text-[#4D4D4D]">
                                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{chunk.content}</ReactMarkdown>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </section>
                            )}

                            {activeTab === 'tips' && (
                                <section className="space-y-8 animate-in fade-in duration-300">
                                    <div className="p-6 rounded-xl bg-blue-50/20 border border-blue-100 shadow-sm">
                                        <h3 className="text-[#0070F3] font-semibold uppercase tracking-wider text-[10px] mb-4">Algorithm Approach</h3>
                                        <div className="prose max-w-none text-[#4D4D4D] text-sm leading-relaxed"><ReactMarkdown remarkPlugins={[remarkGfm]}>{question.approach}</ReactMarkdown></div>
                                    </div>
                                    <div className="p-6 rounded-xl bg-amber-50/30 border border-amber-100 shadow-sm">
                                        <h3 className="text-[#B76E00] font-semibold uppercase tracking-wider text-[10px] mb-4">Interview Strategy</h3>
                                        <div className="prose max-w-none text-[#4D4D4D] text-sm leading-relaxed"><ReactMarkdown remarkPlugins={[remarkGfm]}>{question.interview_tips}</ReactMarkdown></div>
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>

                    {/* Right: Code Editor & Console */}
                    <div className="flex flex-col gap-6 overflow-hidden h-full">
                        <div className="flex-1 min-h-[400px]">
                            <CodeEditor 
                                problemId={question.id} 
                                problemContext={`Problem: ${question.title}. Category: ${question.topic}. Description: ${question.description}`}
                                onResult={setExecutionResult}
                                onExplainResult={(expl) => {
                                    setAiExplanation(expl);
                                    setActiveTab('solution');
                                }}
                            />
                        </div>
                        <div className="h-[250px] shrink-0">
                            <OutputConsole result={executionResult} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
