'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ArrowRight, Briefcase, CheckCircle2, Sparkles,
    FileText, Zap, Target, Layout, BrainCircuit,
    MessageSquareWarning, Shield, XCircle,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface PlanOption {
    name: string;
    price: string;
    period: string;
    highlight?: string;
    color: string;
    features: string[];
    href: string;
}

interface RegionConfig {
    name: string;
    flag: string;
    currency: string;
    hreflang: string;
    hero: { tagline: string; description: string };
    jobMarket: { headline: string; description: string; highlights: string[] };
    plans: PlanOption[];
}

// ─── Region config ─────────────────────────────────────────────────────────
const REGION_CONFIG: Record<string, RegionConfig> = {
    in: {
        name: 'India',
        flag: '🇮🇳',
        currency: '₹',
        hreflang: 'en-IN',
        hero: {
            tagline: 'Built for the Indian Job Market',
            description:
                'Craft ATS-winning resumes tailored for Indian MNCs, startups, and fresher roles. Land interviews at Wipro, TCS, Infosys, startups and beyond.',
        },
        jobMarket: {
            headline: 'Why Indian Candidates Love ResumeForgeAI',
            description: 'Designed specifically for the Indian hiring landscape — from campus placements to senior roles.',
            highlights: [
                'ATS-optimised for top Indian recruiters',
                'INR pricing — no hidden conversion fees',
                'Jobs from Naukri, LinkedIn, Glassdoor & more',
                'Interview prep for service & product companies',
            ],
        },
        plans: [
            {
                name: 'Free',
                price: '₹0',
                period: '/forever',
                color: 'bg-white/5 border-white/10',
                href: '/signup',
                features: ['1 resume generation', 'Basic ATS score check', '20 job listings', 'No mock tests'],
            },
            {
                name: 'Pro',
                price: '₹29',
                period: '/one-time',
                highlight: 'Most Popular',
                color: 'bg-gradient-to-b from-blue-900/40 to-[#070710] border-blue-500/50',
                href: '/billing?plan=PRO',
                features: ['Unlimited resumes (24h)', 'Unlimited cover letters', 'Unlimited mock tests', 'Full ATS analysis'],
            },
            {
                name: 'Premium',
                price: '₹199',
                period: '/month',
                color: 'bg-gradient-to-b from-purple-900/30 to-[#070710] border-purple-500/40',
                href: '/billing?plan=PREMIUM',
                features: ['10 resumes / day', '10 mock tests / day', '10 cover letters / day', 'Job recommendations'],
            },
            {
                name: 'Career',
                price: '₹499',
                period: '/month',
                color: 'bg-gradient-to-b from-amber-900/30 to-[#070710] border-amber-500/40',
                href: '/billing?plan=CAREER',
                features: ['Unlimited everything', 'AI job assistant', 'MNC & fresher alerts', 'Priority AI processing'],
            },
        ],
    },
    us: {
        name: 'United States',
        flag: '🇺🇸',
        currency: '$',
        hreflang: 'en-US',
        hero: {
            tagline: 'Built for the US Job Market',
            description:
                'Land roles at FAANG, Fortune 500, and high-growth startups. Our AI aligns your resume with US-specific ATS systems and recruiter expectations.',
        },
        jobMarket: {
            headline: 'Why US Job Seekers Choose ResumeForgeAI',
            description: 'From Silicon Valley to Wall Street — beat the bots and get your resume seen by humans.',
            highlights: [
                'ATS-optimised for US hiring systems (Workday, Greenhouse)',
                'USD pricing — transparent and fair',
                'Jobs from LinkedIn, Indeed, Glassdoor & more',
                'Interview prep for FAANG & top US companies',
            ],
        },
        plans: [
            {
                name: 'Free',
                price: '$0',
                period: '/forever',
                color: 'bg-white/5 border-white/10',
                href: '/signup',
                features: ['1 resume generation', 'Basic ATS score check', '20 job listings', 'No mock tests'],
            },
            {
                name: 'Pro',
                price: '$0.35',
                period: '/one-time',
                highlight: 'Most Popular',
                color: 'bg-gradient-to-b from-blue-900/40 to-[#070710] border-blue-500/50',
                href: '/billing?plan=PRO',
                features: ['Unlimited resumes (24h)', 'Unlimited cover letters', 'Unlimited mock tests', 'Full ATS analysis'],
            },
            {
                name: 'Premium',
                price: '$2.39',
                period: '/month',
                color: 'bg-gradient-to-b from-purple-900/30 to-[#070710] border-purple-500/40',
                href: '/billing?plan=PREMIUM',
                features: ['10 resumes / day', '10 mock tests / day', '10 cover letters / day', 'Job recommendations'],
            },
            {
                name: 'Career',
                price: '$5.99',
                period: '/month',
                color: 'bg-gradient-to-b from-amber-900/30 to-[#070710] border-amber-500/40',
                href: '/billing?plan=CAREER',
                features: ['Unlimited everything', 'AI job assistant', 'FAANG & startup alerts', 'Priority AI processing'],
            },
        ],
    },
    eu: {
        name: 'Europe',
        flag: '🇪🇺',
        currency: '€',
        hreflang: 'en-EU',
        hero: {
            tagline: 'Built for European Professionals',
            description:
                'Create GDPR-compliant, EU-format resumes that stand out to European recruiters — from Germany to France, Netherlands to Poland.',
        },
        jobMarket: {
            headline: 'Why European Job Seekers Choose ResumeForgeAI',
            description: 'Tailored for EU markets with GDPR-compliant data handling and Europass-compatible formatting.',
            highlights: [
                'EU resume format support (Europass-style)',
                'EUR pricing, GDPR-compliant by design',
                'Jobs from across EU markets',
                'Multilingual job market insights',
            ],
        },
        plans: [
            {
                name: 'Free',
                price: '€0',
                period: '/forever',
                color: 'bg-white/5 border-white/10',
                href: '/signup',
                features: ['1 resume generation', 'Basic ATS score check', '20 job listings', 'No mock tests'],
            },
            {
                name: 'Pro',
                price: '€0.30',
                period: '/one-time',
                highlight: 'Most Popular',
                color: 'bg-gradient-to-b from-blue-900/40 to-[#070710] border-blue-500/50',
                href: '/billing?plan=PRO',
                features: ['Unlimited resumes (24h)', 'Unlimited cover letters', 'Unlimited mock tests', 'Full ATS analysis'],
            },
            {
                name: 'Premium',
                price: '€2.19',
                period: '/month',
                color: 'bg-gradient-to-b from-purple-900/30 to-[#070710] border-purple-500/40',
                href: '/billing?plan=PREMIUM',
                features: ['10 resumes / day', '10 mock tests / day', '10 cover letters / day', 'Job recommendations'],
            },
            {
                name: 'Career',
                price: '€5.49',
                period: '/month',
                color: 'bg-gradient-to-b from-amber-900/30 to-[#070710] border-amber-500/40',
                href: '/billing?plan=CAREER',
                features: ['Unlimited everything', 'AI job assistant', 'EU & international alerts', 'Priority AI processing'],
            },
        ],
    },
};

