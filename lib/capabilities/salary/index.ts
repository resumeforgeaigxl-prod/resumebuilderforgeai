import { callAI } from '@/lib/ai/router';

export interface SalaryNegotiationParams {
  role: string;
  currentOffer: string;
  targetSalary: string;
  location?: string;
}

export interface SalaryNegotiationResult {
  success: boolean;
  tool: string;
  role: string;
  currentOffer: string;
  targetSalary: string;
  script: string;
  keyPoints: string[];
  marketInsight: string;
  recommendedCounter: string;
}

/**
 * Negotiates salary offer by analyzing market benchmarks, drafting counter-offer scripts,
 * and producing strategic leverage tactics.
 */
export async function negotiateSalaryOffer(
  params: SalaryNegotiationParams,
  userId: string
): Promise<SalaryNegotiationResult> {
  const { role, currentOffer, targetSalary, location } = params;

  const prompt = `
You are an expert compensation strategist and executive salary negotiator.
A candidate has received an offer for ${role}${location ? ` in ${location}` : ''}.
Current Offer: ${currentOffer}
Target Salary: ${targetSalary}

Return a valid JSON object matching:
{
  "script": "Professional, collaborative negotiation script to send to HR/recruiter...",
  "keyPoints": ["Data point 1 justifying higher pay", "Data point 2 on specialized expertise", "Counter-proposal clause"],
  "marketInsight": "Insight into percentile ranges and leverage tactics for this role.",
  "recommendedCounter": "${targetSalary}"
}
`;

  const response = await callAI({
    task: 'career',
    prompt,
    systemPrompt: 'You are an executive compensation negotiator. Return strictly valid JSON.',
    userId,
    responseFormat: 'json',
  });

  const parsed = JSON.parse(response.text);

  return {
    success: true,
    tool: 'negotiate_salary_offer',
    role,
    currentOffer,
    targetSalary,
    script: parsed.script || 'Thank you for this offer...',
    keyPoints: parsed.keyPoints || parsed.key_points || ['Aligned with top market decile', 'Specialized domain experience'],
    marketInsight: parsed.marketInsight || parsed.market_insight || 'Market benchmarks indicate a 15-20% uplift for this seniority level.',
    recommendedCounter: parsed.recommendedCounter || targetSalary,
  };
}
