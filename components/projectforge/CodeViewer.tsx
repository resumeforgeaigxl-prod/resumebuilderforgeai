"use client";

import React from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import ts from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml'; // for HTML/XML
import css from 'react-syntax-highlighter/dist/esm/languages/hljs/css';
import sql from 'react-syntax-highlighter/dist/esm/languages/hljs/sql';
import atomOneDark from 'react-syntax-highlighter/dist/esm/styles/hljs/atom-one-dark';

SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('typescript', ts);
SyntaxHighlighter.registerLanguage('html', xml);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('sql', sql);

interface CodeViewerProps {
    code: string;
    path: string;
}

export default function CodeViewer({ code, path }: CodeViewerProps) {
    const getLanguage = (filePath: string) => {
        const ext = filePath.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'js':
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

    return (
        <div className="h-full w-full overflow-hidden bg-[#0d0d1a] border-b border-white/5 flex flex-col">
            <div className="px-4 py-2 border-b border-white/5 bg-[#0a0a15] flex items-center justify-between">
                <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">{path}</span>
                <span className="text-[10px] font-bold text-slate-600 uppercase bg-white/5 px-2 py-0.5 rounded">
                    {getLanguage(path)}
                </span>
            </div>
            <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                <SyntaxHighlighter
                    language={getLanguage(path)}
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
        </div>
    );
}
