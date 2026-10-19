'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import type { StatusBlock, MetricBlock, ScoreBlock, ProgressBlock, ErrorBlock, ChecklistBlock } from '../types';
import { Button } from '@/components/ui/Button';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ShieldAlert,
  Info,
  TrendingUp,
  Zap,
  RotateCcw,
  ArrowRight,
  Check,
  Briefcase,
} from '@/components/icons';
import { cn } from '@/lib/utils';

export function StatusRenderer({ block }: { block: StatusBlock }) {
  const status = block.status || 'info';

  const icon = status === 'success' ? (
    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
  ) : status === 'warning' ? (
    <AlertTriangle className="w-4 h-4 text-amber-400" />
  ) : status === 'error' || status === 'blocked' ? (
    <ShieldAlert className="w-4 h-4 text-rose-400" />
  ) : (
    <Info className="w-4 h-4 text-[#8B5CF6]" />
  );

  const style = status === 'success'
    ? 'border-emerald-800/40 bg-emerald-950/40 text-emerald-400'
    : status === 'warning'
    ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
    : status === 'error' || status === 'blocked'
    ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
    : 'border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#C4B5FD]';

  return (
    <div className={cn("my-2.5 rounded-xl border p-3.5 space-y-1 text-xs shadow-xs", style)}>
      <div className="flex items-center gap-2 font-bold font-mono">
        {icon}
        <span>{block.title}</span>
      </div>
      <p className="text-xs leading-relaxed opacity-90 pl-6">{block.message}</p>
      {block.details && (
        <p className="text-[11px] font-mono opacity-75 pl-6 pt-1">{block.details}</p>
      )}
    </div>
  );
}

