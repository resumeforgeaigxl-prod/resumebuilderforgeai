'use client'
export const dynamic = 'force-dynamic';
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Lock, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function ResetPasswordPage({
    searchParams,
}: {
    searchParams: { token?: string, error?: string, message?: string }
}) {
    const router = useRouter()
    const token = searchParams.token
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(searchParams.error || null)
    const [message, setMessage] = useState(searchParams.message || null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setMessage(null)

        const formData = new FormData(e.currentTarget)
        const password = formData.get('password')
        const confirm_password = formData.get('confirm_password')

        try {
            const res = await fetch('/api/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, password, confirm_password }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to update password')
            }

            setMessage(data.message)

            // Redirect to login after a short delay
            setTimeout(() => {
                router.push(`/login?message=${encodeURIComponent(data.message)}`)
            }, 3000)
        } catch (err: unknown) {
            setError((err as Error).message || 'Failed to update password')
            setIsLoading(false)
        }
    }

    if (!token) {
        return (
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/10 text-red-500 mb-6 ring-1 ring-red-500/20">
                    <Lock className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Invalid Reset Link</h1>
                <p className="text-slate-400 mb-8">This reset link may be invalid or has expired.</p>
                <Link
                    href="/forgot-password"
                    className="w-full inline-block py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-all"
                >
                    Request New Link
                </Link>
            </div>
        )
    }

    return (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 mb-4 ring-1 ring-blue-500/20">
                    <Lock className="w-6 h-6" />
                </div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    Set New Password
                </h1>
                <p className="text-slate-400 mt-2">Create a secure new password for your account</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="font-medium text-red-500">{error}</p>
                </div>
            )}

            {message && (
                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="font-medium text-emerald-500">{message}</p>
                </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">New Password</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        required
                        disabled={isLoading}
                        className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white placeholder-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Confirm New Password</label>
                    <input
                        type="password"
                        name="confirm_password"
                        placeholder="••••••••"
                        required
                        disabled={isLoading}
                        className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white placeholder-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Updating Password...
                        </>
                    ) : (
                        'Update Password'
                    )}
                </button>
            </form>

            <div className="mt-8 text-center pt-8 border-t border-slate-800/50">
                <Link href="/login" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sign In
                </Link>
            </div>
        </div>
    )
}

