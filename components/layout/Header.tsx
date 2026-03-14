import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, LogOut } from 'lucide-react';
import { getSession } from '@/lib/auth/jwt';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import RegionSwitcher from '@/components/ui/RegionSwitcher';
import { getTranslations } from '@/lib/i18n/server';

export default async function Header({ lang = 'en', region = 'in' }: { lang?: string, region?: string }) {
    const session = await getSession();
    const t = getTranslations(lang);
    const locale = `${lang}-${region}`;

    return (
        <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/[0.05]">
            <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <Link href={`/${locale}`} className="flex items-center">
                        <Image src="/logo/resumeforge-logo.svg" width={200} height={50} className="w-40 md:w-[200px] h-auto object-contain" alt="ResumeForgeAI" priority />
                    </Link>
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
                    <a href={`/${locale}/#how-it-works`} className="hover:text-white transition-colors">{t('how_it_works')}</a>
                    <a href={`/${locale}/#features`} className="hover:text-white transition-colors">{t('features')}</a>
                    <a href={`/${locale}/#pricing`} className="hover:text-white transition-colors">{t('pricing')}</a>
                </div>
                <div className="flex items-center gap-4">
                    <RegionSwitcher />
                    <LanguageSwitcher />

                    {session ? (
                        <>
                            {session.role === 'admin' && (
                                <Link href={`/${locale}/admin`} className="text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    Admin
                                </Link>
                            )}
                            <Link href={`/${locale}/dashboard`} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                                {t('dashboard')}
                            </Link>
                            <form action="/api/auth/signout" method="post">
                                <button className="text-sm font-bold bg-white/5 border border-white/10 text-white px-5 py-2 rounded-lg hover:bg-white/10 transition-all active:scale-95 flex items-center gap-2">
                                    <LogOut className="w-4 h-4" />
                                    {t('logout')}
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <Link href={`/${locale}/login`} className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:block">
                                {t('login')}
                            </Link>
                            <Link href={`/${locale}/signup`} className="btn-primary px-6 py-2 rounded-lg">
                                {t('signup')}
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
