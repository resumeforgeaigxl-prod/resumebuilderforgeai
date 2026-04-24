"use client"
export const dynamic = 'force-dynamic';
;

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import CodeEditor from '@/components/codingforge/CodeEditor';
import OutputConsole from '@/components/codingforge/OutputConsole';

interface Problem {
    id: string;
    title: string;
    slug: string;
    problem_statement: string;
    difficulty: string;
    topic: string;
    pattern: string;
    input_example: string;
    output_example: string;
    constraints: string[];
}

interface ExecutionResult {
    stdout?: string;
    stderr?: string;
    status?: string;
    execution_time?: number;
    error?: string;
    remaining?: number;
}

export default function ProblemDetailPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const locale = params?.locale as string;
    const [problem, setProblem] = useState<Problem | null>(null);
    const [loading, setLoading] = useState(true);
    const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);

    useEffect(() => {
        async function fetchProblem() {
            const supabase = createClient();
            const { data } = await supabase
                .from('coding_problems')
                .select('*')
                .eq('slug', slug)
                .single();

            if (data) setProblem(data);
            setLoading(false);
        }
        fetchProblem();
    }, [slug]);

    if (loading) return (
        <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );

    if (!problem) return (
        <div className="text-white flex flex-col items-center justify-center h-[60vh]">
            <h1 className="text-2xl font-bold mb-4">Problem Not Found</h1>
            <a href={`/${locale}/codingforge`} className="text-blue-400 hover:underline">Back to Library</a>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-140px)]">
            {/* Left Panel: Problem Description */}
            <div className="overflow-y-auto pr-4 custom-scrollbar">
                <h1 className="text-3xl font-extrabold text-white mb-2">{problem.title}</h1>
                <div className="flex gap-3 mb-6">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400' :
                        problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' :
                            'bg-red-500/10 text-red-400'
                        }`}>
                        {problem.difficulty}
                    </span>
                    <span className="text-xs text-slate-500">{problem.topic}</span>
                </div>

                <div className="prose prose-invert max-w-none mb-8">
                    <h3 className="text-lg font-bold text-white mb-2 font-black uppercase tracking-widest text-[10px]">Description</h3>
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">{problem.problem_statement}</p>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-[10px] font-black text-white mb-2 uppercase tracking-widest">Example Input</h3>
                        <pre className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-blue-300 overflow-x-auto font-mono">
                            {problem.input_example}
                        </pre>
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black text-white mb-2 uppercase tracking-widest">Example Output</h3>
                        <pre className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-green-300 overflow-x-auto font-mono">
                            {problem.output_example}
                        </pre>
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black text-white mb-2 uppercase tracking-widest">Constraints</h3>
                        <ul className="list-disc list-inside space-y-1 text-slate-400 text-sm">
                            {problem.constraints?.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Right Panel: Editor & Console */}
            <div className="flex flex-col gap-6 h-full overflow-hidden">
                <div className="flex-1 min-h-0">
                    <CodeEditor
                        problemId={problem.id}
                        onResult={setExecutionResult}
                    />
                </div>
                <div className="h-[250px] shrink-0">
                    <OutputConsole result={executionResult} />
                </div>
            </div>
        </div>
    );
}
