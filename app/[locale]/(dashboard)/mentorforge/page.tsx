export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';

export default function MentorForgePage({ params }: { params: { locale: string } }) {
  redirect(`/${params.locale}/omni`);
}
