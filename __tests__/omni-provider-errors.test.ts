import { classifyProviderError } from '@/lib/ai/provider-errors';

describe('Omni provider recovery', () => {
  test.each([400, 401, 402, 403, 404])('does not retry permanent HTTP %s failures', status => {
    expect(classifyProviderError({ status }).retryable).toBe(false);
  });
  test.each([408, 429, 500, 503])('allows recovery from HTTP %s', status => {
    expect(classifyProviderError({ status }).retryable).toBe(true);
  });
  it('preserves the category through a safe error wrapper without leaking details', () => {
    const result = classifyProviderError(new Error('Safe message', { cause: { status: 404, message: 'https://provider/private?key=secret' } }));
    expect(result).toEqual({ status: 404, category: 'model_unavailable', retryable: false });
    expect(JSON.stringify(result)).not.toContain('secret');
  });
});
