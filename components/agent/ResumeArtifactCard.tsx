'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import {
  FileText,
  Sparkles,
  ShieldCheck,
  FileDown,
  ExternalLink,
  Check,
  CheckCircle2,
  TrendingUp,
  Copy
} from '@/components/icons';
import { cn } from '@/lib/utils';

export interface ResumeArtifact {
  success?: boolean;
  tool?: 'audit_resume_ats' | 'tailor_resume_for_job' | 'trigger_resume_generation' | string;
  resumeId?: string;
  title?: string;
  atsScore?: number;
  newScore?: number;
  previousScore?: number;
  scoreImprovement?: string;
  scoreCategory?: string;
  matchedSkills?: string[];
  missingSkills?: string[];
  feedback?: string[];
  keyImprovements?: string[];
  downloadUrl?: string;
  message?: string;
}

interface ResumeArtifactCardProps {
  artifact: ResumeArtifact;
  locale: string;
}

export function ResumeArtifactCard({ artifact, locale }: ResumeArtifactCardProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const router = useRouter();

  const score = artifact.newScore || artifact.atsScore || 85;
  const isTailored = artifact.tool === 'tailor_resume_for_job';
  const isGenerated = artifact.tool === 'trigger_resume_generation';
  const isAudit = artifact.tool === 'audit_resume_ats';

  const downloadUrl =
    artifact.downloadUrl ||
    (artifact.resumeId ? `/api/resume/download?id=${artifact.resumeId}` : null);

  const handleDownload = () => {
    if (!downloadUrl) return;
    setDownloading(true);
    window.open(downloadUrl, '_blank');
    setTimeout(() => setDownloading(false), 1500);
  };

  const handleEdit = () => {
    router.push(`/${locale}/resumes`);
  };

  const handleCopySummary = () => {
    const summary = `${artifact.title || 'Resume'} | ATS Score: ${score}/100\nMatched: ${(artifact.matchedSkills || []).join(', ')}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3.5 w-full rounded-xl border border-[#242424] bg-[#0A0A0A] p-5 shadow-sm space-y-4 hover:border-[#303030] transition-all text-[#F5F5F5]">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 border-b border-[#242424] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#151515] border border-[#242424] flex items-center justify-center shrink-0 shadow-xs">
            {isTailored ? (
              <Sparkles className="w-5 h-5 text-[#C4B5FD]" />
            ) : isGenerated ? (
              <FileText className="w-5 h-5 text-[#8B5CF6]" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-[#F5F5F5] tracking-tight">
                {artifact.title || 'Candidate Resume'}
              </h4>
              <span
                className={cn(
                  "text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border",
                  isTailored || isGenerated
                    ? "text-[#C4B5FD] bg-[#8B5CF6]/10 border-[#8B5CF6]/30"
                    : "text-emerald-400 bg-emerald-950/40 border-emerald-800/40"
                )}
              >
                {isTailored ? 'AI Tailored Version' : isGenerated ? 'AI Generated' : 'ATS Audit'}
              </span>
            </div>
            <p className="text-xs text-[#7E7E7E] mt-0.5 font-mono">
              Omni Resume Analysis • {artifact.resumeId ? `ID: ${artifact.resumeId.slice(0, 8)}...` : 'Active'}
            </p>
          </div>
        </div>

        {/* Credit Receipt Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#121212] border border-[#242424] text-[10px] font-mono text-[#BDBDBD] shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>⚡ 5 Credits • Autonomous Ledger</span>
        </div>
      </div>

      {/* Score & Key Match Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* ATS Score Dial Box */}
        <div className="flex items-center gap-4 p-3.5 rounded-lg bg-[#121212] border border-[#242424]">
          <div className="relative w-14 h-14 rounded-full border-2 border-[#242424] flex items-center justify-center shrink-0 bg-[#0A0A0A]">
            <span className="text-base font-bold text-[#F5F5F5] tracking-tighter">
              {score}
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#F5F5F5]">ATS Match Score</span>
              {artifact.scoreImprovement && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-1.5 py-0.5 rounded-full">
                  <TrendingUp className="w-2.5 h-2.5" />
                  {artifact.scoreImprovement}
                </span>
              )}
            </div>
            <p
              className={cn(
                "text-xs font-medium",
                score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-rose-400"
              )}
            >
              {score >= 80 ? '✓ Strong Recruiter Pass' : score >= 60 ? '⚡ Moderate Compatibility' : '⚠ Needs Keyword Tuning'}
            </p>
          </div>
        </div>

        {/* Skills Matched Chips Box */}
        <div className="p-3.5 rounded-lg bg-[#121212] border border-[#242424] space-y-2">
          <span className="text-xs font-bold text-[#F5F5F5] block">Key Matched Skills</span>
          <div className="flex flex-wrap gap-1.5">
            {(artifact.matchedSkills || ['Core Stack', 'TypeScript', 'Node.js', 'React'])
              .slice(0, 5)
              .map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 px-2 py-0.5 rounded-md"
                >
                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                  {skill}
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* Improvements / Feedback */}
      {((artifact.keyImprovements && artifact.keyImprovements.length > 0) ||
        (artifact.feedback && artifact.feedback.length > 0)) && (
        <div className="rounded-lg bg-[#121212] border border-[#242424] p-3.5 space-y-2">
          <span className="text-xs font-bold text-[#F5F5F5]">Autonomous Enhancements</span>
          <ul className="space-y-1 text-xs text-[#BDBDBD]">
            {(artifact.keyImprovements || artifact.feedback || []).slice(0, 3).map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Missing Skills Recommendation */}
      {artifact.missingSkills && artifact.missingSkills.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-[#7E7E7E] bg-[#121212] border border-[#242424] px-3.5 py-2 rounded-lg">
          <span className="font-semibold text-[#F5F5F5]">Recommended additions:</span>
          <div className="flex flex-wrap gap-1">
            {artifact.missingSkills.map((ms, idx) => (
              <span
                key={idx}
                className="text-[10px] font-mono bg-[#1A1A1A] border border-[#2A2A2A] text-[#BDBDBD] px-1.5 py-0.5 rounded"
              >
                + {ms}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-2">
          {downloadUrl && (
            <Button
              onClick={handleDownload}
              size="sm"
              className="h-8 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-medium px-3.5 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              {downloading ? 'Opening PDF...' : 'Download PDF'}
            </Button>
          )}
          <Button
            onClick={handleEdit}
            size="sm"
            className="h-8 rounded-lg bg-[#1A1A1A] hover:bg-[#222222] text-[#F5F5F5] border border-[#2E2E2E] text-xs font-medium px-3.5 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#7E7E7E]" />
            Open Resume Editor
          </Button>
          <button
            onClick={handleCopySummary}
            className="text-xs text-[#7E7E7E] hover:text-[#F5F5F5] p-1.5 transition-colors flex items-center gap-1 cursor-pointer"
            title="Copy ATS Summary"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span className="text-[10px] font-mono">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <span className="text-[10px] font-mono text-[#7E7E7E]">
          Optimized for Greenhouse & Workday
        </span>
      </div>
    </div>
  );
}
