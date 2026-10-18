/**
 * ResumeForge — Agent Event Tracer (Level 12.5)
 * Version: 1.0.0
 *
 * Emits auditable execution telemetry for every agent operation.
 * Strictly avoids logging private candidate PII or private model chain-of-thought.
 */

export interface AgentTraceEvent {
  agent: string;
  skill?: string;
  tool?: string;
  inputReferences: Record<string, string | number | boolean>;
  decision: string;
  policyOutcome: string;
  provider?: string;
  model?: string;
  latencyMs: number;
  costCredits?: number;
  timestamp: string;
}

export class AgentTracer {
  private static events: AgentTraceEvent[] = [];
  private static maxInMemoryEvents = 200;

  /**
   * Records a sanitized agent execution event.
   */
  static recordEvent(event: Omit<AgentTraceEvent, 'timestamp'>): AgentTraceEvent {
    const fullEvent: AgentTraceEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    // Sanitize references to ensure no raw passwords or private tokens are logged
    const sanitizedRefs: Record<string, any> = {};
    for (const [k, v] of Object.entries(fullEvent.inputReferences || {})) {
      if (!k.toLowerCase().includes('token') && !k.toLowerCase().includes('secret') && !k.toLowerCase().includes('password')) {
        sanitizedRefs[k] = v;
      }
    }
    fullEvent.inputReferences = sanitizedRefs;

    this.events.unshift(fullEvent);
    if (this.events.length > this.maxInMemoryEvents) {
      this.events.pop();
    }

    return fullEvent;
  }

  /**
   * Retrieves recent sanitized telemetry events.
   */
  static getRecentEvents(limit = 50): readonly AgentTraceEvent[] {
    return this.events.slice(0, limit);
  }

  /**
   * Clears in-memory trace buffer (used in test suites).
   */
  static clear(): void {
    this.events = [];
  }
}
