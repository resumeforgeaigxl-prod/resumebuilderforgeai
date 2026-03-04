import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'AI Resume Builder — Create ATS Optimized Resumes in Minutes',
    description: 'Build professional, ATS-optimized resumes with AI. ResumeForgeAI uses advanced AI to tailor your resume for every job application. Free to get started.',
    alternates: { canonical: 'https://resumeforgeai.in/ai-resume-builder' },
    openGraph: {
        title: 'AI Resume Builder | ResumeForgeAI',
        description: 'Create ATS-optimized resumes powered by AI. Tailored for freshers and professionals.',
        url: 'https://resumeforgeai.in/ai-resume-builder',
    },
};

const features = [
    { emoji: '🤖', title: 'AI-Powered Writing', desc: 'Our AI analyzes your experience and writes powerful bullet points, summaries, and skill sections that align perfectly with your target job description.' },
    { emoji: '📊', title: 'Real-Time ATS Scoring', desc: 'Instantly see how well your resume scores against applicant tracking systems. Get actionable suggestions to improve keyword density and formatting.' },
    { emoji: '⚡', title: 'Build in Minutes', desc: 'Select a template, enter your details, and let AI do the heavy lifting. A complete, professional resume ready in under 5 minutes.' },
    { emoji: '🎯', title: 'Job Description Matching', desc: 'Paste any job description and AI will automatically optimize your resume to match the specific requirements, skills, and keywords that recruiters are looking for.' },
    { emoji: '📄', title: 'Multiple Export Formats', desc: 'Download your resume as a clean, recruiter-ready PDF without watermarks. Every resume is formatted to industry standards for maximum compatibility.' },
    { emoji: '🔄', title: 'Unlimited Versions', desc: 'Create multiple versions of your resume tailored to different roles, industries, or companies. Manage all versions from a single dashboard.' },
];

export default function AIResumeBuilderPage() {
    return (
        <main className="min-h-screen bg-[#070710] text-slate-200">
            {/* Hero */}
            <section className="max-w-5xl mx-auto px-4 pt-24 pb-16 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6">
                    🤖 Powered by Advanced AI
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                    AI Resume Builder That{' '}
                    <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        Gets You Hired
                    </span>
                </h1>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
                    ResumeForgeAI is the most advanced AI resume builder designed for freshers, students, and professionals in India.
                    Build ATS-optimized resumes that pass applicant tracking systems and impress recruiters — in minutes, not hours.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/dashboard" className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-base hover:opacity-90 transition-all">
                        Build My Resume Free →
                    </Link>
                    <Link href="/#pricing" className="px-8 py-3.5 rounded-xl border border-white/10 text-slate-300 font-semibold text-base hover:bg-white/5 transition-all">
                        View Pricing
                    </Link>
                </div>
            </section>

            {/* Long-form SEO content */}
            <section className="max-w-4xl mx-auto px-4 py-12">
                <div className="prose prose-invert prose-lg max-w-none space-y-6 text-slate-300 leading-relaxed">
                    <h2 className="text-2xl font-bold text-white">What is an AI Resume Builder?</h2>
                    <p>
                        An AI resume builder is a tool that uses artificial intelligence to help job seekers create professional, compelling resumes quickly and efficiently.
                        Unlike traditional resume builders that simply format text, an AI resume builder like ResumeForgeAI analyzes your work experience, skills, and target job description
                        to generate tailored content that significantly improves your chances of getting shortlisted.
                    </p>
                    <p>
                        In today&apos;s competitive job market, especially in India where lakhs of candidates apply for the same positions, having a well-crafted resume is no longer optional —
                        it&apos;s essential. Most modern companies use Applicant Tracking Systems (ATS) to filter resumes before a human ever reads them.
                        An AI resume builder ensures your resume is designed to pass these automated filters while still being compelling to hiring managers.
                    </p>

                    <h2 className="text-2xl font-bold text-white">Why Use ResumeForgeAI?</h2>
                    <p>
                        ResumeForgeAI stands apart from generic resume builders because it combines the power of large language models with deep knowledge of what recruiters and ATS systems look for.
                        Whether you are a fresher looking for your first job, a student graduating from college, or an experienced professional switching careers — our AI resume builder adapts to your unique situation.
                    </p>
                    <p>
                        Our platform has helped thousands of job seekers across India create resumes that stand out. The AI analyzes real job descriptions from top companies and ensures your resume contains
                        the right keywords, action verbs, and quantifiable achievements that make recruiters stop scrolling.
                    </p>

                    <h2 className="text-2xl font-bold text-white">How ResumeForgeAI Works</h2>
                    <p>
                        Getting started with ResumeForgeAI is simple. Create a free account, enter your basic information — your name, contact details, education, work experience, and skills.
                        Then, optionally paste the job description for the role you&apos;re applying to. Our AI instantly analyzes the job requirements and generates tailored content for each section of your resume.
                    </p>
                    <p>
                        The AI uses advanced natural language processing to write your professional summary, enhance your work experience bullet points with powerful action verbs and metrics,
                        and identify which skills to highlight for your target role. You can review, edit, and refine any section before downloading the final PDF.
                    </p>

                    <h2 className="text-2xl font-bold text-white">AI Resume Builder for Freshers</h2>
                    <p>
                        One of the biggest challenges for freshers is the chicken-and-egg problem: you need experience to get a job, but you need a job to get experience.
                        ResumeForgeAI solves this by helping freshers present their education, internships, projects, and skills in the most impactful way possible.
                        Our AI knows how to frame limited experience compellingly, highlighting transferable skills, academic achievements, and personal projects that demonstrate your potential.
                    </p>
                    <p>
                        For students and fresh graduates from engineering, MBA, BCA, BBA, and other degree programs, our AI resume builder creates professional-looking resumes that compete
                        with candidates who have years of experience — because formatting, keywords, and presentation matter just as much as experience.
                    </p>

                    <h2 className="text-2xl font-bold text-white">ATS Optimization Built In</h2>
                    <p>
                        Every resume created with ResumeForgeAI is automatically optimized for Applicant Tracking Systems. ATS software scans resumes for specific keywords, formatting patterns,
                        and section headers before allowing them to reach human reviewers. Many qualified candidates get rejected simply because their resume isn&apos;t formatted correctly for ATS parsing.
                    </p>
                    <p>
                        Our built-in ATS score checker gives you a real-time score from 0-100, showing you exactly how well optimized your resume is. You get specific suggestions on which keywords to add,
                        which sections to improve, and how to restructure content for better ATS compatibility — giving you a significant advantage over candidates using manual resume building.
                    </p>
                </div>
            </section>

            {/* Features Grid */}
            <section className="max-w-5xl mx-auto px-4 pb-16">
                <h2 className="text-2xl font-bold text-white text-center mb-10">Everything You Need to Build the Perfect Resume</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {features.map(f => (
                        <div key={f.title} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 transition-all">
                            <div className="text-2xl mb-3">{f.emoji}</div>
                            <h3 className="font-bold text-white mb-2">{f.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="text-center pb-24 px-4">
                <div className="max-w-xl mx-auto p-10 rounded-3xl bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/20">
                    <h2 className="text-2xl font-bold text-white mb-3">Ready to Build Your Resume?</h2>
                    <p className="text-slate-400 mb-6">Join thousands of job seekers who landed interviews with ResumeForgeAI.</p>
                    <Link href="/dashboard" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:opacity-90 transition-all">
                        Start Building Free →
                    </Link>
                </div>
            </section>
        </main>
    );
}
