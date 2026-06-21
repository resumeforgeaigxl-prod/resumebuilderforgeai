import Link from 'next/link';
import { LogOut, Wand2 } from 'lucide-react';
import { getSession } from '@/lib/auth/jwt';
import { getTranslations } from '@/lib/i18n/server';

export default async function Header({ lang = 'en', region = 'in' }: { lang?: string, region?: string }) {
    const session = await getSession();
    const t = getTranslations(lang);
    const locale = `${lang}-${region}`;

    return (
        <nav className="fixed top-0 w-full z-50 bg-[#fafaf9]/90 backdrop-blur-md border-b border-[#e7e5e4]">
            <div className="flex h-16 items-center justify-between px-6 max-w-7xl mx-auto select-none">
                {/* Logo (matching the new landing page RF logo) */}
                <div className="flex items-center gap-2">
                    <Link href={`/${locale}`} className="flex items-center gap-2.5 select-none">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#171717]">
                            <span
                                className="text-white"
                                style={{
                                    fontFamily: "var(--font-geist-sans)",
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    lineHeight: 1,
                                    letterSpacing: "-0.02em",
                                }}
                            >
                                RF
                            </span>
                        </div>
                        <span
                            className="text-[#171717] font-semibold text-sm tracking-tight"
                            style={{
                                fontFamily: "var(--font-geist-sans)",
                            }}
                        >
                            ResumeForge AI
                        </span>
                    </Link>
                </div>

                {/* Center links (matching new landing page styles) */}
                <div className="hidden md:flex items-center gap-8">
                    <a 
                        href={`/${locale}#how-it-works`} 
                        className="text-[#4D4D4D] transition-colors duration-200 hover:text-[#171717] font-mono text-[13px] uppercase font-semibold tracking-wider"
                    >
                        {t('how_it_works')}
                    </a>
                    <a 
                        href={`/${locale}#features`} 
                        className="text-[#4D4D4D] transition-colors duration-200 hover:text-[#171717] font-mono text-[13px] uppercase font-semibold tracking-wider"
                    >
                        {t('features')}
                    </a>
                    <a 
                        href={`/${locale}/pricing`} 
                        className="text-[#4D4D4D] transition-colors duration-200 hover:text-[#171717] font-mono text-[13px] uppercase font-semibold tracking-wider"
                    >
                        {t('pricing')}
                    </a>
                </div>

                {/* Right side actions */}
                <div className="flex items-center gap-4">

                    {session ? (
                        <>
                            {session.role === 'admin' && (
                                <Link 
                                    href={`/${locale}/admin`} 
                                    className="text-xs font-semibold font-mono text-amber-600 hover:text-amber-700 transition-colors uppercase tracking-wider flex items-center gap-1"
                                >
                                    <Wand2 className="w-3.5 h-3.5" />
                                    Admin
                                </Link>
                            )}
                            <Link 
                                href={`/${locale}/dashboard`} 
                                className="text-xs font-semibold font-mono text-[#4D4D4D] hover:text-[#171717] transition-colors uppercase tracking-wider"
                            >
                                {t('dashboard')}
                            </Link>
                            <form action="/api/auth/signout" method="post">
                                <button className="inline-flex items-center justify-center rounded-xl border border-[#EBEBEB] bg-white px-3.5 h-9 text-[#171717] transition-all duration-75 hover:bg-[#F2F2F2] active:scale-95 font-mono text-[11px] uppercase font-semibold tracking-wider gap-1.5 cursor-pointer">
                                    <LogOut className="w-3.5 h-3.5" />
                                    {t('logout')}
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <Link 
                                href={`/${locale}/login`} 
                                className="inline-flex items-center justify-center rounded-xl border border-[#EBEBEB] bg-white px-3.5 h-9 text-[#171717] transition-all duration-75 hover:bg-[#F2F2F2] active:scale-95 font-mono text-[11px] uppercase font-semibold tracking-wider"
                            >
                                {t('login')}
                            </Link>
                            <Link 
                                href={`/${locale}/signup`} 
                                className="inline-flex items-center justify-center rounded-xl bg-[#7c3aed] border border-[#6d28d9] px-5 h-9 text-white transition-all duration-75 hover:bg-[#6d28d9] active:scale-95 font-mono text-[11px] uppercase font-semibold tracking-wider"
                            >
                                {t('signup')}
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
