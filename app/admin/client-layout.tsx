'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Users, FileText, ScrollText, LayoutDashboard, Ticket, Menu, X, Globe, BrainCircuit, Activity } from 'lucide-react';

export default function AdminLayoutClient({ children, profile }: { children: ReactNode, profile: { email: string } }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
        <div className="min-h-screen bg-[#050508] text-slate-200">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden transition-opacity duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Top Navigation - Mobile Only */}
            <header className="md:hidden flex items-center justify-between p-4 bg-slate-900/50 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-500" />
                    <span className="font-bold text-white tracking-tight">Admin</span>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-all active:scale-95"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </header>

            <div className="flex h-screen overflow-hidden">
                {/* Sidebar */}
                <aside className={`
                    fixed md:relative inset-y-0 left-0 z-[70] 
                    w-64 md:w-64 bg-slate-900 border-r border-white/5 
                    flex flex-col transform transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    ${isSidebarOpen ? 'flex' : 'hidden md:flex'}
                `}>
                    {/* Sidebar Header */}
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Shield className="w-6 h-6 text-indigo-500" />
                            <span className="font-bold text-white tracking-tight">Admin Panel</span>
                        </div>
                        <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 text-slate-500 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">User Session</p>
                        <p className="text-sm text-slate-300 truncate font-medium">{profile.email}</p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                        {navItems.map(item => {
                            const isActive = item.href === '/admin' ? pathname === item.href : pathname?.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200
                                        ${isActive
                                            ? 'bg-indigo-600/10 text-white font-semibold border border-indigo-500/20'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}
                                    `}
                                >
                                    <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="p-4 border-t border-white/5">
                        <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-xs text-slate-500 hover:text-slate-300 transition-all group">
                            <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                            Exit Admin Panel
                        </Link>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 overflow-y-auto bg-[#050508] relative">
                    <div className="max-w-7xl mx-auto min-h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
