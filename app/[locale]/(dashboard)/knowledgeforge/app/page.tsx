'use client'
export const dynamic = 'force-dynamic';
;

import KnowledgeForgeClient from '../KnowledgeForgeClient';
import { FeatureGate } from '@/components/pricing/FeatureGate';

export default function KnowledgeForgePage({ params }: { params: { locale: string } }) {
  return (
    <FeatureGate task="knowledge">
      <KnowledgeForgeClient locale={params.locale} />
    </FeatureGate>
  );
}
