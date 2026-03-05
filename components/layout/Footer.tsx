'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/I18nProvider';

export default function Footer() {
    const { locale, region } = useTranslation();

    return (
        <footer className="border-t border-white/5 py-8 bg-[#05050a] relative z-10 w-full text-center">
            <div className="max-w-7xl mx-auto px-6">
                <p className="text-slate-600 text-sm mb-4">© {new Date().getFullYear()} ResumeForge AI. All rights reserved.</p>

                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-500 font-medium">
                    <Link href={`/${region}/${locale}/privacy-policy`} className="hover:text-slate-300 transition-colors cursor-pointer">
                        Privacy Policy
                    </Link>
                    <Link href={`/${region}/${locale}/terms-of-service`} className="hover:text-slate-300 transition-colors cursor-pointer">
                        Terms of Service
                    </Link>
                    <Link href={`/${region}/${locale}/cookie-policy`} className="hover:text-slate-300 transition-colors cursor-pointer">
                        Cookie Policy
                    </Link>
                    <Link href={`/${region}/${locale}/data-deletion`} className="hover:text-slate-300 transition-colors cursor-pointer">
                        Data Deletion
                    </Link>
                    <Link href={`/${region}/${locale}/dashboard/support`} className="hover:text-slate-300 transition-colors cursor-pointer underline decoration-purple-500/30">
                        Contact / Support
                    </Link>
                </div>
            </div>
        </footer>
    );
}
