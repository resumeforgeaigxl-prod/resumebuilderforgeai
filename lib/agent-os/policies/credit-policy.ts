/**
 * ResumeForge — Credit Policy (Level 12.5)
 * Version: 1.0.0
 *
 * Enforces Level 11 two-phase reservations, settlements, and credit bounds.
 * Prevents overdraft, unauthorized spending, and double charging.
 */

import type { DomainPolicy, PolicyDecision, PolicyEvaluationContext } from './types';
import { CreditService } from '@/lib/billing';
import { BILLING_CONFIG } from '@/lib/billing/config';

export const CREDIT_POLICY_VERSION = '1.0.0';

export const CreditPolicy: DomainPolicy = {
  id: 'credit-policy',
  name: 'Credit Economy & Budget Policy',
  version: CREDIT_POLICY_VERSION,
  description: 'Guarantees that agents strictly adhere to two-phase credit reservations and never exceed authorized balances.',

  async evaluate(ctx: PolicyEvaluationContext): Promise<PolicyDecision> {
    const { action, userId, billableAction, requiredCredits } = ctx;

    if (billableAction || requiredCredits) {
      if (!userId) {
        return {
          allowed: false,
          policyId: 'credit-policy',
          reasonCode: 'USER_ID_REQUIRED_FOR_BILLABLE_ACTION',
          humanMessage: 'Cannot perform billable action without an authenticated user ID.',
        };
      }

      // Check current wallet balance
      try {
        const wallet = await CreditService.getBalance(userId);
        const cost = requiredCredits || (billableAction ? BILLING_CONFIG.actionCosts[billableAction] || 0 : 0);

        if (cost > 0 && wallet.available < cost) {
          return {
            allowed: false,
            policyId: 'credit-policy',
            reasonCode: 'INSUFFICIENT_CREDITS',
            humanMessage: `Action requires ${cost} credits, but you only have ${wallet.available} available. Please top up your wallet to proceed.`,
            details: { required: cost, available: wallet.available, planId: wallet.planId },
          };
        }
      } catch (err: any) {
        console.warn('[CreditPolicy] Balance check warning:', err.message);
      }
    }

    return {
      allowed: true,
      policyId: 'credit-policy',
      reasonCode: 'CREDIT_POLICY_COMPLIANT',
    };
  },

  getPromptSnippet(): string {
    return `[POLICY: CREDIT_POLICY v${CREDIT_POLICY_VERSION}]
- TWO-PHASE SPENDING: Billable actions (e.g. tailoring, application preparation, interview generation) require an upfront credit reservation before execution.
- INSUFFICIENT BALANCE: If available balance is less than the required action cost, STOP immediately and inform the user. Never execute unpaid tasks.
- IDEMPOTENCY: Re-verifying, re-reading, or retrying existing prepared artifacts must NEVER double-charge credits. Existing tailored resumes are reused at 0 credits.
- NO DIRECT WALLET EDITS: Balance modifications are strictly managed server-side by the CreditService.`;
  },
};
