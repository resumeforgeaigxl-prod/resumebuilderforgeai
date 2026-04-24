export const dynamic = 'force-dynamic';
import MentorForgeClient from '../MentorForgeClient';
import { FeatureGate } from '@/components/pricing/FeatureGate';

export default function MentorForgePage({ params }: { params: { locale: string } }) {
  return (
    <FeatureGate task="mentor">
      <MentorForgeClient locale={params.locale} />
    </FeatureGate>
  );
}
