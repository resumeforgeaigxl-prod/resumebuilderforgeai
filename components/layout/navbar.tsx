import Link from 'next/link'
import { FileText, LogOut } from 'lucide-react'
import { getSession } from '@/lib/auth/jwt'

export default async function Navbar() {
    const session = await getSession()

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
                <Link href="/" className="flex items-center gap-2 group shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <FileText className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-white hidden sm:block">ResumeForge</span>
                </Link>

                <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-end">
                    {session ? (
                        <>
                            <Link href="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                                Dashboard
                            </Link>
                            <form action="/api/auth/signout" method="post">
                                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                                Log in
                            </Link>
                            <Link href="/signup" className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg shadow-blue-600/20">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}
