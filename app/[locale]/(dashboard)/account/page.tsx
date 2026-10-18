export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';
import { AlertCircle } from '@/components/icons';
import { getCandidateApplicationProfile } from '@/lib/capabilities/profile';
import { AccountWorkspace } from '@/components/account/AccountWorkspace';

export default async function AccountPage({ params }: { params: { locale: string } }) {
  const locale = params.locale || 'en-IN';
  const supabase = createClient();
  const session = await getSession();

  if (!session) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: user, error } = await (supabase as any)
    .from('users')
    .select('*')
    .eq('id', session.userId)
    .single();

  if (error || !user) {
    return (
      <div className="p-8 text-center border border-red-500/20 bg-red-950/20 rounded-xl max-w-xl mx-auto">
        <AlertCircle className="w-10 h-10 mx-auto mb-4 text-red-400" />
        <h3 className="text-lg font-semibold text-[#F5F5F5] mb-1">Protocol Error</h3>
        <p className="text-xs text-[#7E7E7E]">Failed to load account details. Please refresh or sign in again.</p>
      </div>
    );
  }

  // Load canonical Candidate Application Profile (Level 6 canonical truth)
  const profile = await getCandidateApplicationProfile(session.userId);

  return <AccountWorkspace user={user} profile={profile} locale={locale} />;
}
