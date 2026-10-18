import React from 'react';
import { getSession } from '@/lib/auth/jwt';
import { ApplicationsHub } from '@/components/applications/ApplicationsHub';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ApplicationsPage({
  params,
}: {
  params: { locale: string };
}) {
  const session = await getSession();
  const locale = params?.locale || 'en-in';

  if (!session?.userId) {
    redirect(`/${locale}/login`);
  }

  return <ApplicationsHub locale={locale} />;
}
