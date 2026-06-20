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
        <div className="w-full flex flex-col gap-5">
            <div className="text-left">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent tracking-tight mb-1">
                    Create Account
                </h1>
                <p className="text-gray-400 text-sm mt-1 mb-8">
                    Start building your production-ready resume.
                </p>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="font-medium text-red-500">{error}</p>
                </div>
            )}

            {message && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="font-medium text-emerald-500">{message}</p>
                </div>
            )}

            <div className="flex flex-col gap-4">
                <OAuthButtons />

                <div className="flex items-center gap-3 my-3">
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-purple-500/30" />
                    <span className="text-purple-400/60 tracking-[0.2em] text-[10px] uppercase font-semibold flex-shrink-0">
                        OR CONTINUE WITH EMAIL
                    </span>
                    <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-purple-500/30" />
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col">
                        <label className="text-purple-300/70 text-[10px] tracking-[0.15em] uppercase font-medium mb-1.5">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            required
                            disabled={isLoading}
                            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-600 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/60 focus:outline-none transition-all duration-200"
                        />
                    </div>
                    
                    <div className="flex flex-col">
                        <label className="text-purple-300/70 text-[10px] tracking-[0.15em] uppercase font-medium mb-1.5">Mobile Phone Number <span className="text-purple-500">*</span></label>
                        <input
                            type="tel"
                            name="phone_number"
                            placeholder="+91 98765 43210"
                            required
                            disabled={isLoading}
                            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-600 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/60 focus:outline-none transition-all duration-200"
                        />
                        <p className="text-purple-400/50 text-xs mt-1 italic font-medium">We need this for account verification and updates.</p>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-purple-300/70 text-[10px] tracking-[0.15em] uppercase font-medium mb-1.5">Secure Password <span className="text-purple-500">*</span></label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            required
                            minLength={6}
                            disabled={isLoading}
                            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-600 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/60 focus:outline-none transition-all duration-200"
                        />
                    </div>

                    <div className="flex items-start gap-2 text-gray-400 text-xs mt-1">
                        <input
                            type="checkbox"
                            id="tc-checkbox"
                            required
                            checked={tcChecked}
                            onChange={e => setTcChecked(e.target.checked)}
                            disabled={isLoading}
                            className="mt-0.5 w-4 h-4 accent-purple-500 rounded border-white/10 bg-white/5 cursor-pointer"
                        />
                        <label htmlFor="tc-checkbox" className="cursor-pointer select-none leading-normal">
                            I agree to the{' '}
                            <Link href={`/${locale}/terms-of-service`} target="_blank" className="text-purple-400 hover:text-purple-300 underline underline-offset-4 decoration-purple-500/30">
                                Terms & Conditions
                            </Link>
                            {' '}and{' '}
                            <Link href={`/${locale}/privacy-policy`} target="_blank" className="text-purple-400 hover:text-purple-300 underline underline-offset-4 decoration-purple-500/30">
                                Privacy Policy
                            </Link>.
                            My IP and acceptance time will be recorded.
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={!tcChecked || isLoading}
                        className="w-full h-12 mt-4 rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 hover:from-purple-500 hover:to-violet-400 shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold hover:scale-[1.01] transition-all duration-200 flex items-center justify-center gap-2"
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

                <p className="text-center text-sm text-gray-500 mt-2">
                    Already have an account?{' '}
                    <Link href={`/${locale}/login`} className="text-purple-400 hover:text-purple-300 font-semibold transition-colors underline underline-offset-4 decoration-purple-500/30 hover:decoration-purple-400">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
