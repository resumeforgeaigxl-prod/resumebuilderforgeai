/**
 * ResumeForge — Internal Actual Cost (COGS) Accounting Service
 * Tracks underlying model, token, search, and future browser infrastructure costs
 * decoupled from customer-facing credit pricing.
 */

import { createClient } from '@/lib/supabase/server';
import { BILLING_CONFIG } from './config';
import type { UsageCostEntry } from './types';

export class CogsService {
  /**
   * Records real infrastructure cost for an AI or platform operation.
   */
  static async recordUsageCost(params: {
    userId: string;
    action: string;
    provider: string;
    model: string;
    inputTokens?: number;
    outputTokens?: number;
    searchCost?: number;
    browserCost?: number;
    browserMinutes?: number;
    storageCost?: number;
    otherCost?: number;
    currency?: string;
  }): Promise<{ success: boolean; totalCost: number }> {
    const {
      userId,
      action,
      provider,
      model,
      inputTokens = 0,
      outputTokens = 0,
      searchCost = 0,
      browserCost = 0,       // Prepared for future browser levels; 0 in Level 11
      browserMinutes = 0,    // Prepared for future browser levels; 0 in Level 11
      storageCost = 0,
      otherCost = 0,
      currency = 'INR',
    } = params;

    // 1. Calculate AI token cost
    const rates =
      BILLING_CONFIG.modelRates[model] ||
      BILLING_CONFIG.modelRates[provider] ||
      BILLING_CONFIG.modelRates.default;

    const inputCost = (inputTokens / 1000) * rates.inputCostPer1k;
    const outputCost = (outputTokens / 1000) * rates.outputCostPer1k;
    const aiCost = parseFloat((inputCost + outputCost).toFixed(6));

    const totalCost = parseFloat(
      (aiCost + searchCost + browserCost + storageCost + otherCost).toFixed(6)
    );

    // 2. Insert into usage_costs
    const supabase = createClient();
    const { error } = await supabase.from('usage_costs').insert({
      user_id: userId,
      action,
      provider,
      model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      ai_cost: aiCost,
      search_cost: searchCost,
      browser_cost: browserCost,
      browser_minutes: browserMinutes,
      storage_cost: storageCost,
      other_cost: otherCost,
      total_cost: totalCost,
      currency,
    });

    if (error) {
      console.error('[CogsService.recordUsageCost] Insert error:', error.message);
      return { success: false, totalCost: 0 };
    }

    return { success: true, totalCost };
  }

  /**
   * Aggregates COGS for a specific user, action, or date window.
   */
  static async aggregateCOGS(params?: {
    userId?: string;
    action?: string;
    provider?: string;
    since?: string;
  }): Promise<{
    totalCost: number;
    totalAiCost: number;
    totalSearchCost: number;
    totalBrowserCost: number;
    totalTokens: number;
    recordCount: number;
  }> {
    const supabase = createClient();

    let query = supabase.from('usage_costs').select('*');

    if (params?.userId) query = query.eq('user_id', params.userId);
    if (params?.action) query = query.eq('action', params.action);
    if (params?.provider) query = query.eq('provider', params.provider);
    if (params?.since) query = query.gte('created_at', params.since);

    const { data, error } = await query;
    if (error || !data) {
      console.error('[CogsService.aggregateCOGS] Query error:', error?.message);
      return {
        totalCost: 0,
        totalAiCost: 0,
        totalSearchCost: 0,
        totalBrowserCost: 0,
        totalTokens: 0,
        recordCount: 0,
      };
    }

    let totalCost = 0;
    let totalAiCost = 0;
    let totalSearchCost = 0;
    let totalBrowserCost = 0;
    let totalTokens = 0;

    for (const row of data) {
      totalCost += Number(row.total_cost || 0);
      totalAiCost += Number(row.ai_cost || 0);
      totalSearchCost += Number(row.search_cost || 0);
      totalBrowserCost += Number(row.browser_cost || 0);
      totalTokens += Number(row.input_tokens || 0) + Number(row.output_tokens || 0);
    }

    return {
      totalCost: parseFloat(totalCost.toFixed(4)),
      totalAiCost: parseFloat(totalAiCost.toFixed(4)),
      totalSearchCost: parseFloat(totalSearchCost.toFixed(4)),
      totalBrowserCost: parseFloat(totalBrowserCost.toFixed(4)),
      totalTokens,
      recordCount: data.length,
    };
  }
}
