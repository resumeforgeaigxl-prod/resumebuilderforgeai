'use client';

import Link from 'next/link';
import { Zap } from '@/components/icons';
import { buttonClass, cardTitleClass } from './design';

interface CreditsWalletCardProps {
  available: number;
  planId?: string;
  isLowCredit?: boolean;
  locale: string;
}

export function CreditsWalletCard({ available, planId = 'STARTER', isLowCredit = false, locale }: CreditsWalletCardProps) {
  return (
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-[10px] border border-[#242424] bg-[#101010] p-4 transition-colors hover:border-[#303030]" aria-label="Credits wallet">
      <div className="min-w-0 space-y-1">
        <h2 className={cardTitleClass + ' flex items-center gap-2.5'}>
          <Zap className="h-5 w-5 shrink-0 text-[#A78BFA]" aria-hidden="true" />
          {available} Credits
        </h2>
        <p className={'text-xs ' + (isLowCredit ? 'text-amber-300' : 'text-[#7E7E7E]')}>
          {isLowCredit ? 'Balance running low' : planId.replace(/_/g, ' ').toLowerCase() + ' plan'}
        </p>
      </div>
      <Link href={'/' + locale + '/account?tab=billing'} className={buttonClass}>Manage</Link>
    </section>
  );
}
