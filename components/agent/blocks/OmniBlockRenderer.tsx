'use client';

import React from 'react';
import type { OmniBlock } from './types';
import { TextRenderer, MarkdownRenderer, HeadingRenderer, ListRenderer } from './renderers/TextRenderer';
import { TableRenderer } from './renderers/TableRenderer';
import { CodeRenderer } from './renderers/CodeRenderer';
import { HtmlArtifactRenderer } from './renderers/HtmlArtifactRenderer';
import { FormRenderer } from './renderers/FormRenderer';
import { LearningPlanRenderer } from './renderers/LearningPlanRenderer';
import { JobMatchRenderer } from './renderers/JobMatchRenderer';
import { ApplicationRenderer } from './renderers/ApplicationRenderer';
import { InterviewRenderer } from './renderers/InterviewRenderer';
import { ActionRenderer } from './renderers/ActionRenderer';
import {
  StatusRenderer,
  MetricRenderer,
  ProgressRenderer,
  ChecklistRenderer,
  ErrorRenderer,
} from './renderers/StatusRenderer';
import { ResumeArtifactCard } from '../ResumeArtifactCard';
import { CodingArtifactCard } from '../CodingArtifactCard';
import { JobArtifactCard } from '../JobArtifactCard';
import { SalaryArtifactCard } from '../SalaryArtifactCard';
import { ProjectArtifactCard } from '../ProjectArtifactCard';

export interface OmniBlockRendererProps {
  block: OmniBlock;
  locale: string;
  onAction?: (actionId: string, payload?: Record<string, any>) => void;
  onFormSubmit?: (values: Record<string, any>) => void;
  onTailorResume?: (jobTitle: string, jobId?: string) => void;
  onPrepareApplication?: (jobId: string) => void;
  onPracticeTopic?: (topic: string) => void;
  onRunCode?: (code: string, language: string) => void;
  onStartInterview?: (role?: string) => void;
  onRetry?: () => void;
  onAnswerQuestion?: (key: string, value: string) => void;
}

/**
 * Canonical Omni Block Dispatcher.
 * Matches on block.type and renders the designated native UI block.
 */
export function OmniBlockRenderer({
  block,
  locale,
  onAction,
  onFormSubmit,
  onTailorResume,
  onPrepareApplication,
  onPracticeTopic,
  onRunCode,
  onStartInterview,
  onRetry,
  onAnswerQuestion,
}: OmniBlockRendererProps) {
  if (!block) return null;

  switch (block.type) {
    case 'text':
      return <TextRenderer block={block} />;

    case 'markdown':
      return <MarkdownRenderer block={block} />;

    case 'heading':
      return <HeadingRenderer block={block} />;

    case 'list':
      return <ListRenderer block={block} />;

    case 'table':
      return <TableRenderer block={block} />;

    case 'code':
      return <CodeRenderer block={block} />;

    case 'html_artifact':
      return <HtmlArtifactRenderer block={block} />;

    case 'form':
    case 'question':
    case 'handoff':
      return <FormRenderer block={block} onSubmit={onFormSubmit} />;

    case 'learning_plan':
      return (
        <LearningPlanRenderer
          block={block}
          locale={locale}
          onPracticeTopic={onPracticeTopic}
          onStartPlan={() => onAction?.('start_plan', { id: block.id })}
        />
      );

    case 'job_match':
      return (
        <JobMatchRenderer
          block={block}
          locale={locale}
          onTailorResume={onTailorResume}
          onPrepareApplication={onPrepareApplication}
          onViewJob={(jobId) => onAction?.('view_job', { jobId })}
        />
      );

    case 'application':
      return (
        <ApplicationRenderer
          block={block}
          locale={locale}
          onAnswerQuestion={onAnswerQuestion}
          onReviewApplication={() => onAction?.('review_application', { packageId: block.packageId })}
        />
      );

    case 'interview':
      return (
        <InterviewRenderer
          block={block}
          locale={locale}
          onStartInterview={onStartInterview}
          onPracticeCoding={(topic) => onPracticeTopic?.(topic || 'Algorithms')}
        />
      );

    case 'resume':
      return <ResumeArtifactCard artifact={block as any} locale={locale} />;

    case 'coding':
      return (
        <CodingArtifactCard
          artifact={block as any}
          locale={locale}
          onRunCode={onRunCode}
        />
      );

    case 'job':
      return (
        <JobArtifactCard
          artifact={block as any}
          locale={locale}
          onTailorResume={onTailorResume}
          onPrepareApplication={onPrepareApplication}
        />
      );

    case 'salary':
      return <SalaryArtifactCard artifact={block as any} locale={locale} />;

    case 'project':
      return <ProjectArtifactCard artifact={block as any} locale={locale} />;

    case 'actions':
      return <ActionRenderer block={block} locale={locale} onAction={onAction} />;

    case 'status':
      return <StatusRenderer block={block} />;

    case 'metric':
    case 'score':
      return <MetricRenderer block={block} />;

    case 'progress':
      return <ProgressRenderer block={block} />;

    case 'checklist':
      return <ChecklistRenderer block={block} />;

    case 'error':
      return <ErrorRenderer block={block} locale={locale} onRetry={onRetry} />;

    default:
      return <MarkdownRenderer block={{ type: 'markdown', content: JSON.stringify(block, null, 2) }} />;
  }
}
