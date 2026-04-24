export const dynamic = 'force-dynamic';
import { createAdminClient } from '@/lib/supabase/admin';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PublicProfileUI from './PublicProfileUI';

interface Props {
  params: { username: string; locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createAdminClient();
  const { data: user } = await supabase
    .from('users')
    .select('full_name, username')
    .eq('username', params.username)
    .single();

  if (!user) return {};

  return {
    title: `${user.full_name} – Developer Portfolio | ResumeForgeAI`,
    description: `View ${user.full_name}'s developer resume, skills, and career journey on ResumeForgeAI.`,
    openGraph: {
      title: `${user.full_name} (@${user.username})`,
      description: `ResumeForgeAI Developer Portfolio`,
      type: 'profile',
      username: user.username,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${user.full_name} – Developer Portfolio`,
    }
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const supabase = createAdminClient();
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('username', params.username)
    .maybeSingle();

  if (!user) notFound();

  // Fetch public forge data (simplified)
  const { data: resumes } = await supabase.from('resumes').select('title, summary, skills').eq('user_id', user.id).limit(1);

  return <PublicProfileUI user={user} resume={resumes?.[0]} />;
}
