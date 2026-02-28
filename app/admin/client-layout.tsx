'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Users, FileText, ScrollText, LayoutDashboard, Ticket, Menu, X, Globe, BrainCircuit, Activity } from 'lucide-react';

export default function AdminLayoutClient({ children, profile }: { children: ReactNode, profile: { email: string } }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
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
        <div className="min-h-screen bg-[#050508] text-slate-200 font-sans selection:bg-indigo-500/30">
            {/* Mobile Sidebar Overlay */}
            <div
                className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] md:hidden transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={() => setIsSidebarOpen(false)}
            />

            {/* Top Navigation */}
            <header className="fixed top-0 right-0 z-50 flex items-center justify-between h-16 px-4 bg-[#050508]/80 backdrop-blur-md border-b border-white/5 transition-all duration-300 ease-in-out"
                style={{
                    left: '0px',
                    paddingLeft: typeof window !== 'undefined' && window.innerWidth >= 768
                        ? (isCollapsed ? '80px' : '256px')
                        : '0px'
                }}>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            if (window.innerWidth < 768) {
                                setIsSidebarOpen(true);
                            } else {
                                setIsCollapsed(!isCollapsed);
                            }
                        }}
                        className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="hidden md:flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-400">Admin</span>
                        <span className="text-slate-700">/</span>
                        <span className="text-sm font-semibold text-white capitalize">
                            {pathname.split('/').pop() || 'Dashboard'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex flex-col items-end mr-2">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest leading-tight">Admin</p>
                        <p className="text-xs text-slate-300 font-medium max-w-[150px] truncate">{profile.email}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white/10">
                        {profile.email.charAt(0).toUpperCase()}
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside
                    className={`
                        fixed inset-y-0 left-0 z-[70] 
                        bg-[#0a0a0f] border-r border-white/5 
                        flex flex-col transition-all duration-300 ease-in-out
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                        ${isCollapsed ? 'w-20' : 'w-64'}
                    `}
                >
                    {/* Sidebar Header */}
                    <div className={`h-16 flex items-center px-6 border-b border-white/5 overflow-hidden whitespace-nowrap`}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <span className={`font-bold text-white tracking-tight text-lg transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                                ResumeForge
                            </span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
                        {!isCollapsed && (
                            <p className="px-4 py-2 text-[10px] text-slate-500 uppercase font-bold tracking-widest">General</p>
                        )}
                        {navItems.map(item => {
                            const isActive = item.href === '/admin' ? pathname === item.href : pathname?.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsSidebarOpen(false)}
                                    title={isCollapsed ? item.label : ''}
                                    className={`
                                        flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 group
                                        ${isActive
                                            ? 'bg-indigo-600/10 text-white font-semibold border border-indigo-500/20'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}
                                    `}
                                >
                                    <item.icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                                    <span className={`transition-all duration-300 opacity-100 ${isCollapsed ? 'md:opacity-0 md:w-0' : 'w-auto'}`}>
                                        {item.label}
                                    </span>
                                    {isActive && !isCollapsed && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="p-4 border-t border-white/5">
                        <Link
                            href="/dashboard"
                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-red-500/5 transition-all group overflow-hidden`}
                        >
                            <X className="w-5 h-5 shrink-0 group-hover:rotate-90 transition-transform text-slate-500 group-hover:text-red-400" />
                            <span className={`transition-all duration-300 ${isCollapsed ? 'md:opacity-0 md:w-0' : 'w-auto'}`}>
                                Exit Admin
                            </span>
                        </Link>
                    </div>
                </aside>

                {/* Main Content */}
                <main
                    className={`flex-1 min-h-screen transition-all duration-300 ease-in-out mt-16`}
                    style={{
                        marginLeft: typeof window !== 'undefined' && window.innerWidth >= 768
                            ? (isCollapsed ? '80px' : '256px')
                            : '0px'
                    }}
                >
                    <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {children}
                        </div>
                    </div>
                </main>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
}
