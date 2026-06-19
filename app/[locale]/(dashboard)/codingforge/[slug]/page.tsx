"use client"
export const dynamic = 'force-dynamic';

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
        <div className="text-[#171717] flex flex-col items-center justify-center h-[60vh]">
            <h1 className="text-2xl font-bold mb-4">Problem Not Found</h1>
            <a href={`/${locale}/codingforge`} className="text-[#0070F3] hover:underline font-medium">Back to Library</a>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-140px)] bg-[#FAFAFA] text-[#171717] p-4 md:p-6 rounded-xl">
            {/* Left Panel: Problem Description */}
            <div className="overflow-y-auto pr-4 custom-scrollbar space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-[#171717] mb-2 tracking-tight">{problem.title}</h1>
                    <div className="flex gap-3">
                        <span className={`text-xs px-2.5 py-0.5 rounded border font-semibold ${
                            problem.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            problem.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                            {problem.difficulty}
                        </span>
                        <span className="text-xs text-[#8F8F8F] font-semibold flex items-center">{problem.topic}</span>
                    </div>
                </div>

                <div className="prose max-w-none text-[#4D4D4D] text-sm leading-relaxed">
                    <h3 className="text-[10px] font-mono text-[#8F8F8F] uppercase tracking-wider mb-2">Description</h3>
                    <p className="whitespace-pre-wrap font-sans">{problem.problem_statement}</p>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-[10px] font-mono text-[#8F8F8F] uppercase tracking-wider mb-2">Example Input</h3>
                        <pre className="p-4 rounded-lg bg-[#FFFFFF] border border-[#EBEBEB] text-xs text-[#171717] overflow-x-auto font-mono">
                            {problem.input_example}
                        </pre>
                    </div>
                    <div>
                        <h3 className="text-[10px] font-mono text-[#8F8F8F] uppercase tracking-wider mb-2">Example Output</h3>
                        <pre className="p-4 rounded-lg bg-[#FFFFFF] border border-[#EBEBEB] text-xs text-[#171717] overflow-x-auto font-mono">
                            {problem.output_example}
                        </pre>
                    </div>
                    {problem.constraints && problem.constraints.length > 0 && (
                        <div>
                            <h3 className="text-[10px] font-mono text-[#8F8F8F] uppercase tracking-wider mb-2">Constraints</h3>
                            <ul className="list-disc list-inside space-y-1.5 text-[#4D4D4D] text-xs">
                                {problem.constraints.map((c, i) => <li key={i} className="font-medium">{c}</li>)}
                            </ul>
                        </div>
                    )}
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
