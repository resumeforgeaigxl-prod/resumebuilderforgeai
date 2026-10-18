'use client';

import React, { useState } from 'react';
import type { HtmlArtifactBlock } from '../types';
import { Eye, Code, ExternalLink, Copy, Check, Maximize, X } from '@/components/icons';
import { Button } from '@/components/ui/Button';

export function HtmlArtifactRenderer({ block }: { block: HtmlArtifactBlock }) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(block.html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="my-3 w-full rounded-xl border border-[#242424] bg-[#101010] text-[#F5F5F5] overflow-hidden shadow-xs space-y-0">
        {/* Artifact Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0A0A0A] border-b border-[#242424]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] inline-block animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.4)]" />
            <span className="text-xs font-semibold text-[#F5F5F5]">{block.title || 'Interactive HTML Artifact'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* View / Code Tabs */}
            <div className="flex rounded-lg bg-[#151515] border border-[#242424] p-0.5 text-[11px] font-medium text-[#7E7E7E]">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'preview' ? 'bg-[#242424] text-[#F5F5F5] shadow-xs' : 'hover:text-[#F5F5F5]'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Preview</span>
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'code' ? 'bg-[#242424] text-[#F5F5F5] shadow-xs' : 'hover:text-[#F5F5F5]'
                }`}
              >
                <Code className="w-3 h-3" />
                <span>Code</span>
              </button>
            </div>

            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs px-2 text-[#7E7E7E] hover:text-[#F5F5F5] hover:bg-[#151515]"
              onClick={() => setIsExpanded(true)}
              title="Expand preview"
            >
              <Maximize className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Content Body */}
        {activeTab === 'preview' ? (
          <div className="relative w-full h-[320px] bg-[#101010] overflow-hidden">
            {/* Sandboxed iframe protects host DOM */}
            <iframe
              srcDoc={block.html}
              sandbox="allow-scripts"
              className="w-full h-full border-0 select-text bg-white"
              title={block.title}
            />
          </div>
        ) : (
          <div className="relative p-3.5 bg-[#0A0A0A] border-t border-[#242424] text-[#F5F5F5] overflow-auto max-h-[320px] custom-scrollbar font-mono text-xs">
            <div className="absolute top-2.5 right-2.5">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-1 rounded bg-[#151515] hover:bg-[#242424] border border-[#242424] text-xs text-[#BDBDBD] hover:text-[#F5F5F5] cursor-pointer transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="text-[#D4D4D4]">
              <code>{block.html}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Expanded Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-5xl h-[85vh] bg-[#101010] border border-[#242424] rounded-xl flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 bg-[#0A0A0A] border-b border-[#242424] text-sm font-semibold text-[#F5F5F5]">
              <span>{block.title}</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="h-8 text-xs bg-[#151515] border-[#242424] text-[#F5F5F5] hover:bg-[#242424]" onClick={handleCopy}>
                  {copied ? 'Copied HTML!' : 'Copy HTML'}
                </Button>
                <Button size="sm" variant="ghost" className="h-8 text-xs text-[#7E7E7E] hover:text-[#F5F5F5] hover:bg-[#151515]" onClick={() => setIsExpanded(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 w-full h-full bg-[#101010]">
              <iframe
                srcDoc={block.html}
                sandbox="allow-scripts"
                className="w-full h-full border-0 bg-white"
                title={block.title}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
