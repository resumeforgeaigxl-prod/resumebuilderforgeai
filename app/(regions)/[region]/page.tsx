'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ArrowRight, Briefcase, CheckCircle2, Sparkles
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface PlanOption {
    name: string;
    price: string;
    period: string;
    highlight?: string;
}

// ─── Region config ────────────────────────────────────────────────────────────
const REGION_CONFIG: Record<
    string,
    {
        name: string;
        flag: string;
        currency: string;
        plans: PlanOption[];
        jobMarket: { headline: string; description: string; highlights: string[] };
        hreflang: string;
    }
> = {
    in: {
        name: 'India',
        flag: '🇮🇳',
        currency: '₹',
        plans: [
            { name: 'Pro', price: '₹29', period: '/one-time', highlight: 'Most Popular' },
            { name: 'Premium', price: '₹199', period: '/month' },
            { name: 'Career', price: '₹499', period: '/month' },
        ],
        jobMarket: {
            headline: 'Built for the Indian Job Market',
            description:
                'Tailored for fresher and experienced professionals targeting top MNCs, startups, and government roles across India.',
            highlights: [
                'ATS-optimised for Indian recruiters',
                'INR pricing — no hidden fees',
                'Jobs from Naukri, LinkedIn, and more',
                'Interview prep for Indian product & service companies',
            ],
        },
        hreflang: 'en-IN',
    },
    us: {
        name: 'United States',
        flag: '🇺🇸',
        currency: '$',
        plans: [
            { name: 'Pro', price: '$0.35', period: '/one-time', highlight: 'Most Popular' },
            { name: 'Premium', price: '$2.39', period: '/month' },
            { name: 'Career', price: '$5.99', period: '/month' },
        ],
        jobMarket: {
            headline: 'Optimised for the US Job Market',
            description:
                'Whether targeting FAANG, Fortune 500, or early-stage startups, ResumeForgeAI aligns your resume with US-specific ATS systems.',
            highlights: [
                'ATS-optimised for US hiring systems',
                'USD pricing with transparent rates',
                'Jobs from LinkedIn, Indeed & more',
                'Interview prep for FAANG & US companies',
            ],
        },
        hreflang: 'en-US',
    },
    eu: {
        name: 'Europe',
        flag: '🇪🇺',
        currency: '€',
        plans: [
            { name: 'Pro', price: '€0.30', period: '/one-time', highlight: 'Most Popular' },
            { name: 'Premium', price: '€2.19', period: '/month' },
            { name: 'Career', price: '€5.49', period: '/month' },
        ],
        jobMarket: {
            headline: 'Tailored for European Professionals',
            description:
                'From Germany to France and beyond — build GDPR-compliant, EU-format resumes that stand out to European recruiters.',
            highlights: [
                'EU-format (Europass-style) resume support',
                'EUR pricing, GDPR-compliant',
                'Jobs from across EU markets',
                'GDPR data privacy by design',
            ],
        },
        hreflang: 'en-EU',
    },
} as const;

type Region = keyof typeof REGION_CONFIG;

interface Props {
    params: { region: string };
}

export default function RegionalPage({ params }: Props) {
    const r = params.region as Region;
    const config = REGION_CONFIG[r];
    if (!config) notFound();

    const { name, flag, jobMarket, plans } = config;

    return (
        <div className="min-h-screen bg-[#070710] text-slate-200 overflow-hidden relative">
            {/* Background */}
            <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-[500px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none opacity-50" />
            <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none opacity-40" />

            <main className="relative z-10 pt-32 pb-24">
                {/* Hero */}
                <section className="flex flex-col items-center text-center max-w-4xl mx-auto px-6 mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6"
                    >
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium text-gray-300">
                            {flag}&nbsp;{name} Edition
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.1] text-white"
                    >
                        AI Resume Builder for{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                            {name} {flag}
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg text-gray-400 mb-8 max-w-2xl"
                    >
                        {jobMarket.description}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
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
                </section>

                {/* Job Market Section */}
                <section className="max-w-5xl mx-auto px-6 mb-20">
                    <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-3xl p-8 md:p-12">
                        <div className="flex items-center gap-3 mb-6">
                            <Briefcase className="w-8 h-8 text-purple-400" />
                            <h2 className="text-2xl md:text-3xl font-bold text-white">{jobMarket.headline}</h2>
                        </div>
                        <ul className="grid sm:grid-cols-2 gap-4">
                            {jobMarket.highlights.map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-300">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Pricing */}
                <section className="max-w-5xl mx-auto px-6 mb-20">
                    <h2 className="text-3xl font-bold text-white text-center mb-10">
                        {flag} {name} Pricing
                    </h2>
                    <div className="grid sm:grid-cols-3 gap-6">
                        {plans.map((plan, i) => (
                            <div
                                key={i}
                                className={`p-7 rounded-3xl flex flex-col relative ${plan.highlight
                                    ? 'bg-gradient-to-b from-blue-900/40 to-[#070710] border border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.2)]'
                                    : 'bg-white/5 border border-white/10'
                                    }`}
                            >
                                {plan.highlight && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs font-bold uppercase tracking-widest py-1 px-3 rounded-full">
                                        {plan.highlight}
                                    </div>
                                )}
                                <h3 className="font-bold text-xl text-white mb-3">{plan.name}</h3>
                                <div className="mb-6 flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                                    <span className="text-slate-400 text-sm">{plan.period}</span>
                                </div>
                                <Link
                                    href={`/billing?plan=${plan.name.toUpperCase()}`}
                                    className={`block w-full py-3 px-4 text-white text-center rounded-xl font-bold transition-colors mt-auto ${plan.highlight
                                        ? 'bg-blue-600 hover:bg-blue-500'
                                        : 'bg-white/5 hover:bg-white/10 border border-white/10'
                                        }`}
                                >
                                    Get {plan.name}
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Region switcher */}
                <section className="max-w-3xl mx-auto px-6 text-center">
                    <p className="text-slate-500 text-sm mb-4">Viewing the {name} version. Switch region:</p>
                    <div className="flex justify-center gap-4 flex-wrap">
                        {(Object.keys(REGION_CONFIG) as Region[])
                            .filter((k) => k !== r)
                            .map((k) => (
                                <Link
                                    key={k}
                                    href={`/${k}`}
                                    className="px-4 py-2 text-sm rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 transition-colors"
                                >
                                    {REGION_CONFIG[k].flag} {REGION_CONFIG[k].name}
                                </Link>
                            ))}
                        <Link
                            href="/"
                            className="px-4 py-2 text-sm rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 transition-colors"
                        >
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
