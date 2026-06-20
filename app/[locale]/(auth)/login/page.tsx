'use client'
export const dynamic = 'force-dynamic';
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { LogIn, Loader2, AlertCircle } from 'lucide-react'
import { OAuthButtons } from '@/components/auth/oauth-buttons'

export default function LoginPage() {
    const params = useParams() as { locale: string };
    const { locale } = params;
    const router = useRouter()
    const searchParams = useSearchParams()
    const initialError = searchParams?.get('error') ?? null
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(initialError)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const email = formData.get('email')
        const password = formData.get('password')

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Login failed')
            }

            // Redirect based on profile completion
            if (!data.profileCompleted) {
                router.push(`/${locale}/complete-profile`)
            } else {
                router.push(`/${locale}/dashboard`)
            }
            router.refresh()
        } catch (err: unknown) {
            setError((err as Error).message || 'Login failed')
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full">
            <div className="text-left mb-8">
                <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-1.5px] leading-[1.05] text-white">
                    Welcome Back
                </h1>
                <p className="text-sm md:text-base text-slate-400 mt-3 max-w-[420px]">
                    Sign in to your account to continue.
                </p>
            </div>

            <div className="space-y-6">
                <OAuthButtons />

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#222]"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="px-3 bg-[#070710] text-[#8f8f8f] font-mono tracking-wider">Or continue with email</span>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-[14px] flex items-start gap-3 text-red-500 animate-in fade-in slide-in-from-top-2 duration-300">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            required
                            disabled={isLoading}
                            className="w-full h-[58px] px-5 bg-[#0a0a0c] border border-[#222] focus:border-[#444] rounded-[14px] focus:outline-none transition-all text-white placeholder-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-slate-300">Password</label>
                            <Link href={`/${locale}/forgot-password`} title='Forgot Password' className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors underline underline-offset-4 decoration-purple-500/30">
                                Forgot password?
                            </Link>
                        </div>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            required
                            disabled={isLoading}
                            className="w-full h-[58px] px-5 bg-[#0a0a0c] border border-[#222] focus:border-[#444] rounded-[14px] focus:outline-none transition-all text-white placeholder-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-[56px] bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-[14px] transition-all shadow-md shadow-purple-600/10 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 text-base"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Signing In...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-400 mt-6">
                    Don&apos;t have an account?{' '}
                    <Link href={`/${locale}/signup`} className="text-purple-400 hover:text-purple-300 font-semibold transition-colors underline underline-offset-4 decoration-purple-500/30 hover:decoration-purple-400">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}

