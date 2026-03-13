import PublicJobBoard from '@/components/jobs/PublicJobBoard';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Browse Tech Jobs | ResumeForgeAI',
    description: 'Explore the latest software engineering, data science, and product management jobs curated by ResumeForgeAI.',
};

export default function JobsPage({ params }: { params: { locale: string } }) {
    return (
        <div className="min-h-screen bg-[#070710] pt-20">
            <PublicJobBoard locale={params.locale} />
        </div>
    );
}
