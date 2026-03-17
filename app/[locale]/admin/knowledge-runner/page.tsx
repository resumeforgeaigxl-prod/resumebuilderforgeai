import KnowledgeRunnerClient from './KnowledgeRunnerClient';

export default function KnowledgeRunnerPage({ params }: { params: { locale: string } }) {
  return <KnowledgeRunnerClient locale={params.locale} />;
}
