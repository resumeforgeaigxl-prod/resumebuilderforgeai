'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { TextBlock, MarkdownBlock, HeadingBlock, ListBlock } from '../types';

export function TextRenderer({ block }: { block: TextBlock }) {
  if (!block.text) return null;
  return (
    <div className="w-full min-w-0 text-[15px] text-[#F5F5F5] leading-[1.6] select-text [overflow-wrap:anywhere]">
      {block.text}
    </div>
  );
}

export function HeadingRenderer({ block }: { block: HeadingBlock }) {
  const level = block.level || 3;
  if (level === 1) {
    return <h1 className="text-lg font-bold text-[#F5F5F5] tracking-tight my-2">{block.text}</h1>;
  }
  if (level === 2) {
    return <h2 className="text-base font-bold text-[#F5F5F5] tracking-tight my-1.5">{block.text}</h2>;
  }
  if (level === 3) {
    return <h3 className="text-sm font-semibold text-[#F5F5F5] tracking-tight my-1">{block.text}</h3>;
  }
  return <h4 className="text-xs font-semibold text-[#7E7E7E] uppercase tracking-wider my-1">{block.text}</h4>;
}

export function ListRenderer({ block }: { block: ListBlock }) {
  if (block.ordered) {
    return (
      <ol className="list-decimal pl-5 my-2 space-y-1 text-[15px] text-[#BDBDBD]">
        {block.items.map((item, idx) => (
          <li key={idx} className="leading-relaxed">{item}</li>
        ))}
      </ol>
    );
  }
  return (
    <ul className="list-disc pl-5 my-2 space-y-1 text-[15px] text-[#BDBDBD]">
      {block.items.map((item, idx) => (
        <li key={idx} className="leading-relaxed">{item}</li>
      ))}
    </ul>
  );
}

export function MarkdownRenderer({ block }: { block: MarkdownBlock }) {
  if (!block.content) return null;
  return (
    <div className="w-full min-w-0 text-[15px] text-[#F5F5F5] leading-[1.6] select-text [overflow-wrap:anywhere]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => <div className="max-w-full overflow-x-auto"><table className="text-[13px]">{children}</table></div>,
          pre: ({ children }) => <pre className="max-w-full overflow-x-auto p-3 rounded-lg bg-[#101010]">{children}</pre>,
          h1: ({ children }) => <h1 className="text-base font-bold text-[#F5F5F5] mt-2 mb-1 tracking-tight">{children}</h1>,
          h2: ({ children }) => <h2 className="text-sm font-bold text-[#F5F5F5] mt-2 mb-1 tracking-tight">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xs font-bold text-[#F5F5F5] mt-1.5 mb-0.5 tracking-tight">{children}</h3>,
          p: ({ children }) => <p className="text-[15px] text-[#BDBDBD] leading-relaxed my-1">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-4 my-1 space-y-0.5 text-[15px] text-[#BDBDBD]">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 my-1 space-y-0.5 text-[15px] text-[#BDBDBD]">{children}</ol>,
          li: ({ children }) => <li className="pl-0.5 leading-relaxed">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-[#F5F5F5]">{children}</strong>,
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 rounded font-mono text-[11px] font-semibold bg-[#151515] border border-[#242424] text-[#C4B5FD]">
              {children}
            </code>
          ),
        }}
      >
        {block.content}
      </ReactMarkdown>
    </div>
  );
}
