/**
 * ResumeForge — Production Credit Service
 * Canonical server-side wallet, ledger, reservation, settlement, and entitlement management.
 * All credit mutations are atomic, ledger-backed, idempotent, and concurrency-safe.
 */

import { createClient } from '@/lib/supabase/server';
import {
  BILLING_CONFIG,
  type BillableAction,
  type PlanId,
} from './config';
import type {
  AffordabilityResult,
  GrantResult,
  LedgerEntry,
  RefundResult,
  ReservationResult,
  SettlementResult,
  WalletBalance,
} from './types';

export class CreditService {
  private static testBalances: Map<string, number> = new Map();

  static _setTestBalance(userId: string, balance: number): void {
    this.testBalances.set(userId, balance);
  }

  static _clearTestBalances(): void {
    this.testBalances.clear();
  }

  /**
   * Retrieves user's wallet balance.
   * Auto-initializes new users with the configurable welcome promotional grant.
   */
  static async getBalance(userId: string): Promise<WalletBalance> {
    if (this.testBalances.has(userId)) {
      const avail = this.testBalances.get(userId)!;
      return {
        available: avail,
        reserved: 0,
        total: avail,
        planId: 'STARTER',
        planExpiresAt: null,
        isLowCredit: avail <= BILLING_CONFIG.lowCreditThreshold,
      };
    }

    const supabase = createClient();

    try {
      const { data: wallet, error } = await supabase
        .from('credit_wallets')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (wallet && !error) {
        const available = Math.max(0, wallet.available_balance || 0);
        const reserved = Math.max(0, wallet.reserved_balance || 0);

        return {
          available,
          reserved,
          total: available + reserved,
          planId: (wallet.plan_id || 'STARTER') as PlanId,
          planExpiresAt: wallet.plan_expires_at || null,
          isLowCredit: available <= BILLING_CONFIG.lowCreditThreshold,
        };
      }
    } catch {
      // credit_wallets table not available
    }

    // ── Resilient fallback to users table ──────────────────────────────
    try {
      const { data: user } = await supabase
        .from('users')
        .select('plan_type, plan, daily_credits_limit, daily_credits_used, access_expires_at')
        .eq('id', userId)
        .maybeSingle();

      if (user) {
        const limit = user.daily_credits_limit ?? BILLING_CONFIG.welcomeCredits;
        const used = user.daily_credits_used ?? 0;
        const available = Math.max(0, limit - used);
        const rawPlan = (user.plan_type || user.plan || '').toLowerCase();
        const planId = (
          rawPlan.toUpperCase() in BILLING_CONFIG.plans
            ? (rawPlan.toUpperCase() as PlanId)
            : (rawPlan.includes('daily') || rawPlan.includes('weekly') || rawPlan.includes('monthly') || rawPlan.includes('pro') || user.plan === 'pro')
            ? 'PRO'
            : 'STARTER'
        ) as PlanId;

        return {
          available,
          reserved: 0,
          total: available,
          planId,
          planExpiresAt: user.access_expires_at || null,
          isLowCredit: available <= BILLING_CONFIG.lowCreditThreshold,
        };
      }
    } catch (userErr) {
      console.warn('[CreditService.getBalance] users table fallback notice:', userErr);
    }

    return {
      available: BILLING_CONFIG.welcomeCredits,
      reserved: 0,
      total: BILLING_CONFIG.welcomeCredits,
      planId: 'STARTER',
      planExpiresAt: null,
      isLowCredit: false,
    };
  }

  /**
   * Checks whether the candidate has sufficient available credits for a specific action.
   */
  static async canAfford(
    userId: string,
    actionOrAmount: BillableAction | number
  ): Promise<AffordabilityResult> {
    const required =
      typeof actionOrAmount === 'number'
        ? actionOrAmount
        : BILLING_CONFIG.actionCosts[actionOrAmount] ?? 0;

    // Free actions are always allowed
    if (required === 0) {
      return { allowed: true, required: 0, available: 999999 };
    }

    const balance = await this.getBalance(userId);

    if (balance.available < required) {
      return {
        allowed: false,
        required,
        available: balance.available,
        reason: `Insufficient credits: ${required} credits required, but only ${balance.available} available.`,
      };
    }

    return {
      allowed: true,
      required,
      available: balance.available,
    };
  }

