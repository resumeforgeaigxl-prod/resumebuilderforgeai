import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { getSession } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';

export default async function NotFound() {
    const session = await getSession();

    // Try to preserve language/region
    const cookieStore = cookies();
    const region = cookieStore.get('preferred_region')?.value || 'in';
    const lang = cookieStore.get('preferred_lang')?.value || 'en';

    const dashboardLink = `/${region}/${lang}/dashboard`;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#070710] text-slate-100 p-4 selection:bg-indigo-500/30">
            <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-indigo-600/10 blur-[150px] -z-10" />
            <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-purple-600/10 blur-[150px] -z-10" />

            <div className="text-center max-w-md relative z-10 border border-white/5 bg-white/[0.02] p-10 rounded-3xl backdrop-blur-xl">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-white/10">
                        <ShieldAlert className="w-8 h-8 text-slate-400" />
                    </div>
                </div>
                <h1 className="text-4xl font-black mb-4 title-grad">Page Not Found</h1>
                <p className="text-slate-400 mb-8 font-medium">
                    The page you are looking for doesn’t exist or may have been moved.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {session ? (
                        <>
                            <Link href={dashboardLink} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-95 text-center">
                                Go to Dashboard
                            </Link>
                            <Link href="/" className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl font-bold transition-all active:scale-95 text-center">
                                Go to Home
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-95 text-center">
                                Go to Home
                            </Link>
                            <Link href={dashboardLink} className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl font-bold transition-all active:scale-95 text-center">
                                Go to Dashboard
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
