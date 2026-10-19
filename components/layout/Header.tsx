import Link from 'next/link';
import { LogOut, Wand2 } from '@/components/icons';
import { getSession } from '@/lib/auth/jwt';
import { getTranslations } from '@/lib/i18n/server';

export default async function Header({ lang = 'en', region = 'in' }: { lang?: string, region?: string }) {
    const session = await getSession();
    const t = getTranslations(lang);
    const locale = `${lang}-${region}`;

    return (
        <nav className="fixed top-0 z-50 w-full border-b border-[#2a2c33] bg-[#0c0d10]">
            <div className="flex h-16 items-center justify-between px-6 max-w-7xl mx-auto select-none">
                {/* Logo (matching the new landing page RF logo) */}
                <div className="flex items-center gap-2">
                    <Link href={`/${locale}`} className="flex items-center gap-2.5 select-none">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#2e3138]">
                            <span
                                className="text-[#f4f5f7]"
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
                            className="text-sm font-semibold tracking-tight text-[#f4f5f7]"
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
                        className="font-mono text-[13px] font-semibold uppercase tracking-wider text-[#8b909a] transition-colors duration-200 hover:text-[#f4f5f7]"
                    >
                        {t('how_it_works')}
                    </a>
                    <a 
                        href={`/${locale}#features`} 
                        className="font-mono text-[13px] font-semibold uppercase tracking-wider text-[#8b909a] transition-colors duration-200 hover:text-[#f4f5f7]"
                    >
                        {t('features')}
                    </a>
                    <a 
                        href={`/${locale}/pricing`} 
                        className="font-mono text-[13px] font-semibold uppercase tracking-wider text-[#8b909a] transition-colors duration-200 hover:text-[#f4f5f7]"
                    >
                        {t('pricing')}
                    </a>
                    <Link 
                        href={`/${locale}/blogs`} 
                        className="font-mono text-[13px] font-semibold uppercase tracking-wider text-[#8b909a] transition-colors duration-200 hover:text-[#f4f5f7]"
                    >
                        Blogs
                    </Link>
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
                                className="font-mono text-xs font-semibold uppercase tracking-wider text-[#b4b8c2] transition-colors hover:text-[#f4f5f7]"
                            >
                                {t('dashboard')}
                            </Link>
                            <form action="/api/auth/signout" method="post">
                                <button className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-[#3a3d46] px-3.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-[#f4f5f7] transition-colors hover:bg-[#16171b]">
                                    <LogOut className="w-3.5 h-3.5" />
                                    {t('logout')}
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <Link 
                                href={`/${locale}/login`} 
                                className="inline-flex h-9 items-center justify-center rounded-full border border-[#3a3d46] px-3.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-[#f4f5f7] transition-colors hover:bg-[#16171b]"
                            >
                                {t('login')}
                            </Link>
                            <Link 
                                href={`/${locale}/signup`} 
                                className="inline-flex h-9 items-center justify-center rounded-full bg-[#f4f5f7] px-5 font-mono text-[11px] font-semibold uppercase tracking-wider text-[#0c0d10] transition-colors hover:bg-white"
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
