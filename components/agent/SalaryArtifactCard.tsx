'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import {
  Scale,
  TrendingUp,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  ChevronRight
} from '@/components/icons';
import { cn } from '@/lib/utils';

export interface SalaryArtifact {
  success?: boolean;
  tool?: 'negotiate_salary_offer' | string;
  role?: string;
  currentOffer?: string;
  targetSalary?: string;
  script?: string;
  keyPoints?: string[];
  marketInsight?: string;
  recommendedCounter?: string;
}

interface SalaryArtifactCardProps {
  artifact: SalaryArtifact;
  locale: string;
}

export function SalaryArtifactCard({ artifact, locale }: SalaryArtifactCardProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const role = artifact.role || 'Software Engineer';
  const currentOffer = artifact.currentOffer || 'Current Offer';
  const targetSalary = artifact.targetSalary || 'Target';
  const counter = artifact.recommendedCounter || targetSalary;
  const keyPoints = artifact.keyPoints || [];

  const handleCopyScript = () => {
    if (!artifact.script) return;
    navigator.clipboard.writeText(artifact.script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3.5 w-full rounded-xl border border-[#242424] bg-[#0A0A0A] p-5 shadow-sm space-y-4 hover:border-[#303030] transition-all text-[#F5F5F5]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-[#242424] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#151515] border border-[#242424] flex items-center justify-center shrink-0 shadow-xs">
            <Scale className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-[#F5F5F5] tracking-tight">
                Executive Salary Negotiation Playbook
              </h4>
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border text-emerald-400 bg-emerald-950/40 border-emerald-800/40">
                {role}
              </span>
            </div>
            <p className="text-xs text-[#7E7E7E] mt-0.5 font-mono">
              Omni Intelligence • Market Compensation & Strategy
            </p>
          </div>
        </div>
      </div>

      {/* Compensation Delta Dial */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg border border-[#242424] bg-[#121212] p-3 space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#7E7E7E]">Baseline Offer</span>
          <div className="text-base font-bold font-mono text-[#BDBDBD]">{currentOffer}</div>
        </div>
        <div className="rounded-lg border border-emerald-800/40 bg-emerald-950/30 p-3 space-y-1">
          <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold">Recommended Counter</span>
          <div className="text-base font-bold font-mono text-emerald-400">{counter}</div>
        </div>
        <div className="rounded-lg border border-[#242424] bg-[#121212] p-3 space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#7E7E7E]">Target Goal</span>
          <div className="text-base font-bold font-mono text-[#F5F5F5]">{targetSalary}</div>
        </div>
      </div>

      {/* Market Insight */}
      {artifact.marketInsight && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#121212] border border-[#242424] text-xs leading-relaxed text-[#BDBDBD]">
          <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#F5F5F5]">Market Benchmark: </span>
            {artifact.marketInsight}
          </div>
        </div>
      )}

      {/* Key Leverage Points */}
      {keyPoints.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-xs font-semibold text-[#F5F5F5] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Negotiation Leverage Justifications</span>
          </div>
          <div className="space-y-1">
            {keyPoints.map((point, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-xs text-[#BDBDBD] bg-[#121212] border border-[#242424] px-3 py-2 rounded-lg"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Negotiation Script Card */}
      {artifact.script && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#F5F5F5]">
              Ready-to-Send Counter Script
            </span>
            <button
              onClick={handleCopyScript}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-[#7E7E7E] hover:text-[#F5F5F5] transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Script</span>
                </>
              )}
            </button>
          </div>
          <div className="p-3.5 rounded-lg bg-[#121212] border border-[#242424] text-xs leading-relaxed text-[#F5F5F5] font-mono whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar">
            {artifact.script}
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[#242424]">
        <Button
          onClick={() => router.push(`/${locale}/salaryforge`)}
          size="sm"
          className="min-h-[44px] h-auto py-2.5 rounded-lg bg-[#1A1A1A] hover:bg-[#222222] text-[#F5F5F5] border border-[#2E2E2E] text-xs font-medium px-3 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Scale className="w-3.5 h-3.5 text-[#7E7E7E]" />
          Review Offer & Details
        </Button>

        <span className="text-[10px] font-mono text-[#7E7E7E]">
          Customized compensation strategy powered by Omni
        </span>
      </div>
    </div>
  );
}
