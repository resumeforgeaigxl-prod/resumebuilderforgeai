'use client';

import React, { useState } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import {
  Briefcase,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  FileText,
  Building2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  HelpCircle,
  ArrowRight
} from '@/components/icons';
import { cn } from '@/lib/utils';
import type { ApplicationArtifact } from './types';

interface ApplicationArtifactCardProps {
  artifact: ApplicationArtifact;
  locale: string;
  onAnswerQuestion?: (questionKey: string, answer: string) => void;
  onFindReplacements?: (jobTitle?: string) => void;
}

export function ApplicationArtifactCard({
  artifact,
  locale,
  onAnswerQuestion,
  onFindReplacements,
}: ApplicationArtifactCardProps) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  const activeLocale =
    (params?.locale as string | undefined) ||
    locale ||
    pathname?.split('/').filter(Boolean)[0] ||
    'en-in';

  const [quickAnswers, setQuickAnswers] = useState<Record<string, string>>({});

  const status = (artifact.status || 'READY').toUpperCase();
  const isReady = status === 'READY';
  const isNeedsUser = status === 'NEEDS_USER';
  const isBlocked = status === 'BLOCKED';

  const readinessScore = typeof artifact.readinessScore === 'number'
    ? `${artifact.readinessScore}%`
    : artifact.readinessScore || (isReady ? '100%' : isBlocked ? '0%' : '75%');

  const title = artifact.jobTitle || 'Target Role Application';
  const company = artifact.company || 'Canonical Job';

  const statusBadge = isReady ? (
    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border text-emerald-700 bg-emerald-50 border-emerald-200 flex items-center gap-1.5">
      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
      <span>100% READY</span>
    </span>
  ) : isNeedsUser ? (
    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border text-amber-700 bg-amber-50 border-amber-200 flex items-center gap-1.5">
      <AlertCircle className="w-3 h-3 text-amber-600" />
      <span>NEEDS YOUR INPUT</span>
    </span>
  ) : (
    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border text-rose-700 bg-rose-50 border-rose-200 flex items-center gap-1.5">
      <ShieldAlert className="w-3 h-3 text-rose-600" />
      <span>APPLICATION BLOCKED</span>
    </span>
  );

  const handleQuickAnswer = (key: string, val: string) => {
    setQuickAnswers(prev => ({ ...prev, [key]: val }));
    if (onAnswerQuestion) {
      onAnswerQuestion(key, val);
    }
  };

  return (
    <div className="my-3.5 w-full rounded-xl border border-[#242424] bg-[#0A0A0A] p-5 space-y-4 text-[#F5F5F5] shadow-xs">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-[#242424] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#151515] border border-[#242424] flex items-center justify-center shrink-0">
            <Briefcase className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-semibold text-[#F5F5F5] tracking-tight">
                {title}
              </h4>
              <span className="text-[10px] font-mono font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border text-[#BDBDBD] bg-[#141414] border-[#242424]">
                {company}
              </span>
            </div>
            <p className="text-xs text-[#7E7E7E] mt-0.5 font-mono">
              Truth-Verified Application Package
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="shrink-0">
          {statusBadge}
        </div>
      </div>

      {/* Progress & Package Metadata */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
        <div className="rounded-lg border border-[#242424] bg-[#121212] p-3 space-y-1">
          <span className="text-[10px] font-mono text-[#7E7E7E] uppercase">Readiness</span>
          <div className="text-sm font-mono font-medium text-[#F5F5F5]">{readinessScore}</div>
        </div>
        <div className="rounded-lg border border-[#242424] bg-[#121212] p-3 space-y-1">
          <span className="text-[10px] font-mono text-[#7E7E7E] uppercase">Resume</span>
          <div className="text-xs font-medium text-[#F5F5F5] truncate">
            {artifact.resumeUsed || 'Tailored Profile Resume'}
          </div>
        </div>
        <div className="col-span-2 sm:col-span-1 rounded-lg border border-[#242424] bg-[#121212] p-3 space-y-1">
          <span className="text-[10px] font-mono text-[#7E7E7E] uppercase">Tailoring</span>
          <div className="text-xs font-medium text-[#F5F5F5]">
            {artifact.tailoringStatus || 'Truth-Preserved'}
          </div>
        </div>
      </div>

      {/* STATUS: READY */}
      {isReady && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Complete Application Package Ready</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-900 pt-1">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Job vacancy active & verified</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Resume tailored & grounded in facts</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Application answers resolved</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Package locked for browser agent</span>
            </div>
          </div>
        </div>
      )}

      {/* STATUS: NEEDS_USER */}
      {isNeedsUser && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-3">
          <div className="flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-amber-950">
                Action Required: {artifact.missingQuestionsCount || artifact.missingQuestions?.length || 1} Unresolved Question(s)
              </p>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                ResumeForge never guesses your legal, authorization, or personal details. Please provide your answer:
              </p>
            </div>
          </div>

          {/* Missing Questions list with Quick Answer Chips */}
          <div className="space-y-2.5 pt-1">
            {artifact.missingQuestions?.map((q, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-amber-800/40 bg-[#121212] p-3 space-y-2 text-xs"
              >
                <div className="font-medium text-[#F5F5F5] flex items-start justify-between gap-2">
                  <span>{idx + 1}. {q.question}</span>
                  {q.required && (
                    <span className="text-[9px] font-mono text-rose-400 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-800/40 shrink-0">
                      Required
                    </span>
                  )}
                </div>
                {q.reason && (
                  <p className="text-[11px] text-[#7E7E7E]">
                    Reason: {q.reason}
                  </p>
                )}

                {/* Common quick response chips */}
                {q.key.includes('authorization') && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px] rounded-lg bg-[#1A1A1A] hover:bg-[#222222] border-[#2E2E2E] text-[#F5F5F5] cursor-pointer"
                      onClick={() => handleQuickAnswer(q.key, 'Yes, legally authorized')}
                    >
                      ✓ Yes, Authorized
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px] rounded-lg bg-[#1A1A1A] hover:bg-[#222222] border-[#2E2E2E] text-[#F5F5F5] cursor-pointer"
                      onClick={() => handleQuickAnswer(q.key, 'No, require sponsorship')}
                    >
                      Requires Sponsorship
                    </Button>
                  </div>
                )}
                {q.key.includes('notice') && (
                  <div className="flex gap-2 pt-1 flex-wrap">
                    {['Immediate', '15 Days', '30 Days', '60 Days'].map(opt => (
                      <Button
                        key={opt}
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px] rounded-lg bg-[#1A1A1A] hover:bg-[#222222] border-[#2E2E2E] text-[#F5F5F5] cursor-pointer"
                        onClick={() => handleQuickAnswer(q.key, opt)}
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STATUS: BLOCKED */}
      {isBlocked && (
        <div className="rounded-lg border border-rose-800/40 bg-rose-950/20 p-4 space-y-2.5">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-rose-300">
                Application Preparation Blocked
              </p>
              <p className="text-xs text-rose-200/80 leading-relaxed">
                {artifact.reason || artifact.evidence || artifact.message || 'Cannot prepare application due to hard blocker criteria.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-[#242424] flex-wrap">
        {isReady && (
          <Button
            size="sm"
            className="min-h-[44px] h-auto py-2.5 text-xs bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg gap-2 font-medium shadow-xs"
            onClick={() => {
              if (artifact.jobId) {
                router.push(`/${activeLocale}/jobs/${artifact.jobId}`);
              } else {
                router.push(`/${activeLocale}/account?tab=application-profile`);
              }
            }}
          >
            <span>Review Full Package</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        )}

        {isNeedsUser && (
          <Button
            size="sm"
            className="min-h-[44px] h-auto py-2.5 text-xs bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg gap-2 font-medium shadow-xs"
            onClick={() => router.push(`/${activeLocale}/account?tab=application-profile`)}
          >
            <span>Complete in Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        )}

        {isBlocked && (
          <Button
            size="sm"
            className="min-h-[44px] h-auto py-2.5 text-xs bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg gap-2 font-medium shadow-xs"
            onClick={() => {
              if (onFindReplacements) {
                onFindReplacements(title);
              } else {
                router.push(`/${activeLocale}/jobs?tab=recommended`);
              }
            }}
          >
            <span>Find Replacement Jobs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          className="min-h-[44px] h-auto py-2.5 text-xs bg-[#1A1A1A] hover:bg-[#222222] border border-[#2E2E2E] hover:border-[#3E3E3E] text-[#F5F5F5] rounded-lg gap-1.5 font-medium ml-auto"
          onClick={() => router.push(`/${activeLocale}/account?tab=application-profile`)}
        >
          <FileText className="w-3.5 h-3.5 text-[#7E7E7E]" />
          <span>Application Profile</span>
        </Button>
      </div>
    </div>
  );
}
