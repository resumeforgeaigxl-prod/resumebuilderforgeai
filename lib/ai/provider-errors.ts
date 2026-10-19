/** Returns only safe metadata, never provider URLs, prompts, or credentials. */
export function classifyProviderError(error: unknown): { status?: number; category: string; retryable: boolean } {
  const e = error as { status?: number; message?: string; cause?: unknown } | null;
  if (e?.cause && e.cause !== error) return classifyProviderError(e.cause);
  const message = String(e?.message || '');
  const status = Number(e?.status || message.match(/\b(400|401|402|403|404|408|429|500|502|503|504)\b/)?.[1]) || undefined;
  const category = status === 404 ? 'model_unavailable' : status === 401 || status === 403 ? 'authentication' : status === 402 ? 'billing' : status === 429 ? 'rate_limit' : status === 400 ? 'invalid_request' : status && status >= 500 ? 'provider_unavailable' : 'connection';
  return { status, category, retryable: ['rate_limit', 'provider_unavailable', 'connection'].includes(category) };
}
export const OMNI_FAILURE_MESSAGE = "Omni couldn't complete that request. Please try again.";
