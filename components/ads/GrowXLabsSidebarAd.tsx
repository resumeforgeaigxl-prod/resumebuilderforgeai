'use client';

import React from 'react';
import { ArrowRight, Check } from '@/components/icons';

interface GrowXLabsSidebarAdProps {
  className?: string;
}

export default function GrowXLabsSidebarAd({ className = '' }: GrowXLabsSidebarAdProps) {
  const ctaLink =
    'https://growxlabs.tech?utm_source=resumeforgeai&utm_medium=blog_sidebar&utm_campaign=ai_engineering';

  return (
    <div
      className={`w-64 bg-white border border-[#E2E8F0] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-neutral-900 rounded-none sticky top-28 ${className}`}
    >
      {/* Badge */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100">
        <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-600 uppercase">
          SPONSOR
        </span>
        <span className="text-[10px] font-mono text-neutral-400">
          GrowXLabs Tech
        </span>
      </div>

      {/* Headline */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-none flex items-center justify-center text-[10px] font-mono font-bold text-white shrink-0">
          GX
        </div>
        <h4 className="text-sm font-bold tracking-tight text-neutral-900 leading-tight">
          Enterprise AI & Autonomous Agents
        </h4>
      </div>

      <p className="text-xs text-neutral-600 leading-relaxed mb-4">
        Need production-grade AI agents or dedicated engineering teams? GrowXLabs turns complex generative AI into resilient business infrastructure.
      </p>

      {/* Value points */}
      <ul className="space-y-1.5 text-[11px] text-neutral-700 mb-5 font-mono">
        <li className="flex items-center gap-1.5">
          <Check size={12} className="text-indigo-600 shrink-0" />
          <span>Autonomous Agent Loops</span>
        </li>
        <li className="flex items-center gap-1.5">
          <Check size={12} className="text-indigo-600 shrink-0" />
          <span>Custom LLM & RAG Systems</span>
        </li>
        <li className="flex items-center gap-1.5">
          <Check size={12} className="text-indigo-600 shrink-0" />
          <span>Vetted Senior Engineers</span>
        </li>
      </ul>

      {/* Button */}
      <a
        href={ctaLink}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold font-mono uppercase tracking-wider rounded-none transition-all shadow-sm group"
      >
        <span>Talk to an Expert</span>
        <ArrowRight className="w-3 h-3 text-white transition-transform group-hover:translate-x-0.5" />
      </a>
    </div>
  );
}
