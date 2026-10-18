'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import {
  Code2,
  CheckCircle2,
  AlertCircle,
  Play,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  Terminal,
  Zap,
  Sparkles
} from '@/components/icons';
import { cn } from '@/lib/utils';

export interface CodingArtifact {
  success?: boolean;
  tool?: 'trigger_coding_challenge' | 'run_code_sandbox' | string;
  id?: string;
  slug?: string;
  title?: string;
  difficulty?: string;
  topic?: string;
  description?: string;
  approach?: string;
  interviewTips?: string[];
  timeComplexity?: string;
  spaceComplexity?: string;
  starterCode?: string;
  testCases?: Array<{ input: string; output?: string; expected_output?: string; is_hidden?: boolean }>;
  solveUrl?: string;

  // Sandbox execution fields
  language?: string;
  codeSnippet?: string;
  results?: Array<{
    input?: string;
    expected?: string;
    actual?: string;
    status?: string;
    status_id?: number;
    passed?: boolean;
    time?: number;
    stderr?: string;
  }>;
  summary?: {
    total: number;
    passed: number;
    failed: number;
  };
  executionTimeMs?: number;
  creditsUsed?: number;
}

interface CodingArtifactCardProps {
  artifact: CodingArtifact;
  locale: string;
  onRunCode?: (code: string, language: string) => void;
}

