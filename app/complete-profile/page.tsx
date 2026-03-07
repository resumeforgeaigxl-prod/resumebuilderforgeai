'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';

const ERROR_MESSAGES: Record<string, string> = {
    PhoneRequired: 'Please enter your phone number.',
    TermsRequired: 'You must accept the Terms & Conditions to continue.',
    SaveFailed: 'Failed to save your profile. Please try again.',
    ServerError: 'An unexpected error occurred. Please try again.',
};

function CompleteProfileForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const errorKey = searchParams?.get('error') ?? '';
    const initialError = ERROR_MESSAGES[errorKey] || (errorKey ? 'Something went wrong. Please try again.' : null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const phone_number = formData.get('phone_number');
        const tc_accepted = formData.get('tc_accepted') === 'on';

        try {
            const res = await fetch('/api/complete-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phone_number, tc_accepted }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to complete profile');
            }

            // Success! Redirect to dashboard
            router.push('/dashboard');
            router.refresh();
        } catch (err: unknown) {
            setError((err as Error).message || 'Failed to complete profile');
            setLoading(false);
        }
    }

    const displayedError = error || initialError;

    return (
        <div className="min-h-screen bg-[#070710] flex items-center justify-center p-4">
            <div className="max-w-md w-full p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl">
                <h1 className="text-3xl font-bold text-white mb-2">Almost there! 🎉</h1>
                <p className="text-slate-400 mb-8">Please complete your profile to access ResumeForge AI.</p>

                {displayedError && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <p className="font-medium">{displayedError}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-sm font-medium text-slate-300 block mb-2">Phone Number</label>
                        <input
                            name="phone_number"
                            type="tel"
                            required
                            disabled={loading}
                            placeholder="+1 (555) 000-0000"
                            className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-white disabled:opacity-50"
                        />
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            name="tc_accepted"
                            required
                            disabled={loading}
                            className="mt-1 w-4 h-4 accent-purple-500 rounded shrink-0 disabled:opacity-50"
                        />
                        <span className="text-sm text-slate-400">
                            I agree to the{' '}
                            <a href="/terms" target="_blank" onClick={e => e.stopPropagation()} className="text-purple-400 hover:underline">
                                Terms &amp; Conditions
                            </a>
                            {' '}and{' '}
                            <a href="/privacy" target="_blank" onClick={e => e.stopPropagation()} className="text-purple-400 hover:underline">
                                Privacy Policy
                            </a>.
                        </span>
                    </label>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Continue to Dashboard'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function CompleteProfilePage() {
    return (
        <Suspense>
            <CompleteProfileForm />
        </Suspense>
    );
}

