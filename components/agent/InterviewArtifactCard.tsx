'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import {
  MessageSquare,
  Mic,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Target,
  Copy,
  Check
} from '@/components/icons';
import { cn } from '@/lib/utils';

export interface InterviewArtifact {
  success?: boolean;
  tool?: 'trigger_mock_interview' | 'evaluate_interview_answer' | string;
  sessionId?: string;
  role?: string;
  difficulty?: string;
  numQuestions?: number;
  questions?: string[];
  firstQuestion?: string;
  interviewUrl?: string;

  // Evaluation fields
  question?: string;
  userAnswer?: string;
  score?: number;
  verdict?: string;
  strengths?: string[];
  weaknesses?: string[];
  starRating?: {
    situation: number;
    task: number;
    action: number;
    result: number;
  };
  feedback?: string;
  improvedSampleAnswer?: string;
}

interface InterviewArtifactCardProps {
  artifact: InterviewArtifact;
  locale: string;
}

export function InterviewArtifactCard({ artifact, locale }: InterviewArtifactCardProps) {
  const router = useRouter();
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [copied, setCopied] = useState(false);

  const isSession = artifact.tool === 'trigger_mock_interview';
  const isEvaluation = artifact.tool === 'evaluate_interview_answer';

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isSession) {
    return (
      <div className="my-3.5 w-full rounded-xl border border-[#242424] bg-[#0A0A0A] p-5 shadow-sm space-y-4 hover:border-[#303030] transition-all text-[#F5F5F5]">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#242424] pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#151515] border border-[#242424] flex items-center justify-center shrink-0 shadow-xs">
              <Mic className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-[#F5F5F5] tracking-tight">
                  {artifact.role || 'Technical Role'} Mock Interview
                </h4>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border text-[#C4B5FD] bg-[#8B5CF6]/10 border-[#8B5CF6]/30">
                  {artifact.difficulty || 'Mid'} Level
                </span>
                <span className="text-[10px] font-mono font-bold text-[#BDBDBD] bg-[#121212] border border-[#242424] px-2 py-0.5 rounded-md">
                  {artifact.numQuestions || 5} Questions
                </span>
              </div>
              <p className="text-xs text-[#7E7E7E] mt-0.5 font-mono">
                Interview Simulation • Session ID: {artifact.sessionId?.slice(0, 8) || 'Active'}...
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#121212] border border-[#242424] text-[10px] font-mono text-[#BDBDBD] shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>⚡ 0 Credits to Start</span>
          </div>
        </div>

        {/* First Question Highlight */}
        <div className="rounded-lg bg-[#121212] border border-[#242424] p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F5F5F5]">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>Question #1 (Opening Round):</span>
          </div>
          <p className="text-xs text-[#F5F5F5] font-medium leading-relaxed italic bg-[#161616] p-3 rounded-lg border border-[#282828]">
            &ldquo;{artifact.firstQuestion}&rdquo;
          </p>
          <p className="text-[11px] text-[#7E7E7E]">
            💡 Tip: Use the STAR methodology (Situation, Task, Action, Result) to format your verbal or typed response.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => router.push(artifact.interviewUrl || `/${locale}/mock-interview`)}
              size="sm"
              className="h-8 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-medium px-4 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Start Mock Interview
            </Button>
          </div>
          <span className="text-[10px] font-mono text-[#7E7E7E]">
            Type your response directly in chat for instant STAR evaluation
          </span>
        </div>
      </div>
    );
  }

  if (isEvaluation) {
    const score = artifact.score || 80;
    const isHire = score >= 75;
    const star = artifact.starRating || { situation: 80, task: 80, action: 85, result: 75 };

    return (
      <div className="my-3.5 w-full rounded-xl border border-[#242424] bg-[#0A0A0A] p-5 shadow-sm space-y-4 hover:border-[#303030] transition-all text-[#F5F5F5]">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#242424] pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#151515] border border-[#242424] flex items-center justify-center shrink-0 shadow-xs">
              {isHire ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-amber-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-[#F5F5F5] tracking-tight">
                  STAR Evaluation: {artifact.verdict || (isHire ? 'Strong Hire' : 'Needs Practice')}
                </h4>
                <span className={cn(
                  "text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border",
                  isHire
                    ? "text-emerald-400 bg-emerald-950/40 border-emerald-800/40"
                    : "text-amber-400 bg-amber-950/40 border-amber-800/40"
                )}>
                  {score}/100 Score
                </span>
              </div>
              <p className="text-xs text-[#7E7E7E] mt-0.5 font-mono">
                Bar Raiser Intelligence • Role: {artifact.role || 'Software Engineer'}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#121212] border border-[#242424] text-[10px] font-mono text-[#BDBDBD] shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>⚡ 2 Credits • STAR Bar Raiser</span>
          </div>
        </div>

        {/* STAR Rubric Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { label: 'Situation', val: star.situation },
            { label: 'Task', val: star.task },
            { label: 'Action', val: star.action },
            { label: 'Result (KPI)', val: star.result },
          ].map((item, idx) => (
            <div key={idx} className="bg-[#121212] border border-[#242424] rounded-lg p-2.5 text-center space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-[#7E7E7E] block">{item.label}</span>
              <span className="text-sm font-bold text-[#F5F5F5]">{item.val}%</span>
              <div className="w-full bg-[#1A1A1A] h-1 rounded-full overflow-hidden">
                <div className="bg-[#8B5CF6] h-full rounded-full" style={{ width: `${item.val}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {artifact.strengths && artifact.strengths.length > 0 && (
            <div className="bg-[#121212] border border-emerald-800/40 rounded-lg p-3 space-y-1.5">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Key Strengths
              </span>
              <ul className="text-[11px] text-[#BDBDBD] space-y-1">
                {artifact.strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {artifact.weaknesses && artifact.weaknesses.length > 0 && (
            <div className="bg-[#121212] border border-amber-800/40 rounded-lg p-3 space-y-1.5">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Improvement Target
              </span>
              <ul className="text-[11px] text-[#BDBDBD] space-y-1">
                {artifact.weaknesses.map((w, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Improved Model Answer */}
        {artifact.improvedSampleAnswer && (
          <div className="space-y-1.5">
            <button
              onClick={() => setShowModelAnswer(!showModelAnswer)}
              className="text-xs font-semibold text-[#8B5CF6] hover:text-[#A78BFA] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>{showModelAnswer ? 'Hide Exemplary Bar Raiser Answer' : 'View Exemplary Bar Raiser Answer'}</span>
              <ChevronDown className={cn("w-3 h-3 transition-transform", showModelAnswer && "rotate-180")} />
            </button>
            {showModelAnswer && (
              <div className="mt-2 p-3.5 bg-[#121212] border border-[#242424] rounded-lg text-xs text-[#F5F5F5] leading-relaxed relative">
                <button
                  onClick={() => handleCopy(artifact.improvedSampleAnswer!)}
                  className="absolute top-2.5 right-2.5 text-[10px] font-mono text-[#BDBDBD] hover:text-[#F5F5F5] flex items-center gap-1 cursor-pointer bg-[#1A1A1A] px-2 py-1 rounded border border-[#2A2A2A]"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <p className="whitespace-pre-wrap pr-16 text-[#BDBDBD]">{artifact.improvedSampleAnswer}</p>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          <Button
            onClick={() => router.push(`/${locale}/mock-interview`)}
            size="sm"
            className="h-8 rounded-lg bg-[#1A1A1A] hover:bg-[#222222] text-[#F5F5F5] border border-[#2E2E2E] text-xs font-medium px-4 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#7E7E7E]" />
            Start Voice Mock Interview
          </Button>
          <span className="text-[10px] font-mono text-[#7E7E7E]">
            Evaluated against FAANG & Tier-1 rubrics
          </span>
        </div>
      </div>
    );
  }

  return null;
}
