'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Download, X } from '@/components/icons';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISS_KEY = 'pwa-banner-dismissed';

export default function InstallBanner() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [cookieOpen, setCookieOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        try {
            setCookieOpen(!localStorage.getItem('cookie_consent'));
            if (localStorage.getItem(DISMISS_KEY)) return;
        } catch { /* private browsing */ }

        if (window.matchMedia('(display-mode: standalone)').matches) return;

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const dismiss = useCallback(() => {
        setIsVisible(false);
        setDeferredPrompt(null);
        try { localStorage.setItem(DISMISS_KEY, '1'); } catch { /* ignore */ }
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            try {
                await fetch('/api/pwa/install', { method: 'POST' });
            } catch (err) {
                console.error('Failed to track install', err);
            }
        }

        dismiss();
    };

    if (!isVisible) return null;
    if (
        pathname?.includes('/login') ||
        pathname?.includes('/signup') ||
        pathname?.includes('/forgot-password') ||
        pathname?.includes('/reset-password')
    ) {
        return null;
    }

    return (
        <div className={`fixed right-4 z-[60] w-[calc(100%-2rem)] max-w-sm md:bottom-4 md:right-8 ${cookieOpen ? 'bottom-44' : 'bottom-4'}`}>
            <div className="relative rounded-2xl border border-[#2a2c33] bg-[#0c0d10] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
                <button
                    type="button"
                    onClick={dismiss}
                    aria-label="Dismiss install prompt"
                    className="absolute right-3 top-3 cursor-pointer p-1 text-[#8b909a] transition-colors hover:text-[#f4f5f7]"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="flex items-start gap-3 pr-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#2a2c33] bg-[#16171b]">
                        <Download className="h-4 w-4 text-[#d7e4f0]" />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-[#f4f5f7]">Install ResumeForge</h4>
                        <p className="mt-1 text-xs leading-relaxed text-[#b4b8c2]">
                            Add it to your home screen for a faster app.
                        </p>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={dismiss}
                        className="h-9 cursor-pointer rounded-full border border-[#3a3d46] px-4 text-xs font-medium text-[#f4f5f7] transition-colors hover:bg-[#16171b]"
                    >
                        Later
                    </button>
                    <button
                        type="button"
                        onClick={handleInstall}
                        className="h-9 cursor-pointer rounded-full bg-[#f4f5f7] px-4 text-xs font-medium text-[#0c0d10] transition-colors hover:bg-white"
                    >
                        Install
                    </button>
                </div>
            </div>
        </div>
    );
}
