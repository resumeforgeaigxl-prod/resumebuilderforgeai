'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, Zap, ArrowRight, X } from '@/components/icons';
import { WalletModal } from './WalletModal';

interface LowCreditBannerProps {
  initialCredits?: number;
  threshold?: number;
  className?: string;
  onTopUp?: () => void;
}

export function LowCreditBanner({
  initialCredits,
  threshold = 5,
  className = '',
  onTopUp,
}: LowCreditBannerProps) {
  const [credits, setCredits] = useState<number | null>(initialCredits ?? null);
  const [dismissed, setDismissed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (initialCredits !== undefined) {
      setCredits(initialCredits);
      return;
    }

    let isMounted = true;
    async function checkBalance() {
      try {
        const res = await fetch('/api/credits/balance');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.balance && isMounted) {
            setCredits(data.balance.available_balance);
          }
        }
      } catch (err) {
        // Silent fail for non-intrusive banner
      }
    }

    checkBalance();
    return () => {
      isMounted = false;
    };
  }, [initialCredits]);

  if (dismissed || credits === null || credits > threshold) {
    return null;
  }

  const handleOpenWallet = () => {
    if (onTopUp) {
      onTopUp();
    } else {
      setModalOpen(true);
    }
  };

  return (
    <>
      <div
        className={`w-full bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-xl p-3 md:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs ${className}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[#171717] tracking-tight">
              {credits === 0 ? 'Zero Credits Remaining' : `Low Credit Balance (${credits} left)`}
            </p>
            <p className="text-[#4D4D4D] text-[11px] truncate">
              {credits === 0
                ? 'Resume tailoring and ATS scans require credits. Basic browsing and tracking remain free.'
                : 'Tailoring a resume requires 4 credits. Top up to keep Omni and AI actions uninterrupted.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={handleOpenWallet}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#171717] hover:bg-[#333333] text-white rounded-lg font-medium text-xs transition-colors shadow-xs"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Top Up Credits</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg text-[#8F8F8F] hover:text-[#171717] hover:bg-black/5 transition-colors"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <WalletModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onTopUpSuccess={() => {
          // Re-fetch balance
          fetch('/api/credits/balance')
            .then((r) => r.json())
            .then((d) => {
              if (d.success && d.balance) setCredits(d.balance.available_balance);
            })
            .catch(() => {});
        }}
      />
    </>
  );
}
