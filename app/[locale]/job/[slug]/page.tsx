export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { MapPin, Briefcase, Globe, ArrowRight, Building2, Calendar, DollarSign, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import ApplyTrackingButton from '@/components/jobs/ApplyTrackingButton';



import TrackJobView from '@/components/jobs/TrackJobView';

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }) {
    const id = params.slug.split('-').slice(-5).join('-');
    if (!id) return { title: 'Job Not Found' };

    const supabase = await createClient();
    const { data: job } = await supabase
        .from('jobs')
        .select('title, company, location')
        .eq('id', id)
        .single();

    if (!job) return { title: 'Job Not Found' };

    return {
        title: `${job.title} at ${job.company} | ResumeForgeAI`,
        description: `Apply for ${job.title} at ${job.company} in ${job.location}. Build your AI resume and land this job faster with ResumeForgeAI.`,
    };
}

export default async function JobDetailPage({ params }: { params: { locale: string; slug: string } }) {
    const id = params.slug.split('-').slice(-5).join('-');
    if (!id) notFound();

    const supabase = await createClient();
    const { data: job } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();

    if (!job) notFound();

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: job.title,
        description: job.description || `Exciting opportunity at ${job.company}`,
        datePosted: job.created_at,
        validThrough: new Date(new Date(job.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        employmentType: job.job_type === 'Full-time' ? 'FULL_TIME' : 'OTHER',
        hiringOrganization: {
            '@type': 'Organization',
            name: job.company,
            logo: `https://logo.clearbit.com/${job.company.toLowerCase().replace(/ /g, '')}.com`
        },
        jobLocation: {
            '@type': 'Place',
            address: {
                '@type': 'PostalAddress',
                addressLocality: job.location,
                addressCountry: job.country
            }
        },
        baseSalary: {
            '@type': 'MonetaryAmount',
            currency: 'USD',
            value: {
                '@type': 'QuantitativeValue',
                value: job.salary === 'Competitive' ? 0 : job.salary,
                unitText: 'YEAR'
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#070710] py-24 px-4 sm:px-6 lg:px-8">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <TrackJobView job={{ id: job.id, title: job.title, company: job.company }} />

            <div className="max-w-4xl mx-auto">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
                    <Link href={`/${params.locale}/jobs`} className="hover:text-indigo-400">Jobs</Link>
                    <span>/</span>
                    <span className="text-slate-300 truncate">{job.title}</span>
                </nav>

                {/* Header Card */}
                <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-8 md:p-12 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Building2 className="w-32 h-32 text-indigo-500" />
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-2xl">
                            <span className="text-3xl font-black text-white">{job.company?.charAt(0)}</span>
                        </div>
                        <div className="space-y-2 flex-1">
                            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">{job.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-slate-400 font-medium">
                                <span className="flex items-center gap-1.5 text-indigo-400">
                                    <Building2 className="w-4 h-4" />
                                    {job.company}
                                </span>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-700 hidden md:block" />
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4" />
                                    {job.location}
                                </span>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-700 hidden md:block" />
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    Posted {new Date(job.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 flex flex-wrap gap-4">
                        <ApplyTrackingButton job={{
                            id: job.id,
                            title: job.title,
                            company: job.company,
                            apply_url: job.apply_url
                        }} />
                        <Link
                            href={`/${params.locale}/resume/optimize?jobId=${job.id}`}
                            className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black uppercase tracking-widest rounded-2xl flex items-center gap-2 transition-all active:scale-95"
                        >
                            Build AI Resume
                        </Link>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        <div className="bg-slate-900/20 border border-white/5 rounded-[2.5rem] p-8 md:p-10">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                                Job Description
                            </h2>
                            <div className="prose prose-invert max-w-none text-slate-400 leading-relaxed whitespace-pre-line">
                                {job.description || "No description provided."}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-6 space-y-6">
                            <h3 className="font-bold text-white uppercase text-xs tracking-[0.2em] mb-4">Job Info</h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500 flex items-center gap-2">
                                        <Briefcase className="w-4 h-4" /> Type
                                    </span>
                                    <span className="text-slate-200 font-bold">{job.job_type}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" /> Salary
                                    </span>
                                    <span className="text-indigo-400 font-bold">{job.salary}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500 flex items-center gap-2">
                                        <Globe className="w-4 h-4" /> Region
                                    </span>
                                    <span className="text-slate-200 font-bold">{job.country}</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5">
                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                                    Verification: This job was verified and listed via {job.source}. Apply directly on the original platform.
                                </p>
                            </div>
                        </div>

                        {/* Upsell Card */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                            <div className="relative z-10">
                                <h3 className="text-xl font-black mb-2 tracking-tight">Land this job faster</h3>
                                <p className="text-indigo-100 text-sm mb-6 leading-relaxed">Use our AI to optimize your resume specifically for this {job.title} role at {job.company}.</p>
                                <Link
                                    href={`/${params.locale}/resume/optimize?jobId=${job.id}`}
                                    className="w-full py-4 bg-white text-indigo-600 font-black uppercase text-xs tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-all shadow-xl active:scale-95"
                                >
                                    Get Started <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                            <Globe className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-700" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
