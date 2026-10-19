'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/I18nProvider';

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
        <div className="fixed bottom-4 left-4 right-4 z-[60] md:left-8 md:right-auto md:max-w-xl">
            <div className="rounded-2xl border border-[#2a2c33] bg-[#0c0d10] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
                <p className="text-[13px] leading-relaxed text-[#b4b8c2]">
                    We use cookies to keep you signed in and remember your settings.{' '}
                    <Link
                        href={`/${locale}-${region}/cookie-policy`}
                        className="text-[#d7e4f0] underline decoration-[#3a3d46] underline-offset-4 hover:decoration-[#d7e4f0]"
                    >
                        Cookie policy
                    </Link>
                </p>
                <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={rejectNonEssential}
                        className="h-9 cursor-pointer rounded-full border border-[#3a3d46] px-4 text-xs font-medium text-[#f4f5f7] transition-colors hover:bg-[#16171b]"
                    >
                        Essential only
                    </button>
                    <button
                        type="button"
                        onClick={acceptAll}
                        className="h-9 cursor-pointer rounded-full bg-[#f4f5f7] px-4 text-xs font-medium text-[#0c0d10] transition-colors hover:bg-white"
                    >
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
}