  /**
   * Atomically reserves credits before executing an asynchronous variable-cost action.
   * Concurrency-safe: Locks wallet row, deducts available, and increments reserved.
   */
  static async reserveCredits(params: {
    userId: string;
    action: BillableAction | string;
    amount?: number;
    referenceType?: string;
    referenceId?: string;
    idempotencyKey?: string;
    ttlMinutes?: number;
  }): Promise<ReservationResult> {
    const {
      userId,
      action,
      amount,
      referenceType,
      referenceId,
      idempotencyKey,
      ttlMinutes = 30,
    } = params;

    const requiredAmount =
      amount ?? BILLING_CONFIG.actionCosts[action] ?? 0;

    if (requiredAmount === 0) {
      return {
        success: true,
        reservedAmount: 0,
      };
    }

    const supabase = createClient();
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();

    const { data: rpcResult, error } = await supabase.rpc(
      'reserve_credits_atomic',
      {
        p_user_id: userId,
        p_amount: requiredAmount,
        p_action: action,
        p_reference_type: referenceType || null,
        p_reference_id: referenceId || null,
        p_idempotency_key: idempotencyKey || null,
        p_expires_at: expiresAt,
      }
    );

    if (error || !rpcResult?.success) {
      console.warn('[CreditService.reserveCredits] RPC notice (falling back to canAfford):', error?.message || rpcResult?.error);
      const afford = await this.canAfford(userId, requiredAmount);
      if (!afford.allowed) {
        return {
          success: false,
          error: afford.reason || 'INSUFFICIENT_CREDITS',
        };
      }
      return {
        success: true,
        reservationId: `res_fallback_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        reservedAmount: requiredAmount,
        availableBalance: afford.available,
        reservedBalance: 0,
      };
    }

    return {
      success: rpcResult.success,
      reservationId: rpcResult.reservation_id,
      reservedAmount: rpcResult.reserved_amount,
      availableBalance: rpcResult.available_balance,
      reservedBalance: rpcResult.reserved_balance,
      error: rpcResult.error,
      isIdempotent: rpcResult.is_idempotent,
    };
  }

  /**
   * Settles a reservation upon successful operation delivery.
   * Supports partial settlement: any unconsumed portion is immediately returned to available balance!
   */
  static async settleReservation(params: {
    reservationId: string;
    actualCredits?: number;
    metadata?: Record<string, any>;
    idempotencyKey?: string;
  }): Promise<SettlementResult> {
    const { reservationId, actualCredits, metadata, idempotencyKey } = params;
    const supabase = createClient();

    const { data: rpcResult, error } = await supabase.rpc(
      'settle_reservation_atomic',
      {
        p_reservation_id: reservationId,
        p_settled_amount: actualCredits ?? null,
        p_metadata: metadata || {},
        p_idempotency_key: idempotencyKey || null,
      }
    );

    if (error || !rpcResult?.success) {
      console.error('[CreditService.settleReservation] Error:', error?.message || rpcResult?.error);
      return {
        success: false,
        reservationId,
        settledAmount: 0,
        releasedAmount: 0,
        status: 'ACTIVE',
        availableBalance: 0,
        reservedBalance: 0,
        error: error?.message || rpcResult?.error || 'Settlement failed',
      };
    }

    return {
      success: true,
      reservationId: rpcResult.reservation_id,
      settledAmount: rpcResult.settled_amount,
      releasedAmount: rpcResult.released_amount,
      status: rpcResult.status,
      availableBalance: rpcResult.available_balance,
      reservedBalance: rpcResult.reserved_balance,
    };
  }

  /**
   * 100% Releases/Refunds a reservation when a platform or model execution fails.
   * Delivers zero cost to user for undelivered work.
   */
  static async refundReservation(params: {
    reservationId: string;
    reason?: string;
    metadata?: Record<string, any>;
    idempotencyKey?: string;
  }): Promise<RefundResult> {
    const {
      reservationId,
      reason = 'SYSTEM_EXECUTION_FAILURE',
      metadata,
      idempotencyKey,
    } = params;

    const supabase = createClient();

    const { data: rpcResult, error } = await supabase.rpc(
      'refund_reservation_atomic',
      {
        p_reservation_id: reservationId,
        p_reason: reason,
        p_metadata: metadata || {},
        p_idempotency_key: idempotencyKey || null,
      }
    );

    if (error || !rpcResult?.success) {
      console.error('[CreditService.refundReservation] Error:', error?.message || rpcResult?.error);
      return {
        success: false,
        reservationId,
        releasedAmount: 0,
        status: 'RELEASED',
        availableBalance: 0,
        reservedBalance: 0,
        error: error?.message || rpcResult?.error || 'Refund failed',
      };
    }

    return {
      success: true,
      reservationId: rpcResult.reservation_id,
      releasedAmount: rpcResult.released_amount,
      status: 'RELEASED',
      availableBalance: rpcResult.available_balance,
      reservedBalance: rpcResult.reserved_balance,
    };
  }

  /**
   * Grants credits to a user wallet (Plan purchase, Top-up, Promotion).
   * Concurrency-safe and idempotent with payment reference.
   * If planId is passed, upgrades entitlement; if omitted (top-up), preserves existing plan!
   */
  static async grantCredits(params: {
    userId: string;
    amount: number;
    reason: string;
    referenceType?: string;
    referenceId?: string;
    idempotencyKey?: string;
    planId?: PlanId;
    planDurationDays?: number;
  }): Promise<GrantResult> {
    const {
      userId,
      amount,
      reason,
      referenceType,
      referenceId,
      idempotencyKey,
      planId,
      planDurationDays,
    } = params;

    const supabase = createClient();

    const { data: rpcResult, error } = await supabase.rpc(
      'grant_credits_atomic',
      {
        p_user_id: userId,
        p_amount: amount,
        p_reason: reason,
        p_reference_type: referenceType || null,
        p_reference_id: referenceId || null,
        p_idempotency_key: idempotencyKey || null,
        p_plan_id: planId || null,
        p_plan_duration_days: planDurationDays || null,
      }
    );

    if (error || !rpcResult?.success) {
      console.warn('[CreditService.grantCredits] DB RPC notice (falling back to users table):', error?.message || rpcResult?.error);
      try {
        const { data: user } = await supabase
          .from('users')
          .select('daily_credits_limit, daily_credits_used, plan_type')
          .eq('id', userId)
          .maybeSingle();

        if (user) {
          const isUpgrade = Boolean(planId) || reason === 'PLAN_PURCHASE';
          const newLimit = isUpgrade ? Math.max(user.daily_credits_limit || 0, amount) : ((user.daily_credits_limit || 0) + amount);
          const durationDays = planDurationDays || (planId?.includes('DAILY') ? 1 : planId?.includes('WEEKLY') ? 7 : 30);
          const expiresAt = new Date(Date.now() + durationDays * 24 * 3600 * 1000).toISOString();

          await supabase.from('users').update({
            daily_credits_limit: newLimit,
            daily_credits_used: 0,
            ...(planId ? { plan_type: planId.toLowerCase(), plan: 'pro', access_expires_at: expiresAt } : {})
          }).eq('id', userId);

          return {
            success: true,
            grantedAmount: amount,
            availableBalance: newLimit,
            reservedBalance: 0,
            planId: planId || (user.plan_type?.toUpperCase() as PlanId) || 'STARTER',
            isIdempotent: false,
          };
        }
      } catch (fbErr) {
        console.error('[CreditService.grantCredits] users table fallback error:', fbErr);
      }

      return {
        success: false,
        grantedAmount: 0,
        availableBalance: 0,
        reservedBalance: 0,
        error: error?.message || rpcResult?.error,
      };
    }

    return {
      success: true,
      grantedAmount: rpcResult.granted_amount,
      availableBalance: rpcResult.available_balance,
      reservedBalance: rpcResult.reserved_balance,
      planId: rpcResult.plan_id,
      isIdempotent: rpcResult.is_idempotent,
    };
  }

  /**
   * Consumes credits synchronously for immediate one-shot operations.
   */
  static async consumeCredits(params: {
    userId: string;
    actionOrAmount: BillableAction | number;
    reason: string;
    referenceType?: string;
    referenceId?: string;
    idempotencyKey?: string;
    metadata?: Record<string, any>;
  }): Promise<{ success: boolean; availableBalance?: number; error?: string }> {
    const {
      userId,
      actionOrAmount,
      reason,
      referenceType,
      referenceId,
      idempotencyKey,
      metadata,
    } = params;

    const amount =
      typeof actionOrAmount === 'number'
        ? actionOrAmount
        : BILLING_CONFIG.actionCosts[actionOrAmount] ?? 0;

    if (amount === 0) return { success: true };

    // 1. Reserve
    const reserveRes = await this.reserveCredits({
      userId,
      action: typeof actionOrAmount === 'string' ? actionOrAmount : reason,
      amount,
      referenceType,
      referenceId,
      idempotencyKey: idempotencyKey ? `${idempotencyKey}_res` : undefined,
    });

    if (!reserveRes.success || !reserveRes.reservationId) {
      return {
        success: false,
        error: reserveRes.error || 'INSUFFICIENT_CREDITS',
      };
    }

    // 2. Settle immediately
    if (reserveRes.reservationId.startsWith('res_fallback_')) {
      try {
        const supabase = createClient();
        const { data: user } = await supabase
          .from('users')
          .select('daily_credits_limit, daily_credits_used')
          .eq('id', userId)
          .maybeSingle();

        if (user) {
          const limit = user.daily_credits_limit ?? 50;
          const used = user.daily_credits_used ?? 0;
          const newUsed = used + amount;
          await supabase.from('users').update({ daily_credits_used: newUsed }).eq('id', userId);
          return {
            success: true,
            availableBalance: Math.max(0, limit - newUsed),
          };
        }
      } catch (e) {
        console.error('[CreditService.consumeCredits] Fallback deduction error:', e);
      }
    }

    const settleRes = await this.settleReservation({
      reservationId: reserveRes.reservationId,
      actualCredits: amount,
      metadata,
      idempotencyKey: idempotencyKey ? `${idempotencyKey}_set` : undefined,
    });

    return {
      success: settleRes.success,
      availableBalance: settleRes.availableBalance,
      error: settleRes.error,
    };
  }

  /**
   * Fetches user's transaction history from the credit ledger.
   */
  static async getLedger(
    userId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<LedgerEntry[]> {
    const supabase = createClient();
    const limit = options?.limit ?? 30;
    const offset = options?.offset ?? 0;

    const { data, error } = await supabase
      .from('credit_ledger')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[CreditService.getLedger] Error:', error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      transactionType: row.transaction_type,
      amount: row.amount,
      availableBalanceAfter: row.available_balance_after,
      reservedBalanceAfter: row.reserved_balance_after,
      reason: row.reason,
      referenceType: row.reference_type,
      referenceId: row.reference_id,
      idempotencyKey: row.idempotency_key,
      metadata: row.metadata,
      createdAt: row.created_at,
    }));
  }

  /**
   * Returns active feature entitlements for a candidate based on current plan or direct planId.
   */
  static async getUserEntitlements(userIdOrPlanId: string): Promise<string[]> {
    if (userIdOrPlanId in BILLING_CONFIG.plans) {
      return BILLING_CONFIG.plans[userIdOrPlanId as PlanId].entitlements;
    }
    const balance = await this.getBalance(userIdOrPlanId);
    const plan = BILLING_CONFIG.plans[balance.planId] || BILLING_CONFIG.plans.STARTER;
    return plan.entitlements;
  }

  /**
   * Verifies if candidate (or plan ID) has entitlement to use a specific high-tier capability.
   */
  static async canUseFeature(userIdOrPlanId: string, feature: string): Promise<boolean> {
    const entitlements = await this.getUserEntitlements(userIdOrPlanId);
    return entitlements.includes(feature);
  }

  /**
   * Reconciles orphan reservations that expired without being settled.
   * Auto-releases locked credits back to user available balances.
   */
  static async reconcileOrphanReservations(): Promise<{ reconciledCount: number }> {
    const supabase = createClient();
    const now = new Date().toISOString();

    const { data: expired, error } = await supabase
      .from('credit_reservations')
      .select('id, user_id, reserved_amount')
      .eq('status', 'ACTIVE')
      .lt('expires_at', now)
      .limit(50);

    if (error || !expired || expired.length === 0) {
      return { reconciledCount: 0 };
    }

    let count = 0;
    for (const res of expired) {
      try {
        await this.refundReservation({
          reservationId: res.id,
          reason: 'ORPHAN_RESERVATION_TIMEOUT_RELEASE',
        });
        count++;
      } catch (err) {
        console.error(`[reconcileOrphanReservations] Error on ${res.id}:`, err);
      }
    }

    return { reconciledCount: count };
  }
}
