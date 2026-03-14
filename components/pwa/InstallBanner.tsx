'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>;
}

export default function InstallBanner() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsVisible(false);
        }

        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
            // Track install in DB
            try {
                await fetch('/api/pwa/install', { method: 'POST' });
            } catch (err) {
                console.error('Failed to track install', err);
            }
        }
        
        setIsVisible(false);
        setDeferredPrompt(null);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-96 z-[100] animate-in slide-in-from-bottom-8 duration-500">
            <div className="p-6 rounded-3xl bg-[#0a0a16] border border-indigo-500/30 shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
                {/* Background Pattern */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
                
                <button 
                    onClick={() => setIsVisible(false)}
                    className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-all"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex gap-4 items-start relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/40">
                        <Download className="w-6 h-6 text-white" />
                    </div>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <h4 className="text-lg font-black text-white uppercase tracking-tight">Level Up Your Access</h4>
                            <p className="text-slate-400 text-xs font-medium leading-relaxed">
                                Install <span className="text-indigo-400">ResumeForgeAI</span> for a faster, seamless mobile experience.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={handleInstall}
                                className="px-5 py-2 rounded-xl bg-white text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95 shadow-md"
                            >
                                Install Now
                            </button>
                            <button 
                                onClick={() => setIsVisible(false)}
                                className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all"
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
