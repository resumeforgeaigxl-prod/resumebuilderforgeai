'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { Globe } from 'lucide-react';

const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'ml', name: 'മലയാളം' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
];

export default function LanguageSwitcher() {
    const router = useRouter();
    const pathname = usePathname() ?? '/';
    const { locale, region } = useTranslation();

    const handleLanguageChange = async (newLocale: string) => {
        // Replace current locale in pathname with new one while preserving region
        const currentPrefix = `/${locale}-${region}`;
        const newPrefix = `/${newLocale}-${region}`;
        let newPathname = pathname;

        if (pathname.startsWith(currentPrefix)) {
            newPathname = pathname.replace(currentPrefix, newPrefix);
        } else {
            const segments = pathname.split('/');
            // /locale-region/path -> segments = ['', 'locale-region', 'path']
            if (segments.length >= 2 && segments[1].includes('-')) {
                segments[1] = `${newLocale}-${region}`;
            }
            newPathname = segments.join('/');
        }

        // 1. Set cookie for persistence (guest & fallback)
        document.cookie = `preferred_lang=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

        // 2. If logged in, sync with Supabase
        try {
            await fetch('/api/user/update-language', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ language: newLocale }),
            });
        } catch (err) {
            console.error('Failed to sync language preference:', err);
        }

        router.push(newPathname);
    };

    return (
        <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm text-slate-300">
                <Globe className="w-4 h-4" />
                <span className="uppercase">{locale}</span>
            </button>

            <div className="absolute right-0 mt-2 w-40 py-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                {LANGUAGES.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors ${locale === lang.code ? 'text-purple-400 font-bold' : 'text-slate-300'
                            }`}
                    >
                        {lang.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
