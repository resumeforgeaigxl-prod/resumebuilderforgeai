'use client';

import type {
  OmniBlock,
  OmniMessage,
  TableBlock,
  TableColumn,
  CodeBlock,
  LearningPlanBlock,
  JobMatchBlock,
  ApplicationBlock,
  ResumeBlock,
  InterviewBlock,
  CodingBlock,
  SalaryBlock,
  ProjectBlock,
  ErrorBlock,
  ActionBlock,
  ActionButton,
  FormBlock,
  StatusBlock,
  MarkdownBlock,
  TextBlock,
} from './types';

/**
 * Validates a single OmniBlock against required schema attributes.
 * Falls back to a safe MarkdownBlock if a structured block is malformed.
 */
export function validateBlock(block: any): OmniBlock {
  if (!block || typeof block !== 'object') {
    return { type: 'text', text: String(block || '') };
  }

  const type = block.type;

  switch (type) {
    case 'text':
      return { type: 'text', text: String(block.text || '') };

    case 'markdown':
      return { type: 'markdown', content: String(block.content || block.text || '') };

    case 'heading':
      return {
        type: 'heading',
        level: [1, 2, 3, 4].includes(block.level) ? block.level : 3,
        text: String(block.text || ''),
      };

    case 'list':
      return {
        type: 'list',
        ordered: Boolean(block.ordered),
        items: Array.isArray(block.items) ? block.items.map(String) : [],
      };

    case 'table':
      if (Array.isArray(block.columns) && Array.isArray(block.rows)) {
        return {
          type: 'table',
          title: block.title,
          columns: block.columns.map((col: any) => ({
            key: String(col.key || col.id || ''),
            label: String(col.label || col.name || col.key || ''),
            align: ['left', 'center', 'right'].includes(col.align) ? col.align : 'left',
            width: col.width,
          })),
          rows: block.rows.map((row: any) => (typeof row === 'object' && row ? row : {})),
          caption: block.caption,
        };
      }
      return { type: 'markdown', content: '```json\n' + JSON.stringify(block, null, 2) + '\n```' };

    case 'code':
      return {
        type: 'code',
        language: String(block.language || 'typescript'),
        code: String(block.code || ''),
        title: block.title,
        showLineNumbers: Boolean(block.showLineNumbers),
      };

    case 'diff':
      return {
        type: 'diff',
        title: block.title,
        language: block.language,
        original: String(block.original || ''),
        modified: String(block.modified || ''),
      };

    case 'metric':
    case 'score':
      return {
        type: type,
        label: String(block.label || 'Score'),
        score: typeof block.score === 'number' ? block.score : Number(block.value || 0),
        value: block.value ?? block.score ?? 0,
        category: block.category,
        total: block.total || 100,
        verdict: block.verdict,
      } as any;

    case 'progress':
      return {
        type: 'progress',
        label: String(block.label || 'Progress'),
        current: Number(block.current || 0),
        total: Number(block.total || 100),
        percentage: block.percentage ?? Math.round((Number(block.current || 0) / Number(block.total || 1)) * 100),
        status: block.status,
      };

    case 'form':
    case 'question':
      return {
        type: 'form',
        id: block.id,
        title: block.title || block.prompt,
        description: block.description,
        fields: Array.isArray(block.fields)
          ? block.fields
          : Array.isArray(block.options)
          ? [
              {
                id: block.id || 'answer',
                label: block.prompt || 'Select an option',
                type: 'radio',
                options: block.options,
                required: true,
              },
            ]
          : [],
        submitLabel: block.submitLabel || 'Submit',
        action: block.action,
      };

    case 'status':
      return {
        type: 'status',
        status: ['success', 'warning', 'info', 'error', 'blocked'].includes(block.status) ? block.status : 'info',
        title: String(block.title || 'Status Update'),
        message: String(block.message || ''),
        details: block.details,
      };

    case 'html_artifact':
      return {
        type: 'html_artifact',
        id: block.id,
        title: String(block.title || 'Component Preview'),
        html: String(block.html || ''),
        description: block.description,
        aspectRatio: block.aspectRatio || '16/9',
      };

    case 'actions':
      return {
        type: 'actions',
        title: block.title,
        actions: Array.isArray(block.actions) ? block.actions : [],
      };

    case 'learning_plan':
      return {
        type: 'learning_plan',
        id: block.id,
        title: String(block.title || block.topic || 'Learning Plan'),
        topic: String(block.topic || block.title || 'Curriculum'),
        durationWeeks: Number(block.durationWeeks || (block.syllabus ? block.syllabus.length : 4)),
        progress: Number(block.progress || 0),
        weeks: block.weeks,
        syllabus: Array.isArray(block.syllabus) ? block.syllabus : undefined,
        status: block.status || 'Active',
      };

    case 'job_match':
      return {
        type: 'job_match',
        jobId: String(block.jobId || ''),
        jobTitle: String(block.jobTitle || 'Target Role'),
        company: String(block.company || 'Company'),
        location: block.location,
        score: Number(block.score || 0),
        category: block.category,
        recommendation: block.recommendation,
        confidence: block.confidence,
        isBlocked: Boolean(block.isBlocked),
        summary: block.summary,
        strongMatches: Array.isArray(block.strongMatches) ? block.strongMatches : [],
        partialMatches: Array.isArray(block.partialMatches) ? block.partialMatches : [],
        missingRequirements: Array.isArray(block.missingRequirements) ? block.missingRequirements : [],
        underrepresentedSkills: Array.isArray(block.underrepresentedSkills) ? block.underrepresentedSkills : [],
        blockers: Array.isArray(block.blockers) ? block.blockers : [],
      };

    case 'job':
      return {
        type: 'job',
        query: block.query,
        count: block.count || (Array.isArray(block.jobs) ? block.jobs.length : 0),
        jobs: Array.isArray(block.jobs)
          ? block.jobs.map((j: any) => ({
              id: j.id,
              title: j.title || 'Software Engineer',
              company: j.company || 'Company',
              location: j.location,
              snippet: j.snippet || j.description,
              description: j.description || j.snippet,
              url: j.apply_url || j.url || j.canonical_url,
              apply_url: j.apply_url || j.url,
              source: j.source,
              salary_min: j.salary_min,
              salary_max: j.salary_max,
              salary_currency: j.salary_currency,
              remote_type: j.remote_type,
            }))
          : [],
        tool: block.tool || 'search_job_market',
        success: block.success ?? true,
      } as any;

    case 'application':
      return {
        type: 'application',
        packageId: block.packageId,
        runId: block.runId,
        jobId: block.jobId,
        jobTitle: String(block.jobTitle || 'Application Package'),
        company: String(block.company || 'Target Company'),
        status: block.status || 'READY',
        readinessScore: block.readinessScore || '100%',
        resumeUsed: block.resumeUsed,
        tailoringStatus: block.tailoringStatus,
        missingQuestionsCount: block.missingQuestionsCount,
        missingQuestions: block.missingQuestions,
        filledFieldsCount: block.filledFieldsCount,
        provider: block.provider,
        submittedAt: block.submittedAt,
        confirmationUrl: block.confirmationUrl,
        applyUrl: block.applyUrl,
        reason: block.reason,
        evidence: block.evidence,
      };

    case 'resume':
      return {
        type: 'resume',
        resumeId: block.resumeId,
        title: String(block.title || 'ATS Optimized Resume'),
        atsScore: Number(block.atsScore || block.newScore || 85),
        scoreCategory: block.scoreCategory,
        matchedSkills: block.matchedSkills,
        missingSkills: block.missingSkills,
        keyImprovements: block.keyImprovements,
        downloadUrl: block.downloadUrl,
        isTailored: Boolean(block.isTailored),
      };

    case 'interview':
      return {
        type: 'interview',
        sessionId: block.sessionId,
        role: String(block.role || 'Software Engineer'),
        difficulty: block.difficulty || 'Mid',
        topicCounts: block.topicCounts,
        focusAreas: block.focusAreas,
        questions: block.questions,
        firstQuestion: block.firstQuestion,
      };

    case 'coding':
      return {
        type: 'coding',
        id: block.id,
        title: String(block.title || 'Coding Drill'),
        difficulty: block.difficulty || 'Medium',
        topic: block.topic,
        description: String(block.description || ''),
        approach: block.approach,
        starterCode: block.starterCode,
        testCases: block.testCases,
        results: block.results,
        summary: block.summary,
      };

    case 'salary':
      return {
        type: 'salary',
        role: String(block.role || 'Target Role'),
        currentOffer: String(block.currentOffer || ''),
        targetSalary: String(block.targetSalary || ''),
        recommendedCounter: block.recommendedCounter,
        script: block.script,
        keyPoints: block.keyPoints,
        marketInsight: block.marketInsight,
      };

    case 'project':
      return {
        type: 'project',
        projectName: String(block.projectName || 'Project Blueprint'),
        techStack: Array.isArray(block.techStack) ? block.techStack : [],
        folderStructure: block.folderStructure,
        files: Array.isArray(block.files) ? block.files : [],
        explanation: block.explanation,
      };

    case 'error':
      return {
        type: 'error',
        errorType: block.errorType || 'GENERAL',
        title: String(block.title || 'Action Error'),
        message: String(block.message || ''),
        actionLabel: block.actionLabel,
        actionUrl: block.actionUrl,
        retryable: block.retryable,
        details: block.details,
      };

    case 'handoff':
      return {
        type: 'handoff',
        questionKey: String(block.questionKey || 'unverified_field'),
        prompt: String(block.prompt || 'Your verification is required'),
        reason: block.reason,
        options: block.options,
        actionLabel: block.actionLabel || 'Confirm & Continue',
      };

    default:
      // Unknown block fallback
      return {
        type: 'markdown',
        content: typeof block === 'string' ? block : JSON.stringify(block, null, 2),
      };
  }
}

