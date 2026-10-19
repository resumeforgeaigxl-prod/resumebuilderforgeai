'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import {
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ChevronRight,
  User,
  ClipboardCheck,
  Clock,
  Sparkles
} from '@/components/icons';

export interface ProfileArtifact {
  tool?: 'check_application_readiness' | 'get_candidate_profile' | 'update_candidate_application_answer' | string;
  status?: 'READY' | 'READY_WITH_CONFIRMATION' | 'NOT_READY' | string;
  readinessStatus?: string;
  summary?: string;
  readinessSummary?: string;
  completeness?: string | number;
  completenessPercentage?: number;
  blockers?: string[];
  missingCritical?: string[];
  actionLink?: string;
  shortcutPrompt?: string;
  message?: string;
}

interface ProfileArtifactCardProps {
  artifact: ProfileArtifact;
  locale: string;
}

export function ProfileArtifactCard({ artifact, locale }: ProfileArtifactCardProps) {
  const router = useRouter();

  const status = artifact.status || artifact.readinessStatus || 'READY_WITH_CONFIRMATION';
  const completeness = artifact.completeness || (artifact.completenessPercentage ? `${artifact.completenessPercentage}%` : '80%');
  const summary = artifact.summary || artifact.readinessSummary || artifact.message || 'Application Profile Status';
  const blockers = artifact.blockers || artifact.missingCritical || [];

  const handleOpenProfile = () => {
    router.push(`/${locale}/account?tab=application-profile`);
  };

  return (
    <div className="my-3.5 w-full rounded-xl border border-[#242424] bg-[#0A0A0A] p-5 shadow-sm space-y-4 hover:border-[#303030] transition-all text-[#F5F5F5]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-[#242424] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#151515] border border-[#242424] flex items-center justify-center shrink-0 shadow-xs">
            <ClipboardCheck className="w-5 h-5 text-[#8B5CF6]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-[#F5F5F5] tracking-tight">
                Candidate Application Profile
              </h4>
              {status === 'READY' && (
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border text-emerald-400 bg-emerald-950/40 border-emerald-800/40 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> READY
                </span>
              )}
              {status === 'READY_WITH_CONFIRMATION' && (
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border text-amber-400 bg-amber-950/40 border-amber-800/40 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-400" /> CONFIRMATION NEEDED
                </span>
              )}
              {status === 'NOT_READY' && (
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border text-rose-400 bg-rose-950/40 border-rose-800/40 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-rose-400" /> INCOMPLETE
                </span>
              )}
            </div>
            <p className="text-xs text-[#7E7E7E] mt-0.5">
              Authoritative candidate answers used by Omni for job applications
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#7E7E7E]">Completeness</div>
          <div className="text-sm font-bold font-mono text-[#F5F5F5]">{completeness}</div>
        </div>
      </div>

      {/* Summary */}
      <p className="text-xs text-[#BDBDBD] leading-relaxed">
        {summary}
      </p>

      {/* Blockers List */}
      {blockers.length > 0 && (
        <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-xs text-amber-300 space-y-1">
          <div className="font-semibold flex items-center gap-1.5 text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Missing Application Details:
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-amber-200/90 pl-1 text-[11px]">
            {blockers.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA Button */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-[#7E7E7E]">
          Omni will never guess work authorization or sensitive fields.
        </span>
        <Button
          onClick={handleOpenProfile}
          size="sm"
          className="min-h-[44px] h-auto py-2.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-medium px-4 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <span>Complete Profile</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
