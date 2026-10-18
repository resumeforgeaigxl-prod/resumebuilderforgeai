export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';

export default function DashboardJobsPage({ params }: { params: { locale: string } }) {
    redirect(`/${params.locale}/jobs`);
}