export function CodingArtifactCard({ artifact, locale, onRunCode }: CodingArtifactCardProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const isChallenge = artifact.tool === 'trigger_coding_challenge';
  const isExecution = artifact.tool === 'run_code_sandbox';

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenChallenge = () => {
    if (artifact.slug) {
      router.push(`/${locale}/codingforge/${artifact.slug}`);
    } else {
      router.push(`/${locale}/codingforge`);
    }
  };

  if (isChallenge) {
    const diff = artifact.difficulty || 'Medium';
    const diffColor =
      diff.toLowerCase() === 'easy'
        ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40'
        : diff.toLowerCase() === 'hard'
        ? 'text-rose-400 bg-rose-950/40 border-rose-800/40'
        : 'text-amber-400 bg-amber-950/40 border-amber-800/40';

    return (
      <div className="my-3.5 w-full rounded-xl border border-[#242424] bg-[#0A0A0A] p-5 shadow-sm space-y-4 hover:border-[#303030] transition-all text-[#F5F5F5]">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#242424] pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#151515] border border-[#242424] flex items-center justify-center shrink-0 shadow-xs">
              <Code2 className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-[#F5F5F5] tracking-tight">
                  {artifact.title || 'Algorithmic Challenge'}
                </h4>
                <span className={cn("text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border", diffColor)}>
                  {diff}
                </span>
                {artifact.topic && (
                  <span className="text-[10px] font-mono font-medium text-[#BDBDBD] bg-[#121212] border border-[#242424] px-2 py-0.5 rounded-md">
                    {artifact.topic}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#7E7E7E] mt-0.5 font-mono">
                Coding Practice • Time: {artifact.timeComplexity || 'O(N)'} • Space: {artifact.spaceComplexity || 'O(1)'}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#121212] border border-[#242424] text-[10px] font-mono text-[#BDBDBD] shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-pulse" />
            <span>⚡ 0 Credits to View</span>
          </div>
        </div>

        {/* Problem Description */}
        {artifact.description && (
          <div className="rounded-lg bg-[#121212] border border-[#242424] p-3.5 text-xs text-[#BDBDBD] leading-relaxed whitespace-pre-wrap">
            <p className="font-semibold text-[#F5F5F5] mb-1">Problem Statement:</p>
            {artifact.description}
          </div>
        )}

        {/* Test Cases Preview */}
        {artifact.testCases && artifact.testCases.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-[#F5F5F5]">Example Test Cases:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {artifact.testCases.map((tc, idx) => (
                <div key={idx} className="bg-[#121212] border border-[#242424] rounded-lg p-2.5 text-[11px] font-mono space-y-1">
                  <div className="text-[#7E7E7E]">Input: <span className="text-[#F5F5F5]">{tc.input}</span></div>
                  <div className="text-[#7E7E7E]">Output: <span className="text-emerald-400 font-semibold">{tc.output || tc.expected_output}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Starter Code Boilerplate */}
        {artifact.starterCode && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#F5F5F5]">Starter Code Template:</span>
              <button
                onClick={() => handleCopy(artifact.starterCode!)}
                className="text-[11px] font-mono text-[#7E7E7E] hover:text-[#F5F5F5] flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 bg-[#050505] text-[#D4D4D4] rounded-lg text-xs font-mono overflow-x-auto max-h-36 custom-scrollbar border border-[#242424]">
              <code>{artifact.starterCode}</code>
            </pre>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleOpenChallenge}
              size="sm"
              className="h-8 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-medium px-4 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Practice in Full Editor
            </Button>
            {onRunCode && artifact.starterCode && (
              <Button
                onClick={() => onRunCode(artifact.starterCode!, 'python')}
                size="sm"
                className="h-8 rounded-lg bg-[#1A1A1A] hover:bg-[#222222] text-[#F5F5F5] border border-[#2E2E2E] text-xs font-medium px-4 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3 h-3 text-[#C4B5FD] fill-[#C4B5FD]" />
                Run in Sandbox
              </Button>
            )}
          </div>
          <span className="text-[10px] font-mono text-[#7E7E7E]">
            Judge0 Isolated Execution Engine
          </span>
        </div>
      </div>
    );
  }

  // Code Sandbox Execution Card
  if (isExecution) {
    const passedAll = artifact.success && (artifact.summary?.failed === 0);
    const passedCount = artifact.summary?.passed || 0;
    const totalCount = artifact.summary?.total || 1;

    return (
      <div className="my-3.5 w-full rounded-xl border border-[#242424] bg-[#0A0A0A] p-5 shadow-sm space-y-4 hover:border-[#303030] transition-all text-[#F5F5F5]">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#242424] pb-3.5">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-xs border",
              passedAll
                ? "bg-emerald-950/40 border-emerald-800/40 text-emerald-400"
                : "bg-rose-950/40 border-rose-800/40 text-rose-400"
            )}>
              {passedAll ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-[#F5F5F5] tracking-tight">
                  {passedAll ? 'Sandbox Execution: Accepted' : 'Sandbox Execution: Test Failed'}
                </h4>
                <span className={cn(
                  "text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border",
                  passedAll
                    ? "text-emerald-400 bg-emerald-950/40 border-emerald-800/40"
                    : "text-rose-400 bg-rose-950/40 border-rose-800/40"
                )}>
                  {passedCount}/{totalCount} Passed
                </span>
                <span className="text-[10px] font-mono font-bold uppercase text-[#BDBDBD] bg-[#121212] border border-[#242424] px-2 py-0.5 rounded-md">
                  {artifact.language || 'Code'}
                </span>
              </div>
              <p className="text-xs text-[#7E7E7E] mt-0.5 font-mono">
                Judge0 Sandbox • Runtime: {artifact.executionTimeMs || 15}ms
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#121212] border border-[#242424] text-[10px] font-mono text-[#BDBDBD] shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>⚡ 1 Credit Used • Sandbox</span>
          </div>
        </div>

        {/* Test Case Breakdown */}
        {artifact.results && artifact.results.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#F5F5F5]">Test Case Verifications:</span>
            <div className="space-y-2">
              {artifact.results.map((res, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "rounded-lg border p-3 text-xs font-mono space-y-1.5 bg-[#121212]",
                    res.passed && res.status_id === 3
                      ? "border-emerald-800/40"
                      : "border-rose-800/40"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#F5F5F5]">Case #{idx + 1}</span>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border",
                      res.passed && res.status_id === 3
                        ? "text-emerald-400 bg-emerald-950/40 border-emerald-800/40"
                        : "text-rose-400 bg-rose-950/40 border-rose-800/40"
                    )}>
                      {res.status || (res.passed ? 'Accepted' : 'Failed')}
                    </span>
                  </div>
                  {res.input && (
                    <div className="text-[#7E7E7E]">
                      Input: <span className="text-[#F5F5F5]">{res.input}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 flex-wrap text-[11px]">
                    {res.expected && (
                      <div className="text-[#7E7E7E]">
                        Expected: <span className="text-emerald-400 font-semibold">{res.expected}</span>
                      </div>
                    )}
                    <div className="text-[#7E7E7E]">
                      Actual Output: <span className={cn("font-semibold", res.passed ? "text-emerald-400" : "text-rose-400")}>{res.actual || '(no output)'}</span>
                    </div>
                  </div>
                  {res.stderr && (
                    <div className="mt-2 p-2 rounded bg-rose-950/30 border border-rose-800/40 text-rose-300 text-[10px] whitespace-pre-wrap">
                      {res.stderr}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Code Snippet Drawer */}
        {artifact.codeSnippet && (
          <div>
            <button
              onClick={() => setShowCode(!showCode)}
              className="text-xs font-semibold text-[#8B5CF6] hover:text-[#A78BFA] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{showCode ? 'Hide Executed Code' : 'View Executed Code'}</span>
              <ChevronDown className={cn("w-3 h-3 transition-transform", showCode && "rotate-180")} />
            </button>
            {showCode && (
              <pre className="mt-2 p-3 bg-[#050505] text-[#D4D4D4] rounded-lg text-xs font-mono overflow-x-auto max-h-48 custom-scrollbar border border-[#242424]">
                <code>{artifact.codeSnippet}</code>
              </pre>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => router.push(`/${locale}/codingforge`)}
              size="sm"
              className="h-8 rounded-lg bg-[#1A1A1A] hover:bg-[#222222] text-[#F5F5F5] border border-[#2E2E2E] text-xs font-medium px-4 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#7E7E7E]" />
              Practice Coding
            </Button>
          </div>
          <span className="text-[10px] font-mono text-[#7E7E7E]">
            {passedAll ? 'Ready for production deployment' : 'Check constraints and edge cases'}
          </span>
        </div>
      </div>
    );
  }

  return null;
}
