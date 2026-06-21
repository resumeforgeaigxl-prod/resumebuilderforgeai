"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LayoutDashboard, Home } from 'lucide-react';

export default function NotFound() {
    const [locale, setLocale] = useState('en-in');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const pathParts = window.location.pathname.split('/');
            // Check if first path segment matches standard pattern (e.g. en-in, hi-in, us-en)
            const possibleLocale = pathParts[1];
            if (possibleLocale && possibleLocale.includes('-')) {
                setLocale(possibleLocale);
            }
        }
    }, []);

    return (
        <div 
            className="flex flex-col items-center justify-center min-h-screen bg-[#FAFAFA] p-6 relative select-none"
            style={{
                backgroundImage: 'radial-gradient(#EBEBEB 1.5px, transparent 1.5px)',
                backgroundSize: '24px 24px',
            }}
        >
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.98) translateY(8px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}} />

            <div className="w-full max-w-md bg-white border border-[#EBEBEB] p-8 md:p-10 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02),0_16px_32px_-8px_rgba(0,0,0,0.05)] text-center relative z-10 animate-fade-in">
                {/* Premium Vercel-style Logo Mark */}
                <div className="flex justify-center mb-6">
                    <div className="w-12 h-12 bg-[#171717] rounded-full flex items-center justify-center font-semibold text-white text-sm tracking-tight border border-[#171717] shadow-sm select-none">
                        RF
                    </div>
                </div>

                {/* Metadata Header */}
                <div className="text-[10px] font-mono font-semibold text-[#8F8F8F] uppercase tracking-widest mb-2">
                    Error Code: 404
                </div>
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tighter text-[#171717] mb-3">
                    Page Not Found
                </h1>
                <p className="text-sm text-[#4D4D4D] leading-relaxed mb-8 max-w-xs mx-auto">
                    The requested page could not be located. It may have been moved, deleted, or the URL might be incorrect.
                </p>

                {/* Action Panel */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href={`/${locale}/dashboard`}
                        className="w-full sm:w-auto px-5 py-2.5 bg-[#171717] hover:bg-[#262626] text-white rounded-lg text-sm font-medium transition-all shadow-sm active:scale-[0.98] text-center flex items-center justify-center gap-2"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        Go to Dashboard
                    </Link>
                    <Link
                        href={`/${locale}`}
                        className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-[#FAFAFA] border border-[#EBEBEB] text-[#171717] rounded-lg text-sm font-medium transition-all active:scale-[0.98] text-center flex items-center justify-center gap-2"
                    >
                        <Home className="w-4 h-4 text-[#8F8F8F]" />
                        Return Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