const FEATURES = [
    { icon: Sparkles, title: 'AI Resume Builder', desc: 'FAANG-mode bullet enhancer that rewrites experience bullets for maximum recruiter impact.', color: 'text-purple-400' },
    { icon: Zap, title: 'ATS Analyzer', desc: 'Real-time grading for action verbs, missing metrics, and readability. Know your score instantly.', color: 'text-blue-400' },
    { icon: Target, title: 'JD Matching', desc: 'Paste the job description — AI cross-references your resume and highlights every missing keyword.', color: 'text-emerald-400' },
    { icon: Layout, title: 'Portfolio Generator', desc: 'One click turns your resume into a stunning dark-mode web portfolio. Share with recruiters.', color: 'text-pink-400' },
    { icon: BrainCircuit, title: 'AI Mock Interviews', desc: 'Resume-specific technical questions generated by AI. Stop memorising generic answers.', color: 'text-orange-400' },
    { icon: MessageSquareWarning, title: 'JobForgeAI Chat', desc: 'Strict AI career coach for resume optimisation and interview preparation.', color: 'text-amber-400' },
    { icon: Briefcase, title: 'Live Job Board', desc: 'Curated MNC and entry-level jobs with direct ATS match scores per listing.', color: 'text-cyan-400' },
    { icon: Shield, title: 'Secure & Private', desc: 'OAuth logins, encrypted storage, 100% privacy toggle. Your data is yours.', color: 'text-yellow-400' },
];

interface Props {
    params: { region: string };
}

