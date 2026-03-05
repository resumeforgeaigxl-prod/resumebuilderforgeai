'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { X, Globe } from 'lucide-react';

interface GeoData {
    suggestedRegion: string | null;
    regionLabel: string | null;
}

function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, maxAge: number) {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
}

export default function GeoSuggestionBanner() {
    const [geo, setGeo] = useState<GeoData | null>(null);
    const [visible, setVisible] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        // Only show on the homepage
        if (pathname !== '/') return;

        // If user already chose a region or dismissed, skip
        const regionCookie = getCookie('region');
        if (regionCookie) return;

        // Try using the server-set suggestion cookie first (fastest)
        const serverSuggested = getCookie('geo_suggested_region');
        const countryCode = getCookie('geo_country');

        if (serverSuggested) {
            const labels: Record<string, string> = {
                in: 'India 🇮🇳',
                us: 'United States 🇺🇸',
                eu: 'Europe 🇪🇺',
            };
            setGeo({ suggestedRegion: serverSuggested, regionLabel: labels[serverSuggested] ?? null });
            setVisible(true);
            return;
        }

        // Fallback: call the geo detection API
        if (countryCode === undefined) {
            fetch('/api/geo/detect')
                .then((r) => r.json())
                .then((data: GeoData) => {
                    if (data.suggestedRegion) {
                        setGeo(data);
                        setVisible(true);
                    }
                })
                .catch(() => {/* silently ignore */ });
        }
    }, [pathname]);

    const handleAccept = () => {
        if (!geo?.suggestedRegion) return;
        // Store region preference (90 days)
        setCookie('region', geo.suggestedRegion, 60 * 60 * 24 * 90);
        router.push(`/${geo.suggestedRegion}`);
    };

    const handleDismiss = () => {
        // Don't show again for 24 hours
        setCookie('region', 'dismissed', 60 * 60 * 24);
        setVisible(false);
    };

    if (!visible || !geo?.suggestedRegion || !geo.regionLabel) return null;

    return (
        <div
            role="banner"
            aria-label="Region suggestion"
            className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-indigo-900/95 to-blue-900/95 backdrop-blur-md border-b border-white/10 shadow-lg"
        >
            <div className="flex items-center gap-3 min-w-0">
                <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                <p className="text-sm text-slate-200 truncate">
                    Looks like you&apos;re in <strong className="text-white">{geo.regionLabel}</strong>.
                </p>
                <button
                    onClick={handleAccept}
                    className="shrink-0 text-xs font-semibold px-3 py-1 rounded-full bg-blue-500 hover:bg-blue-400 text-white transition-colors"
                >
                    View {geo.regionLabel.split(' ')[0]} version?
                </button>
            </div>
            <button
                onClick={handleDismiss}
                aria-label="Dismiss region suggestion"
                className="shrink-0 p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
