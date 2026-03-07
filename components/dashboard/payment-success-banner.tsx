'use client';

import { useSearchParams } from 'next/navigation';
import { CheckCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function PaymentSuccessBanner() {
    const searchParams = useSearchParams();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (searchParams?.get('payment') === 'success') {
            setVisible(true);
        }
    }, [searchParams]);

    if (!visible) return null;

    return (
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 mb-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                    <p className="font-semibold text-emerald-300 text-sm">Payment successful!</p>
                    <p className="text-emerald-400/70 text-xs">Your plan is now active. Enjoy your access!</p>
                </div>
            </div>
            <button
                onClick={() => setVisible(false)}
                className="text-slate-400 hover:text-white transition-colors shrink-0"
                aria-label="Dismiss"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
