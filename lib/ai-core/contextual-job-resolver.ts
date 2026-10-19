/**
 * ResumeForge — Contextual Job Selection & Reference Resolver
 * 
 * Deterministically resolves conversational job references ("first one", "second one",
 * "pick 1st", "apply to this", "choose best match", "apply to all jobs")
 * against the actual active job shortlist in the conversation history.
 * 
 * Ensures:
 * 1. Ordinals resolve to real canonical job UUIDs, never hallucinated titles.
 * 2. If no shortlist exists, instructs agent to fetch fresh eligible matches.
 * 3. Bulk apply commands ("apply to all jobs") are safely rejected by presenting a verified shortlist.
 * 4. Eliminates "null" or "undefined" suggested actions.
 */

export interface ShortlistJob {
  ordinal: number;
  jobId: string;
  jobTitle: string;
  company: string;
  score?: number;
}

export interface JobReferenceIntent {
  type: 'ordinal' | 'best_match' | 'relative' | 'bulk_apply' | null;
  ordinal?: number;
  rawText: string;
}

/**
 * Normalizes and sanitizes suggestedAction strings to prevent "Open null" or "Open undefined".
 */
export function sanitizeSuggestedAction(action: unknown): string | undefined {
  if (!action || typeof action !== 'string') return undefined;
  const trimmed = action.trim();
  const lower = trimmed.toLowerCase();
  if (
    lower === '' ||
    lower === 'null' ||
    lower === 'undefined' ||
    lower === 'none' ||
    lower === 'false' ||
    lower === '0' ||
    lower === 'n/a'
  ) {
    return undefined;
  }
  return trimmed;
}

/**
 * Extracts ordinal, relative, or bulk reference intent from user prompt.
 */
export function extractJobReference(text: string): JobReferenceIntent {
  const rawText = String(text || '').trim();
  const lower = rawText.toLowerCase();

  // 1. Bulk apply / broad apply check
  const bulkRegex = /\b(apply\s+to\s+all|open\s+browser\s+and\s+apply\s+to\s+all|apply\s+to\s+all\s+jobs|auto\s*apply\s+to\s+all|apply\s+all|apply\s+to\s+everything|mass\s+apply)\b/i;
  if (bulkRegex.test(lower)) {
    return { type: 'bulk_apply', rawText };
  }

  // 2. Best / Top match check
  const bestMatchRegex = /\b(best\s+match|top\s+match|highest\s+match|highest\s+score|top\s+one|best\s+one)\b/i;
  if (bestMatchRegex.test(lower)) {
    return { type: 'best_match', ordinal: 1, rawText };
  }

  // 3. Explicit Ordinal words / numbers
  // Matches "first one", "pick first", "the 1st", "second one", "2nd", "3rd", etc.
  const ordinalMap: Record<string, number> = {
    'first': 1, '1st': 1, '1': 1, 'one': 1,
    'second': 2, '2nd': 2, '2': 2, 'two': 2,
    'third': 3, '3rd': 3, '3': 3, 'three': 3,
    'fourth': 4, '4th': 4, '4': 4, 'four': 4,
    'fifth': 5, '5th': 5, '5': 5, 'five': 5,
    'sixth': 6, '6th': 6, '6': 6, 'six': 6,
    'seventh': 7, '7th': 7, '7': 7, 'seven': 7,
    'eighth': 8, '8th': 8, '8': 8, 'eight': 8,
    'ninth': 9, '9th': 9, '9': 9, 'nine': 9,
    'tenth': 10, '10th': 10, '10': 10, 'ten': 10,
  };

  // Specific pattern like "pick first one", "choose the 2nd", "first one", "apply to 1st"
  const ordinalRegex = /(?:pick|choose|select|take|apply\s+to|prepare|start)?\s*(?:the\s+)?(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|1st|2nd|3rd|4th|5th|6th|7th|8th|9th|10th|\b[1-9]\b|\b10\b)(?:\s+(?:one|job|role|position|option))?/i;
  const match = lower.match(ordinalRegex);
  if (match && match[1]) {
    const key = match[1].toLowerCase();
    const ord = ordinalMap[key];
    if (ord) {
      return { type: 'ordinal', ordinal: ord, rawText };
    }
  }

  // 4. Relative references like "apply to this", "prepare this job", "apply to it"
  const relativeRegex = /\b(apply\s+to\s+this|prepare\s+this\s+job|apply\s+to\s+it|prepare\s+this\s+role|apply\s+now|prepare\s+this|this\s+one)\b/i;
  if (relativeRegex.test(lower)) {
    return { type: 'relative', ordinal: 1, rawText };
  }

  return { type: null, rawText };
}

/**
 * Extracts the active job shortlist from recent conversation messages or artifacts.
 */
