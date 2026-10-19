'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Circle,
  Code,
  Layers,
  TrendingUp
} from '@/components/icons';
import { cn } from '@/lib/utils';

export interface LearningArtifact {
  success?: boolean;
  tool?: 'trigger_study_plan' | 'add_study_topic' | string;
  id?: string;
  title?: string;
  topic?: string;
  durationWeeks?: number;
  syllabus?: string[];
  syllabus_steps?: number;
  progress?: number;
  status?: string;
}

interface LearningArtifactCardProps {
  artifact: LearningArtifact;
  locale: string;
  onPracticeTopic?: (topic: string) => void;
}

export function LearningArtifactCard({
  artifact,
  locale,
  onPracticeTopic
}: LearningArtifactCardProps) {
  const router = useRouter();
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const syllabus = artifact.syllabus || [];
  const topicTitle = artifact.topic || artifact.title || 'Technical Curriculum';
  const duration = artifact.durationWeeks || (syllabus.length > 0 ? syllabus.length : 4);

  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const currentProgress = syllabus.length > 0
    ? Math.round((completedCount / syllabus.length) * 100)
    : (artifact.progress || 0);

  const toggleStep = (idx: number) => {
    setCompletedSteps(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div className="my-3.5 w-full rounded-xl border border-[#242424] bg-[#0A0A0A] p-5 shadow-sm space-y-4 hover:border-[#303030] transition-all text-[#F5F5F5]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-[#242424] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#151515] border border-[#242424] flex items-center justify-center shrink-0 shadow-xs">
            <GraduationCap className="w-5 h-5 text-[#8B5CF6]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-[#F5F5F5] tracking-tight">
                {topicTitle} Study Roadmap
              </h4>
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border text-[#C4B5FD] bg-[#8B5CF6]/10 border-[#8B5CF6]/30">
                {duration} {duration === 1 ? 'Week' : 'Weeks'}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-md">
                Active Curriculum
              </span>
            </div>
            <p className="text-xs text-[#7E7E7E] mt-0.5 font-mono">
              Learning Plan • Structured Mastery Path
            </p>
          </div>
        </div>

        {/* Progress Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#121212] border border-[#242424] shadow-xs shrink-0">
          <TrendingUp className="w-3.5 h-3.5 text-[#8B5CF6]" />
          <div className="text-right">
            <div className="text-xs font-bold font-mono text-[#F5F5F5]">{currentProgress}%</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-mono text-[#7E7E7E]">
          <span>Curriculum Progress</span>
          <span>{completedCount} of {syllabus.length} Milestones Complete</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-[#151515] overflow-hidden">
          <div
            className="h-full bg-[#8B5CF6] rounded-full transition-all duration-300"
            style={{ width: `${Math.max(currentProgress, 4)}%` }}
          />
        </div>
      </div>

      {/* Milestone Modules Checklist */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-[#F5F5F5] flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#7E7E7E]" />
          <span>Curriculum Milestones</span>
        </div>

        <div className="space-y-1.5">
          {syllabus.map((step, idx) => {
            const isDone = !!completedSteps[idx];
            return (
              <div
                key={idx}
                onClick={() => toggleStep(idx)}
                className={cn(
                  'flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer select-none text-xs',
                  isDone
                    ? 'border-emerald-800/40 bg-emerald-950/30 text-emerald-300'
                    : 'border-[#242424] bg-[#121212] hover:border-[#303030] text-[#F5F5F5]'
                )}
              >
                <div className="flex items-center gap-2.5 flex-1 pr-2">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-[#565656] shrink-0" />
                  )}
                  <span className={cn('font-medium', isDone && 'line-through text-[#7E7E7E]')}>
                    {step}
                  </span>
                </div>

                <span className="text-[10px] font-mono text-[#7E7E7E] shrink-0 bg-[#1A1A1A] border border-[#242424] px-1.5 py-0.5 rounded">
                  Milestone {idx + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[#242424]">
        <div className="flex items-center gap-2 flex-wrap">
          {onPracticeTopic && (
            <button
              onClick={() => onPracticeTopic(topicTitle)}
              className="min-h-[44px] h-auto inline-flex items-center gap-1.5 text-xs font-semibold text-[#C4B5FD] bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 px-3.5 py-2.5 rounded-lg transition-all cursor-pointer"
            >
              <Code className="w-3.5 h-3.5" />
              Practice Coding on this Topic
            </button>
          )}

          <Button
            onClick={() => router.push(`/${locale}/studyforge`)}
            size="sm"
            className="min-h-[44px] h-auto py-2.5 rounded-lg bg-[#1A1A1A] hover:bg-[#222222] text-[#F5F5F5] border border-[#2E2E2E] text-xs font-medium px-3.5 transition-all flex items-center gap-1 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#7E7E7E]" />
            Start Learning Plan
          </Button>
        </div>

        <span className="text-[10px] font-mono text-[#7E7E7E]">
          Click milestones to track mastery
        </span>
      </div>
    </div>
  );
}
