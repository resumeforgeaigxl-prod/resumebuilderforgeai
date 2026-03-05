'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/I18nProvider';
import { MapPin } from 'lucide-react';

const REGIONS = [
    { code: 'in', name: 'India' },
    { code: 'us', name: 'United States' },
    { code: 'eu', name: 'Europe' },
];

export default function RegionSwitcher() {
    const router = useRouter();
    const pathname = usePathname();
    const { locale, region } = useTranslation();

    const handleRegionChange = async (newRegion: string) => {
        const currentPrefix = `/${region}/${locale}`;
        const newPrefix = `/${newRegion}/${locale}`;
        let newPathname = pathname;

        if (pathname.startsWith(currentPrefix)) {
            newPathname = pathname.replace(currentPrefix, newPrefix);
        } else {
            const segments = pathname.split('/');
            // /region/lang/path -> segments = ['', region, lang, path]
            if (segments.length >= 3) {
                segments[1] = newRegion;
            }
            newPathname = segments.join('/');
        }

        router.push(newPathname);
    };

    return (
        <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm text-slate-300">
                <MapPin className="w-4 h-4" />
                <span className="uppercase">{region}</span>
            </button>

            <div className="absolute right-0 mt-2 w-40 py-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                {REGIONS.map((r) => (
                    <button
                        key={r.code}
                        onClick={() => handleRegionChange(r.code)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors ${region === r.code ? 'text-purple-400 font-bold' : 'text-slate-300'
                            }`}
                    >
                        {r.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
