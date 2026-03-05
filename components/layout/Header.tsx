import Link from 'next/link';
import { Sparkles, LogOut } from 'lucide-react';
import { getSession } from '@/lib/auth/jwt';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import RegionSwitcher from '@/components/ui/RegionSwitcher';
import fs from 'fs';
import path from 'path';

export default async function Header({ lang = 'en', region = 'in' }: { lang?: string, region?: string }) {
    const session = await getSession();

    // Load translations on the server
    let t_data: Record<string, string> = {};
    try {
        const filePath = path.join(process.cwd(), 'public', 'locales', lang, 'common.json');
        const fileContent = fs.readFileSync(filePath, 'utf8');
        t_data = JSON.parse(fileContent);
    } catch (e) {
        console.error('Header: Failed to load translations', e);
    }

    const t = (key: string) => {
        if (t_data[key]) return t_data[key];
        // Dynamic fallback: remove underscores and title-case
        return key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    return (
        <nav className="fixed top-0 w-full z-50 bg-[#070710]/80 backdrop-blur-md border-b border-white/5">
            <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <Link href={`/${region}/${lang}`} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">ResumeForge<span className="text-purple-400">AI</span></span>
                    </Link>
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
                    <a href={`/${region}/${lang}/#how-it-works`} className="hover:text-white transition-colors">{t('how_it_works')}</a>
                    <a href={`/${region}/${lang}/#features`} className="hover:text-white transition-colors">{t('features')}</a>
                    <a href={`/${region}/${lang}/#pricing`} className="hover:text-white transition-colors">{t('pricing')}</a>
                </div>
                <div className="flex items-center gap-4">
                    <RegionSwitcher />
                    <LanguageSwitcher />

                    {session ? (
                        <>
                            {session.role === 'admin' && (
                                <Link href={`/${region}/${lang}/admin`} className="text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    Admin
                                </Link>
                            )}
                            <Link href={`/${region}/${lang}/dashboard`} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                                {t('dashboard')}
                            </Link>
                            <form action="/api/auth/signout" method="post">
                                <button className="text-sm font-bold bg-white/10 text-white px-5 py-2.5 rounded-full hover:bg-white/20 transition-all active:scale-95 flex items-center gap-2">
                                    <LogOut className="w-4 h-4" />
                                    {t('logout')}
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <Link href={`/${region}/${lang}/login`} className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:block">
                                {t('login')}
                            </Link>
                            <Link href={`/${region}/${lang}/signup`} className="text-sm font-bold bg-white text-black px-5 py-2.5 rounded-full hover:bg-slate-200 transition-all hover:scale-105 active:scale-95">
                                {t('signup')}
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
