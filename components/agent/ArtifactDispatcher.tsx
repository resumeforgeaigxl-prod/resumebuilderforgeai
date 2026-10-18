'use client';

import React from 'react';
import type { OmniArtifact } from './types';
import { ResumeArtifactCard } from './ResumeArtifactCard';
import { CodingArtifactCard } from './CodingArtifactCard';
import { InterviewArtifactCard } from './InterviewArtifactCard';
import { JobArtifactCard } from './JobArtifactCard';
import { JobMatchArtifactCard } from './JobMatchArtifactCard';
import { ApplicationArtifactCard } from './ApplicationArtifactCard';
import { LearningArtifactCard } from './LearningArtifactCard';
import { ProjectArtifactCard } from './ProjectArtifactCard';
import { SalaryArtifactCard } from './SalaryArtifactCard';
import { ProfileArtifactCard } from './ProfileArtifactCard';
import { ErrorArtifactCard } from './ErrorArtifactCard';

export interface ArtifactDispatcherProps {
  artifact: any;
  locale: string;
  onSendMessage?: (msg: string, mode?: string) => void;
  onTailorResume?: (jobTitle: string, jobId?: string) => void;
  onPrepareApplication?: (jobId: string) => void;
  onPracticeTopic?: (topic: string) => void;
  onRunCode?: (code: string, language: string) => void;
  onRetry?: () => void;
  onTopUp?: () => void;
}

export function ArtifactDispatcher({
  artifact,
  locale,
  onSendMessage,
  onTailorResume,
  onPrepareApplication,
  onPracticeTopic,
  onRunCode,
  onRetry,
  onTopUp,
}: ArtifactDispatcherProps) {
  if (!artifact) return null;

  // 1. Error / Handoff / Credit Limits
  if (
    artifact.tool === 'error_card' ||
    artifact.errorType ||
    (artifact.error && !artifact.tool)
  ) {
    const errorArtifact = {
      errorType: artifact.errorType || (artifact.error?.includes('credit') ? 'CREDIT_EXHAUSTED' : 'TOOL_FAILED'),
      title: artifact.title || 'Action Interrupted',
      message: artifact.message || artifact.error || 'The requested operation could not be completed.',
      actionLabel: artifact.actionLabel,
      actionUrl: artifact.actionUrl,
      retryable: artifact.retryable,
      details: artifact.details,
    };
    return (
      <ErrorArtifactCard
        artifact={errorArtifact}
        locale={locale}
        onRetry={onRetry}
        onTopUp={onTopUp}
      />
    );
  }

  // 2. Application Preparation Package (Level 12)
  if (
    artifact.tool === 'prepare_job_application_package' ||
    artifact.tool === 'answer_application_questions' ||
    artifact.packageId ||
    (artifact.status && ['READY', 'NEEDS_USER', 'BLOCKED'].includes(artifact.status) && artifact.jobTitle)
  ) {
    return (
      <ApplicationArtifactCard
        artifact={artifact}
        locale={locale}
        onAnswerQuestion={(key, ans) => {
          if (onSendMessage) {
            onSendMessage(`Update my answer for ${key}: ${ans}`, 'Jobs');
          }
        }}
        onFindReplacements={(role) => {
          if (onSendMessage) {
            onSendMessage(`Find alternative active roles for ${role || 'my profile'}`, 'Jobs');
          }
        }}
      />
    );
  }

  // 3. Candidate ↔ Job Matching & Ranking (Level 10)
  if (
    artifact.tool === 'get_job_match' ||
    artifact.tool === 'explain_job_match' ||
    artifact.tool === 'rank_candidate_jobs' ||
    artifact.matches ||
    (artifact.score !== undefined && artifact.category && (artifact.strongMatches || artifact.underrepresentedSkills))
  ) {
    return (
      <JobMatchArtifactCard
        artifact={artifact}
        locale={locale}
        onTailorResume={(jobTitle, jobId) => {
          if (onTailorResume) {
            onTailorResume(jobTitle, jobId);
          } else if (onSendMessage) {
            onSendMessage(`Tailor my resume for ${jobTitle}`, 'Resume');
          }
        }}
        onPrepareApplication={(jobId) => {
          if (onPrepareApplication) {
            onPrepareApplication(jobId);
          } else if (onSendMessage) {
            onSendMessage(`Prepare my application package for job ID ${jobId}`, 'Jobs');
          }
        }}
      />
    );
  }

  // 4. Resume Artifacts (Audit, Tailoring, Generation)
  if (
    artifact.tool === 'audit_resume_ats' ||
    artifact.tool === 'tailor_resume_for_job' ||
    artifact.tool === 'trigger_resume_generation' ||
    artifact.resumeId
  ) {
    return <ResumeArtifactCard artifact={artifact} locale={locale} />;
  }

  // 5. Coding Sandbox & Challenge Artifacts
  if (
    artifact.tool === 'trigger_coding_challenge' ||
    artifact.tool === 'run_code_sandbox'
  ) {
    return (
      <CodingArtifactCard
        artifact={artifact}
        locale={locale}
        onRunCode={(code, lang) => {
          if (onRunCode) {
            onRunCode(code, lang);
          } else if (onSendMessage) {
            onSendMessage(`Run this ${lang} code in the sandbox:\n\`\`\`${lang}\n${code}\n\`\`\``, 'Coding');
          }
        }}
      />
    );
  }

  // 6. Mock Interview & STAR Evaluation Artifacts
  if (
    artifact.tool === 'trigger_mock_interview' ||
    artifact.tool === 'evaluate_interview_answer'
  ) {
    return <InterviewArtifactCard artifact={artifact} locale={locale} />;
  }

  // 7. Live Job Market Search
  if (artifact.tool === 'search_job_market' || artifact.jobs) {
    return (
      <JobArtifactCard
        artifact={artifact}
        locale={locale}
        onTailorResume={(jobTitle, jobDesc) => {
          if (onSendMessage) {
            onSendMessage(`Tailor my resume for the role of ${jobTitle}. Here are the job requirements:\n${jobDesc || ''}`, 'Resume');
          }
        }}
      />
    );
  }

  // 8. Learning Roadmap & Milestones
  if (
    artifact.tool === 'trigger_study_plan' ||
    artifact.tool === 'add_study_topic' ||
    artifact.syllabus
  ) {
    return (
      <LearningArtifactCard
        artifact={artifact}
        locale={locale}
        onPracticeTopic={(topic) => {
          if (onPracticeTopic) {
            onPracticeTopic(topic);
          } else if (onSendMessage) {
            onSendMessage(`Give me a coding challenge on ${topic} to practice for this roadmap milestone.`, 'Coding');
          }
        }}
      />
    );
  }

  // 9. Portfolio Project Blueprint
  if (artifact.tool === 'generate_project_blueprint') {
    return <ProjectArtifactCard artifact={artifact} locale={locale} />;
  }

  // 10. Salary Benchmark & Counter Strategy
  if (artifact.tool === 'negotiate_salary_offer') {
    return <SalaryArtifactCard artifact={artifact} locale={locale} />;
  }

  // 11. Candidate Application Profile Readiness
  if (
    artifact.tool === 'check_application_readiness' ||
    artifact.tool === 'get_candidate_profile' ||
    artifact.tool === 'update_candidate_application_answer'
  ) {
    return <ProfileArtifactCard artifact={artifact} locale={locale} />;
  }

  return null;
}
