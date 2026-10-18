'use client';

import React, { useState } from 'react';
import type { CodeBlock } from '../types';
import { Copy, Check, Maximize, X } from '@/components/icons';
import { Button } from '@/components/ui/Button';

export function CodeRenderer({ block }: { block: CodeBlock }) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(block.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = block.code.split('\n');

  return (
    <>
      <div className="relative group my-2.5 rounded-xl overflow-hidden border border-[#242424] bg-[#101010] text-white shadow-xs">
        {/* Header bar */}
        <div className="flex items-center justify-between px-3.5 py-2 bg-[#151515] border-b border-[#242424] text-xs font-mono text-[#7E7E7E]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-2 text-white/90 font-semibold">{block.title || block.language}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-[#A3A3A3] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Copy code to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsExpanded(true)}
              className="p-1 rounded text-[#A3A3A3] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Expand code view"
            >
              <Maximize className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-3.5 overflow-x-auto font-mono text-xs leading-relaxed bg-[#1E1E1E] text-[#D4D4D4] custom-scrollbar max-h-[380px]">
          <pre className="flex">
            {block.showLineNumbers && (
              <div className="select-none text-[#5A5A5A] pr-3 text-right shrink-0">
                {lines.map((_: string, i: number) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
            )}
            <code className="text-[#E6E6E6]">{block.code}</code>
          </pre>
        </div>
      </div>

      {/* Fullscreen Expand Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl max-h-[85vh] bg-[#1E1E1E] border border-[#333333] rounded-xl flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 bg-[#252526] border-b border-[#333333] text-sm font-mono text-white">
              <span>{block.title || `${block.language} snippet`}</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" className="h-7 text-xs text-white" onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs text-white" onClick={() => setIsExpanded(false)}>
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <div className="p-5 overflow-auto flex-1 font-mono text-xs leading-relaxed text-[#D4D4D4] custom-scrollbar">
              <pre>
                <code>{block.code}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
