'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, BookOpen, Code2, Loader2 } from 'lucide-react';

interface CodeExample {
    title: string;
    code: string;
    language: string;
}

interface PracticeQuestion {
    question: string;
    answer: string;
    hint: string;
}

interface TopicContent {
    overview: string;
    explanation: string;
    code_examples: CodeExample[];
    key_points: string[];
    practice_questions: PracticeQuestion[];
}

interface TopicResponse {
    id: string;
    title: string;
    slug: string;
    languages: {
        id: string;
        name: string;
        slug: string;
    };
    content_json: TopicContent;
}

export default function LearningTopicPage() {
    const params = useParams() as { region: string; lang: string; language: string; topic: string };
    const { region, lang, language, topic } = params;

    const [topicData, setTopicData] = useState<TopicResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setNotFound(false);
        setLoadError(null);

        fetch(`/api/careerforge/library/${language}/${topic}`)
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    setTopicData(data.topic as TopicResponse);
                } else {
                    setTopicData(null);
                    if (data.error === 'Topic not found') {
                        setNotFound(true);
                    } else {
                        setLoadError(data.error || 'Unable to load topic content right now.');
                    }
                }
                setLoading(false);
            })
            .catch(() => {
                setTopicData(null);
                setLoadError('Unable to load topic content right now. Please refresh and try again.');
                setLoading(false);
            });
    }, [language, topic]);

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-6">
                <h1 className="text-2xl font-black text-white uppercase tracking-tight">Topic not found</h1>
                <Link
                    href={`/${region}/${lang}/careerforge/library/${language}`}
                    className="text-indigo-400 text-sm font-bold"
                >
                    Back to Topic List
                </Link>
            </div>
        );
    }

    if (!topicData) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-6">
                <h1 className="text-2xl font-black text-white uppercase tracking-tight">Preparing Topic Content</h1>
                <p className="text-slate-400 max-w-md text-sm">
                    {loadError || 'We are generating and loading this topic. Please refresh in a moment.'}
                </p>
                <Link
                    href={`/${region}/${lang}/careerforge/library/${language}`}
                    className="text-indigo-400 text-sm font-bold"
                >
                    Back to Topic List
                </Link>
            </div>
        );
    }

    const content = topicData.content_json;

    return (
        <div className="max-w-5xl mx-auto pt-28 pb-24 px-6 space-y-10">
            <div className="space-y-5">
                <Link
                    href={`/${region}/${lang}/careerforge/library/${language}`}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
                >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Topic List
                </Link>

                <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 p-10 space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1">
                        <BookOpen className="w-4 h-4 text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                            {topicData.languages.name}
                        </span>
                    </div>
                    <h1 className="text-5xl font-black text-white uppercase tracking-tight">{topicData.title}</h1>
                </div>
            </div>

            <section className="rounded-[2rem] border border-white/10 bg-[#0a0a16] p-8 space-y-3">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Overview</h2>
                <p className="text-slate-300 leading-relaxed">{content.overview}</p>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-[#0a0a16] p-8 space-y-3">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Explanation</h2>
                <div className="space-y-4">
                    {content.explanation.split('\n').filter((line) => line.trim().length > 0).map((line, index) => (
                        <p key={`${line}-${index}`} className="text-slate-300 leading-relaxed">{line}</p>
                    ))}
                </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-[#0a0a16] p-8 space-y-6">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <Code2 className="w-6 h-6 text-emerald-400" /> Code examples
                </h2>
                <div className="space-y-4">
                    {content.code_examples.map((example, index) => (
                        <div key={`${example.title}-${index}`} className="rounded-2xl border border-white/10 overflow-hidden">
                            <div className="px-5 py-3 bg-white/5 flex items-center justify-between">
                                <span className="text-sm font-bold text-white">{example.title}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                                    {example.language}
                                </span>
                            </div>
                            <pre className="p-5 text-sm text-slate-200 overflow-x-auto whitespace-pre-wrap">
                                <code>{example.code}</code>
                            </pre>
                        </div>
                    ))}
                </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-[#0a0a16] p-8 space-y-4">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Key points</h2>
                <ul className="space-y-3">
                    {content.key_points.map((point, index) => (
                        <li key={`${point}-${index}`} className="flex gap-3 text-slate-300">
                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                            <span>{point}</span>
                        </li>
                    ))}
                </ul>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-[#0a0a16] p-8 space-y-4">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Practice questions</h2>
                <div className="space-y-4">
                    {content.practice_questions.map((question, index) => (
                        <details key={`${question.question}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <summary className="cursor-pointer list-none text-white font-bold">
                                {index + 1}. {question.question}
                            </summary>
                            <div className="mt-4 space-y-3 text-sm text-slate-300">
                                <p><span className="text-indigo-400 font-bold">Hint:</span> {question.hint}</p>
                                <p><span className="text-emerald-400 font-bold">Answer:</span> {question.answer}</p>
                            </div>
                        </details>
                    ))}
                </div>
            </section>
        </div>
    );
}
