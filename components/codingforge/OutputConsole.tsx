"use client";

import React, { useState } from 'react';
import { Terminal, CheckCircle2, XCircle, Info, Clock } from 'lucide-react';
import type { ExecutionResult, TestResult } from '../../lib/code-execution';

interface OutputConsoleProps {
    result: ExecutionResult | null;
}

export default function OutputConsole({ result }: OutputConsoleProps) {
    const [activeTab, setActiveTab] = useState<'console' | 'tests'>('console');

    // Automatically switch to tests if results are present in a new run
    React.useEffect(() => {
        if (result?.results) {
            setActiveTab('tests');
        } else if (result) {
            setActiveTab('console');
        }
    }, [result]);

    if (!result) return (
        <div className="h-full bg-black/40 rounded-[2rem] border border-white/10 p-4 flex flex-col items-center justify-center text-slate-500 text-sm backdrop-blur-xl">
            <Terminal className="w-8 h-8 mb-3 opacity-20" />
            <p className="font-bold uppercase tracking-widest text-[10px]">Ready to execute</p>
        </div>
    );

    const hasTests = result.results && result.results.length > 0;

    return (
        <div className="h-full bg-black/40 rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col shadow-2xl backdrop-blur-xl">
            {/* Tabs */}
            <div className="px-6 pt-4 pb-2 bg-white/5 border-b border-white/10 flex items-center justify-between">
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('console')}
                        className={`pb-2 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'console' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Console
                        {activeTab === 'console' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400 rounded-full" />}
                    </button>
                    {hasTests && (
                        <button
                            onClick={() => setActiveTab('tests')}
                            className={`pb-2 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'tests' ? 'text-green-400' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Test Results
                            {activeTab === 'tests' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400 rounded-full" />}
                        </button>
                    )}
                </div>
                
                {result.summary && (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-green-500/10 border border-green-500/20 text-[9px] font-bold text-green-400">
                            {result.summary.passed} Passed
                        </div>
                        {result.summary.failed > 0 && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-[9px] font-bold text-red-400">
                                {result.summary.failed} Failed
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 font-mono text-sm custom-scrollbar">
                {activeTab === 'console' ? (
                    <div className="space-y-4">
                        {result.error && (
                            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
                                <span className="font-black uppercase text-[10px] block mb-1 tracking-widest">System Error</span>
                                {result.error}
                            </div>
                        )}

                        {result.stderr && (
                            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 whitespace-pre-wrap text-xs">
                                <span className="font-black uppercase text-[10px] block mb-1 tracking-widest">Runtime Error</span>
                                {result.stderr}
                            </div>
                        )}

                        {result.stdout ? (
                            <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                                {result.stdout}
                            </div>
                        ) : (
                            !result.error && !result.stderr && <div className="text-slate-600 italic">No output returned.</div>
                        )}

                        {/* If we have many test cases, maybe show them in console too? No, keep it separate */}
                        {hasTests && !result.stdout && (
                            <div className="flex flex-col items-center justify-center py-10 opacity-30">
                                <Info size={24} className="mb-2" />
                                <p className="text-[10px] font-bold uppercase tracking-widest">Switch to Test Results tab for details</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {result.results?.map((tc: TestResult, idx: number) => (
                            <div key={idx} className={`p-4 rounded-[2rem] border transition-all ${tc.passed ? 'bg-green-500/5 border-green-500/10' : 'bg-red-500/5 border-red-500/10'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        {tc.passed ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${tc.passed ? 'text-green-500' : 'text-red-500'}`}>
                                            Case {idx + 1}: {tc.status}
                                        </span>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold uppercase">
                                            <Clock size={10} /> {tc.time}s
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Input</span>
                                        <pre className="p-3 bg-black/40 rounded-xl border border-white/5 text-xs text-slate-400 overflow-x-auto">{tc.input || 'None'}</pre>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Expected</span>
                                        <pre className="p-3 bg-black/40 rounded-xl border border-white/5 text-xs text-green-500/80 overflow-x-auto">{tc.expected || 'None'}</pre>
                                    </div>
                                    <div className="md:col-span-2 space-y-1">
                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Actual Output</span>
                                        <pre className={`p-3 bg-black/40 rounded-xl border border-white/5 text-xs overflow-x-auto ${tc.passed ? 'text-slate-300' : 'text-red-400'}`}>
                                            {tc.actual || (tc.stderr ? tc.stderr : 'Empty')}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
