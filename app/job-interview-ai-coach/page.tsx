export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'AI Job Interview Coach — JobForgeAI Conversation Assistant',
    description: 'Get real-time AI coaching for job interviews. JobForgeAI answers your career questions, helps with salary negotiation, and prepares you for every interview scenario.',
    alternates: { canonical: 'https://resumeforgeai.in/job-interview-ai-coach' },
    openGraph: {
        title: 'AI Job Interview Coach | JobForgeAI by ResumeForgeAI',
        description: 'Your personal AI career coach. Get interview tips, salary advice, and job search strategies.',
        url: 'https://resumeforgeai.in/job-interview-ai-coach',
    },
};

const coachFeatures = [
    { emoji: '💬', title: 'Conversational AI Coach', desc: 'Chat naturally with JobForgeAI about your career challenges. Ask anything from interview tips to career transitions.' },
    { emoji: '💰', title: 'Salary Negotiation', desc: 'Get data-backed salary benchmarks and scripted negotiation strategies for your role and experience level.' },
    { emoji: '🗺️', title: 'Career Path Planning', desc: 'Explore different career trajectories, skill requirements, and growth timelines for your target industry.' },
    { emoji: '📧', title: 'Email & Follow-up Scripts', desc: 'Get professionally written templates for thank-you emails, follow-up messages, and offer negotiations.' },
    { emoji: '🏢', title: 'Company Research', desc: 'Get insights on company culture, interview formats, and what to expect from specific organizations.' },
    { emoji: '🎯', title: 'Job Search Strategy', desc: 'Personalized job search strategies based on your skills, experience, and target companies.' },
];

export default function JobInterviewAICoachPage() {
    return (
        <main className="min-h-screen bg-[#070710] text-slate-200">
            {/* Hero */}
            <section className="max-w-5xl mx-auto px-4 pt-24 pb-16 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-6">
                    🧠 Powered by JobForgeAI
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                    Your Personal{' '}
                    <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                        AI Interview Coach
                    </span>
                </h1>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
                    JobForgeAI is your always-available AI career assistant. Get personalized interview advice, salary insights, career guidance,
                    and job search strategies — in a natural conversation, whenever you need it.
                </p>
                <Link href="/jobforgeai" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-base hover:opacity-90 transition-all">
                    Chat with AI Coach Free →
                </Link>
            </section>

            {/* Features */}
            <section className="max-w-5xl mx-auto px-4 pb-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {coachFeatures.map(f => (
                        <div key={f.title} className="p-5 rounded-2xl bg-white/5 border border-white/10">
                            <div className="text-2xl mb-3">{f.emoji}</div>
                            <h3 className="font-bold text-white mb-2">{f.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Long-form SEO */}
            <section className="max-w-4xl mx-auto px-4 py-8">
                <div className="space-y-6 text-slate-300 leading-relaxed">
                    <h2 className="text-2xl font-bold text-white">What is an AI Job Interview Coach?</h2>
                    <p>
                        An AI job interview coach is an artificial intelligence assistant specifically designed to help job seekers prepare for interviews, navigate the job search process,
                        and make better career decisions. Unlike generic AI chatbots, a job interview AI coach is trained on career-specific knowledge including interview strategies,
                        industry-specific hiring practices, salary benchmarking data, and company research.
                    </p>
                    <p>
                        JobForgeAI by ResumeForgeAI is India&apos;s leading AI career coaching assistant. It combines conversational AI with deep knowledge of the Indian job market,
                        helping candidates from all backgrounds — freshers, mid-level professionals, and senior executives — navigate their career journeys more confidently and effectively.
                    </p>

                    <h2 className="text-2xl font-bold text-white">How AI Coaching Improves Interview Performance</h2>
                    <p>
                        Research consistently shows that candidates who prepare more thoroughly for interviews perform significantly better and receive higher job offers.
                        The challenge has always been access to quality preparation resources and personalized guidance. Professional career coaches charge thousands of rupees per session,
                        mock interview services are expensive and hard to schedule, and generic guides on the internet are too generalised to be truly helpful.
                    </p>
                    <p>
                        JobForgeAI democratizes access to quality career coaching by providing personalized, contextual guidance at scale. You can describe your specific situation —
                        your background, target role, company, interview stage — and receive advice tailored exactly to your circumstances. This level of personalization was previously
                        only available through expensive one-on-one coaching.
                    </p>

                    <h2 className="text-2xl font-bold text-white">AI Coaching for Salary Negotiation</h2>
                    <p>
                        One of the most valuable use cases for AI coaching is salary negotiation. Studies show that candidates who negotiate their salary offers receive an average of 10-20%
                        higher compensation than those who accept the initial offer. Yet many candidates, especially freshers and early-career professionals in India, hesitate to negotiate
                        because they lack confidence and don&apos;t know the market rates.
                    </p>
                    <p>
                        JobForgeAI provides real-time salary benchmarks based on your role, experience, location, and industry. It also coaches you on negotiation scripts —
                        exactly what to say when a recruiter asks for your salary expectations, how to counter a lowball offer professionally, and how to negotiate additional benefits
                        beyond base salary like signing bonuses, flexibility, or early review cycles.
                    </p>

                    <h2 className="text-2xl font-bold text-white">Career Transition Guidance</h2>
                    <p>
                        Changing careers or industries is one of the most challenging professional decisions anyone can make. The uncertainty, self-doubt, and lack of clear information
                        make it difficult to commit to a path. JobForgeAI acts as a sounding board and research partner for career transitions.
                    </p>
                    <p>
                        Tell JobForgeAI your current role, target role, and concerns — and it will map out exactly what skills you need to develop, what certifications are most valued,
                        which companies hire career changers, and how to position your existing experience as an asset rather than a liability in your new field.
                        This kind of strategic career guidance, available 24/7 and completely free, is a game-changer for anyone considering a professional pivot.
                    </p>
                </div>
            </section>

            {/* CTA */}
            <section className="text-center py-20 px-4">
                <div className="max-w-xl mx-auto p-10 rounded-3xl bg-gradient-to-br from-amber-900/30 to-orange-900/30 border border-amber-500/20">
                    <h2 className="text-2xl font-bold text-white mb-3">Get Expert Career Guidance — Instantly</h2>
                    <p className="text-slate-400 mb-6">Chat with JobForgeAI about your interview, salary, or career path. Free, always available.</p>
                    <Link href="/jobforgeai" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold hover:opacity-90 transition-all">
                        Start Coaching Session →
                    </Link>
                </div>
            </section>
        </main>
    );
}
