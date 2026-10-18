export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';

export default function JobForgeAppPage({ params }: { params: { locale: string } }) {
    redirect(`/${params.locale}/jobs`);
}
