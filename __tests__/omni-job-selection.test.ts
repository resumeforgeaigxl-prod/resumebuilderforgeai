// @ts-nocheck
import { describe, it, expect } from 'bun:test';
import {
  extractJobReference,
  extractConversationShortlist,
  resolveContextualJobIntent,
  formatShortlistForPrompt,
  sanitizeSuggestedAction,
} from '@/lib/ai-core/contextual-job-resolver';
import { convertMessageToBlocks } from '@/components/agent/blocks/block-converter';
import { toolsRegistry } from '@/lib/ai-core/tools/registry';

describe('P0 — Omni Contextual Job Selection, Tool Execution & Broken Artifacts Audit', () => {

  describe('1. Contextual Job Intent & Ordinal Extraction', () => {
    it('correctly extracts "pick first one" as ordinal 1', () => {
      const intent = extractJobReference('pick first one');
      expect(intent.type).toBe('ordinal');
      expect(intent.ordinal).toBe(1);
    });

    it('correctly extracts variations of the first job: "first one", "1st", "the first one", "number 1"', () => {
      expect(extractJobReference('first one').ordinal).toBe(1);
      expect(extractJobReference('1st').ordinal).toBe(1);
      expect(extractJobReference('choose the first one').ordinal).toBe(1);
      expect(extractJobReference('apply to 1st job').ordinal).toBe(1);
      expect(extractJobReference('number 1').ordinal).toBe(1);
    });

    it('correctly extracts ordinals 2, 3, 4, 5', () => {
      expect(extractJobReference('second one').ordinal).toBe(2);
      expect(extractJobReference('pick 2nd').ordinal).toBe(2);
      expect(extractJobReference('third one').ordinal).toBe(3);
      expect(extractJobReference('3rd').ordinal).toBe(3);
      expect(extractJobReference('fourth one').ordinal).toBe(4);
      expect(extractJobReference('fifth one').ordinal).toBe(5);
    });

    it('correctly extracts "best match" and "top match" as ordinal 1', () => {
      const intent = extractJobReference('choose best match');
      expect(intent.type).toBe('best_match');
      expect(intent.ordinal).toBe(1);

      expect(extractJobReference('apply to top match').ordinal).toBe(1);
      expect(extractJobReference('highest score').ordinal).toBe(1);
    });

    it('correctly extracts relative references like "apply to this" as relative ordinal 1', () => {
      const intent = extractJobReference('apply to this');
      expect(intent.type).toBe('relative');
      expect(intent.ordinal).toBe(1);

      expect(extractJobReference('prepare this job').type).toBe('relative');
      expect(extractJobReference('apply now').type).toBe('relative');
    });

    it('correctly identifies bulk apply commands like "open browser and apply to all jobs"', () => {
      const intent1 = extractJobReference('open browser and apply to all jobs');
      expect(intent1.type).toBe('bulk_apply');

      const intent2 = extractJobReference('apply to all jobs');
      expect(intent2.type).toBe('bulk_apply');

      const intent3 = extractJobReference('auto apply to all');
      expect(intent3.type).toBe('bulk_apply');
    });
  });

  describe('2. Shortlist Extraction & Persistence Across Turns', () => {
    it('extracts ranked job matches from rank_candidate_jobs artifact', () => {
      const mockHistory = [
        { role: 'user', content: 'show me jobs' },
        {
          role: 'assistant',
          content: 'Here are your top jobs:',
          artifacts: [
            {
              tool: 'rank_candidate_jobs',
              matches: [
                { jobId: '00000000-0000-0000-0000-000000000001', jobTitle: 'Frontend Engineer', company: 'Acme Corp', score: 95 },
                { jobId: '00000000-0000-0000-0000-000000000002', jobTitle: 'Fullstack Dev', company: 'Beta Inc', score: 88 },
              ]
            }
          ]
        }
      ];

      const shortlist = extractConversationShortlist(mockHistory);
      expect(shortlist.length).toBe(2);
      expect(shortlist[0].ordinal).toBe(1);
      expect(shortlist[0].jobId).toBe('00000000-0000-0000-0000-000000000001');
      expect(shortlist[0].jobTitle).toBe('Frontend Engineer');
      expect(shortlist[1].ordinal).toBe(2);
      expect(shortlist[1].jobId).toBe('00000000-0000-0000-0000-000000000002');
    });

    it('extracts shortlist from serialized JSON content stored in ai_messages on page reload', () => {
      const mockDbHistory = [
        {
          role: 'assistant',
          content: JSON.stringify({
            reply: 'Found matching roles below',
            artifacts: [
              {
                tool: 'rank_candidate_jobs',
                matches: [
                  { jobId: '11111111-1111-1111-1111-111111111111', jobTitle: 'Platform Engineer', company: 'Delta Co', score: 91 }
                ]
              }
            ]
          })
        }
      ];

      const shortlist = extractConversationShortlist(mockDbHistory);
      expect(shortlist.length).toBe(1);
      expect(shortlist[0].jobId).toBe('11111111-1111-1111-1111-111111111111');
      expect(shortlist[0].jobTitle).toBe('Platform Engineer');
    });

    it('formats active shortlist with canonical UUIDs for LLM prompt annotation', () => {
      const shortlist = [
        { ordinal: 1, jobId: 'abc-123', jobTitle: 'React Lead', company: 'Alpha', score: 94 },
        { ordinal: 2, jobId: 'def-456', jobTitle: 'Node Developer', company: 'Omega', score: 86 }
      ];

      const formatted = formatShortlistForPrompt(shortlist);
      expect(formatted).toContain('1. "React Lead" at "Alpha" (Canonical Job ID: "abc-123", Fit: 94%)');
      expect(formatted).toContain('2. "Node Developer" at "Omega" (Canonical Job ID: "def-456", Fit: 86%)');
      expect(formatted).toContain('match it directly to the exact Canonical Job ID');
    });
  });

  describe('3. Deterministic Contextual Job Intent Resolution', () => {
    it('resolves "pick first one" directly to canonical job #1 from active shortlist', () => {
      const mockHistory = [
        {
          role: 'assistant',
          content: 'Here are matches:',
          artifacts: [
            {
              tool: 'rank_candidate_jobs',
              matches: [
                { jobId: '00000000-0000-0000-0000-000000000001', jobTitle: 'Frontend Engineer', company: 'Acme Corp' },
                { jobId: '00000000-0000-0000-0000-000000000002', jobTitle: 'Backend Dev', company: 'Beta Corp' }
              ]
            }
          ]
        }
      ];

      const resolution = resolveContextualJobIntent('pick first one', mockHistory);
      expect(resolution.targetJob).toBeDefined();
      expect(resolution.targetJob?.jobId).toBe('00000000-0000-0000-0000-000000000001');
      expect(resolution.targetJob?.jobTitle).toBe('Frontend Engineer');
      expect(resolution.systemDirective).toContain('Contextual resolution verified');
      expect(resolution.systemDirective).toContain('00000000-0000-0000-0000-000000000001');
      expect(resolution.systemDirective).toContain('Immediately invoke \'prepare_job_application_package\'');
    });

    it('resolves "pick second one" directly to canonical job #2 from active shortlist', () => {
      const mockHistory = [
        {
          role: 'assistant',
          content: 'Here are matches:',
          artifacts: [
            {
              tool: 'rank_candidate_jobs',
              matches: [
                { jobId: '00000000-0000-0000-0000-000000000001', jobTitle: 'Frontend Engineer', company: 'Acme Corp' },
                { jobId: '00000000-0000-0000-0000-000000000002', jobTitle: 'Backend Dev', company: 'Beta Corp' }
              ]
            }
          ]
        }
      ];

      const resolution = resolveContextualJobIntent('pick second one', mockHistory);
      expect(resolution.targetJob).toBeDefined();
      expect(resolution.targetJob?.jobId).toBe('00000000-0000-0000-0000-000000000002');
      expect(resolution.targetJob?.jobTitle).toBe('Backend Dev');
      expect(resolution.systemDirective).toContain('00000000-0000-0000-0000-000000000002');
    });

    it('falls back safely when user says "pick first one" but NO shortlist exists: instructs rank_candidate_jobs', () => {
      const mockEmptyHistory: any[] = [];
      const resolution = resolveContextualJobIntent('pick first one', mockEmptyHistory);

      expect(resolution.targetJob).toBeUndefined();
      expect(resolution.systemDirective).toContain('NO job shortlist was previously displayed');
      expect(resolution.systemDirective).toContain('DO NOT invent, guess, or hallucinate a job title or UUID');
      expect(resolution.systemDirective).toContain('call \'rank_candidate_jobs\'');
    });

    it('safely handles bulk apply "open browser and apply to all jobs": rejects blind mass apply and presents verified shortlist', () => {
      const resolution = resolveContextualJobIntent('open browser and apply to all jobs', []);
      expect(resolution.intent.type).toBe('bulk_apply');
      expect(resolution.systemDirective).toContain('User commanded bulk/automated mass apply');
      expect(resolution.systemDirective).toContain('ResumeForge policy requires per-role preparation');
      expect(resolution.systemDirective).toContain('Immediately call the \'rank_candidate_jobs\' tool');
      expect(resolution.systemDirective).toContain('DO NOT claim the browser was opened without execution');
    });
  });

  describe('4. "Open null" Elimination & Action Sanitization', () => {
    it('sanitizes "null", "undefined", "none", empty strings to undefined', () => {
      expect(sanitizeSuggestedAction('null')).toBeUndefined();
      expect(sanitizeSuggestedAction('undefined')).toBeUndefined();
      expect(sanitizeSuggestedAction('NULL')).toBeUndefined();
      expect(sanitizeSuggestedAction('none')).toBeUndefined();
      expect(sanitizeSuggestedAction('false')).toBeUndefined();
      expect(sanitizeSuggestedAction('0')).toBeUndefined();
      expect(sanitizeSuggestedAction('   ')).toBeUndefined();
      expect(sanitizeSuggestedAction(null)).toBeUndefined();
      expect(sanitizeSuggestedAction(undefined)).toBeUndefined();
    });

    it('preserves valid suggested action names', () => {
      expect(sanitizeSuggestedAction('JobForge')).toBe('JobForge');
      expect(sanitizeSuggestedAction('ResumeForge')).toBe('ResumeForge');
      expect(sanitizeSuggestedAction('CodingForge')).toBe('CodingForge');
    });

    it('block-converter NEVER creates an "Open null" action when suggestedAction is "null"', () => {
      const blocks = convertMessageToBlocks({
        role: 'assistant',
        content: 'Generation Unavailable',
        suggestedAction: 'null',
      });

      const actionBlocks = blocks.filter((b) => b.type === 'actions');
      expect(actionBlocks.length).toBe(0);

      // Verify no action in any block has label "Open null"
      for (const block of blocks) {
        if (block.type === 'actions' && Array.isArray((block as any).actions)) {
          for (const act of (block as any).actions) {
            expect(act.label).not.toContain('null');
            expect(act.action).not.toBe('null');
          }
        }
      }
    });

    it('block-converter maps valid "JobForge" suggestedAction to Explore Jobs', () => {
      const blocks = convertMessageToBlocks({
        role: 'assistant',
        content: 'Check out these openings',
        suggestedAction: 'JobForge',
      });

      const actionBlock = blocks.find((b) => b.type === 'actions') as any;
      expect(actionBlock).toBeDefined();
      expect(actionBlock.actions[0].label).toBe('Explore Jobs');
      expect(actionBlock.actions[0].action).toBe('explore_jobs');
      expect(actionBlock.actions[0].payload?.tab).toBe('recommended');
    });
  });

  describe('5. Deterministic Error Recovery for Missing or Closed Jobs', () => {
    it('returns JOB_NOT_FOUND error card with "Find Other Matches" when jobId is hallucinated or non-existent', async () => {
      const prepareTool = toolsRegistry['prepare_job_application_package'];
      expect(prepareTool).toBeDefined();

      // Pass the exact hallucinated title from the reported incident
      const result = await prepareTool.execute(
        { jobId: 'Werkstudent Social Media | Marketing' },
        '00000000-0000-0000-0000-000000000000'
      );

      expect(result.success).toBe(false);
      expect(result.status).toBe('BLOCKED');
      expect(result.errorType).toBe('JOB_NOT_FOUND');
      expect(result.title).toBe('Job Not Found in Active Listings');
      expect(result.message).toContain('could not be found in our current listings');
      expect(result.actionLabel).toBe('Find Other Matches');
      expect(result.action).toBe('explore_jobs');
      expect(result.actionUrl).toBe('/jobs?tab=recommended');
    });

    it('converts JOB_NOT_FOUND artifact into structured error block with "Find Other Matches" action', () => {
      const blocks = convertMessageToBlocks({
        role: 'assistant',
        content: '',
        artifacts: [
          {
            tool: 'prepare_job_application_package',
            errorType: 'JOB_NOT_FOUND',
            title: 'Job Not Found in Active Listings',
            message: 'This job could not be found in our current listings. It may have expired or been removed.',
            actionLabel: 'Find Other Matches',
            actionUrl: '/jobs?tab=recommended',
          }
        ]
      });

      const errorBlock = blocks.find((b) => b.type === 'error') as any;
      expect(errorBlock).toBeDefined();
      expect(errorBlock.errorType).toBe('JOB_NOT_FOUND');
      expect(errorBlock.title).toBe('Job Not Found in Active Listings');
      expect(errorBlock.actionLabel).toBe('Find Other Matches');
      expect(errorBlock.actionUrl).toBe('/jobs?tab=recommended');
      expect(errorBlock.actionLabel).not.toBe('Try Again');
    });
  });
});
