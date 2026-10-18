export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';

export default function ResumeForgePage({ params }: { params: { locale: string } }) {
    redirect(`/${params.locale}/resumes`);
}
