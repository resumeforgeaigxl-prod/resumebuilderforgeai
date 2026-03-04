import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'AI Mock Interview Practice — Prepare for Any Job Interview',
    description: 'Practice job interviews with AI. Get real interview questions, instant feedback, and detailed analysis to ace your next interview. Free AI mock interview tool by ResumeForgeAI.',
    alternates: { canonical: 'https://resumeforgeai.in/ai-mock-interview' },
    openGraph: {
        title: 'AI Mock Interview | ResumeForgeAI',
        description: 'Practice unlimited mock interviews with AI. Get instant feedback and improve your interview performance.',
        url: 'https://resumeforgeai.in/ai-mock-interview',
    },
};

const interviewTypes = [
    { icon: '💼', title: 'HR & Behavioral', desc: 'Practice common HR questions like "Tell me about yourself", strength/weakness questions, situational scenarios, and cultural fit assessments.' },
    { icon: '💻', title: 'Technical Rounds', desc: 'Role-specific technical questions for software engineering, data analysis, marketing, finance, and other domains.' },
    { icon: '🎯', title: 'Domain Specific', desc: 'Industry and role-specific questions tailored to your target job description and company type.' },
    { icon: '📝', title: 'STAR Method Practice', desc: 'Practice the Situation-Task-Action-Result framework for behavioral interviews with AI coaching.' },
];

export default function AIMockInterviewPage() {
    return (
        <main className="min-h-screen bg-[#070710] text-slate-200">
            {/* Hero */}
            <section className="max-w-5xl mx-auto px-4 pt-24 pb-16 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-6">
                    🎤 AI Interview Coach
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                    AI Mock Interview{' '}
                    <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Practice Tool
                    </span>
                </h1>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
                    Practice unlimited mock interviews with our AI interview coach. Get real-time feedback, detailed answer analysis,
                    and expert tips to build confidence and ace your next job interview — from campus placements to senior roles.
                </p>
                <Link href="/mock-test" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-base hover:opacity-90 transition-all">
                    Start Mock Interview Free →
                </Link>
            </section>

            {/* Interview Types */}
            <section className="max-w-4xl mx-auto px-4 pb-12">
                <h2 className="text-xl font-bold text-white text-center mb-6">Interview Types Covered</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {interviewTypes.map(t => (
                        <div key={t.title} className="p-5 rounded-2xl bg-white/5 border border-white/10">
                            <div className="text-2xl mb-2">{t.icon}</div>
                            <h3 className="font-bold text-white mb-1">{t.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{t.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Long-form SEO content */}
            <section className="max-w-4xl mx-auto px-4 py-8">
                <div className="space-y-6 text-slate-300 leading-relaxed">
                    <h2 className="text-2xl font-bold text-white">Why Practice with AI Mock Interviews?</h2>
                    <p>
                        Interview preparation is one of the most important factors in landing a job, yet it&apos;s also one of the most neglected.
                        Most candidates spend hours perfecting their resume but only minutes preparing for the actual interview.
                        ResumeForgeAI&apos;s AI mock interview tool changes that by providing unlimited, realistic interview practice available 24/7 — without scheduling a real person.
                    </p>
                    <p>
                        Traditional interview preparation relied on practicing with friends or family, reading generic interview guides, or expensive career coaching sessions.
                        AI mock interviewing removes all these barriers. You can practice at midnight before your 9 AM interview, get immediate objective feedback,
                        and repeat the same question as many times as needed until your answer is polished and confident.
                    </p>

                    <h2 className="text-2xl font-bold text-white">How AI Mock Interviews Work on ResumeForgeAI</h2>
                    <p>
                        Our AI mock interview system generates contextually relevant questions based on your target role, industry, experience level, and job description.
                        You type or speak your answers, and the AI provides instant, detailed feedback covering content quality, answer structure, keyword usage, confidence indicators,
                        and specific suggestions to strengthen your response.
                    </p>
                    <p>
                        The AI evaluates your answers against best practices for each question type. For behavioral questions, it checks whether you&apos;re using the STAR method effectively.
                        For technical questions, it assesses accuracy, depth, and clarity of explanation. For HR questions, it evaluates authenticity, professionalism, and alignment with common employer expectations.
                    </p>

                    <h2 className="text-2xl font-bold text-white">AI Mock Interviews for Campus Placements</h2>
                    <p>
                        Campus placement season is one of the most stressful periods for engineering and MBA students in India. Companies like TCS, Infosys, Wipro, Accenture,
                        Cognizant, and hundreds of other organizations conduct structured recruitment drives at colleges, and preparation is key to standing out.
                    </p>
                    <p>
                        ResumeForgeAI&apos;s AI mock interview tool offers specific preparation tracks for campus placements, covering aptitude-based interview questions,
                        group discussion topics, technical interview questions for freshers, and HR rounds. Students can practice for mass recruiters as well as specific dream companies,
                        dramatically improving their confidence and performance on placement day.
                    </p>

                    <h2 className="text-2xl font-bold text-white">Preparing for Product & Tech Companies</h2>
                    <p>
                        For candidates targeting product companies, startups, and tech-focused organizations, the interview process is significantly different from traditional service companies.
                        These companies emphasize problem-solving ability, system design thinking, product sense, and cultural fit over rote technical knowledge.
                        Our AI mock interview tool adapts to these requirements, providing scenario-based questions, case studies, and system design discussions for tech and product roles.
                    </p>
                    <p>
                        Whether you&apos;re preparing for a software engineering role at a FAANG company, a product management position at a startup, or a data science role at a large enterprise —
                        ResumeForgeAI&apos;s contextual AI interview coaching gives you the specific, targeted practice you need to walk into that interview with confidence.
                    </p>
                </div>
            </section>

            {/* CTA */}
            <section className="text-center py-20 px-4">
                <div className="max-w-xl mx-auto p-10 rounded-3xl bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/20">
                    <h2 className="text-2xl font-bold text-white mb-3">Practice Makes Perfect</h2>
                    <p className="text-slate-400 mb-6">Start your AI mock interview session now — no scheduling, no waiting, no judgment.</p>
                    <Link href="/mock-test" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:opacity-90 transition-all">
                        Start Practicing Free →
                    </Link>
                </div>
            </section>
        </main>
    );
}
