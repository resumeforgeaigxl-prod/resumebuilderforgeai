'use client';

import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { motion } from 'framer-motion';

const REGION_DATA: Record<string, {
    name: string; flag: string;
    free: string; pro: string; premium: string; career: string;
}> = {
    in: { name: 'India', flag: '🇮🇳', free: '₹0', pro: '₹29', premium: '₹199', career: '₹499' },
    us: { name: 'United States', flag: '🇺🇸', free: '$0', pro: '$0.35', premium: '$2.39', career: '$5.99' },
    eu: { name: 'Europe', flag: '🇪🇺', free: '€0', pro: '€0.30', premium: '€2.19', career: '€5.49' },
};

export default function PricingSection() {
    const { locale, region } = useTranslation();
    const regionData = REGION_DATA[region] || REGION_DATA['in'];

    return (
        <section id="pricing" className="max-w-7xl mx-auto px-6 py-32">
            <div className="text-center mb-20">
                <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Simple, Transparent Pricing</h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                    Choose the plan that fits your career stage. All plans include core AI features.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-[10px] font-black uppercase tracking-wider text-indigo-400">
                    Flexible pricing designed for students and developers
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {/* FREE */}
                <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] flex flex-col hover:bg-white/[0.04] transition-all"
                >
                    <h3 className="font-bold text-xl text-white mb-1">Free</h3>
                    <p className="text-slate-500 text-sm mb-6">Basic resume builder access</p>
                    <div className="mb-8"><span className="text-4xl font-black text-white">{regionData.free}</span></div>
                    <ul className="space-y-4 mb-8 text-sm text-slate-400 flex-1">
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> 1 resume generation</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Basic ATS check</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> 20 job listings</li>
                    </ul>
                    <Link href={`/${locale}/signup`} className="w-full py-4 text-center rounded-2xl bg-white/[0.05] hover:bg-white/10 text-white font-bold transition-all border border-white/10">Start Free</Link>
                </motion.div>

                {/* PRO */}
                <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: 0.1 }}
                   className="p-8 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 flex flex-col relative shadow-[0_0_40px_-15px_rgba(99,102,241,0.2)]"
                >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Best Value</div>
                    <h3 className="font-bold text-xl text-white mb-1">Pro</h3>
                    <p className="text-slate-400 text-sm mb-6">24-hour full platform access</p>
                    <div className="mb-8 flex items-baseline gap-1"><span className="text-4xl font-black text-white">{regionData.pro}</span><span className="text-slate-500 text-sm font-bold">/one-time</span></div>
                    <ul className="space-y-4 mb-8 text-sm text-slate-300 flex-1">
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Unlimited resumes (24h)</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Full ATS score analysis</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> All PDF templates</li>
                    </ul>
                    <Link href={`/${locale}/billing?plan=PRO`} className="w-full py-4 text-center rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-500/25">Unlock 24h</Link>
                </motion.div>

                {/* PREMIUM */}
                <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: 0.2 }}
                   className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] flex flex-col hover:bg-white/[0.04] transition-all"
                >
                    <h3 className="font-bold text-xl text-white mb-1">Premium</h3>
                    <p className="text-slate-500 text-sm mb-6">Daily feature usage</p>
                    <div className="mb-8 flex items-baseline gap-1"><span className="text-4xl font-black text-white">{regionData.premium}</span><span className="text-slate-500 text-sm font-bold">/month</span></div>
                    <ul className="space-y-4 mb-8 text-sm text-slate-400 flex-1">
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> 10 resumes / day</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> 10 mock tests / day</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Advanced ATS insights</li>
                    </ul>
                    <Link href={`/${locale}/billing?plan=PREMIUM`} className="w-full py-4 text-center rounded-2xl bg-white hover:bg-slate-100 text-black font-bold transition-all">Upgrade Monthly</Link>
                </motion.div>

                {/* CAREER */}
                <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: 0.3 }}
                   className="p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex flex-col"
                >
                    <h3 className="font-bold text-xl text-white mb-1">Career</h3>
                    <p className="text-slate-400 text-sm mb-6">Full ecosystem access</p>
                    <div className="mb-8 flex items-baseline gap-1"><span className="text-4xl font-black text-white">{regionData.career}</span><span className="text-slate-500 text-sm font-bold">/month</span></div>
                    <ul className="space-y-4 mb-8 text-sm text-slate-300 flex-1">
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Unlimited everything</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Priority AI processing</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Custom AI roadmaps</li>
                    </ul>
                    <Link href={`/${locale}/billing?plan=CAREER`} className="w-full py-4 text-center rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold transition-all shadow-lg shadow-amber-500/25">Get Full Access</Link>
                </motion.div>
            </div>
        </section>
    );
}
