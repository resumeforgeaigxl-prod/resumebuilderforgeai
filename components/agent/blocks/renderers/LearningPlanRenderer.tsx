'use client';

import React, { useState } from 'react';
import type { LearningPlanBlock } from '../types';
import { Button } from '@/components/ui/Button';
import { GraduationCap, CheckCircle2, Circle, Code, Play, ArrowRight, TrendingUp } from '@/components/icons';
import { cn } from '@/lib/utils';

interface LearningPlanRendererProps {
  block: LearningPlanBlock;
  locale: string;
  onPracticeTopic?: (topic: string) => void;
  onStartPlan?: (planId?: string) => void;
}

export function LearningPlanRenderer({
  block,
  locale,
  onPracticeTopic,
  onStartPlan,
}: LearningPlanRendererProps) {
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  const title = block.title || `${block.topic} Learning Plan`;
  const duration = block.durationWeeks || 4;

  // Derive weeks structure from either block.weeks or block.syllabus
  const weeks = block.weeks && block.weeks.length > 0
    ? block.weeks
    : (block.syllabus || [
        'Containers & Docker Foundations',
        'Kubernetes Architecture & Pods',
        'Deployments, Services & Networking',
        'ConfigMaps, Secrets & Helm Charts',
      ]).map((item, idx) => ({
        week: idx + 1,
        title: item.replace(/^Week \d+:\s*/i, ''),
        topics: [
          `${item} Architecture & Basics`,
          'Hands-on manifest creation',
          'Debugging & Production Best Practices',
        ],
      }));

  const totalMilestones = weeks.reduce((sum, w) => sum + w.topics.length, 0);
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = totalMilestones > 0
    ? Math.round((completedCount / totalMilestones) * 100)
    : (block.progress || 0);

  const toggleMilestone = (key: string) => {
    setCompletedSteps(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="my-3 w-full rounded-xl border border-[#242424] bg-[#0A0A0A] p-5 shadow-xs space-y-4 text-[#F5F5F5]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-[#242424] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#151515] border border-[#242424] flex items-center justify-center shrink-0 shadow-xs">
            <GraduationCap className="w-5 h-5 text-[#8B5CF6]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#F5F5F5] tracking-tight">
              {title}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border text-[#C4B5FD] bg-[#8B5CF6]/15 border-[#8B5CF6]/30">
                {duration} {duration === 1 ? 'Week' : 'Weeks'}
              </span>
              <span className="text-[10px] font-mono text-[#7E7E7E]">
                Structured Milestone Roadmap
              </span>
            </div>
          </div>
        </div>

        {/* Progress Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#151515] border border-[#242424] shadow-xs shrink-0">
          <TrendingUp className="w-3.5 h-3.5 text-[#8B5CF6]" />
          <span className="text-xs font-bold font-mono text-[#F5F5F5]">{progressPercent}%</span>
        </div>
      </div>

      {/* Week-by-Week Milestones */}
      <div className="space-y-3.5">
        {weeks.map((w, wIdx) => (
          <div
            key={wIdx}
            className="rounded-xl border border-[#242424] bg-[#151515] p-3.5 space-y-2.5 hover:border-[#2D2D2D] transition-all shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#F5F5F5]">
                Week {w.week}: {w.title}
              </span>
              <span className="text-[10px] font-mono text-[#7E7E7E]">
                {w.topics.filter((_, tIdx) => completedSteps[`${w.week}_${tIdx}`]).length}/{w.topics.length} done
              </span>
            </div>

            {/* Topic checklist items */}
            <div className="space-y-1.5 pl-1">
              {w.topics.map((topic, tIdx) => {
                const key = `${w.week}_${tIdx}`;
                const isDone = Boolean(completedSteps[key]);

                return (
                  <button
                    key={tIdx}
                    type="button"
                    onClick={() => toggleMilestone(key)}
                    className="w-full flex items-center gap-2.5 text-left text-xs text-[#BDBDBD] hover:text-[#F5F5F5] transition-colors py-0.5 group cursor-pointer"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-[#565656] group-hover:text-[#F5F5F5] shrink-0" />
                    )}
                    <span className={cn(isDone && "line-through text-[#565656]")}>
                      {topic}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#242424]">
        <Button
          size="sm"
          className="h-8 text-xs bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg gap-1.5 font-medium cursor-pointer"
          onClick={() => {
            if (onStartPlan) {
              onStartPlan(block.id);
            }
          }}
        >
          <Play className="w-3 h-3 text-white fill-white" />
          <span>Start Plan</span>
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs rounded-lg gap-1.5 font-medium border-[#2E2E2E] bg-[#1A1A1A] text-[#F5F5F5] hover:bg-[#222222] cursor-pointer"
          onClick={() => {
            if (onPracticeTopic) {
              onPracticeTopic(block.topic);
            }
          }}
        >
          <Code className="w-3 h-3 text-[#BDBDBD]" />
          <span>Practice</span>
        </Button>
      </div>
    </div>
  );
}
