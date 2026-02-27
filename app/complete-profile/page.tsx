'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const ERROR_MESSAGES: Record<string, string> = {
    PhoneRequired: 'Please enter your phone number.',
    TermsRequired: 'You must accept the Terms & Conditions to continue.',
    SaveFailed: 'Failed to save your profile. Please try again.',
    ServerError: 'An unexpected error occurred. Please try again.',
};

function CompleteProfileForm() {
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const errorKey = searchParams.get('error') ?? '';
    const errorMessage = ERROR_MESSAGES[errorKey] || (errorKey ? 'Something went wrong. Please try again.' : '');

    return (
        <div className="min-h-screen bg-[#070710] flex items-center justify-center p-4">
            <div className="max-w-md w-full p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl">
                <h1 className="text-3xl font-bold text-white mb-2">Almost there! 🎉</h1>
                <p className="text-slate-400 mb-8">Please complete your profile to access ResumeForge AI.</p>

                {errorMessage && (
                    <div className="mb-6 px-4 py-3 bg-red-900/40 border border-red-700/50 rounded-xl text-red-300 text-sm">
                        {errorMessage}
                    </div>
                )}

                <form action="/api/auth/complete-profile" method="POST" onSubmit={() => setLoading(true)} className="space-y-6">
                    <div>
                        <label className="text-sm font-medium text-slate-300 block mb-2">Phone Number</label>
                        <input
                            name="phone_number"
                            type="tel"
                            required
                            placeholder="+1 (555) 000-0000"
                            className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-white"
                        />
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            name="tc_accepted"
                            required
                            className="mt-1 w-4 h-4 accent-purple-500 rounded shrink-0"
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
                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-xl transition-all"
                    >
                        {loading ? 'Saving...' : 'Continue to Dashboard'}
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
