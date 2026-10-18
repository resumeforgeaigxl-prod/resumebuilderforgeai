export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';

export default function InterviewForgePage({ params }: { params: { locale: string } }) {
    redirect(`/${params.locale}/mock-interview`);
}