export function MetricRenderer({ block }: { block: MetricBlock | ScoreBlock }) {
  const isScore = block.type === 'score' || typeof (block as any).score === 'number';
  const val = isScore ? (block as any).score : (block as any).value;

  return (
    <div className="my-2 inline-flex items-center gap-3 px-3.5 py-2 rounded-xl border border-[#242424] bg-[#101010] shadow-xs">
      <div>
        <span className="text-[10px] font-mono text-[#7E7E7E] uppercase block">{block.label}</span>
        <div className="text-sm font-bold font-mono text-[#F5F5F5]">{val}{isScore && '%'}</div>
      </div>
      {block.category && (
        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-[#151515] border border-[#242424] text-[#BDBDBD]">
          {block.category}
        </span>
      )}
    </div>
  );
}

export function ProgressRenderer({ block }: { block: ProgressBlock }) {
  const pct = block.percentage ?? Math.round((block.current / (block.total || 1)) * 100);

  return (
    <div className="my-2.5 p-3.5 rounded-xl border border-[#242424] bg-[#101010] space-y-2 text-xs shadow-xs">
      <div className="flex items-center justify-between">
        <span className="font-medium text-[#F5F5F5]">{block.label}</span>
        <span className="font-mono text-xs font-bold text-[#F5F5F5]">{pct}%</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-[#151515] overflow-hidden">
        <div
          className="h-full bg-[#8B5CF6] transition-all duration-300 rounded-full"
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] font-mono text-[#7E7E7E]">
        <span>{block.current} of {block.total} completed</span>
        {block.status && <span>{block.status}</span>}
      </div>
    </div>
  );
}

export function ChecklistRenderer({ block }: { block: ChecklistBlock }) {
  return (
    <div className="my-2.5 p-3.5 rounded-xl border border-[#242424] bg-[#101010] space-y-2 text-xs shadow-xs">
      {block.title && (
        <span className="font-bold text-xs text-[#F5F5F5] block">{block.title}</span>
      )}
      <div className="space-y-1.5">
        {block.items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs text-[#BDBDBD]">
            {item.checked ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <span className="w-3.5 h-3.5 rounded-full border border-[#565656] shrink-0" />
            )}
            <span className={cn(item.checked && "font-medium text-[#F5F5F5]")}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ErrorRenderer({
  block,
  locale,
  onRetry,
}: {
  block: ErrorBlock;
  locale: string;
  onRetry?: () => void;
}) {
  const router = useRouter();
  const isCredit = block.errorType === 'CREDIT_EXHAUSTED';
  const isPolicy = block.errorType === 'POLICY_BLOCKED';
  const isJobNotFound = block.errorType === 'JOB_NOT_FOUND';
  const isJobClosed = block.errorType === 'JOB_CLOSED';
  const isJobRelated =
    isJobNotFound ||
    isJobClosed ||
    block.errorType === 'JOB_UNVERIFIED' ||
    block.errorType === 'JOB_UNSUPPORTED' ||
    (block.actionLabel && block.actionLabel.toLowerCase().includes('match'));

  const handleAction = () => {
    if (block.actionUrl) {
      const url =
        block.actionUrl.startsWith('/') && !block.actionUrl.startsWith(`/${locale}`)
          ? `/${locale}${block.actionUrl}`
          : block.actionUrl;
      router.push(url);
    } else if (isJobRelated) {
      router.push(`/${locale}/jobs?tab=recommended`);
    } else if (isCredit) {
      router.push(`/${locale}/pricing`);
    } else if (isPolicy) {
      router.push(`/${locale}/account?tab=application-profile`);
    } else if (onRetry) {
      onRetry();
    }
  };

  const badgeText = isCredit
    ? 'AI CREDITS EXHAUSTED'
    : isPolicy
    ? 'POLICY PROTECTED'
    : isJobNotFound
    ? 'JOB NOT FOUND'
    : isJobClosed
    ? 'JOB CLOSED'
    : block.errorType === 'JOB_UNVERIFIED'
    ? 'VERIFICATION PENDING'
    : block.errorType === 'JOB_UNSUPPORTED'
    ? 'SUBMISSION UNSUPPORTED'
    : 'ACTION UNAVAILABLE';

  return (
    <div className="my-3 w-full rounded-xl border border-amber-800/40 bg-[#0A0A0A] p-4 space-y-3 shadow-xs text-[#F5F5F5]">
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
          {isCredit ? (
            <Zap className="w-4 h-4 text-amber-400" />
          ) : isPolicy ? (
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          ) : isJobRelated ? (
            <Briefcase className="w-4 h-4 text-amber-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-[#F5F5F5]">{block.title}</h4>
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#181818] border border-[#2E2E2E] text-[#9E9E9E]">
              {badgeText}
            </span>
          </div>
          <p className="text-xs text-[#BDBDBD] mt-1 leading-relaxed">{block.message}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-[#242424]">
        {isCredit ? (
          <Button
            size="sm"
            className="h-8 text-xs bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg gap-1.5 font-medium cursor-pointer"
            onClick={handleAction}
          >
            <Zap className="w-3 h-3 text-white" />
            <span>{block.actionLabel || 'Top Up Credits'}</span>
          </Button>
        ) : isPolicy ? (
          <Button
            size="sm"
            className="h-8 text-xs bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg gap-1.5 font-medium cursor-pointer"
            onClick={handleAction}
          >
            <span>{block.actionLabel || 'Review Profile'}</span>
            <ArrowRight className="w-3 h-3 text-white" />
          </Button>
        ) : isJobRelated || block.actionUrl ? (
          <Button
            size="sm"
            className="h-8 text-xs bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg gap-1.5 font-medium cursor-pointer"
            onClick={handleAction}
          >
            <Briefcase className="w-3 h-3 text-white" />
            <span>{block.actionLabel || 'Find Other Matches'}</span>
          </Button>
        ) : onRetry && block.retryable !== false ? (
          <Button
            size="sm"
            className="h-8 text-xs bg-[#1A1A1A] border border-[#2E2E2E] text-[#F5F5F5] hover:bg-[#222222] rounded-lg gap-1.5 font-medium cursor-pointer"
            onClick={handleAction}
          >
            <RotateCcw className="w-3 h-3" />
            <span>{block.actionLabel || 'Try Again'}</span>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
