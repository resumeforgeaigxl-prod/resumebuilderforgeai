export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const slug = params.slug.charAt(0).toUpperCase() + params.slug.slice(1).toLowerCase();
    return {
        title: `${slug} Jobs | Career Opportunities on ResumeForgeAI`,
        description: `Explore the latest ${slug} job openings. AI-curated carrier opportunities for freshers and experienced professionals.`
    };
}

export default function JobSlugPage({ params }: { params: { slug: string } }) {
    const slug = params.slug.toLowerCase();

    if (slug === 'remote') redirect('/jobs?remote=true');
    if (slug === 'usa' || slug === 'us') redirect('/jobs?country=United%20States');
    if (slug === 'india') redirect('/jobs?country=India');

    // Capitalize for cleaner filter UI
    const capitalized = params.slug.charAt(0).toUpperCase() + params.slug.slice(1).toLowerCase();

    const locations = ['bengaluru', 'hyderabad', 'pune', 'delhi', 'mumbai'];
    if (locations.includes(slug)) {
        redirect(`/jobs?location=${capitalized}`);
    }

    redirect(`/jobs?search=${capitalized}`);
}
