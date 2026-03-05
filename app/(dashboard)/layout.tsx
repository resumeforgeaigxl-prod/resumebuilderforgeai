import { Sidebar, MobileNav } from '@/components/dashboard/Sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col pt-20">
            <Sidebar />
            <main className="flex-1 md:ml-20 lg:ml-64 transition-all duration-300 relative">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8 w-full max-w-7xl">
                    {children}
                </div>
            </main>
            <MobileNav />
        </div>
    )
}
