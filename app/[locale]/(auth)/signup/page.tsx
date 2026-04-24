'use client'
export const dynamic = 'force-dynamic';
;
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { UserPlus, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { OAuthButtons } from '@/components/auth/oauth-buttons';

export default function SignupPage({ searchParams }: { searchParams: { error?: string; message?: string } }) {
    const params = useParams() as { locale: string };
    const { locale } = params;
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(searchParams.error || null);
    const [message, setMessage] = useState(searchParams.message || null);
    const [tcChecked, setTcChecked] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setMessage(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email');
        const password = formData.get('password');
        const phone_number = formData.get('phone_number');

        try {
            const res = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    phone_number,
                    tc_accepted: tcChecked,
                }),
            });

            // Handle errors before parsing JSON to avoid "Unexpected end of JSON input"
            if (!res.ok) {
                let errorMessage = 'Signup failed';
                try {
                    const errorData = await res.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    console.error('Error parsing error response:', e);
                }
                throw new Error(errorMessage);
            }

            const data = await res.json();

            // Successfully created account
            setMessage(data.message || 'Account created! Please log in.');

            // Short delay before redirecting to login
            setTimeout(() => {
                router.push(`/${locale}/login?message=${encodeURIComponent(data.message || 'Account created! Please log in.')}`);
            }, 2000);
        } catch (err: unknown) {
            setError((err as Error).message || 'Signup failed');
            setIsLoading(false);
        }
    }

    return (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 mb-4 ring-1 ring-purple-500/20">
                    <UserPlus className="w-6 h-6" />
                </div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    Create Account
                </h1>
                <p className="text-slate-400 mt-2">Start building your production-ready resume</p>
            </div>

            {error && (
                <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="font-medium text-red-500">{error}</p>
                </div>
            )}

            {message && (
                <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="font-medium text-emerald-500">{message}</p>
                </div>
            )}

            <div className="space-y-6">
                <OAuthButtons />

                <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-slate-900/50 text-slate-500">Or continue with email</span>
                    </div>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            required
                            disabled={isLoading}
                            className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-white placeholder-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-300">Mobile Phone Number <span className="text-purple-500">*</span></label>
                        <input
                            type="tel"
                            name="phone_number"
                            placeholder="+91 98765 43210"
                            required
                            disabled={isLoading}
                            className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-white placeholder-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <p className="text-[10px] text-slate-500 px-1 font-medium italic">We need this for account verification and updates.</p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-300">Secure Password <span className="text-purple-500">*</span></label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            required
                            minLength={6}
                            disabled={isLoading}
                            className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-white placeholder-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>

                    <label className="flex items-start gap-3 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 cursor-pointer select-none mt-4">
                        <input
                            type="checkbox"
                            required
                            checked={tcChecked}
                            onChange={e => setTcChecked(e.target.checked)}
                            disabled={isLoading}
                            className="mt-1 w-4 h-4 accent-purple-500 bg-slate-950 border-slate-800 rounded cursor-pointer disabled:opacity-50"
                        />
                        <span className="text-sm text-slate-400 leading-tight">
                            I agree to the{' '}
                            <Link href={`/${locale}/terms-of-service`} target="_blank" className="text-purple-400 hover:text-purple-300 underline underline-offset-4">
                                Terms & Conditions
                            </Link>
                            {' '}and{' '}
                            <Link href={`/${locale}/privacy-policy`} target="_blank" className="text-purple-400 hover:text-purple-300 underline underline-offset-4">
                                Privacy Policy
                            </Link>.
                            My IP and acceptance time will be recorded.
                        </span>
                    </label>

                    <button
                        type="submit"
                        disabled={!tcChecked || isLoading}
                        className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Creating Account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-400">
                    Already have an account?{' '}
                    <Link href={`/${locale}/login`} className="text-purple-400 hover:text-purple-300 font-medium transition-colors">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
