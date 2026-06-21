'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>;
}

const DISMISS_KEY = 'pwa-banner-dismissed';

export default function InstallBanner() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // If already dismissed or already installed, never show
        try {
            if (localStorage.getItem(DISMISS_KEY)) return;
        } catch { /* SSR / private browsing */ }

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
            console.log('User accepted the install prompt');
            try {
                await fetch('/api/pwa/install', { method: 'POST' });
            } catch (err) {
                console.error('Failed to track install', err);
            }
        }
        
        dismiss();
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-96 z-[100] animate-in slide-in-from-bottom-8 duration-500">
            <div className="p-6 rounded-[12px] bg-white border border-[#EBEBEB] shadow-[0_2px_2px_rgba(0,0,0,0.04),0_8px_16px_-4px_rgba(0,0,0,0.06)] relative overflow-hidden group">
                <button 
                    onClick={dismiss}
                    className="absolute top-4 right-4 p-1 rounded-[4px] hover:bg-[#FAFAFA] text-[#8F8F8F] hover:text-[#171717] transition-all cursor-pointer"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex gap-4 items-start relative z-10">
                    <div className="w-10 h-10 rounded-[6px] bg-[#F2F2F2] border border-[#EBEBEB] flex items-center justify-center shrink-0 shadow-sm">
                        <Download className="w-5 h-5 text-[#171717]" />
                    </div>
                    <div className="space-y-3 flex-1">
                        <div className="space-y-1">
                            <h4 className="text-sm font-semibold tracking-[-0.28px] text-[#171717]">Level Up Your Access</h4>
                            <p className="text-[#4D4D4D] text-xs leading-relaxed">
                                Install <span className="font-semibold text-[#171717]">ResumeForgeAI</span> for a faster, seamless mobile experience.
                            </p>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <button 
                                onClick={handleInstall}
                                className="px-4 py-2 rounded-[6px] bg-[#171717] hover:bg-[#333333] text-white text-xs font-medium transition-all active:scale-95 shadow-sm cursor-pointer"
                            >
                                Install Now
                            </button>
                            <button 
                                onClick={dismiss}
                                className="px-4 py-2 rounded-[6px] bg-white border border-[#EBEBEB] text-[#4D4D4D] hover:text-[#171717] hover:bg-[#FAFAFA] text-xs font-medium transition-all cursor-pointer"
                            >
                                Later
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

