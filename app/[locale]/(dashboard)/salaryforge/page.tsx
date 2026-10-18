export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';

export default function SalaryForgePage({ params }: { params: { locale: string } }) {
    redirect(`/${params.locale}/omni`);
}
