'use client';
import { useState } from 'react';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import { OAuthButtons } from '@/components/auth/oauth-buttons';

export default function SignupPage({ searchParams }: { searchParams: { error?: string; message?: string } }) {
    const [tcChecked, setTcChecked] = useState(false);

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

            {searchParams.error && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {searchParams.error}
                </div>
            )}
            {searchParams.message && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                    {searchParams.message}
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

                <form className="space-y-4" method="POST" action="/api/auth/signup">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Email Address</label>
                        <input type="email" name="email" placeholder="you@example.com" required
                            className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-white placeholder-slate-600" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Phone Number <span className="text-slate-500 text-xs">(optional)</span></label>
                        <input type="tel" name="phone_number" placeholder="+91 98765 43210"
                            className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-white placeholder-slate-600" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Password</label>
                        <input type="password" name="password" placeholder="••••••••" required minLength={6}
                            className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-white placeholder-slate-600" />
                    </div>

                    {/* T&C Checkbox — links open in new tab so they never interfere with the form */}
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" name="tc_accepted" value="on" required
                            checked={tcChecked} onChange={e => setTcChecked(e.target.checked)}
                            className="mt-1 w-4 h-4 accent-purple-500 rounded shrink-0" />
                        <span className="text-sm text-slate-400">
                            I agree to the{' '}
                            <a href="/terms" target="_blank" rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="text-purple-400 hover:text-purple-300 underline">
                                Terms &amp; Conditions
                            </a>
                            {' '}and{' '}
                            <a href="/privacy" target="_blank" rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="text-purple-400 hover:text-purple-300 underline">
                                Privacy Policy
                            </a>.
                            My IP and acceptance time will be recorded.
                        </span>
                    </label>

                    <button type="submit" disabled={!tcChecked}
                        className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-600/20 active:scale-[0.98]">
                        Create Account
                    </button>
                </form>

                <p className="text-center text-sm text-slate-400">
                    Already have an account?{' '}
                    <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
