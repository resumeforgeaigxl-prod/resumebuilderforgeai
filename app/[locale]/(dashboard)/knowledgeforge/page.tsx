'use client';

import KnowledgeForgeClient from './KnowledgeForgeClient';

export default function KnowledgeForgePage({ params }: { params: { locale: string } }) {
  return <KnowledgeForgeClient locale={params.locale} />;
}
