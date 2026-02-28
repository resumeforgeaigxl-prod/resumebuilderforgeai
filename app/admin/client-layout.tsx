'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Users, FileText, ScrollText, LayoutDashboard, Ticket, Menu, X, Globe, BrainCircuit, Activity } from 'lucide-react';

export default function AdminLayoutClient({ children, profile }: { children: ReactNode, profile: { email: string } }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const navItems = [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/users', label: 'Users', icon: Users },
        { href: '/admin/resumes', label: 'Resumes', icon: FileText },
        { href: '/admin/mock-tests', label: 'Mock Tests', icon: BrainCircuit },
        { href: '/admin/portfolios', label: 'Portfolios', icon: Globe },
        { href: '/admin/resume-scores', label: 'Resume Scores', icon: Activity },
        { href: '/admin/downloads', label: 'PDF Downloads', icon: FileText },
        { href: '/admin/coupons', label: 'Coupons', icon: Ticket },
        { href: '/admin/logs', label: 'Audit Logs', icon: ScrollText },
    ];

    return (
        <div className="min-h-screen bg-[#050508] text-slate-200 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-white/5 sticky top-0 z-30">
                <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-400" />
                    <span className="font-bold text-white">Admin Panel</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-400 hover:text-white transition-colors">
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Sidebar Overlay (Mobile) */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 md:w-60 shrink-0 bg-slate-900 border-r border-white/5 flex flex-col z-50 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="p-5 border-b border-white/5 hidden md:block">
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-red-400" />
                        <span className="font-bold text-white">Admin Panel</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 truncate">{profile.email}</p>
                </div>
                {/* Mobile email show */}
                <div className="p-5 border-b border-white/5 md:hidden bg-slate-800/50">
                    <p className="text-xs text-slate-400 truncate">Logged in as:</p>
                    <p className="text-sm text-slate-200 truncate font-medium">{profile.email}</p>
                </div>

                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {navItems.map(item => {
                        const isActive = item.href === '/admin' ? pathname === item.href : pathname?.startsWith(item.href);
                        return (
                            <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 md:py-2 rounded-xl text-sm transition-all ${isActive ? 'bg-white/10 text-white font-medium border-l-2 border-indigo-500' : 'font-medium md:font-normal text-slate-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'}`}>
                                <item.icon className={`w-5 h-5 md:w-4 md:h-4 ${isActive ? 'text-indigo-400' : ''}`} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-3 border-t border-white/5">
                    <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:text-slate-300 transition-all">
                        ← Back to App
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 min-h-screen">
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