/**
 * Parses markdown text containing table structures into TableBlock
 */
export function parseMarkdownTable(text: string): { tableBlock: TableBlock; beforeText: string; afterText: string } | null {
  const tableRegex = /((?:\|[^\n]+\|\r?\n)+)/;
  const match = text.match(tableRegex);
  if (!match) return null;

  const rawTable = match[1].trim();
  const lines = rawTable.split(/\r?\n/).filter(line => line.includes('|'));
  if (lines.length < 2) return null;

  // Header row
  const headerCells = lines[0]
    .split('|')
    .slice(1, -1)
    .map(c => c.trim());
  if (headerCells.length === 0) return null;

  // Separator row check
  if (!lines[1].includes('-')) return null;

  // Rows
  const rows: Record<string, any>[] = [];
  for (let i = 2; i < lines.length; i++) {
    const rowCells = lines[i]
      .split('|')
      .slice(1, -1)
      .map(c => c.trim());
    if (rowCells.length === 0) continue;
    const rowObj: Record<string, any> = {};
    headerCells.forEach((header, idx) => {
      const key = header.toLowerCase().replace(/[^a-z0-9]/g, '_') || `col_${idx}`;
      rowObj[key] = rowCells[idx] ?? '';
    });
    rows.push(rowObj);
  }

  const columns: TableColumn[] = headerCells.map((header, idx) => {
    const key = header.toLowerCase().replace(/[^a-z0-9]/g, '_') || `col_${idx}`;
    // Check if numeric column
    const isNum = rows.some(r => /^\d+(\.\d+)?%?$/.test(String(r[key]).trim()));
    return {
      key,
      label: header,
      align: isNum ? 'right' : 'left',
    };
  });

  const beforeText = text.substring(0, match.index).trim();
  const afterText = text.substring(match.index! + match[0].length).trim();

  return {
    tableBlock: {
      type: 'table',
      columns,
      rows,
    },
    beforeText,
    afterText,
  };
}

