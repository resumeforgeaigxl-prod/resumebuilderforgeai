import DemoStudioClient from './DemoStudioClient';

export default function DemoStudioPage({ params }: { params: { locale: string } }) {
  return <DemoStudioClient locale={params.locale} />;
}
