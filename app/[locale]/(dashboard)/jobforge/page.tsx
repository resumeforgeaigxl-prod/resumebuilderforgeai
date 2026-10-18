export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';

export default function JobForgePage({ params }: { params: { locale: string } }) {
    redirect(`/${params.locale}/jobs`);
}