export function extractConversationShortlist(messages: any[]): ShortlistJob[] {
  if (!Array.isArray(messages) || messages.length === 0) return [];

  // Traverse in reverse chronological order (most recent first)
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (!msg) continue;

    // A. Check structured artifacts in msg
    let artifacts: any[] = [];
    if (Array.isArray(msg.artifacts)) {
      artifacts = msg.artifacts;
    } else if (typeof msg.content === 'string' && msg.content.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(msg.content);
        if (Array.isArray(parsed?.artifacts)) {
          artifacts = parsed.artifacts;
        }
      } catch {
        // Not JSON
      }
    }

    if (artifacts.length > 0) {
      for (const art of artifacts) {
        if (!art) continue;

        // 1. rank_candidate_jobs format
        if ((art.tool === 'rank_candidate_jobs' || art.matches) && Array.isArray(art.matches) && art.matches.length > 0) {
          const list: ShortlistJob[] = art.matches
            .filter((m: any) => m && (m.jobId || m.id))
            .map((m: any, idx: number) => ({
              ordinal: idx + 1,
              jobId: m.jobId || m.id,
              jobTitle: m.jobTitle || m.title || 'Target Role',
              company: m.company || 'Employer',
              score: typeof m.score === 'number' ? m.score : undefined,
            }));
          if (list.length > 0) return list;
        }

        // 2. search_job_market format
        if ((art.tool === 'search_job_market' || art.jobs) && Array.isArray(art.jobs) && art.jobs.length > 0) {
          const list: ShortlistJob[] = art.jobs
            .filter((j: any) => j && (j.jobId || j.id))
            .map((j: any, idx: number) => ({
              ordinal: idx + 1,
              jobId: j.jobId || j.id,
              jobTitle: j.title || j.jobTitle || 'Target Role',
              company: j.company || 'Employer',
            }));
          if (list.length > 0) return list;
        }

        // 3. Single job / application package
        if (art.jobId) {
          return [{
            ordinal: 1,
            jobId: art.jobId,
            jobTitle: art.jobTitle || 'Target Role',
            company: art.company || 'Employer',
          }];
        }
      }
    }

    // B. Check structured blocks in msg
    let blocks: any[] = [];
    if (Array.isArray(msg.blocks)) {
      blocks = msg.blocks;
    }
    for (const block of blocks) {
      if (!block) continue;
      if (block.type === 'job_match' && block.jobId) {
        return [{
          ordinal: 1,
          jobId: block.jobId,
          jobTitle: block.jobTitle || 'Target Role',
          company: block.company || 'Employer',
          score: block.score,
        }];
      }
    }
  }

  return [];
}

/**
 * Builds a structured text annotation summarizing the active shortlist for the agent prompt.
 */
export function formatShortlistForPrompt(shortlist: ShortlistJob[]): string {
  if (!shortlist || shortlist.length === 0) return '';

  const lines = shortlist.map((j) => {
    const scoreStr = j.score !== undefined ? `, Fit: ${j.score}%` : '';
    return `${j.ordinal}. "${j.jobTitle}" at "${j.company}" (Canonical Job ID: "${j.jobId}"${scoreStr})`;
  });

  return `\n\n[Active Job Shortlist in Conversation Context]:\n${lines.join('\n')}\nWhen the user references an ordinal (e.g. "first one", "2nd"), match it directly to the exact Canonical Job ID above.`;
}

/**
 * Resolves user message intent and produces deterministic system instructions or overrides.
 */
export function resolveContextualJobIntent(
  userMessage: string,
  history: any[]
): {
  intent: JobReferenceIntent;
  shortlist: ShortlistJob[];
  systemDirective?: string;
  targetJob?: ShortlistJob;
} {
  const intent = extractJobReference(userMessage);
  const shortlist = extractConversationShortlist(history);

  // 1. Bulk Apply Command
  if (intent.type === 'bulk_apply') {
    return {
      intent,
      shortlist,
      systemDirective: `[System Instruction: User commanded bulk/automated mass apply ("${userMessage}"). ResumeForge policy requires per-role preparation, truthful resume tailoring, and explicit user approval before any submission. Explain this concisely in 1 sentence. Immediately call the 'rank_candidate_jobs' tool to present an active, verified candidate shortlist for them to select from. DO NOT claim the browser was opened without execution.]`,
    };
  }

  // 2. Ordinal / Relative / Best Match Reference
  if (intent.type === 'ordinal' || intent.type === 'best_match' || intent.type === 'relative') {
    const targetOrdinal = intent.ordinal || 1;
    const targetJob = shortlist.find((j) => j.ordinal === targetOrdinal);

    if (targetJob) {
      return {
        intent,
        shortlist,
        targetJob,
        systemDirective: `[System Instruction: Contextual resolution verified. The user selected item #${targetJob.ordinal} ("${targetJob.jobTitle}" at "${targetJob.company}") from the active shortlist. Canonical Job ID: "${targetJob.jobId}". Immediately invoke 'prepare_job_application_package' with jobId: "${targetJob.jobId}". DO NOT guess, invent a job title, or pass an unverified string.]`,
      };
    } else {
      // Ordinal requested but no shortlist exists in history!
      return {
        intent,
        shortlist,
        systemDirective: `[System Instruction: The user is referencing an ordinal (${intent.rawText}), but NO job shortlist was previously displayed in this conversation. DO NOT invent, guess, or hallucinate a job title or UUID. Explain in 1 concise sentence that you have pulled their top active matching jobs, and immediately call 'rank_candidate_jobs' to display an active shortlist.]`,
      };
    }
  }

  return { intent, shortlist };
}
