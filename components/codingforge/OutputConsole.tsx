"use client";

import React from 'react';

interface OutputConsoleProps {
    result: {
        stdout?: string;
        stderr?: string;
        status?: string;
        execution_time?: number;
        error?: string;
        remaining?: number;
    } | null;
}

export default function OutputConsole({ result }: OutputConsoleProps) {
    if (!result) return (
        <div className="flex-1 bg-black/40 rounded-2xl border border-white/10 p-4 min-h-[150px] flex items-center justify-center text-slate-500 text-sm">
            Run your code to see the output here
        </div>
    );

    return (
        <div className="flex-1 bg-black/40 rounded-2xl border border-white/10 overflow-hidden flex flex-col min-h-[200px]">
            <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Console Output</span>
                {result.execution_time !== undefined && (
                    <span className="text-[10px] text-slate-500">Time: {result.execution_time}s</span>
                )}
            </div>

            <div className="flex-1 p-4 font-mono text-sm overflow-y-auto">
                {result.error && (
                    <div className="text-red-400 mb-2">Error: {result.error}</div>
                )}

                {result.stderr && (
                    <div className="text-red-400 mb-2 whitespace-pre-wrap">{result.stderr}</div>
                )}

                {result.stdout && (
                    <div className="text-slate-200 whitespace-pre-wrap">{result.stdout}</div>
                )}

                {!result.stdout && !result.stderr && !result.error && (
                    <div className="text-slate-500 italic">No output returned</div>
                )}
            </div>

            {result.remaining !== undefined && (
                <div className="px-4 py-2 bg-white/5 border-t border-white/10 text-[10px] text-slate-500 text-right">
                    Daily runs remaining: {result.remaining}
                </div>
            )}
        </div>
    );
}
