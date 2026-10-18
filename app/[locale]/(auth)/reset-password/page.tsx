'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { authHeadingClass, authDescriptionClass, authLabelClass, authInputClass, authButtonClass } from '@/components/auth/styles';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from '@/components/icons';

export default function ResetPasswordPage() {
    const params = useParams() as { locale?: string };
    const locale = params?.locale || 'en-in';
    const router = useRouter();
    const searchParams = useSearchParams();

    const token = searchParams?.get('token') || '';
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(searchParams?.get('error') || null);
    const [message, setMessage] = useState<string | null>(searchParams?.get('message') || null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setMessage(null);

        const formData = new FormData(e.currentTarget);
        const password = formData.get('password');
        const confirm_password = formData.get('confirm_password');

        try {
            const res = await fetch('/api/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, password, confirm_password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to update password.');
            }

            setMessage(data.message || 'Password successfully updated! Redirecting to sign in...');

            setTimeout(() => {
                router.push(`/${locale}/login?message=${encodeURIComponent(data.message || 'Password updated! Please sign in.')}`);
            }, 2000);
        } catch (err: unknown) {
            setError((err as Error).message || 'Failed to update password.');
            setIsLoading(false);
        }
    }

    if (!token) {
        return (
            <div className="w-full space-y-6 text-center">
                <div className="space-y-2">
                    <h1 className={authHeadingClass}>
                        Invalid reset link
                    </h1>
                    <p className="text-[15px] text-[#BDBDBD]">
                        This password reset link is invalid or has expired.
                    </p>
                </div>
                <Link
                    href={`/${locale}/forgot-password`}
                    className={authButtonClass}
                >
                    Request new link
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full space-y-4">
            {/* Auth heading */}
            <div className="text-left">
                <h1 className={authHeadingClass}>
                    Set New Password
                </h1>
                <p className={authDescriptionClass}>
                    Choose a secure password for your account.
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
                        htmlFor="new-password"
                        className={authLabelClass + ' mb-2'}
                    >
                        New Password
                    </label>
                    <input
                        id="new-password"
                        type="password"
                        name="password"
                        placeholder="•••••••••"
                        required
                        minLength={6}
                        disabled={isLoading}
                        autoComplete="new-password"
                        className={authInputClass}
                    />
                </div>

                <div>
                    <label
                        htmlFor="confirm-password"
                        className={authLabelClass + ' mb-2'}
                    >
                        Confirm New Password
                    </label>
                    <input
                        id="confirm-password"
                        type="password"
                        name="confirm_password"
                        placeholder="•••••••••"
                        required
                        minLength={6}
                        disabled={isLoading}
                        autoComplete="new-password"
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
                            <span>Updating password...</span>
                        </>
                    ) : (
                        'Update Password'
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
