import Link from 'next/link';
import { Sparkles, LogOut } from 'lucide-react';
import { getSession } from '@/lib/auth/jwt';

export default async function Header() {
    const session = await getSession();

    return (
        <nav className="fixed top-0 w-full z-50 bg-[#070710]/80 backdrop-blur-md border-b border-white/5">
            <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">ResumeForge<span className="text-purple-400">AI</span></span>
                    </Link>
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
                    <a href="/#how-it-works" className="hover:text-white transition-colors">How it works</a>
                    <a href="/#features" className="hover:text-white transition-colors">Features</a>
                    <a href="/#pricing" className="hover:text-white transition-colors">Pricing</a>
                </div>
                <div className="flex items-center gap-4">
                    {session ? (
                        <>
                            {session.role === 'admin' && (
                                <Link href="/admin" className="text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    Admin
                                </Link>
                            )}
                            <Link href="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                                Dashboard
                            </Link>
                            <form action="/api/auth/signout" method="post">
                                <button className="text-sm font-bold bg-white/10 text-white px-5 py-2.5 rounded-full hover:bg-white/20 transition-all active:scale-95 flex items-center gap-2">
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:block">
                                Sign In
                            </Link>
                            <Link href="/signup" className="text-sm font-bold bg-white text-black px-5 py-2.5 rounded-full hover:bg-slate-200 transition-all hover:scale-105 active:scale-95">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
