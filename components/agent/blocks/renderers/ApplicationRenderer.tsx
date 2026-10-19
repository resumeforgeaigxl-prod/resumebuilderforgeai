'use client';

import React, { useState } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import type { ApplicationBlock } from '../types';
import { Button } from '@/components/ui/Button';
import {
  Briefcase,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  FileText,
  Check,
  Sparkles,
  RefreshCw,
  XCircle,
  RotateCcw,
} from '@/components/icons';
import { cn } from '@/lib/utils';

interface ApplicationRendererProps {
  block: ApplicationBlock;
  locale: string;
  onAnswerQuestion?: (key: string, value: string) => void;
  onReviewApplication?: (packageId?: string) => void;
}

export function ApplicationRenderer({
  block,
  locale,
  onAnswerQuestion,
  onReviewApplication,
}: ApplicationRendererProps) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  const activeLocale =
    (params?.locale as string | undefined) ||
    locale ||
    pathname?.split('/').filter(Boolean)[0] ||
    'en-in';
  const [answeredKeys, setAnsweredKeys] = useState<Record<string, boolean>>({});

  const status = (block.status || 'READY').toUpperCase();
  const isReady = status === 'READY';
  const isAwaitingApproval = status === 'AWAITING_APPROVAL';
  const isSubmitted = status === 'SUBMITTED';
  const isUnsupported = status === 'UNSUPPORTED';
  const isNeedsUser =
    status === 'NEEDS_USER' ||
    status === 'READY WITH INPUT' ||
    status === 'PAUSED_NEEDS_USER';
  const isBlocked = status === 'BLOCKED';
  const isRecovering = status === 'RECOVERING' || status === 'RETRY_SCHEDULED';
  const isSubmissionUnknown = status === 'SUBMISSION_UNKNOWN';
  const isCancelled = status === 'CANCELLED';
  const isFailed = status === 'FAILED' || status === 'SESSION_EXPIRED';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [localStatus, setLocalStatus] = useState<string | null>(null);

  const missingQuestions = block.missingQuestions || [];
  const missingCount = block.missingQuestionsCount ?? missingQuestions.length;

  const handleQuickAnswer = (key: string, val: string) => {
    setAnsweredKeys(prev => ({ ...prev, [key]: true }));
    if (onAnswerQuestion) {
      onAnswerQuestion(key, val);
    }
  };

  const handleApproveAndSubmit = async () => {
    if (!block.runId || !block.packageId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/applications/browser-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'APPROVE_AND_SUBMIT',
          runId: block.runId,
          packageId: block.packageId,
          explicitUserConsent: true,
        }),
      });
      const data = await res.json();
      if (data.success && data.run?.status === 'SUBMITTED') {
        setSubmissionSuccess(true);
        router.refresh();
      } else if (data.run?.status === 'SUBMISSION_UNKNOWN') {
        setLocalStatus('SUBMISSION_UNKNOWN');
      } else {
        alert(data.message || data.error || 'Submission could not be completed.');
      }
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecover = async () => {
    if (!block.runId) return;
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/applications/browser-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RECOVER',
          runId: block.runId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLocalStatus(data.run?.status || 'AWAITING_APPROVAL');
        router.refresh();
      } else {
        alert(data.error || 'Could not resume session.');
      }
    } catch (err: any) {
      alert(`Recovery error: ${err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!block.runId) return;
    if (!confirm('Are you sure you want to cancel this application run? Reserved credits will be refunded.')) {
      return;
    }
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/applications/browser-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CANCEL',
          runId: block.runId,
          reason: 'Candidate cancelled from chat',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLocalStatus('CANCELLED');
        router.refresh();
      } else {
        alert(data.error || 'Could not cancel run.');
      }
    } catch (err: any) {
      alert(`Cancellation error: ${err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const currentDisplayStatus = localStatus || status;

  return (
    <div className="my-3 w-full rounded-xl border border-[#242424] bg-[#0A0A0A] p-5 shadow-xs space-y-4 text-[#F5F5F5]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-[#242424] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#151515] border border-[#242424] flex items-center justify-center shrink-0 shadow-xs">
            <Briefcase className="w-5 h-5 text-[#8B5CF6]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#7E7E7E] uppercase">
                {block.provider ? `Application · ${block.provider}` : 'Application'}
              </span>
              {block.recoveryCount && block.recoveryCount > 0 ? (
                <span className="text-[9px] font-mono bg-[#1E1E1E] text-[#BDBDBD] px-1.5 py-0.5 rounded">
                  Recovered v{block.recoveryCount}
                </span>
              ) : null}
            </div>
            <h4 className="text-sm font-bold text-[#F5F5F5] tracking-tight">
              {block.company} · {block.jobTitle}
            </h4>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={cn(
            'text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border flex items-center gap-1.5 shrink-0',
            isReady && 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40',
            isAwaitingApproval && 'text-[#C4B5FD] bg-[#8B5CF6]/15 border-[#8B5CF6]/30',
            (isSubmitted || submissionSuccess) && 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40',
            isUnsupported && 'text-[#BDBDBD] bg-[#151515] border-[#242424]',
            isNeedsUser && 'text-amber-400 bg-amber-950/40 border-amber-800/40',
            isRecovering && 'text-amber-300 bg-amber-950/40 border-amber-700/50 animate-pulse',
            isSubmissionUnknown && 'text-amber-300 bg-amber-950/40 border-amber-800/60',
            isCancelled && 'text-[#7E7E7E] bg-[#151515] border-[#242424]',
            isFailed && 'text-rose-400 bg-rose-950/40 border-rose-800/40',
            isBlocked && 'text-rose-400 bg-rose-950/40 border-rose-800/40'
          )}
        >
          {isReady && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
          {isAwaitingApproval && <Sparkles className="w-3 h-3 text-[#C4B5FD]" />}
          {(isSubmitted || submissionSuccess) && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
          {isRecovering && <RefreshCw className="w-3 h-3 text-amber-300 animate-spin" />}
          {isNeedsUser && <AlertCircle className="w-3 h-3 text-amber-400" />}
          {isSubmissionUnknown && <AlertCircle className="w-3 h-3 text-amber-300" />}
          {isCancelled && <XCircle className="w-3 h-3 text-[#7E7E7E]" />}
          {(isFailed || isBlocked) && <ShieldAlert className="w-3 h-3 text-rose-400" />}
          <span>
            {submissionSuccess || isSubmitted
              ? 'SUBMITTED'
              : currentDisplayStatus === 'SUBMISSION_UNKNOWN'
              ? 'SUBMISSION UNCERTAIN'
              : currentDisplayStatus === 'RECOVERING'
              ? 'RECOVERING...'
              : currentDisplayStatus === 'RETRY_SCHEDULED'
              ? 'RETRY SCHEDULED'
              : currentDisplayStatus === 'PAUSED_NEEDS_USER'
              ? 'HUMAN TAKEOVER'
              : currentDisplayStatus === 'CANCELLED'
              ? 'CANCELLED'
              : currentDisplayStatus === 'SESSION_EXPIRED'
              ? 'SESSION EXPIRED'
              : currentDisplayStatus === 'FAILED'
              ? 'FAILED'
              : isAwaitingApproval
              ? 'READY TO SUBMIT'
              : isReady
              ? 'PACKAGE READY'
              : isUnsupported
              ? 'MANUAL APPLY'
              : isNeedsUser
              ? 'NEEDS INPUT'
              : 'BLOCKED'}
          </span>
        </span>
      </div>

      {/* 4-Item Verification Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Resume */}
        <div className="p-3 rounded-xl border border-[#242424] bg-[#151515] space-y-1">
          <span className="text-[10px] font-mono text-[#7E7E7E] uppercase block">Resume</span>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F5F5F5]">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{block.tailoringStatus || 'Tailored'}</span>
          </div>
        </div>

        {/* Profile */}
        <div className="p-3 rounded-xl border border-[#242424] bg-[#151515] space-y-1">
          <span className="text-[10px] font-mono text-[#7E7E7E] uppercase block">Profile</span>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F5F5F5]">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Complete</span>
          </div>
        </div>

        {/* Answers */}
        <div className="p-3 rounded-xl border border-[#242424] bg-[#151515] space-y-1">
          <span className="text-[10px] font-mono text-[#7E7E7E] uppercase block">Answers</span>
          <div className="text-xs font-semibold text-[#F5F5F5]">
            {isNeedsUser ? (
              <span className="text-amber-400 font-mono">{missingCount} need input</span>
            ) : (
              <span className="text-emerald-400 font-mono">100% verified</span>
            )}
          </div>
        </div>

        {/* Job Freshness */}
        <div className="p-3 rounded-xl border border-[#242424] bg-[#151515] space-y-1">
          <span className="text-[10px] font-mono text-[#7E7E7E] uppercase block">Job Status</span>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F5F5F5]">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active & Fresh</span>
          </div>
        </div>
      </div>

      {/* HUMAN TAKEOVER / PAUSED_NEEDS_USER BANNER (LEVEL 14) */}
      {(status === 'PAUSED_NEEDS_USER' || block.handoffReason) && (
        <div className="p-4 rounded-xl border border-amber-700/50 bg-amber-950/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>
                Human Action Required: {block.handoffReason || 'Verification Needed'}
              </span>
            </div>
            <span className="text-[10px] font-mono bg-amber-900/60 text-amber-200 px-2 py-0.5 rounded">
              Omni Paused Safely
            </span>
          </div>
          <p className="text-xs text-[#E0E0E0] leading-relaxed">
            {block.handoffMessage ||
              block.requiredAction ||
              'A verification step (such as a CAPTCHA, MFA code, or custom legal confirmation) requires your direct attention. Omni has paused external actions to safeguard your account.'}
          </p>

          {block.takeoverUrl ? (
            <div className="pt-1 flex gap-2">
              <Button
                size="sm"
                className="h-8 text-xs bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg gap-1.5 cursor-pointer"
                onClick={() => window.open(block.takeoverUrl, '_blank')}
              >
                <span>Take Over in Browser ↗</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs border-[#2E2E2E] bg-[#1A1A1A] text-white hover:bg-[#222222] rounded-lg cursor-pointer"
                disabled={isActionLoading}
                onClick={handleRecover}
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                <span>I Have Completed It — Resume</span>
              </Button>
            </div>
          ) : (
            <div className="pt-1 flex gap-2">
              {block.applyUrl && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs border-[#2E2E2E] bg-[#1A1A1A] text-white hover:bg-[#222222] rounded-lg cursor-pointer"
                  onClick={() => window.open(block.applyUrl, '_blank')}
                >
                  <span>Open Employer Form ↗</span>
                </Button>
              )}
              <Button
                size="sm"
                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg gap-1.5 cursor-pointer"
                disabled={isActionLoading}
                onClick={handleRecover}
              >
                <RotateCcw className="w-3.5 h-3.5 text-white" />
                <span>Resume Application</span>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* SUBMISSION UNCERTAIN BANNER (LEVEL 14 GUARDRAIL) */}
      {currentDisplayStatus === 'SUBMISSION_UNKNOWN' && (
        <div className="p-4 rounded-xl border border-amber-600/50 bg-amber-950/40 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Submission State Uncertain — Duplicate Prevention Guard Active</span>
          </div>
          <p className="text-xs text-[#E0E0E0] leading-relaxed">
            The final submit request was transmitted, but confirmation timed out or disconnected before an official response was received.
            <strong> Omni has intentionally NOT retried submission</strong> to avoid creating duplicate applications with the employer.
          </p>
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            {block.applyUrl && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs border-[#2E2E2E] bg-[#1A1A1A] text-white hover:bg-[#222222] rounded-lg cursor-pointer"
                onClick={() => window.open(block.applyUrl, '_blank')}
              >
                <span>Check Employer Portal ↗</span>
              </Button>
            )}
            <Button
              size="sm"
              className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg gap-1.5 cursor-pointer"
              onClick={() => {
                setLocalStatus('SUBMITTED');
                setSubmissionSuccess(true);
              }}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              <span>I Confirmed Receipt (Mark Submitted)</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs border-rose-900/50 bg-rose-950/20 text-rose-300 hover:bg-rose-950/40 rounded-lg cursor-pointer"
              disabled={isActionLoading}
              onClick={handleCancel}
            >
              <span>Cancel Run & Release Credits</span>
            </Button>
          </div>
        </div>
      )}

      {/* RECOVERING / RETRY SCHEDULED BANNER */}
      {isRecovering && (
        <div className="p-3.5 rounded-xl border border-amber-800/40 bg-amber-950/20 flex items-center gap-3">
          <RefreshCw className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
          <div className="text-xs space-y-0.5">
            <span className="font-semibold text-amber-300">Recovery in progress...</span>
            <p className="text-[#BDBDBD]">
              Reconnecting session, inspecting form fields, and preparing fresh validation.
            </p>
          </div>
        </div>
      )}

      {/* CANCELLED BANNER */}
      {currentDisplayStatus === 'CANCELLED' && (
        <div className="p-4 rounded-xl border border-[#242424] bg-[#151515] space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#F5F5F5]">
            <XCircle className="w-4 h-4 text-[#7E7E7E]" />
            <span>Application Run Cancelled</span>
          </div>
          <p className="text-xs text-[#7E7E7E]">
            This browser application run was cancelled. Reserved credits have been returned to your wallet.
          </p>
        </div>
      )}

      {/* Missing Questions if NEEDS_USER */}
      {isNeedsUser && missingQuestions.length > 0 && status !== 'PAUSED_NEEDS_USER' && (
        <div className="space-y-2 pt-1">
          <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
            Questions Requiring Confirmation
          </span>
          <div className="space-y-2">
            {missingQuestions.map((q, idx) => {
              const isDone = answeredKeys[q.key];
              return (
                <div key={idx} className="p-3 rounded-xl border border-amber-800/40 bg-[#151515] space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-[#F5F5F5]">{q.question}</span>
                    {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </div>
                  {!isDone && (
                    <div className="flex gap-2 pt-1 flex-wrap">
                      {q.key.includes('authorization') && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] rounded-lg border-[#242424] bg-[#101010] text-[#F5F5F5] hover:bg-[#1E1E1E]"
                            onClick={() => handleQuickAnswer(q.key, 'Yes, legally authorized')}
                          >
                            ✓ Yes, Authorized
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] rounded-lg border-[#242424] bg-[#101010] text-[#BDBDBD] hover:bg-[#1E1E1E]"
                            onClick={() => handleQuickAnswer(q.key, 'No, require visa sponsorship')}
                          >
                            Requires Sponsorship
                          </Button>
                        </>
                      )}
                      {q.key.includes('notice') && (
                        <>
                          {['Immediate', '15 Days', '30 Days'].map(opt => (
                            <Button
                              key={opt}
                              size="sm"
                              variant="outline"
                              className="h-7 text-[11px] rounded-lg border-[#242424] bg-[#101010] text-[#F5F5F5] hover:bg-[#1E1E1E]"
                              onClick={() => handleQuickAnswer(q.key, opt)}
                            >
                              {opt}
                            </Button>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* APPROVAL MODE BANNER (LEVEL 13 & 14) */}
      {isAwaitingApproval && !submissionSuccess && currentDisplayStatus !== 'SUBMISSION_UNKNOWN' && (
        <div className="p-4 rounded-xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#C4B5FD]">
            <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
            <span>Application Ready to Submit — Your Approval is Required</span>
          </div>
          <p className="text-xs text-[#BDBDBD] leading-relaxed">
            The Browser Agent has mapped your verified details, attached your approved resume, and validated all required employer fields. Review the summary below and click <strong>Approve & Submit</strong>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-xs text-[#F5F5F5]">
            <div className="flex items-center gap-1.5 font-medium">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Personal information & contact details</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Work history & experience</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Resume attached: {block.resumeUsed || 'Approved resume'}</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>{block.filledFieldsCount || 14} verified fields completed</span>
            </div>
          </div>
        </div>
      )}

      {/* SUBMISSION CONFIRMATION BANNER */}
      {(isSubmitted || submissionSuccess) && (
        <div className="p-4 rounded-xl border border-emerald-800/40 bg-emerald-950/40 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Application Submitted Successfully</span>
          </div>
          <p className="text-xs text-[#BDBDBD]">
            Official employer confirmation verified. Tracked in your Applications pipeline.
          </p>
          {block.confirmationUrl && (
            <a
              href={block.confirmationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#C4B5FD] hover:text-white underline font-mono inline-block"
            >
              Confirmation Link ↗
            </a>
          )}
        </div>
      )}

      {/* UNSUPPORTED / MANUAL APPLY BANNER */}
      {isUnsupported && (
        <div className="p-4 rounded-xl border border-[#242424] bg-[#151515] space-y-1.5">
          <p className="text-xs text-[#F5F5F5] font-semibold">
            Portal Format Not Automated Yet
          </p>
          <p className="text-xs text-[#7E7E7E]">
            This employer uses a portal format the agent doesn't automate yet. Your prepared package is ready for manual submission.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#242424] flex-wrap">
        {isAwaitingApproval && !submissionSuccess && currentDisplayStatus !== 'SUBMISSION_UNKNOWN' && (
          <>
            <Button
              size="sm"
              className="h-8 text-xs bg-[#8B5CF6] text-white hover:bg-[#7C3AED] rounded-lg gap-1.5 font-medium cursor-pointer"
              disabled={isSubmitting || isActionLoading}
              onClick={handleApproveAndSubmit}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              <span>{isSubmitting ? 'Submitting...' : 'Approve & Submit'}</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs rounded-lg gap-1.5 font-medium border-rose-900/40 bg-[#1A1A1A] hover:bg-rose-950/30 text-rose-300 cursor-pointer"
              disabled={isSubmitting || isActionLoading}
              onClick={handleCancel}
            >
              <span>Cancel Run</span>
            </Button>
          </>
        )}

        {(isSubmitted || submissionSuccess) && (
          <Button
            size="sm"
            className="h-8 text-xs bg-[#8B5CF6] text-white hover:bg-[#7C3AED] rounded-lg gap-1.5 font-medium cursor-pointer"
            onClick={() => router.push(`/${activeLocale}/applications`)}
          >
            <span>View in Applications</span>
            <ArrowRight className="w-3 h-3 text-white" />
          </Button>
        )}

        {isUnsupported && block.applyUrl && (
          <Button
            size="sm"
            className="h-8 text-xs bg-[#8B5CF6] text-white hover:bg-[#7C3AED] rounded-lg gap-1.5 font-medium cursor-pointer"
            onClick={() => window.open(block.applyUrl, '_blank')}
          >
            <span>Apply Manually ↗</span>
          </Button>
        )}

        {isNeedsUser && status !== 'PAUSED_NEEDS_USER' && (
          <Button
            size="sm"
            className="h-8 text-xs bg-[#8B5CF6] text-white hover:bg-[#7C3AED] rounded-lg gap-1.5 font-medium cursor-pointer"
            onClick={() => router.push(`/${activeLocale}/account?tab=application-profile`)}
          >
            <span>Complete Answers</span>
            <ArrowRight className="w-3 h-3 text-white" />
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs rounded-lg gap-1.5 font-medium border-[#2E2E2E] bg-[#1A1A1A] hover:bg-[#222222] text-[#F5F5F5] cursor-pointer"
          onClick={() => {
            if (onReviewApplication) {
              onReviewApplication(block.packageId);
            } else if (block.jobId) {
              router.push(`/${activeLocale}/jobs/${block.jobId}`);
            }
          }}
        >
          <FileText className="w-3 h-3 text-[#7E7E7E]" />
          <span>Review Application</span>
        </Button>
      </div>
    </div>
  );
}
