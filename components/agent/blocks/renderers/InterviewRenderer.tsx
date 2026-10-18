'use client';

import React from 'react';
import type { InterviewBlock } from '../types';
import { Button } from '@/components/ui/Button';
import { MessageSquare, Mic, Code, Sparkles, ArrowRight } from '@/components/icons';

interface InterviewRendererProps {
  block: InterviewBlock;
  locale: string;
  onStartInterview?: (role?: string) => void;
  onPracticeCoding?: (topic?: string) => void;
}

export function InterviewRenderer({
  block,
  locale,
  onStartInterview,
  onPracticeCoding,
}: InterviewRendererProps) {
  const counts = block.topicCounts || {
    technical: 6,
    behavioral: 4,
    resumeBased: 3,
  };

  const focusAreas = block.focusAreas || [
    'Distributed systems & concurrency',
    'PostgreSQL query optimization & scaling',
    'Idempotent REST & gRPC API design',
  ];

  return (
    <div className="my-3 w-full rounded-xl border border-[#242424] bg-[#0A0A0A] p-5 shadow-xs space-y-4 text-[#F5F5F5]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-[#242424] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#151515] border border-[#242424] flex items-center justify-center shrink-0 shadow-xs">
            <MessageSquare className="w-5 h-5 text-[#8B5CF6]" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-[#7E7E7E] uppercase">Interview Preparation</div>
            <h4 className="text-sm font-bold text-[#F5F5F5] tracking-tight">
              {block.role} Simulation
            </h4>
          </div>
        </div>

        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md border text-[#C4B5FD] bg-[#8B5CF6]/15 border-[#8B5CF6]/30 shrink-0">
          {block.difficulty || 'Mid-Senior'}
        </span>
      </div>

      {/* Topics Breakdown Row */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3 rounded-xl border border-[#242424] bg-[#151515] space-y-0.5">
          <span className="text-[10px] font-mono text-[#7E7E7E] uppercase block">Technical</span>
          <div className="text-xs font-bold text-[#F5F5F5] font-mono">{counts.technical} topics</div>
        </div>
        <div className="p-3 rounded-xl border border-[#242424] bg-[#151515] space-y-0.5">
          <span className="text-[10px] font-mono text-[#7E7E7E] uppercase block">Behavioral</span>
          <div className="text-xs font-bold text-[#F5F5F5] font-mono">{counts.behavioral} topics</div>
        </div>
        <div className="p-3 rounded-xl border border-[#242424] bg-[#151515] space-y-0.5">
          <span className="text-[10px] font-mono text-[#7E7E7E] uppercase block">Resume-based</span>
          <div className="text-xs font-bold text-[#F5F5F5] font-mono">{counts.resumeBased} topics</div>
        </div>
      </div>

      {/* Focus Areas */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono font-bold text-[#7E7E7E] uppercase tracking-wider block">
          Key Focus Areas
        </span>
        <ul className="space-y-1 text-xs text-[#BDBDBD]">
          {focusAreas.map((area, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] shrink-0" />
              <span>{area}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#242424]">
        <Button
          size="sm"
          className="h-8 text-xs bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg gap-1.5 font-medium cursor-pointer"
          onClick={() => {
            if (onStartInterview) {
              onStartInterview(block.role);
            }
          }}
        >
          <Mic className="w-3 h-3 text-white" />
          <span>Start Mock Interview</span>
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs rounded-lg gap-1.5 font-medium border-[#2E2E2E] bg-[#1A1A1A] text-[#F5F5F5] hover:bg-[#222222] cursor-pointer"
          onClick={() => {
            if (onPracticeCoding) {
              onPracticeCoding(block.role);
            }
          }}
        >
          <Code className="w-3 h-3 text-[#BDBDBD]" />
          <span>Practice Coding</span>
        </Button>
      </div>
    </div>
  );
}
