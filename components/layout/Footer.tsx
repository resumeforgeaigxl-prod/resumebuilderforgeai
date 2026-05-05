'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { usePathname } from 'next/navigation';
import { Briefcase, Github, Twitter, Linkedin, Shield, FileLock } from 'lucide-react';

const INTERNAL_APP_ROOTS = new Set([
    'dashboard',
    'careerforge',
    'resumes',
    'resume',
    'roadmap',
    'mock-interview',
    'mock-test',
    'company-prep',
    'company-prep-interview',
    'codingforge',
    'studyforge',
    'jobforgeai',
    'dashboard-jobs',
    'interview-intelligence',
    'job-alerts',
    'portfolio',
    'tools',
    'account',
    'billing',
    'recruiter',
    'builder',
    'mentorforge',
    'learnforge',
    'demo-studio',
    'knowledge-runner',
    'ai-monitoring',
    'setup-username',
    'u',
    'knowledgeforge',
    'salaryforge',
    'networkforge',
    'ats-live',
    'jobs',
]);

function getRouteRoot(pathname: string | null): string {
    if (!pathname) return '';

    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return '';

    // Locale path format: /{region}/{lang}/{root}
    if (segments.length >= 3) {
        return segments[2];
    }

    return segments[0] || '';
}

export default function Footer() {
    const { t, locale, region } = useTranslation();
    const pathname = usePathname();

    const root = getRouteRoot(pathname);
    const shouldHideFooter =
        pathname?.startsWith('/admin') ||
        pathname?.startsWith('/api') ||
        INTERNAL_APP_ROOTS.has(root);

    if (shouldHideFooter) {
        return null;
    }

    // Landing Page Footer: Robust, professional multi-column SaaS layout.
    return (
        <footer className="relative z-10 w-full border-t border-white/5 bg-[#05050a] pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <Briefcase className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-black tracking-tight text-white uppercase">ResumeForge<span className="text-indigo-500">AI</span></span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                            The comprehensive professional career platform. Empowering candidates with AI-driven resume optimization, mock interviews, and personalized roadmaps.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"><Twitter className="w-4 h-4" /></a>
                            <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"><Linkedin className="w-4 h-4" /></a>
                            <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"><Github className="w-4 h-4" /></a>
                        </div>
                    </div>

                    {/* Modules Column */}
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Platform Modules</h4>
                        <ul className="space-y-4">
                            <li><Link href={`/${region}/${locale}/dashboard`} className="text-sm font-medium text-slate-500 hover:text-white transition-all flex items-center gap-2 group"><div className="w-1 h-1 rounded-full bg-indigo-500/50 group-hover:bg-indigo-500" /> CareerForge</Link></li>
                            <li><Link href={`/${region}/${locale}/resumes`} className="text-sm font-medium text-slate-500 hover:text-white transition-all flex items-center gap-2 group"><div className="w-1 h-1 rounded-full bg-indigo-500/50 group-hover:bg-indigo-500" /> ResumeForge</Link></li>
                            <li><Link href={`/${region}/${locale}/mock-interview`} className="text-sm font-medium text-slate-500 hover:text-white transition-all flex items-center gap-2 group"><div className="w-1 h-1 rounded-full bg-indigo-500/50 group-hover:bg-indigo-500" /> InterviewForge</Link></li>
                            <li><Link href={`/${region}/${locale}/learnforge`} className="text-sm font-medium text-slate-500 hover:text-white transition-all flex items-center gap-2 group"><div className="w-1 h-1 rounded-full bg-indigo-500/50 group-hover:bg-indigo-500" /> LearnForge</Link></li>
                            <li><Link href={`/${region}/${locale}/knowledgeforge`} className="text-sm font-medium text-slate-500 hover:text-white transition-all flex items-center gap-2 group"><div className="w-1 h-1 rounded-full bg-indigo-500/50 group-hover:bg-indigo-500" /> KnowledgeForge</Link></li>
                            <li><Link href={`/${region}/${locale}/salaryforge`} className="text-sm font-medium text-slate-500 hover:text-white transition-all flex items-center gap-2 group"><div className="w-1 h-1 rounded-full bg-[#00D4A0]/50 group-hover:bg-[#00D4A0]" /> SalaryForge</Link></li>
                            <li><Link href={`/${region}/${locale}/ats-live`} className="text-sm font-medium text-slate-500 hover:text-white transition-all flex items-center gap-2 group"><div className="w-1 h-1 rounded-full bg-[#00D4A0]/50 group-hover:bg-[#00D4A0]" /> AtsLive</Link></li>
                            <li><Link href={`/${region}/${locale}/jobs`} className="text-sm font-medium text-slate-500 hover:text-white transition-all flex items-center gap-2 group"><div className="w-1 h-1 rounded-full bg-[#00D4A0]/50 group-hover:bg-[#00D4A0]" /> JobForge</Link></li>
                            <li><Link href={`/${region}/${locale}/mentorforge`} className="text-sm font-medium text-slate-500 hover:text-white transition-all flex items-center gap-2 group"><div className="w-1 h-1 rounded-full bg-indigo-500/50 group-hover:bg-indigo-500" /> MentorForge</Link></li>
                            <li><Link href={`/${region}/${locale}/company-prep`} className="text-sm font-medium text-slate-500 hover:text-white transition-all flex items-center gap-2 group"><div className="w-1 h-1 rounded-full bg-indigo-500/50 group-hover:bg-indigo-500" /> CompanyForge</Link></li>
                        </ul>
                    </div>

                    {/* Resources Column */}
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Resources</h4>
                        <ul className="space-y-4">
                            <li><Link href="#" className="text-sm font-medium text-slate-500 hover:text-white transition-all">Support Center</Link></li>
                            <li><Link href="#" className="text-sm font-medium text-slate-500 hover:text-white transition-all">Templates Library</Link></li>
                            <li><Link href="#" className="text-sm font-medium text-slate-500 hover:text-white transition-all">Career Blog</Link></li>
                            <li><Link href="#" className="text-sm font-medium text-slate-500 hover:text-white transition-all">API Reference</Link></li>
                        </ul>
                    </div>

                    {/* Legal Column */}
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Legal & Policy</h4>
                        <ul className="space-y-4">
                            <li><Link href={`/${region}/${locale}/privacy-policy`} className="text-sm font-medium text-slate-500 hover:text-white transition-all flex items-center gap-2"><Shield className="w-3 h-3 text-emerald-500/50" /> {t('privacy_policy')}</Link></li>
                            <li><Link href={`/${region}/${locale}/terms-of-service`} className="text-sm font-medium text-slate-500 hover:text-white transition-all flex items-center gap-2"><FileLock className="w-3 h-3 text-amber-500/50" /> {t('terms_of_service')}</Link></li>
                            <li><Link href={`/${region}/${locale}/cookie-policy`} className="text-sm font-medium text-slate-500 hover:text-white transition-all">Cookie Policy</Link></li>
                            <li><Link href={`/${region}/${locale}/data-deletion`} className="text-sm font-medium text-slate-500 hover:text-white transition-all">Data Deletion</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[11px] font-bold text-slate-600 uppercase tracking-[0.1em]">© {new Date().getFullYear()} RESUMEFORGE AI. ALL RIGHTS RESERVED.</p>
                    <div className="flex items-center gap-4 text-slate-500">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Powered by Next Gen AI</span>
                        <div className="w-8 h-px bg-white/5" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500/50">Trusted globally</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
