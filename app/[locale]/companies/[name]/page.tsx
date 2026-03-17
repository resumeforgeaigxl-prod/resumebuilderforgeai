import PublicJobBoard from '@/components/jobs/PublicJobBoard';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { name: string } }): Promise<Metadata> {
    const name = params.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return {
        title: `Jobs at ${name} | ResumeForgeAI`,
        description: `Explore open positions at ${name}. apply for roles and use our AI tools to boost your chances of getting hired at ${name}.`,
    };
}

export default function CompanyJobsPage({ params }: { params: { locale: string; name: string } }) {
    const { locale, name } = params;
    const company = name.split('-').join(' ');
    return (
        <div className="min-h-screen bg-[#070710] pt-20">
            <div className="max-w-7xl mx-auto px-4 pt-12">
                <div className="flex items-center gap-6 mb-12">
                    <div className="w-24 h-24 rounded-3xl bg-slate-900 border border-white/5 flex items-center justify-center shrink-0">
                        <span className="text-4xl font-black text-indigo-500 uppercase">{company.charAt(0)}</span>
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white">{company}</h1>
                        <p className="text-slate-500 font-medium">Viewing all open positions at {company}</p>
                    </div>
                </div>
            </div>
            <PublicJobBoard locale={locale} initialCompany={company} />
        </div>
    );
}
