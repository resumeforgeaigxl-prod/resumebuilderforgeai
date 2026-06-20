'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const params = useParams() as { locale: string };
    const locale = params.locale || 'en-in';
    const pathname = usePathname();
    const isSignup = pathname?.includes('/signup');

    return (
        <div className="min-h-screen bg-[#070710] text-white flex flex-col font-sans">
            {/* 1440px Centered Container */}
            <div className="max-w-[1440px] mx-auto w-full flex-1 flex flex-col relative">
                
                {/* Top Navigation - 80px Height */}
                <header className="h-20 w-full flex items-center justify-between px-[56px] border-b border-white/5 relative z-10 shrink-0">
                    {/* Logo */}
                    <Link href={`/${locale}`} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-[6px] bg-purple-600 flex items-center justify-center font-bold text-white text-base">
                            RF
                        </div>
                        <span className="font-semibold text-lg tracking-tight text-white">
                            ResumeForge<span className="text-purple-500 font-bold">AI</span>
                        </span>
                    </Link>

                    {/* Top Right Navigation Links */}
                    <div className="flex items-center gap-6">
                        <span className="text-sm text-slate-400 hidden sm:inline">
                            {isSignup ? "Already have an account?" : "Don't have an account?"}
                        </span>
                        <Link 
                            href={isSignup ? `/${locale}/login` : `/${locale}/signup`}
                            className="text-sm font-medium px-4 py-2 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 rounded-[10px] transition-all"
                        >
                            {isSignup ? "Sign In" : "Sign Up"}
                        </Link>
                    </div>
                </header>

                {/* Content Section - Remaining Height */}
                <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-80px)] overflow-hidden">
                    
                    {/* Left Panel: Form Container (Fixed Width 520px on Desktop) */}
                    <div className="w-full md:w-[520px] shrink-0 flex flex-col justify-center px-[56px] py-10 overflow-y-auto relative z-10">
                        <div className="w-full max-w-[560px] mx-auto flex flex-col justify-center flex-1">
                            {children}
                        </div>
                    </div>

                    {/* Right Panel: Flexible illustration covers remaining space */}
                    <div className="flex-1 h-full relative overflow-hidden bg-black flex items-center justify-center">
                        <img
                            src="/images/auth-side.png"
                            alt="ResumeForgeAI Cinematic Auth Visual"
                            className="w-full h-full object-cover object-center aspect-[16/10]"
                        />
                    </div>
                    
                </div>
            </div>
        </div>
    );
}
