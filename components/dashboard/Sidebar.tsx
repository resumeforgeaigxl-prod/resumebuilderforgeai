'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    FileText,
    Briefcase,
    Wrench,
    User,
    ChevronLeft,
    ChevronRight,
    LogOut
} from 'lucide-react';
import { useState, useEffect } from 'react';

const MENU_ITEMS = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Resumes', href: '/resumes', icon: FileText },
    { label: 'Job Board', href: '/jobs', icon: Briefcase },
    { label: 'AI Tools', href: '/tools', icon: Wrench },
    { label: 'Account', href: '/account', icon: User },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Collapse on mobile by default or handle with a drawer
    }, []);

    if (!mounted) return null;

    return (
        <aside
            className={`fixed left-0 top-20 h-[calc(100vh-5rem)] bg-[#070710]/80 backdrop-blur-xl border-r border-white/5 transition-all duration-300 z-40
                ${isCollapsed ? 'w-20' : 'w-64'} hidden md:flex flex-col`}
        >
            <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group
                                ${isActive
                                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                            {!isCollapsed && <span className="font-bold text-sm tracking-tight">{item.label}</span>}
                            {!isCollapsed && isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                            )}
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t border-white/5 space-y-2">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-300 transition-colors"
                >
                    {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    {!isCollapsed && <span className="text-xs font-bold uppercase tracking-widest">Collapse View</span>}
                </button>

                <form action="/api/auth/signout" method="post">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-rose-500/70 hover:text-rose-400 transition-colors group">
                        <LogOut className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                        {!isCollapsed && <span className="text-sm font-bold">Sign Out</span>}
                    </button>
                </form>
            </div>
        </aside>
    );
}

// Mobile Bottom Nav
export function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#070710]/90 backdrop-blur-xl border-t border-white/5 flex md:hidden items-center justify-around px-2 z-50">
            {MENU_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-indigo-400' : 'text-slate-500'}`}
                    >
                        <item.icon className={`w-5 h-5 ${isActive ? 'scale-110 shadow-indigo-500/50' : ''}`} />
                        <span className="text-[10px] font-bold uppercase tracking-tighter Otros">{item.label.split(' ').pop()}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
