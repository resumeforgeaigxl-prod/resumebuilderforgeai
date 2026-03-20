"use client";

import React, { useState, useEffect } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import ts from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml'; // for HTML/XML
import css from 'react-syntax-highlighter/dist/esm/languages/hljs/css';
import sql from 'react-syntax-highlighter/dist/esm/languages/hljs/sql';
import cpp_lang from 'react-syntax-highlighter/dist/esm/languages/hljs/cpp';
import python_lang from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import java_lang from 'react-syntax-highlighter/dist/esm/languages/hljs/java';
import atomOneDark from 'react-syntax-highlighter/dist/esm/styles/hljs/atom-one-dark';
import { Play, Loader2, X, Terminal, Zap } from 'lucide-react';
import type { ExecutionResult } from '@/lib/code-execution';

SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('typescript', ts);
SyntaxHighlighter.registerLanguage('html', xml);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('sql', sql);
SyntaxHighlighter.registerLanguage('cpp', cpp_lang);
SyntaxHighlighter.registerLanguage('python', python_lang);
SyntaxHighlighter.registerLanguage('java', java_lang);

interface CodeViewerProps {
    code: string;
    path: string;
}

export default function CodeViewer({ code, path }: CodeViewerProps) {
    const [isRunning, setIsRunning] = useState(false);
    const [result, setResult] = useState<ExecutionResult | null>(null);
    const [showConsole, setShowConsole] = useState(false);
    const [credits, setCredits] = useState<number | null>(null);

    useEffect(() => {
        const fetchCredits = async () => {
            try {
                const res = await fetch('/api/run-code/credits');
                if (res.ok) {
                    const data = await res.json();
                    setCredits(data.credits);
                }
            } catch (err) {
                console.error("Failed to fetch credits", err);
            }
        };
        fetchCredits();
    }, []);

    const getLanguage = (filePath: string) => {
        const ext = filePath.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'js':
                return 'javascript';
            case 'py':
                return 'python';
            case 'java':
                return 'java';
            case 'cpp':
            case 'c':
                return 'cpp';
            case 'jsx':
                return 'javascript';
            case 'ts':
            case 'tsx':
                return 'typescript';
            case 'html':
                return 'html';
            case 'css':
                return 'css';
            case 'sql':
                return 'sql';
            default:
                return 'text';
        }
    };

    const isRunnable = (filePath: string) => {
        const ext = filePath.split('.').pop()?.toLowerCase();
        return ['js', 'py', 'java', 'cpp', 'c'].includes(ext || '');
    };

    const handleRunCode = async () => {
        setShowConsole(true);
        setIsRunning(true);
        setResult(null);

        try {
            const ext = path.split('.').pop()?.toLowerCase();
            const languageMap: Record<string, string> = {
                'js': 'javascript',
                'py': 'python',
                'java': 'java',
                'cpp': 'cpp',
                'c': 'c'
            };
            
            const res = await fetch('/api/run-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    language: languageMap[ext || ''] || 'javascript', 
                    code,
                    problemId: 'projectforge'
                }),
            });
            const data = await res.json();
            
            if (res.ok) {
                setResult(data);
                setCredits(prev => (prev !== null ? prev - 1 : null));
            } else {
                setResult({ error: data.error || 'Execution failed' });
            }
        } catch {
            setResult({ error: 'Failed to execute code' });
        }
        setIsRunning(false);
    };

    const language = getLanguage(path);
    const runnable = isRunnable(path);

    return (
        <div className="h-full w-full overflow-hidden bg-[#0d0d1a] border-b border-white/5 flex flex-col relative">
            <div className="px-4 py-2 border-b border-white/5 bg-[#0a0a15] flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">{path}</span>
                    <span className="text-[10px] font-bold text-slate-600 uppercase bg-white/5 px-2 py-0.5 rounded">
                        {language}
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    {credits !== null && runnable && (
                        <div className="hidden md:flex flex-col items-end">
                            <div className="flex items-center gap-1.5 text-[9px] font-black text-amber-500 uppercase tracking-widest leading-none mb-1">
                                <Zap className="w-2.5 h-2.5" />
                                1 Unit
                            </div>
                            <div className="text-[8px] text-slate-500 font-bold uppercase tracking-wider leading-none">
                                Units: {credits}
                            </div>
                        </div>
                    )}
                    
                    {runnable && (
                        <button
                            onClick={handleRunCode}
                            disabled={isRunning || (credits !== null && credits <= 0)}
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                                isRunning 
                                    ? 'bg-zinc-800 text-zinc-500 cursor-wait' 
                                    : (credits !== null && credits <= 0)
                                        ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed'
                                        : 'bg-green-600/20 hover:bg-green-600 text-green-500 hover:text-white border border-green-500/20 active:scale-95'
                            }`}
                        >
                            {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                            Run Code
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                <SyntaxHighlighter
                    language={language}
                    style={atomOneDark}
                    customStyle={{
                        background: 'transparent',
                        padding: '0',
                        fontSize: '14px',
                        fontFamily: 'var(--font-geist-mono)',
                    }}
                    showLineNumbers={true}
                    lineNumberStyle={{ minWidth: '2.5em', paddingRight: '1em', color: '#334155' }}
                >
                    {code}
                </SyntaxHighlighter>
            </div>

            {/* In-view Console Overlay */}
            {showConsole && (
                <div className="absolute bottom-4 right-4 left-4 max-h-[40%] bg-[#08080f]/95 backdrop-blur-3xl border border-white/10 rounded-[1.5rem] shadow-2xl flex flex-col overflow-hidden animate-slide-up z-20">
                    <div className="px-5 py-3 border-b border-white/5 bg-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-blue-400" />
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Materialization Engine Output</span>
                        </div>
                        <button 
                            onClick={() => setShowConsole(false)}
                            className="p-1 rounded-full hover:bg-white/10 text-slate-400 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex-1 p-6 font-mono text-sm overflow-y-auto custom-scrollbar min-h-[100px]">
                        {isRunning ? (
                            <div className="flex items-center gap-3 text-slate-500 italic animate-pulse">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing in Neural Core...
                            </div>
                        ) : result ? (
                            <div className="space-y-4">
                                {result.error && (
                                    <div className="text-red-400 font-bold bg-red-400/5 p-3 rounded-lg border border-red-400/10">
                                        SYSTEM ERROR: {result.error}
                                    </div>
                                )}
                                {result.stderr && (
                                    <div className="text-red-300 whitespace-pre-wrap bg-red-950/20 p-4 rounded-xl border border-red-900/10">
                                        {result.stderr}
                                    </div>
                                )}
                                {result.stdout && (
                                    <div className="text-slate-100 whitespace-pre-wrap bg-white/5 p-4 rounded-xl border border-white/5 leading-relaxed">
                                        {result.stdout}
                                    </div>
                                )}
                                {!result.stdout && !result.stderr && !result.error && (
                                    <div className="text-slate-500 italic">No signal output detected.</div>
                                )}
                                
                                <div className="pt-4 border-t border-white/5 flex items-center justify-between opacity-50">
                                    <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest italic">
                                        Status: {result.status || 'Verified'}
                                    </div>
                                    {result.execution_time !== undefined && (
                                        <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest italic">
                                            Cycle Time: {result.execution_time}s
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
}
