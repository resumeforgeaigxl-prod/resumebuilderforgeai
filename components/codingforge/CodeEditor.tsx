"use client";

import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

const STARTER_CODE: Record<string, string> = {
    python: 'def solution():\n    # Write your code here\n    print("Hello from Python!")\n\nsolution()',
    javascript: 'function solution() {\n    // Write your code here\n    console.log("Hello from JavaScript!");\n}\n\nsolution();',
    java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}',
    cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello from C++!" << std::endl;\n    return 0;\n}',
};

interface CodeEditorProps {
    problemId: string;
    onResult: (result: ExecutionResult) => void;
}

interface ExecutionResult {
    stdout?: string;
    stderr?: string;
    status?: string;
    execution_time?: number;
    error?: string;
    remaining?: number;
}

export default function CodeEditor({ problemId, onResult }: CodeEditorProps) {
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState(STARTER_CODE.python);
    const [isRunning, setIsRunning] = useState(false);

    const handleRunCode = async () => {
        setIsRunning(true);
        try {
            const res = await fetch('/api/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ language, code, problemId }),
            });
            const data = await res.json();
            onResult(data);
        } catch {
            onResult({ error: 'Failed to execute code' });
        }
        setIsRunning(false);
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(code);
    };

    const handleReset = () => {
        if (confirm('Reset code to starter template?')) {
            setCode(STARTER_CODE[language]);
        }
    };

    return (
        <div className="flex flex-col h-[500px] bg-[#1e1e1e] rounded-2xl border border-white/10 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <select
                        className="bg-zinc-800 text-xs text-white border border-white/10 rounded px-2 py-1 outline-none"
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
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopyCode}
                        className="p-1.5 text-slate-400 hover:text-white transition-colors"
                        title="Copy Code"
                    >
                        📋
                    </button>
                    <button
                        onClick={handleReset}
                        className="p-1.5 text-slate-400 hover:text-white transition-colors"
                        title="Reset Code"
                    >
                        🔄
                    </button>
                    <button
                        onClick={handleRunCode}
                        disabled={isRunning}
                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${isRunning
                            ? 'bg-slate-700 text-slate-400'
                            : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20'
                            }`}
                    >
                        {isRunning ? 'Running...' : 'Run Code'}
                    </button>
                </div>
            </div>
            <div className="flex-1">
                <Editor
                    height="100%"
                    language={language === 'cpp' ? 'cpp' : language}
                    theme="vs-dark"
                    value={code}
                    onChange={(value: string | undefined) => setCode(value || '')}
                    options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        padding: { top: 16, bottom: 16 }
                    }}
                />
            </div>
        </div>
    );
}