/**
 * Parses markdown code fences into CodeBlock
 */
export function parseMarkdownCodeBlock(text: string): { codeBlock: CodeBlock; beforeText: string; afterText: string } | null {
  const codeRegex = /```(\w+)?\r?\n([\s\S]*?)```/;
  const match = text.match(codeRegex);
  if (!match) return null;

  const language = match[1] || 'text';
  const code = match[2];
  const beforeText = text.substring(0, match.index).trim();
  const afterText = text.substring(match.index! + match[0].length).trim();

  return {
    codeBlock: {
      type: 'code',
      language,
      code,
    },
    beforeText,
    afterText,
  };
}

/**
 * Converts a raw or legacy message into a verified array of typed OmniBlocks.
 * Ensures a single message can compose text, tables, code, and specialized domain UI natively.
 */
export function convertMessageToBlocks(msg: Partial<OmniMessage> & { content?: string; artifacts?: any[] }): OmniBlock[] {
  // If message already has explicit blocks, validate each one
  if (Array.isArray(msg.blocks) && msg.blocks.length > 0) {
    return msg.blocks.map(validateBlock);
  }

  const blocks: OmniBlock[] = [];
  let rawContent = msg.content || '';

  // 1. Process artifacts if present
  if (Array.isArray(msg.artifacts) && msg.artifacts.length > 0) {
    for (const art of msg.artifacts) {
      if (!art) continue;

      if (art.tool === 'error_card' || art.errorType) {
        blocks.push(validateBlock({ type: 'error', ...art }));
      } else if (art.tool === 'trigger_study_plan' || art.syllabus || art.durationWeeks) {
        blocks.push(validateBlock({ type: 'learning_plan', ...art }));
      } else if (art.tool === 'get_job_match' || art.tool === 'explain_job_match' || art.score !== undefined && art.strongMatches) {
        blocks.push(validateBlock({ type: 'job_match', ...art }));
      } else if (
        art.tool === 'prepare_job_application_package' ||
        art.tool === 'start_browser_application' ||
        art.tool === 'approve_and_submit_job_application' ||
        art.tool === 'apply_to_job' ||
        art.packageId ||
        (art.status && art.jobTitle)
      ) {
        blocks.push(validateBlock({ type: 'application', ...art }));
      } else if (art.tool === 'audit_resume_ats' || art.tool === 'tailor_resume_for_job' || art.resumeId) {
        blocks.push(validateBlock({ type: 'resume', ...art }));
      } else if (art.tool === 'trigger_coding_challenge' || art.tool === 'run_code_sandbox') {
        blocks.push(validateBlock({ type: 'coding', ...art }));
      } else if (art.tool === 'trigger_mock_interview' || art.tool === 'evaluate_interview_answer') {
        blocks.push(validateBlock({ type: 'interview', ...art }));
      } else if (art.tool === 'search_job_market' || art.jobs) {
        blocks.push(validateBlock({ type: 'job', ...art }));
      } else if (art.tool === 'negotiate_salary_offer') {
        blocks.push(validateBlock({ type: 'salary', ...art }));
      } else if (art.tool === 'generate_project_blueprint') {
        blocks.push(validateBlock({ type: 'project', ...art }));
      } else if (art.html) {
        blocks.push(validateBlock({ type: 'html_artifact', ...art }));
      }
    }
  }

  // 2. Process content string into blocks
  if (rawContent.trim()) {
    // If rawContent contains an embedded or standalone JSON object (e.g. from a tool dump or previously saved message)
    if (rawContent.includes('{"') || rawContent.includes('{ "') || rawContent.includes('```json')) {
      const jsonCandidate = rawContent.startsWith('```')
        ? rawContent.replace(/^```json\s*/, '').replace(/```$/, '').trim()
        : rawContent;

      const jsonMatch = jsonCandidate.match(/\{[\s\S]*"(?:type|tool|jobs|query)"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed && typeof parsed === 'object') {
            if (parsed.jobs || parsed.tool === 'search_job_market' || parsed.type === 'job') {
              blocks.push(validateBlock({ type: 'job', ...parsed }));
              rawContent = rawContent.replace(jsonMatch[0], '').replace(/```json/g, '').replace(/```/g, '').trim();
            } else if (parsed.syllabus || parsed.type === 'learning_plan') {
              blocks.push(validateBlock({ type: 'learning_plan', ...parsed }));
              rawContent = rawContent.replace(jsonMatch[0], '').replace(/```json/g, '').replace(/```/g, '').trim();
            } else if (parsed.packageId || parsed.type === 'application') {
              blocks.push(validateBlock({ type: 'application', ...parsed }));
              rawContent = rawContent.replace(jsonMatch[0], '').replace(/```json/g, '').replace(/```/g, '').trim();
            } else if (parsed.resumeId || parsed.type === 'resume') {
              blocks.push(validateBlock({ type: 'resume', ...parsed }));
              rawContent = rawContent.replace(jsonMatch[0], '').replace(/```json/g, '').replace(/```/g, '').trim();
            }
          }
        } catch {
          // ignore parsing error and proceed with normal text processing
        }
      }
    }

    // If artifacts exist and rawContent contains a large duplicate markdown syllabus/table,
    // keep only the introductory sentence
    if (blocks.length > 0 && (rawContent.includes('|---') || rawContent.includes('###') || (rawContent.match(/\n\s*[-*]\s+/g) || []).length >= 3)) {
      const firstParagraph = rawContent.split(/\n\s*\n/)[0]?.trim();
      if (firstParagraph && !firstParagraph.startsWith('#') && !firstParagraph.startsWith('|') && !firstParagraph.startsWith('{')) {
        blocks.unshift({ type: 'text', text: firstParagraph });
      }
      return blocks;
    }

    // Check for inline markdown tables
    const tableParse = parseMarkdownTable(rawContent);
    if (tableParse) {
      if (tableParse.beforeText) {
        blocks.unshift({ type: 'markdown', content: tableParse.beforeText });
      }
      blocks.push(tableParse.tableBlock);
      if (tableParse.afterText) {
        blocks.push({ type: 'markdown', content: tableParse.afterText });
      }
      return blocks;
    }

    // Check for inline code fences
    const codeParse = parseMarkdownCodeBlock(rawContent);
    if (codeParse) {
      if (codeParse.beforeText) {
        blocks.unshift({ type: 'markdown', content: codeParse.beforeText });
      }
      blocks.push(codeParse.codeBlock);
      if (codeParse.afterText) {
        blocks.push({ type: 'markdown', content: codeParse.afterText });
      }
      return blocks;
    }

    // Normal text/markdown
    if (rawContent.length < 180 && !rawContent.includes('\n') && !rawContent.includes('#')) {
      blocks.unshift({ type: 'text', text: rawContent });
    } else {
      blocks.unshift({ type: 'markdown', content: rawContent });
    }
  }

  // 3. Process suggested actions
  if (msg.suggestedAction) {
    const actionClean = msg.suggestedAction.toLowerCase();
    const isJobAction = actionClean.includes('job');
    const actionLabel = actionClean.includes('coding')
      ? 'Practice Coding'
      : actionClean.includes('interview')
      ? 'Prepare for Interview'
      : actionClean.includes('study') || actionClean.includes('learn')
      ? 'Start Learning Plan'
      : actionClean.includes('resume')
      ? 'Open Resume Editor'
      : isJobAction
      ? 'Explore Jobs'
      : `Open ${msg.suggestedAction}`;

    blocks.push({
      type: 'actions',
      actions: [
        {
          id: isJobAction ? 'explore_jobs' : 'suggested_action',
          label: actionLabel,
          action: isJobAction ? 'explore_jobs' : msg.suggestedAction,
          payload: isJobAction ? { tab: 'recommended' } : undefined,
          variant: 'primary',
        },
      ],
    });
  }

  return blocks.length > 0 ? blocks : [{ type: 'text', text: rawContent || '' }];
}
