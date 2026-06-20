'use client'
export const dynamic = 'force-dynamic';
;
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { UserPlus, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { OAuthButtons } from '@/components/auth/oauth-buttons';

export default function SignupPage() {
    const params = useParams() as { locale: string };
    const { locale } = params;
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(searchParams?.get('error') || null);
    const [message, setMessage] = useState<string | null>(searchParams?.get('message') || null);
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
        <div className="w-full">
            <div className="text-left mb-8">
                <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-1.5px] leading-[1.05] text-white">
                    Create Account
                </h1>
                <p className="text-sm md:text-base text-slate-400 mt-3 max-w-[420px]">
                    Start building your production-ready resume.
                </p>
            </div>

            {error && (
                <div className="mb-4 p-4 rounded-[6px] bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="font-medium text-red-500">{error}</p>
                </div>
            )}

            {message && (
                <div className="mb-4 p-4 rounded-[6px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="font-medium text-emerald-500">{message}</p>
                </div>
            )}

            <div className="space-y-6">
                <OAuthButtons />

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#222]" /></div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="px-3 bg-[#070710] text-[#8f8f8f] font-mono tracking-wider">Or continue with email</span>
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
                            className="w-full h-11 px-3.5 bg-[#0a0a0c] border border-[#222] focus:border-[#444] rounded-[6px] focus:outline-none transition-all text-white placeholder-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-300">Mobile Phone Number <span className="text-purple-500">*</span></label>
                        <input
                            type="tel"
                            name="phone_number"
                            placeholder="+91 98765 43210"
                            required
                            disabled={isLoading}
                            className="w-full h-11 px-3.5 bg-[#0a0a0c] border border-[#222] focus:border-[#444] rounded-[6px] focus:outline-none transition-all text-white placeholder-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        />
                        <p className="text-[10px] text-slate-500 px-1 font-medium italic">We need this for account verification and updates.</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-300">Secure Password <span className="text-purple-500">*</span></label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            required
                            minLength={6}
                            disabled={isLoading}
                            className="w-full h-11 px-3.5 bg-[#0a0a0c] border border-[#222] focus:border-[#444] rounded-[6px] focus:outline-none transition-all text-white placeholder-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        />
                    </div>

                    <label className="flex items-start gap-3 p-3.5 rounded-[6px] bg-[#0a0a0c] border border-[#222] hover:border-[#333] cursor-pointer select-none mt-4 transition-all">
                        <input
                            type="checkbox"
                            required
                            checked={tcChecked}
                            onChange={e => setTcChecked(e.target.checked)}
                            disabled={isLoading}
                            className="mt-1 w-4 h-4 accent-purple-500 bg-[#0a0a0c] border-[#222] rounded-[4px] cursor-pointer disabled:opacity-50"
                        />
                        <span className="text-xs text-slate-400 leading-normal">
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
                        className="w-full h-11 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-[6px] transition-all shadow-md shadow-purple-600/10 active:scale-[0.99] flex items-center justify-center gap-2 text-sm"
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
                    <Link href={`/${locale}/login`} className="text-purple-400 hover:text-purple-300 font-semibold transition-colors underline underline-offset-4 decoration-purple-500/30 hover:decoration-purple-400">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
