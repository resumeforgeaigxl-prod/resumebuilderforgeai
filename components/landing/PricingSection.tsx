'use client';

import { CheckCircle2, XCircle, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/I18nProvider';

const REGION_DATA: Record<string, {
    name: string; flag: string;
    free: string; pro: string; premium: string; career: string;
}> = {
    in: { name: 'India', flag: '🇮🇳', free: '₹0', pro: '₹29', premium: '₹199', career: '₹499' },
    us: { name: 'United States', flag: '🇺🇸', free: '$0', pro: '$0.35', premium: '$2.39', career: '$5.99' },
    eu: { name: 'Europe', flag: '🇪🇺', free: '€0', pro: '€0.30', premium: '€2.19', career: '€5.49' },
};

export default function PricingSection() {
    const { t, locale, region } = useTranslation();
    const regionData = REGION_DATA[region] || REGION_DATA['in'];

    return (
        <section id="pricing" className="max-w-7xl mx-auto px-6 py-20">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">{t('pricing_title')} {regionData.flag}</h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg">{t('pricing_subtitle')}</p>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
                {/* FREE */}
                <div className="p-7 rounded-3xl bg-white/5 border border-white/10 flex flex-col">
                    <h3 className="font-bold text-xl text-white mb-1">Free</h3>
                    <p className="text-slate-400 text-sm mb-5">Try it out, no card needed</p>
                    <div className="mb-6"><span className="text-4xl font-bold text-white">{regionData.free}</span></div>
                    <ul className="space-y-3 mb-8 text-sm text-slate-300 flex-1">
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 1 resume generation</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> No watermark</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Basic ATS score check</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 20 job listings</li>
                        <li className="flex items-center gap-3 text-slate-500"><XCircle className="w-4 h-4 shrink-0" /> No mock tests</li>
                        <li className="flex items-center gap-3 text-slate-500"><XCircle className="w-4 h-4 shrink-0" /> No cover letters</li>
                    </ul>
                    <Link href={`/${locale}-${region}/signup`} className="block w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-white text-center rounded-xl font-bold transition-colors border border-white/10">Start Free</Link>
                </div>

                {/* PRO */}
                <div className="p-7 rounded-3xl bg-gradient-to-b from-blue-900/40 to-[#070710] border border-blue-500/50 relative shadow-[0_0_30px_rgba(59,130,246,0.2)] flex flex-col">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs font-bold uppercase tracking-widest py-1 px-3 rounded-full whitespace-nowrap">{t('most_popular')}</div>
                    <h3 className="font-bold text-xl text-white mb-1">Pro</h3>
                    <p className="text-slate-400 text-sm mb-5">Full access for 24 hours</p>
                    <div className="mb-1 flex items-baseline gap-1"><span className="text-4xl font-bold text-white">{regionData.pro}</span><span className="text-slate-400 text-sm">/one-time</span></div>
                    <p className="text-xs text-blue-400 font-bold mb-5">⏱ Expires 24 hours after purchase</p>
                    <ul className="space-y-3 mb-8 text-sm text-slate-300 flex-1">
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> Unlimited resumes (24h)</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> Unlimited cover letters (24h)</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> Unlimited mock tests (24h)</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> Full ATS score analysis</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> Full job access</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> Watermark-free PDF</li>
                    </ul>
                    <Link
                        href={`/${locale}-${region}/billing?plan=PRO`}
                        onClick={async () => {
                            try {
                                const posthog = (await import('@/lib/posthog')).default;
                                posthog.capture('plan_selected', { plan_type: 'PRO' });
                            } catch (e) { console.error('[PostHog] Event error:', e); }
                        }}
                        className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white text-center rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/25"
                    >
                        Unlock 24h Access
                    </Link>
                </div>

                {/* PREMIUM */}
                <div className="p-7 rounded-3xl bg-gradient-to-b from-purple-900/30 to-[#070710] border border-purple-500/40 flex flex-col">
                    <h3 className="font-bold text-xl text-white mb-1">Premium</h3>
                    <p className="text-slate-400 text-sm mb-5">Daily limits, reset every 24h</p>
                    <div className="mb-1 flex items-baseline gap-1"><span className="text-4xl font-bold text-white">{regionData.premium}</span><span className="text-slate-400 text-sm">/month</span></div>
                    <p className="text-xs text-purple-400 font-bold mb-5">30-day subscription</p>
                    <ul className="space-y-3 mb-8 text-sm text-slate-300 flex-1">
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> 10 resumes / day</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> 10 mock tests / day</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> 10 cover letters / day</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> Advanced ATS insights</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> Full job access</li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                            <span>Job recommendations <span className="inline-flex items-center gap-1 ml-1 text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded-full"><Briefcase className="w-3 h-3" /> JobForgeAI</span></span>
                        </li>
                    </ul>
                    <Link
                        href={`/${locale}-${region}/billing?plan=PREMIUM`}
                        onClick={async () => {
                            try {
                                const posthog = (await import('@/lib/posthog')).default;
                                posthog.capture('plan_selected', { plan_type: 'PREMIUM' });
                            } catch (e) { console.error('[PostHog] Event error:', e); }
                        }}
                        className="block w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white text-center rounded-xl font-bold transition-colors shadow-lg shadow-purple-500/25"
                    >
                        Upgrade Monthly
                    </Link>
                </div>

                {/* CAREER */}
                <div className="p-7 rounded-3xl bg-gradient-to-b from-amber-900/30 to-[#070710] border border-amber-500/40 flex flex-col">
                    <h3 className="font-bold text-xl text-white mb-1">Career</h3>
                    <p className="text-slate-400 text-sm mb-5">Serious job seekers only</p>
                    <div className="mb-1 flex items-baseline gap-1"><span className="text-4xl font-bold text-white">{regionData.career}</span><span className="text-slate-400 text-sm">/month</span></div>
                    <p className="text-xs text-amber-400 font-bold mb-5">30-day subscription</p>
                    <ul className="space-y-3 mb-8 text-sm text-slate-300 flex-1">
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Unlimited resumes</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Unlimited mock tests</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Unlimited cover letters</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Advanced ATS optimization</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Priority AI processing</li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <span>AI job assistant <span className="inline-flex items-center gap-1 ml-1 text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded-full"><Briefcase className="w-3 h-3" /> JobForgeAI</span></span>
                        </li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> MNC &amp; fresher job alerts</li>
                    </ul>
                    <Link
                        href={`/${locale}-${region}/billing?plan=CAREER`}
                        onClick={async () => {
                            try {
                                const posthog = (await import('@/lib/posthog')).default;
                                posthog.capture('plan_selected', { plan_type: 'CAREER' });
                            } catch (e) { console.error('[PostHog] Event error:', e); }
                        }}
                        className="block w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-center rounded-xl font-bold transition-colors shadow-lg shadow-amber-500/25"
                    >
                        Unlock Unlimited
                    </Link>
                </div>
            </div>

            {/* JobForgeAI explanation strip */}
            <div className="mt-10 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center gap-4 max-w-4xl mx-auto">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                    <Briefcase className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                    <p className="font-bold text-white text-sm">Powered by JobForgeAI</p>
                    <p className="text-slate-400 text-xs mt-0.5">Finds jobs from multiple sources · ATS match score per job · MNC &amp; fresher opportunities · Resume-based job suggestions</p>
                </div>
                <span className="text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full shrink-0">Premium &amp; Career</span>
            </div>
        </section>
    );
}
