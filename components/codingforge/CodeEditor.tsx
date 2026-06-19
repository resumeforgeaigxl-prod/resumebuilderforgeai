"use client";

import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Loader2, Zap, Lightbulb, Copy, RotateCcw } from 'lucide-react';
import type { ExecutionResult } from '../../lib/code-execution';
import { ForgeSoftPaywall } from '../auth/ForgeSoftPaywall';


const STARTER_CODE: Record<string, string> = {
    python: 'def solution():\n    # Write your code here\n    print("Hello from Python!")\n\nsolution()',
    javascript: 'function solution() {\n    // Write your code here\n    console.log("Hello from JavaScript!");\n}\n\nsolution();',
    java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}',
    cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello from C++!" << std::endl;\n    return 0;\n}',
};

type MonacoEditorInstance = Parameters<NonNullable<React.ComponentProps<typeof Editor>['onMount']>>[0];

interface CodeEditorProps {
    problemId: string;
    problemContext?: string;
    onResult: (result: ExecutionResult) => void;
    onExplainResult?: (explanation: string) => void;
}

export default function CodeEditor({ problemId, problemContext, onResult, onExplainResult }: CodeEditorProps) {
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState(STARTER_CODE.python);
    const [isRunning, setIsRunning] = useState(false);
    const [isExplaining, setIsExplaining] = useState(false);
    const [credits, setCredits] = useState<number | null>(null);
    const editorRef = useRef<MonacoEditorInstance | null>(null);

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

    const [showPaywall, setShowPaywall] = useState(false);

    const handleRunCode = async () => {
        if (credits !== null && credits <= 0) {
            onResult({ error: 'Daily run limit reached. Try again tomorrow.' });
            return;
        }

        setIsRunning(true);
        try {
            const res = await fetch('/api/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ language, code, problemId }),
            });
            const data = await res.json();
            
            if (res.ok) {
                setCredits(prev => (prev !== null ? prev - 1 : null));
                onResult(data);
            } else {
                if (data.limitReached) {
                    setShowPaywall(true);
                } else {
                    onResult({ error: data.error || 'Failed to execute code' });
                }
                const credRes = await fetch('/api/run-code/credits');
                const credData = await credRes.json();
                setCredits(credData.credits);
            }
        } catch (err) {
            console.error('Code execution failed:', err);
            onResult({ error: 'Failed to execute code. Check connection.' });
        } finally {
            setIsRunning(false);
        }
    };

    const handleExplainAI = async () => {
        if (isExplaining) return;
        
        // Get selection from Monaco
        const selection = editorRef.current?.getSelection();
        const selectedCode = selection
            ? editorRef.current?.getModel()?.getValueInRange(selection)
            : undefined;
        
        setIsExplaining(true);
        try {
            const res = await fetch('/api/codingforge/explain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    code: selectedCode || code, 
                    language, 
                    context: problemContext,
                    mode: selectedCode ? 'explain' : 'summarize'
                }),
            });
            
            const data = await res.json();
            if (onExplainResult) {
                onExplainResult(data.explanation || 'Failed to generate explanation.');
            }
        } catch (err) {
            console.error("AI Explain failed", err);
        }
        setIsExplaining(false);
    };

    if (showPaywall) {
        return <ForgeSoftPaywall forgeName="CodingForge" />;
    }

    const handleEditorDidMount: NonNullable<React.ComponentProps<typeof Editor>['onMount']> = (editor) => {
        editorRef.current = editor;
    };

    return (
        <div className="flex flex-col h-[500px] bg-[#0d0d1a] rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <div className="bg-zinc-800/50 rounded-xl px-1 py-1 border border-white/5">
                        <select
                            className="bg-transparent text-[10px] font-black uppercase tracking-widest text-white px-2 py-1 outline-none cursor-pointer"
                            value={language}
                            onChange={(e) => {
                                setLanguage(e.target.value);
                                setCode(STARTER_CODE[e.target.value]);
                            }}
                        >
                            <option value="python">Python</option>
                            <option value="javascript">JavaScript</option>
                            <option value="java">Java</option>
                            <option value="cpp">C++</option>
                        </select>
                    </div>
                    
                    <button
                        onClick={handleExplainAI}
                        disabled={isExplaining}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isExplaining ? <Loader2 className="w-3 h-3 animate-spin" /> : <Lightbulb className="w-3 h-3" />}
                        {isExplaining ? 'Thinking...' : 'AI Explain'}
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => navigator.clipboard.writeText(code)}
                            className="p-2 text-slate-500 hover:text-white transition-colors hover:bg-white/5 rounded-lg"
                            title="Copy Code"
                        >
                            <Copy size={16} />
                        </button>
                        <button
                            onClick={() => confirm('Reset code?') && setCode(STARTER_CODE[language])}
                            className="p-2 text-slate-500 hover:text-white transition-colors hover:bg-white/5 rounded-lg"
                            title="Reset Code"
                        >
                            <RotateCcw size={16} />
                        </button>
                    </div>

                    <div className="w-px h-6 bg-white/10" />

                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-amber-500 uppercase tracking-widest leading-none mb-1">
                            <Zap className="w-3 h-3" />
                            Cost: 1
                        </div>
                        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider tabular-nums">
                            {credits !== null ? `${credits}/30 Left` : '...'}
                        </div>
                    </div>

                    <button
                        onClick={handleRunCode}
                        disabled={isRunning || (credits !== null && credits <= 0)}
                        className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 ${isRunning
                            ? 'bg-slate-700 text-slate-400'
                            : (credits !== null && credits <= 0)
                                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed shadow-none border border-white/5'
                                : 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/20 active:scale-95'
                            }`}
                    >
                        {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Run Code'}
                    </button>
                </div>
            </div>

            {/* Editor */}
            <div className="flex-1 relative group">
                <Editor
                    height="100%"
                    language={language === 'cpp' ? 'cpp' : language}
                    theme="vs-dark"
                    value={code}
                    onMount={handleEditorDidMount}
                    onChange={(value: string | undefined) => setCode(value || '')}
                    options={{
                        fontSize: 14,
                        fontFamily: 'JetBrains Mono, Menlo, Monaco, Courier New, monospace',
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        padding: { top: 20, bottom: 20 },
                        lineNumbers: 'on',
                        glyphMargin: false,
                        folding: true,
                        lineDecorationsWidth: 0,
                        lineNumbersMinChars: 3,
                        renderLineHighlight: 'all',
                        cursorBlinking: 'smooth',
                        cursorSmoothCaretAnimation: 'on',
                    }}
                />
                
                {/* Visual indicator for selection mode */}
                <div className="absolute bottom-4 right-6 pointer-events-none transition-opacity duration-300">
                    <div className="bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Monaco v0.45.0 High Perf
                    </div>
                </div>
            </div>
        </div>
    );
}