export default function RegionalPage({ params }: Props) {
    const r = params.region;
    const config = REGION_CONFIG[r];
    if (!config) notFound();

    const { name, flag, hero, jobMarket, plans } = config;
    const otherRegions = (Object.keys(REGION_CONFIG) as string[]).filter((k) => k !== r);

    return (
        <div className="min-h-screen bg-[#070710] text-slate-200 overflow-hidden relative font-sans">
            {/* Background glows */}
            <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-[500px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none opacity-50" />
            <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none opacity-40" />

            <main className="relative z-10 pt-32 pb-24 space-y-32">

                {/* ── 1. HERO ─────────────────────────────────────────────── */}
                <section className="flex flex-col items-center text-center max-w-4xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6"
                    >
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium text-gray-300">{flag}&nbsp;{name} Edition</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.1] text-white"
                    >
                        {hero.tagline.split(name).map((part, i, arr) =>
                            i < arr.length - 1 ? (
                                <span key={i}>{part}<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">{name} {flag}</span></span>
                            ) : part
                        )}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg text-gray-400 mb-10 max-w-2xl"
                    >
                        {hero.description}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4"
                    >
                        <Link
                            href="/signup"
                            className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-black font-semibold hover:bg-gray-100 hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                        >
                            Build Resume Free <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/"
                            className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-colors"
                        >
                            Back to Homepage
                        </Link>
                    </motion.div>

                    {/* Problem strip */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-14 w-full max-w-3xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-6 text-left"
                    >
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-purple-400" /> {jobMarket.headline}
                        </h2>
                        <ul className="grid sm:grid-cols-2 gap-3">
                            {jobMarket.highlights.map((item, i) => (
                                <li key={i} className="flex items-center gap-2.5 text-sm text-slate-300">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />{item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </section>

                {/* ── 2. FEATURES ─────────────────────────────────────────── */}
                <section id="features" className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-14">
                        <FileText className="w-8 h-8 text-purple-400 mx-auto mb-4" />
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                            Everything you need to get hired in {name} {flag}
                        </h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                            A full suite of AI career tools — optimised for job seekers in {name}.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {FEATURES.map((f, i) => {
                            const Icon = f.icon;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: i * 0.05 }}
                                    viewport={{ once: true }}
                                    className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                        <Icon className={`w-6 h-6 ${f.color}`} />
                                    </div>
                                    <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Why 80% of resumes get rejected */}
                    <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[
                            { title: 'Poor Formatting', desc: 'Complex columns or unreadable fonts crash the ATS parser instantly.' },
                            { title: 'Missing Keywords', desc: 'Failing to match the exact terms the recruiter specified in the JD.' },
                            { title: 'Weak Action Verbs', desc: 'Passive language like "helped with" tanks your recruiter scan time.' },
                            { title: 'No Quantified Impact', desc: 'Listing duties instead of measurable achievements gets you skipped.' },
                        ].map((reason, i) => (
                            <div key={i} className="bg-red-500/5 border border-red-500/10 p-5 rounded-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50" />
                                <XCircle className="w-7 h-7 text-red-400 mb-3" />
                                <h3 className="text-sm font-bold text-slate-200 mb-1">{reason.title}</h3>
                                <p className="text-xs text-slate-400">{reason.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── 3. PRICING ──────────────────────────────────────────── */}
                <section id="pricing" className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                            {flag} Pricing for {name}
                        </h2>
                        <p className="text-slate-400 max-w-xl mx-auto text-lg">
                            Simple, transparent pricing. No subscriptions required. Cancel anytime.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
                        {plans.map((plan, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: i * 0.08 }}
                                viewport={{ once: true }}
                                className={`p-7 rounded-3xl border flex flex-col relative ${plan.color}`}
                            >
                                {plan.highlight && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs font-bold uppercase tracking-widest py-1 px-3 rounded-full whitespace-nowrap">
                                        {plan.highlight}
                                    </div>
                                )}
                                <h3 className="font-bold text-xl text-white mb-1">{plan.name}</h3>
                                <div className="mb-5 flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                                    <span className="text-slate-400 text-sm">{plan.period}</span>
                                </div>
                                <ul className="space-y-2.5 mb-8 text-sm text-slate-300 flex-1">
                                    {plan.features.map((f, fi) => (
                                        <li key={fi} className="flex items-center gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />{f}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href={plan.href}
                                    className={`block w-full py-3 px-4 text-white text-center rounded-xl font-bold transition-colors ${plan.highlight
                                            ? 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25'
                                            : 'bg-white/5 hover:bg-white/10 border border-white/10'
                                        }`}
                                >
                                    {plan.name === 'Free' ? 'Start Free' : `Get ${plan.name}`}
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Region switcher */}
                <section className="max-w-3xl mx-auto px-6 text-center pb-8">
                    <p className="text-slate-500 text-sm mb-4">Currently viewing the {name} {flag} version. Switch region:</p>
                    <div className="flex justify-center gap-3 flex-wrap">
                        {otherRegions.map((k) => (
                            <Link
                                key={k}
                                href={`/${k}`}
                                className="px-4 py-2 text-sm rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 transition-colors"
                            >
                                {REGION_CONFIG[k].flag} {REGION_CONFIG[k].name}
                            </Link>
                        ))}
                        <Link href="/" className="px-4 py-2 text-sm rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 transition-colors">
                            🌍 Global
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="border-t border-white/5 py-8 text-center bg-[#05050a] relative z-10">
                <p className="text-slate-600 text-sm">© {new Date().getFullYear()} ResumeForge AI. All rights reserved.</p>
                <div className="flex justify-center gap-4 mt-4 text-xs text-slate-500 font-medium">
                    <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
                    <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
                </div>
            </footer>
        </div>
    );
}
