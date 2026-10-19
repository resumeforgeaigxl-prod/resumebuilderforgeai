'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import {
  AlertCircle,
  ShieldAlert,
  Zap,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Briefcase,
} from '@/components/icons';
import { cn } from '@/lib/utils';
import type { ErrorArtifact } from './types';

interface ErrorArtifactCardProps {
  artifact: ErrorArtifact;
  locale: string;
  onRetry?: () => void;
  onTopUp?: () => void;
}

export function ErrorArtifactCard({
  artifact,
  locale,
  onRetry,
  onTopUp,
}: ErrorArtifactCardProps) {
  const router = useRouter();

  const isCredit = artifact.errorType === 'CREDIT_EXHAUSTED';
  const isRateLimit = artifact.errorType === 'RATE_LIMIT';
  const isPolicy = artifact.errorType === 'POLICY_BLOCKED';
  const isJobNotFound = artifact.errorType === 'JOB_NOT_FOUND';
  const isJobClosed = artifact.errorType === 'JOB_CLOSED';
  const isJobRelated =
    isJobNotFound ||
    isJobClosed ||
    artifact.errorType === 'JOB_UNVERIFIED' ||
    artifact.errorType === 'JOB_UNSUPPORTED' ||
    artifact.actionType === 'explore_jobs' ||
    (artifact.actionLabel && artifact.actionLabel.toLowerCase().includes('match'));

  const badgeColor = isCredit
    ? 'text-amber-400 bg-amber-950/40 border-amber-800/40'
    : isPolicy
    ? 'text-rose-400 bg-rose-950/40 border-rose-800/40'
    : isJobRelated
    ? 'text-amber-400 bg-amber-950/40 border-amber-800/40'
    : 'text-[#BDBDBD] bg-[#121212] border-[#242424]';

  const badgeIcon = isCredit ? (
    <Zap className="w-3 h-3 text-amber-400" />
  ) : isPolicy ? (
    <ShieldAlert className="w-3 h-3 text-rose-400" />
  ) : isJobRelated ? (
    <Briefcase className="w-3 h-3 text-amber-400" />
  ) : (
    <AlertCircle className="w-3 h-3 text-[#BDBDBD]" />
  );

  const badgeText = isCredit
    ? 'AI CREDITS EXHAUSTED'
    : isRateLimit
    ? 'AI RATE LIMIT'
    : isPolicy
    ? 'POLICY PROTECTED'
    : isJobNotFound
    ? 'JOB NOT FOUND'
    : isJobClosed
    ? 'JOB CLOSED'
    : artifact.errorType === 'JOB_UNVERIFIED'
    ? 'VERIFICATION PENDING'
    : artifact.errorType === 'JOB_UNSUPPORTED'
    ? 'SUBMISSION UNSUPPORTED'
    : 'ACTION UNAVAILABLE';

  const handleAction = () => {
    if (artifact.actionUrl) {
      const url =
        artifact.actionUrl.startsWith('/') && !artifact.actionUrl.startsWith(`/${locale}`)
          ? `/${locale}${artifact.actionUrl}`
          : artifact.actionUrl;
      router.push(url);
    } else if (isJobRelated) {
      router.push(`/${locale}/jobs?tab=recommended`);
    } else if (isCredit) {
      if (onTopUp) {
        onTopUp();
      } else {
        router.push(`/${locale}/pricing`);
      }
    } else if (isPolicy) {
      router.push(`/${locale}/account?tab=application-profile`);
    } else if (onRetry) {
      onRetry();
    }
  };

  return (
    <div className="my-3.5 w-full rounded-xl border border-amber-800/40 bg-[#0A0A0A] p-5 shadow-sm space-y-3.5 text-[#F5F5F5] hover:border-[#303030] transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-[#242424] pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#151515] border border-[#242424] flex items-center justify-center shrink-0 shadow-xs">
            {isCredit ? (
              <Zap className="w-5 h-5 text-amber-400" />
            ) : isPolicy ? (
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            ) : isJobRelated ? (
              <Briefcase className="w-5 h-5 text-amber-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-[#F5F5F5] tracking-tight">
                {artifact.title || 'Generation Unavailable'}
              </h4>
            </div>
            <p className="text-xs text-[#7E7E7E] mt-0.5 font-mono">
              Omni Intelligence Engine • Status Report
            </p>
          </div>
        </div>

        {/* Badge */}
        <span className={cn("text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border flex items-center gap-1.5 shrink-0", badgeColor)}>
          {badgeIcon}
          <span>{badgeText}</span>
        </span>
      </div>

      {/* Message */}
      <p className="text-xs text-[#BDBDBD] leading-relaxed">
        {artifact.message}
      </p>

      {/* Details (if any) */}
      {artifact.details && (
        <div className="text-[11px] font-mono text-[#7E7E7E] bg-[#121212] rounded-lg p-2.5 border border-[#242424]">
          {artifact.details}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#242424] flex-wrap">
        <Button
          size="sm"
          className="min-h-[44px] h-auto py-2.5 text-xs bg-[#8B5CF6] text-white hover:bg-[#7C3AED] rounded-lg gap-1.5 font-medium cursor-pointer"
          onClick={handleAction}
        >
          {isCredit ? (
            <>
              <Zap className="w-3 h-3 text-white" />
              <span>{artifact.actionLabel || 'Top Up Credits'}</span>
            </>
          ) : isPolicy ? (
            <>
              <span>{artifact.actionLabel || 'Open Profile Settings'}</span>
              <ArrowRight className="w-3 h-3" />
            </>
          ) : isJobRelated || artifact.actionUrl ? (
            <>
              <Briefcase className="w-3 h-3 text-white" />
              <span>{artifact.actionLabel || 'Find Other Matches'}</span>
            </>
          ) : onRetry ? (
            <>
              <RotateCcw className="w-3 h-3" />
              <span>{artifact.actionLabel || 'Try Again'}</span>
            </>
          ) : (
            <span>{artifact.actionLabel || 'Learn More'}</span>
          )}
        </Button>

        {isCredit && (
          <Button
            size="sm"
            variant="outline"
            className="min-h-[44px] h-auto py-2.5 text-xs rounded-lg gap-1.5 bg-[#1A1A1A] hover:bg-[#222222] text-[#F5F5F5] border border-[#2E2E2E] cursor-pointer"
            onClick={() => router.push(`/${locale}/account?tab=credits`)}
          >
            <span>View Credit Ledger</span>
          </Button>
        )}
      </div>
    </div>
  );
}
