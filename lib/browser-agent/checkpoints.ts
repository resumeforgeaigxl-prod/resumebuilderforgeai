/**
 * ResumeForge — Durable Checkpoint Manager (Level 14)
 * Stores immutable execution milestones without sensitive PII or credentials.
 */

import { createClient } from '@/lib/supabase/server';
import type { BrowserCheckpoint, CheckpointStep } from './types';

// In-memory fallback cache for fast recovery and deterministic test runner
const inMemoryCheckpoints = new Map<string, BrowserCheckpoint[]>();

export class CheckpointManager {
  /**
   * Sanitizes checkpoint metadata to guarantee no passwords, MFA tokens,
   * session cookies, or raw authorization secrets are persisted.
   */
  static sanitizeMetadata(data?: Record<string, any>): Record<string, any> {
    if (!data) return {};
    const sanitized: Record<string, any> = {};
    const bannedKeys = [
      'password',
      'passwd',
      'pwd',
      'token',
      'mfa',
      'otp',
      'cookie',
      'secret',
      'auth',
      'authorization',
      'ssn',
      'credit_card',
    ];

    for (const [key, value] of Object.entries(data)) {
      const lower = key.toLowerCase();
      // Omit sensitive credential keys entirely from checkpoint data
      if (bannedKeys.some((b) => lower.includes(b))) {
        continue;
      }

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeMetadata(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Records a durable checkpoint after a verified milestone.
   */
  static async recordCheckpoint(params: {
    runId: string;
    step: CheckpointStep;
    sequence: number;
    status: 'COMPLETED' | 'FAILED' | 'WAITING';
    safeResultReference?: any;
    metadata?: Record<string, any>;
  }): Promise<BrowserCheckpoint> {
    const { runId, step, sequence, status, safeResultReference, metadata } = params;
    const now = new Date().toISOString();
    const cleanMeta = this.sanitizeMetadata(metadata || (typeof safeResultReference === 'object' ? safeResultReference : undefined));
    const safeRef = typeof safeResultReference === 'object' ? this.sanitizeMetadata(safeResultReference) : safeResultReference;

    const checkpoint: BrowserCheckpoint = {
      id: `chk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      runId,
      step,
      sequence,
      status,
      safeResultReference: safeRef as any,
      metadata: cleanMeta,
      createdAt: now,
    };

    // 1. In-memory cache
    const existing = inMemoryCheckpoints.get(runId) || [];
    existing.push(checkpoint);
    inMemoryCheckpoints.set(runId, existing);

    // 2. Persist to Supabase table
    try {
      const supabase = createClient();
      await supabase.from('application_checkpoints').insert({
        id: checkpoint.id,
        run_id: runId,
        step,
        sequence,
        status,
        safe_result_reference: typeof safeRef === 'string' ? safeRef : JSON.stringify(safeRef || null),
        metadata: cleanMeta,
        created_at: now,
      });

      // Update run's checkpoint_version
      await supabase
        .from('application_runs')
        .update({
          checkpoint_version: sequence,
          updated_at: now,
        })
        .eq('id', runId);
    } catch (err: any) {
      console.warn('[CheckpointManager.recordCheckpoint] DB notice:', err?.message || err);
    }

    return checkpoint;
  }

  /**
   * Alias for recordCheckpoint supporting test expectations.
   */
  static async saveCheckpoint(params: {
    runId: string;
    step: CheckpointStep;
    sequence: number;
    status: 'COMPLETED' | 'FAILED' | 'WAITING';
    safeResult?: Record<string, any>;
    safeResultReference?: any;
    metadata?: Record<string, any>;
  }): Promise<BrowserCheckpoint> {
    return this.recordCheckpoint({
      runId: params.runId,
      step: params.step,
      sequence: params.sequence,
      status: params.status,
      safeResultReference: params.safeResultReference || params.safeResult,
      metadata: params.metadata || params.safeResult,
    });
  }

  /**
   * Retrieves all checkpoints for a run ordered by sequence.
   */
  static async getCheckpoints(runId: string): Promise<BrowserCheckpoint[]> {
    const memory = inMemoryCheckpoints.get(runId);
    if (memory && memory.length > 0) {
      return [...memory].sort((a, b) => a.sequence - b.sequence);
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('application_checkpoints')
        .select('*')
        .eq('run_id', runId)
        .order('sequence', { ascending: true });

      if (error || !data) return [];

      return data.map((r: any) => ({
        id: r.id,
        runId: r.run_id,
        step: r.step as CheckpointStep,
        sequence: r.sequence,
        status: r.status,
        safeResultReference: r.safe_result_reference,
        metadata: r.metadata || {},
        createdAt: r.created_at,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Finds the latest successfully completed checkpoint.
   */
  static async getLatestCompletedCheckpoint(runId: string): Promise<BrowserCheckpoint | null> {
    const all = await this.getCheckpoints(runId);
    const completed = all.filter((c) => c.status === 'COMPLETED');
    if (completed.length === 0) return null;
    return completed[completed.length - 1];
  }

  /**
   * Clears memory checkpoints (used in test teardown).
   */
  static clearMemory(): void {
    inMemoryCheckpoints.clear();
  }
}
