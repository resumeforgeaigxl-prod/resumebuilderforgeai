export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';

export default function LearnForgePage({ params }: { params: { locale: string } }) {
    redirect(`/${params.locale}/studyforge`);
}
