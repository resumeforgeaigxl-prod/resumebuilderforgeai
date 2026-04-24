export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'ATS Resume Builder — Beat Applicant Tracking Systems',
    description: 'Build resumes that pass every ATS filter. ResumeForgeAI\'s ATS resume builder uses AI to optimize your resume with the right keywords, format, and structure.',
    alternates: { canonical: 'https://resumeforgeai.in/ats-resume-builder' },
    openGraph: {
        title: 'ATS Resume Builder | ResumeForgeAI',
        description: 'Build ATS-compliant resumes that pass automated filters and reach human recruiters.',
        url: 'https://resumeforgeai.in/ats-resume-builder',
    },
};

const atsFeatures = [
    { score: '95%', label: 'Average ATS score achieved by our users' },
    { score: '3x', label: 'More interview callbacks vs generic resumes' },
    { score: '5 min', label: 'Average time to build a complete resume' },
    { score: '100%', label: 'Clean PDF format readable by all ATS systems' },
];

export default function ATSResumeBuilderPage() {
    return (
        <main className="min-h-screen bg-[#070710] text-slate-200">
            {/* Hero */}
            <section className="max-w-5xl mx-auto px-4 pt-24 pb-16 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
                    📊 ATS Score Checker Included
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                    Build a Resume That{' '}
                    <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        Beats Every ATS
                    </span>
                </h1>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
                    Over 75% of resumes are rejected by ATS software before a human reads them. ResumeForgeAI ensures your resume is perfectly formatted,
                    keyword-optimized, and ATS-compliant — so your application actually reaches the recruiter.
                </p>
                <Link href="/dashboard" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-base hover:opacity-90 transition-all">
                    Check My ATS Score Free →
                </Link>
            </section>

            {/* Stats */}
            <section className="max-w-4xl mx-auto px-4 pb-12">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {atsFeatures.map(s => (
                        <div key={s.label} className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
                            <div className="text-3xl font-black text-emerald-400 mb-1">{s.score}</div>
                            <div className="text-xs text-slate-400 leading-snug">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Long-form SEO content */}
            <section className="max-w-4xl mx-auto px-4 py-8">
                <div className="space-y-6 text-slate-300 leading-relaxed">
                    <h2 className="text-2xl font-bold text-white">What is an ATS Resume Builder?</h2>
                    <p>
                        An ATS (Applicant Tracking System) resume builder is a specialized tool designed to create resumes that meet the technical requirements of automated hiring software.
                        Companies like Infosys, TCS, Wipro, Google, Amazon, and thousands of others use ATS platforms to automatically screen incoming applications before human reviewers see them.
                        An ATS-optimized resume uses the right file format, section headings, keyword density, and layout to ensure it is parsed correctly by these systems.
                    </p>
                    <p>
                        ResumeForgeAI goes beyond basic ATS formatting. Our AI analyzes actual job descriptions and cross-references them with your resume to identify missing keywords,
                        weaker sections, and formatting issues that could cause ATS rejection. You get a real-time ATS compatibility score and specific recommendations to improve it.
                    </p>

                    <h2 className="text-2xl font-bold text-white">Why Most Resumes Fail ATS Screening</h2>
                    <p>
                        The most common reasons resumes get rejected by ATS software include: using complex templates with tables, columns, or graphics that confuse parsers;
                        missing industry-specific keywords from the job description; using non-standard section headings like &quot;My Journey&quot; instead of &quot;Work Experience&quot;;
                        submitting in incompatible file formats; and having inconsistent date formatting.
                    </p>
                    <p>
                        ResumeForgeAI automatically avoids all these pitfalls. Our templates are specifically designed to be ATS-friendly — clean single-column layouts,
                        standard section headings, proper chronological ordering, and industry-standard formatting that every major ATS system can parse correctly.
                    </p>

                    <h2 className="text-2xl font-bold text-white">How Our ATS Score Checker Works</h2>
                    <p>
                        Once you create or upload your resume in ResumeForgeAI, our ATS score checker performs a comprehensive analysis across multiple dimensions:
                        keyword match percentage against your target job description, section completeness score, action verb usage, quantifiable achievement detection,
                        formatting compatibility score, and contact information completeness. Each factor is weighted to produce a final ATS score from 0-100.
                    </p>
                    <p>
                        The score checker also provides a detailed breakdown showing exactly which areas need improvement and why. You can paste any job description to get
                        a job-specific ATS score, see which keywords you&apos;re missing, and get AI suggestions to naturally incorporate them into your resume content.
                        This iterative optimization process is what separates ResumeForgeAI from basic resume builders.
                    </p>

                    <h2 className="text-2xl font-bold text-white">ATS-Optimized Resume Templates</h2>
                    <p>
                        Every template in ResumeForgeAI has been tested against major ATS platforms including Greenhouse, Lever, Workday, iCIMS, Taleo, and SmartRecruiters.
                        Our templates use clean, single-column layouts with clearly defined sections, consistent typography, and proper white space — all factors that improve ATS parsing accuracy.
                        We avoid design gimmicks like infographic elements, skill bars, photographs, or complex multi-column layouts that regularly cause ATS parsing failures.
                    </p>

                    <h2 className="text-2xl font-bold text-white">Keyword Optimization for Indian Job Markets</h2>
                    <p>
                        The Indian job market has unique requirements. Platforms like Naukri, LinkedIn, Monster India, Indeed India, and Shine use their own ATS systems tuned to
                        the Indian job market. ResumeForgeAI understands these nuances. Our AI is trained on Indian job descriptions across IT, finance, marketing, engineering,
                        healthcare, and other sectors to provide keyword recommendations specifically relevant to Indian employers and recruiters.
                    </p>
                </div>
            </section>

            {/* CTA */}
            <section className="text-center py-20 px-4">
                <div className="max-w-xl mx-auto p-10 rounded-3xl bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border border-emerald-500/20">
                    <h2 className="text-2xl font-bold text-white mb-3">Stop Getting Rejected by ATS</h2>
                    <p className="text-slate-400 mb-6">Build a resume that passes ATS filters and lands in front of real recruiters.</p>
                    <Link href="/dashboard" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:opacity-90 transition-all">
                        Build ATS Resume Free →
                    </Link>
                </div>
            </section>
        </main>
    );
}
