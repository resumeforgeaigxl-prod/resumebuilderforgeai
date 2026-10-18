'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CreditCard, AlertCircle, X, Loader2 } from '@/components/icons';
import type { WalletBalance, LedgerEntry } from '@/lib/billing/types';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTopUpSuccess?: () => void;
}

export function WalletModal({ isOpen, onClose, onTopUpSuccess }: WalletModalProps) {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackId, setSelectedPackId] = useState<string>('TOPUP_175');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [activeTab, setActiveTab] = useState<'topup' | 'history'>('topup');
  const [error, setError] = useState<string | null>(null);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [balRes, histRes] = await Promise.all([
        fetch('/api/credits/balance'),
        fetch('/api/credits/history?limit=15'),
      ]);

      const balData = await balRes.json();
      const histData = await histRes.json();

      if (balData.success) setBalance(balData.balance);
      if (histData.success) setLedger(histData.ledger);
    } catch (err: any) {
      console.error('Error fetching wallet details:', err);
      setError('Failed to load wallet details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchWalletData();
    }
  }, [isOpen]);

  // Load Razorpay script if needed
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleTopUp = async () => {
    try {
      setProcessingPayment(true);
      setError(null);

      const res = await fetch('/api/credits/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId: selectedPackId }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to initiate top-up.');
      }

      if (!(window as any).Razorpay) {
        throw new Error('Payment gateway SDK loading. Please try again.');
      }

      const rzp = new (window as any).Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'ResumeForge AI',
        description: `${data.pack.name} Top-Up`,
        order_id: data.orderId,
        theme: { color: '#171717' },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan_name: selectedPackId,
              }),
            });

            if (verifyRes.ok) {
              await fetchWalletData();
              onTopUpSuccess?.();
            } else {
              setError('Payment verification pending. Please refresh your wallet shortly.');
            }
          } catch (verErr: any) {
            setError(verErr.message || 'Payment verification failed');
          }
        },
      });

      rzp.open();
    } catch (err: any) {
      console.error('Top-up error:', err);
      setError(err.message || 'Payment initiation failed.');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (!isOpen) return null;

  const TOP_UP_OPTIONS = [
    { id: 'TOPUP_75', credits: 75, price: '₹199', popular: false },
    { id: 'TOPUP_175', credits: 175, price: '₹399', popular: true },
    { id: 'TOPUP_350', credits: 350, price: '₹699', popular: false },
    { id: 'TOPUP_550', credits: 550, price: '₹999', popular: false },
  ];

  const modal = (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[420px] overflow-hidden rounded-2xl border border-white/10 bg-[#0c0d10] text-[#f4f5f7] shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
        <div className="relative h-[196px] overflow-hidden">
          <img
            src="/credits-card-backdrop.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[center_38%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-[#0c0d10]" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/35 text-white/80 backdrop-blur-sm hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>

          {loading ? (
            <div className="relative flex h-full items-center justify-center text-xs text-white/70">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading balance
            </div>
          ) : (
            <div className="relative flex h-full flex-col justify-between p-5">
              <div className="flex items-center justify-between pr-10">
                <span className="text-[11px] uppercase tracking-[0.22em] text-white/75">ResumeForge</span>
                <span className="rounded-full border border-white/25 bg-black/25 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/85 backdrop-blur-sm">
                  {balance?.planId || 'Starter'}
                </span>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.16em] text-white/65">Available credits</div>
                <div className="mt-1 flex items-end gap-2">
                  <span
                    className="text-[56px] leading-none tracking-tight text-white"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {balance?.available ?? 0}
                  </span>
                  <span className="mb-2 text-sm text-white/70">credits</span>
                </div>
                {balance?.reserved ? (
                  <div className="mt-1 text-[11px] text-white/55">{balance.reserved} held for a job in progress</div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {!loading && balance?.isLowCredit ? (
          <p className="px-5 pb-1 text-xs leading-5 text-[#b4b8c2]">
            {balance.available === 0
              ? 'Balance is empty. Add credits to keep matching jobs and tailoring your resume.'
              : `${balance.available} credits left. Add more to keep matching jobs and tailoring your resume.`}
          </p>
        ) : null}

        {/* Tab Navigation */}
        <div className="mx-5 mt-3 flex gap-5 border-b border-white/10 text-sm">
          <button
            type="button"
            onClick={() => setActiveTab('topup')}
            className={`pb-2.5 ${
              activeTab === 'topup'
                ? 'border-b border-[#f4f5f7] text-[#f4f5f7]'
                : 'text-[#8b909a]'
            }`}
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 ${
              activeTab === 'history'
                ? 'border-b border-[#f4f5f7] text-[#f4f5f7]'
                : 'text-[#8b909a]'
            }`}
          >
            History
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto px-5 pb-5 pt-4">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'topup' ? (
            <div>
              <div className="grid grid-cols-2 gap-2.5">
                {TOP_UP_OPTIONS.map(pack => {
                  const isSelected = selectedPackId === pack.id;
                  return (
                    <button
                      key={pack.id}
                      type="button"
                      onClick={() => setSelectedPackId(pack.id)}
                      className={`relative rounded-xl border px-3.5 py-3 text-left ${
                        isSelected
                          ? 'border-white/80 bg-white/[0.04]'
                          : 'border-white/10 bg-transparent hover:border-white/25'
                      }`}
                    >
                      {pack.popular && (
                        <span className="absolute right-2.5 top-2.5 text-[9px] uppercase tracking-[0.14em] text-[#8b909a]">
                          Popular
                        </span>
                      )}
                      <div
                        className="text-[28px] leading-none tracking-tight text-[#f4f5f7]"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {pack.credits}
                      </div>
                      <div className="mt-1.5 text-[11px] uppercase tracking-[0.12em] text-[#8b909a]">credits</div>
                      <div className="mt-2 text-sm text-[#f4f5f7]">{pack.price}</div>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleTopUp}
                disabled={processingPayment}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#f4f5f7] py-2.5 text-sm font-medium text-[#0c0d10] disabled:opacity-50"
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Opening checkout
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Pay {TOP_UP_OPTIONS.find(p => p.id === selectedPackId)?.price}
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {ledger.length === 0 ? (
                <div className="py-10 text-center text-xs text-[#8b909a]">No credits used yet.</div>
              ) : (
                ledger.map(entry => {
                  const isPositive = entry.amount > 0;
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2.5 text-xs"
                    >
                      <div>
                        <div className="font-medium capitalize text-[#f4f5f7]">
                          {entry.reason.replace(/_/g, ' ')}
                        </div>
                        <div className="mt-0.5 text-[10px] text-[#8b909a]">
                          {new Date(entry.createdAt).toLocaleString()} · {entry.availableBalanceAfter} left
                        </div>
                      </div>
                      <div className={`font-medium tabular-nums ${isPositive ? 'text-[#86efac]' : 'text-[#b4b8c2]'}`}>
                        {isPositive ? `+${entry.amount}` : entry.amount}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return modal;
  return createPortal(modal, document.body);
}
