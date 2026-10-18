'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { authHeadingClass, authDescriptionClass, authLabelClass, authInputClass, authButtonClass } from '@/components/auth/styles';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle2 } from '@/components/icons';
import { OAuthButtons } from '@/components/auth/oauth-buttons';
import { resolvePostAuthDestination } from '@/lib/auth/intent';

export default function LoginPage() {
    const params = useParams() as { locale?: string };
    const locale = params?.locale || 'en-in';
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialError = searchParams?.get('error') ?? null;
    const initialMessage = searchParams?.get('message') ?? null;

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(initialError);
    const [message, setMessage] = useState<string | null>(initialMessage);
    const [isCheckingSession, setIsCheckingSession] = useState(true);

    const searchString = searchParams?.toString() ? `?${searchParams.toString()}` : '';

    // Check existing session and preserve intent redirect
    useEffect(() => {
        async function checkSession() {
            try {
                const res = await fetch('/api/user/profile');
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        const destination = resolvePostAuthDestination(
                            searchParams,
                            locale,
                            data.user?.profileCompleted
                        );
                        router.push(destination);
                        return;
                    }
                }
            } catch (err) {
                console.warn('[Login session check]', err);
            } finally {
                setIsCheckingSession(false);
            }
        }
        checkSession();
    }, [locale, router, searchParams]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setMessage(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Invalid email or password.');
            }

            // Resolve target destination preserving flow intent
            const destination = resolvePostAuthDestination(
                searchParams,
                locale,
                data.profileCompleted
            );

            router.push(destination);
            router.refresh();
        } catch (err: unknown) {
            setError((err as Error).message || 'Login failed. Please try again.');
            setIsLoading(false);
        }
    }

    if (isCheckingSession) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-[#7E7E7E]" />
            </div>
        );
    }

    return (
        <div className="w-full space-y-4">
            {/* Auth heading */}
            <div className="text-left">
                <h1 className={authHeadingClass}>
                    Sign in
                </h1>
                <p className={authDescriptionClass}>
                    Continue where you left off.
                </p>
            </div>

            {/* Error Banner */}
            {error && (
                <div
                    role="alert"
                    className="p-3.5 rounded-[10px] bg-red-950/20 border border-red-900/40 text-red-400 text-[13px] flex items-start gap-2.5"
                >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                    <p className="leading-relaxed">{error}</p>
                </div>
            )}

            {/* Success Message Banner */}
            {message && (
                <div
                    role="status"
                    className="p-3.5 rounded-[10px] bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 text-[13px] flex items-start gap-2.5"
                >
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                    <p className="leading-relaxed">{message}</p>
                </div>
            )}

            {/* Social Authentication */}
            <OAuthButtons />

            {/* Simple Divider */}
            <div className="relative" aria-hidden="true">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#242424]" />
                </div>
                <div className="relative flex justify-center text-[12px]">
                    <span className="bg-[#050505] px-3 text-[#7E7E7E]">
                        or continue with email
                    </span>
                </div>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label
                        htmlFor="signin-email"
                        className={authLabelClass + ' mb-2'}
                    >
                        Email
                    </label>
                    <input
                        id="signin-email"
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        required
                        disabled={isLoading}
                        autoComplete="email"
                        className={authInputClass}
                    />
                </div>

                <div>
                    <div className="mb-2 flex items-center justify-between gap-4">
                        <label
                            htmlFor="signin-password"
                            className={authLabelClass}
                        >
                            Password
                        </label>
                        <Link
                            href={`/${locale}/forgot-password`}
                            className="text-[12px] text-[#BDBDBD] hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BDBDBD]"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <input
                        id="signin-password"
                        type="password"
                        name="password"
                        placeholder="•••••••••"
                        required
                        disabled={isLoading}
                        autoComplete="current-password"
                        className={authInputClass}
                    />
                </div>

                {/* Primary Continue Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className={authButtonClass}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin text-[#0A0A0A]" />
                            <span>Signing in...</span>
                        </>
                    ) : (
                        'Continue'
                    )}
                </button>
            </form>

            {/* Terms and Privacy */}
            <p className="text-center text-[12px] text-[#7E7E7E] leading-relaxed pt-1">
                By continuing, you agree to{' '}
                <Link
                    href={`/${locale}/terms-of-service`}
                    target="_blank"
                    className="text-[#BDBDBD] hover:text-white underline underline-offset-4 decoration-[#242424] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BDBDBD]"
                >
                    Terms
                </Link>{' '}
                and{' '}
                <Link
                    href={`/${locale}/privacy-policy`}
                    target="_blank"
                    className="text-[#BDBDBD] hover:text-white underline underline-offset-4 decoration-[#242424] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BDBDBD]"
                >
                    Privacy
                </Link>.
            </p>

            {/* Switch to Sign Up */}
            <p className="text-center text-[13px] text-[#7E7E7E] pt-1">
                Don&apos;t have an account?{' '}
                <Link
                    href={`/${locale}/signup${searchString}`}
                    className="text-white hover:underline font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BDBDBD]"
                >
                    Create account
                </Link>
            </p>
        </div>
    );
}
