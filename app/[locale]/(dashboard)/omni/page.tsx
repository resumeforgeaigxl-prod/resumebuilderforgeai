export const dynamic = 'force-dynamic';
import { Suspense } from 'react';
import MentorForgeClient from '../mentorforge/MentorForgeClient';
import { FeatureGate } from '@/components/pricing/FeatureGate';

export default function OmniPage({ params }: { params: { locale: string } }) {
  return (
    <FeatureGate task="mentor">
      <Suspense fallback={<div className="flex-1 flex items-center justify-center bg-[#050505]" />}>
        <MentorForgeClient locale={params.locale} />
      </Suspense>
    </FeatureGate>
  );
}
