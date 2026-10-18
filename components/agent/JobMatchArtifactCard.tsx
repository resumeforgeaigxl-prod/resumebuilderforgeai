'use client';

import React from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import {
  Target,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Briefcase,
  Building2,
  FileText,
  ShieldAlert,
  ArrowRight
} from '@/components/icons';
import { cn } from '@/lib/utils';
import type { JobMatchArtifact } from './types';

interface JobMatchArtifactCardProps {
  artifact: JobMatchArtifact;
  locale: string;
  onTailorResume?: (jobTitle: string, jobId?: string) => void;
  onPrepareApplication?: (jobId: string) => void;
}

export function JobMatchArtifactCard({
  artifact,
  locale,
  onTailorResume,
  onPrepareApplication,
}: JobMatchArtifactCardProps) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  const activeLocale =
    (params?.locale as string | undefined) ||
    locale ||
    pathname?.split('/').filter(Boolean)[0] ||
    'en-in';

  // If this is a ranked job list from rank_candidate_jobs
  if (artifact.matches && artifact.matches.length > 0) {
    return (
      <div className="my-3.5 w-full rounded-xl border border-[#242424] bg-[#0A0A0A] p-5 space-y-4 text-[#F5F5F5] shadow-xs">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#242424] pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#151515] border border-[#242424] flex items-center justify-center shrink-0">
              <Target className="w-4 h-4 text-[#8B5CF6]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-semibold text-[#F5F5F5] tracking-tight">
                  Top Ranked Job Opportunities
                </h4>
                <span className="text-[10px] font-mono font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border text-[#C4B5FD] bg-[#8B5CF6]/15 border-[#8B5CF6]/30">
                  {artifact.matches.length} Matches
                </span>
              </div>
              <p className="text-xs text-[#7E7E7E] mt-0.5 font-mono">
                Truth-Verified Match Engine
              </p>
            </div>
          </div>
        </div>

        {/* Ranked Matches List */}
        <div className="space-y-3">
          {artifact.matches.slice(0, 5).map((match, idx) => {
            const isBlocked = match.isBlocked;
            const scoreColor = isBlocked
              ? 'text-rose-400 bg-rose-950/40 border-rose-800/40'
              : match.score >= 80
              ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40'
              : match.score >= 65
              ? 'text-[#C4B5FD] bg-[#8B5CF6]/15 border-[#8B5CF6]/30'
              : 'text-amber-400 bg-amber-950/40 border-amber-800/40';

            return (
              <div
                key={idx}
                className="rounded-lg border border-[#242424] bg-[#121212] p-4 space-y-2.5 hover:border-[#303030] transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h5 className="text-sm font-medium text-[#F5F5F5] tracking-tight">
                      {match.jobTitle || `Job #${match.jobId.slice(0, 8)}`}
                    </h5>
                    {match.company && (
                      <div className="flex items-center gap-1.5 text-xs text-[#7E7E7E] mt-0.5 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-[#7E7E7E]" />
                        <span>{match.company}</span>
                      </div>
                    )}
                  </div>
                  <div className={cn("px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-medium shrink-0", scoreColor)}>
                    {isBlocked ? 'BLOCKED' : `${match.score}% Fit`}
                  </div>
                </div>

                <p className="text-xs text-[#BDBDBD] leading-relaxed">
                  {match.summary}
                </p>

                {/* Skill highlights */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {match.strongMatches?.slice(0, 3).map((s, sIdx) => (
                    <span key={sIdx} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
                      ✓ {s}
                    </span>
                  ))}
                  {match.underrepresentedSkills?.slice(0, 2).map((s, sIdx) => (
                    <span key={sIdx} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#C4B5FD] border border-[#8B5CF6]/30">
                      + Tailor: {s}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#242424]">
                  <Button
                    size="sm"
                    className="h-8 text-xs bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg gap-1.5 font-medium shadow-xs"
                    onClick={() => {
                      if (onPrepareApplication) {
                        onPrepareApplication(match.jobId);
                      } else {
                        router.push(`/${activeLocale}/jobs/${match.jobId}`);
                      }
                    }}
                  >
                    <span>Prepare Application</span>
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs bg-[#1A1A1A] hover:bg-[#222222] border border-[#2E2E2E] hover:border-[#3E3E3E] text-[#F5F5F5] rounded-lg gap-1.5 font-medium"
                    onClick={() => {
                      if (onTailorResume) {
                        onTailorResume(match.jobTitle || 'Target Role', match.jobId);
                      }
                    }}
                  >
                    <FileText className="w-3 h-3 text-[#7E7E7E]" />
                    <span>Tailor Resume</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Single job match card
  const score = artifact.score ?? 78;
  const isBlocked = Boolean(artifact.isBlocked);
  const scoreColor = isBlocked
    ? 'text-rose-400 bg-rose-950/40 border-rose-800/40'
    : score >= 80
    ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40'
    : score >= 65
    ? 'text-[#C4B5FD] bg-[#8B5CF6]/15 border-[#8B5CF6]/30'
    : 'text-amber-400 bg-amber-950/40 border-amber-800/40';

  const title = artifact.jobTitle || 'Role Match Analysis';
  const company = artifact.company || 'Canonical Job';

  return (
    <div className="my-3.5 w-full rounded-xl border border-[#242424] bg-[#0A0A0A] p-5 space-y-4 text-[#F5F5F5] shadow-xs">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-[#242424] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#151515] border border-[#242424] flex items-center justify-center shrink-0">
            <Target className="w-4 h-4 text-[#8B5CF6]" />
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
              Candidate ↔ Job Match • {artifact.confidence || 'HIGH'} Confidence
            </p>
          </div>
        </div>

        {/* Score Pill */}
        <div className={cn("px-3 py-1 rounded-full border text-right shrink-0", scoreColor)}>
          <div className="text-xs font-medium font-mono">
            {isBlocked ? 'BLOCKED' : `${score}% Fit`}
          </div>
        </div>
      </div>

      {/* Blocker alert if blocked */}
      {isBlocked && (
        <div className="rounded-lg border border-rose-800/40 bg-rose-950/30 p-3.5 text-xs text-rose-300 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-rose-200">Application Blocked by Hard Criterion</p>
            <p className="text-rose-300/80 text-[11px] leading-relaxed">
              {artifact.summary || 'A hard blocker prevents recommended application.'}
            </p>
          </div>
        </div>
      )}

      {/* Summary */}
      {!isBlocked && artifact.summary && (
        <p className="text-xs text-[#BDBDBD] leading-relaxed">
          {artifact.summary}
        </p>
      )}

      {/* Breakdown grids */}
      <div className="space-y-2.5 pt-1">
        {/* Strong Matches */}
        {artifact.strongMatches && artifact.strongMatches.length > 0 && (
          <div>
            <div className="text-[11px] font-mono text-[#7E7E7E] uppercase tracking-wider mb-1.5">
              Verified Strong Matches
            </div>
            <div className="flex flex-wrap gap-1.5">
              {artifact.strongMatches.map((item, idx) => (
                <span
                  key={idx}
                  className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{item}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Underrepresented skills */}
        {artifact.underrepresentedSkills && artifact.underrepresentedSkills.length > 0 && (
          <div>
            <div className="text-[11px] font-mono text-[#7E7E7E] uppercase tracking-wider mb-1.5">
              Underrepresented Skills (Tailoring Opportunity)
            </div>
            <div className="flex flex-wrap gap-1.5">
              {artifact.underrepresentedSkills.map((item, idx) => (
                <span
                  key={idx}
                  className="text-xs font-mono px-2.5 py-1 rounded-full bg-[#8B5CF6]/15 text-[#C4B5FD] border border-[#8B5CF6]/30 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-[#8B5CF6]" />
                  <span>{item}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Missing requirements */}
        {artifact.missingRequirements && artifact.missingRequirements.length > 0 && (
          <div>
            <div className="text-[11px] font-mono text-[#7E7E7E] uppercase tracking-wider mb-1.5">
              Missing Requirements
            </div>
            <div className="flex flex-wrap gap-1.5">
              {artifact.missingRequirements.map((item, idx) => (
                <span
                  key={idx}
                  className="text-xs font-mono px-2.5 py-1 rounded-full bg-amber-950/40 text-amber-300 border border-amber-800/40"
                >
                  ! {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-[#242424] flex-wrap">
        {!isBlocked && artifact.jobId && (
          <Button
            size="sm"
            className="h-8 text-xs bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg gap-2 font-medium shadow-xs"
            onClick={() => {
              if (onPrepareApplication && artifact.jobId) {
                onPrepareApplication(artifact.jobId);
              } else if (artifact.jobId) {
                router.push(`/${locale}/jobs/${artifact.jobId}`);
              }
            }}
          >
            <Briefcase className="w-3.5 h-3.5 text-white" />
            <span>Prepare Application Package</span>
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs bg-[#1A1A1A] hover:bg-[#222222] border border-[#2E2E2E] hover:border-[#3E3E3E] text-[#F5F5F5] rounded-lg gap-2 font-medium"
          onClick={() => {
            if (onTailorResume) {
              onTailorResume(title, artifact.jobId);
            } else {
              router.push(`/${activeLocale}/resumes`);
            }
          }}
        >
          <FileText className="w-3.5 h-3.5 text-[#7E7E7E]" />
          <span>Tailor Resume for Role</span>
        </Button>

        {artifact.jobId && (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs rounded-lg gap-1.5 text-[#7E7E7E] hover:text-[#F5F5F5] ml-auto"
            onClick={() => router.push(`/${activeLocale}/jobs/${artifact.jobId}`)}
          >
            <span>View Job</span>
            <ExternalLink className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
