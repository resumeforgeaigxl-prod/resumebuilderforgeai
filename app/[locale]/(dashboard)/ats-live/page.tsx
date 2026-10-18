export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';

export default function AtsLivePage({ params }: { params: { locale: string } }) {
    redirect(`/${params.locale}/resumes?tab=ats`);
}
