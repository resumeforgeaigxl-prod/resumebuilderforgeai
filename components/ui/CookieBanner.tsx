'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { X } from 'lucide-react';

export default function CookieBanner() {
    const { locale, region } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const acceptAll = () => {
        localStorage.setItem('cookie_consent', 'all');
        setIsVisible(false);
    };

    const rejectNonEssential = () => {
        localStorage.setItem('cookie_consent', 'essential');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 w-full bg-slate-900 border-t border-slate-700/50 p-4 md:p-6 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                    <p className="text-slate-300 text-sm md:text-base pr-8">
                        We use cookies to improve your experience on ResumeForgeAI. By continuing you agree to our{' '}
                        <Link href={`/${region}/${locale}/cookie-policy`} className="text-purple-400 hover:text-purple-300 underline underline-offset-2">
                            cookie policy
                        </Link>.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end mt-2 md:mt-0">
                    <button
                        onClick={rejectNonEssential}
                        className="px-4 py-2 border border-slate-600 hover:bg-slate-800 text-slate-300 text-sm rounded-lg transition-colors font-medium"
                    >
                        Reject Non-Essential
                    </button>
                    <button
                        onClick={acceptAll}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-colors shadow-lg shadow-purple-500/20 font-medium"
                    >
                        Accept Cookies
                    </button>
                    <button onClick={rejectNonEssential} className="text-slate-500 hover:text-white p-1 rounded-full md:hidden absolute right-4 top-4">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
