'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { authHeadingClass, authDescriptionClass, authLabelClass, authInputClass, authButtonClass } from '@/components/auth/styles';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from '@/components/icons';

export default function ForgotPasswordPage() {
    const params = useParams() as { locale?: string };
    const locale = params?.locale || 'en-in';
    const searchParams = useSearchParams();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(searchParams?.get('error') || null);
    const [message, setMessage] = useState<string | null>(searchParams?.get('message') || null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setMessage(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email');

        try {
            const res = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to request reset link.');
            }

            setMessage(data.message || 'Password reset link sent to your email.');
        } catch (err: unknown) {
            setError((err as Error).message || 'Failed to request reset link.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full space-y-4">
            {/* Auth heading */}
            <div className="text-left">
                <h1 className={authHeadingClass}>
                    Reset Password
                </h1>
                <p className={authDescriptionClass}>
                    Enter your email and we&apos;ll send you a recovery link.
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label
                        htmlFor="forgot-email"
                        className={authLabelClass + ' mb-2'}
                    >
                        Email
                    </label>
                    <input
                        id="forgot-email"
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        required
                        disabled={isLoading}
                        autoComplete="email"
                        className={authInputClass}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={authButtonClass}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin text-[#0A0A0A]" />
                            <span>Sending link...</span>
                        </>
                    ) : (
                        'Send Reset Link'
                    )}
                </button>
            </form>

            {/* Back to sign in */}
            <div className="pt-2 text-center">
                <Link
                    href={`/${locale}/login`}
                    className="inline-flex items-center gap-2 text-[13px] text-[#7E7E7E] hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BDBDBD]"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to sign in</span>
                </Link>
            </div>
        </div>
    );
}
