/**
 * ResumeForge — Production Credit Economy & Billing Types
 */

import type { BillableAction, PlanId } from './config';

export type TransactionType =
  | 'GRANT'
  | 'PURCHASE'
  | 'RESERVE'
  | 'SETTLE'
  | 'RELEASE'
  | 'REFUND'
  | 'ADJUSTMENT'
  | 'EXPIRE';

export type ReservationStatus =
  | 'ACTIVE'
  | 'SETTLED'
  | 'PARTIALLY_SETTLED'
  | 'RELEASED'
  | 'EXPIRED';

export interface WalletBalance {
  available: number;
  reserved: number;
  total: number;
  planId: PlanId;
  planExpiresAt?: string | null;
  isLowCredit: boolean;
}

export interface AffordabilityResult {
  allowed: boolean;
  required: number;
  available: number;
  reason?: string;
}

export interface ReservationResult {
  success: boolean;
  reservationId?: string;
  reservedAmount?: number;
  availableBalance?: number;
  reservedBalance?: number;
  error?: string;
  isIdempotent?: boolean;
}

export interface SettlementResult {
  success: boolean;
  reservationId: string;
  settledAmount: number;
  releasedAmount: number;
  status: ReservationStatus;
  availableBalance: number;
  reservedBalance: number;
  error?: string;
}

export interface RefundResult {
  success: boolean;
  reservationId: string;
  releasedAmount: number;
  status: 'RELEASED';
  availableBalance: number;
  reservedBalance: number;
  error?: string;
}

export interface GrantResult {
  success: boolean;
  grantedAmount: number;
  availableBalance: number;
  reservedBalance: number;
  planId?: string;
  error?: string;
  isIdempotent?: boolean;
}

export interface LedgerEntry {
  id: string;
  userId: string;
  transactionType: TransactionType;
  amount: number;
  availableBalanceAfter: number;
  reservedBalanceAfter: number;
  reason: string;
  referenceType?: string | null;
  referenceId?: string | null;
  idempotencyKey?: string | null;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface UsageCostEntry {
  id?: string;
  userId: string;
  action: string;
  provider: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  aiCost?: number;
  searchCost?: number;
  browserCost?: number;
  browserMinutes?: number;
  storageCost?: number;
  otherCost?: number;
  totalCost?: number;
  currency?: string;
  createdAt?: string;
}
