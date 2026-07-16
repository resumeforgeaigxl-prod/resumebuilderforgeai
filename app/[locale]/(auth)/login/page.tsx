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

            // Redirect based on profile completion or explicit redirect param
            const redirectTo = searchParams?.get('redirect');
            if (redirectTo) {
                router.push(redirectTo);
            } else if (!data.profileCompleted) {
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
        <div className="w-full flex flex-col gap-5">
            <div className="text-left">
                <h1 className="text-4xl font-bold text-white mb-1">
                    Welcome Back
                </h1>
                <p className="text-sm text-gray-400 mb-6">
                    Sign in to your account to continue.
                </p>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-md flex items-start gap-3 text-red-500">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            <div className="flex flex-col gap-4">
                <OAuthButtons />

                <div className="text-xs text-gray-500 tracking-widest text-center my-3">
                    OR CONTINUE WITH EMAIL
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col">
                        <label className="text-[10px] tracking-widest text-gray-400 mb-1.5 uppercase font-medium">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            required
                            disabled={isLoading}
                            className="w-full h-11 px-4 rounded-md bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                        />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="text-[10px] tracking-widest text-gray-400 uppercase font-medium">Password</label>
                            <Link href={`/${locale}/forgot-password`} title='Forgot Password' className="text-xs text-purple-400 hover:text-purple-300 font-semibold transition-colors underline underline-offset-4 decoration-purple-500/30">
                                Forgot password?
                            </Link>
                        </div>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            required
                            disabled={isLoading}
                            className="w-full h-11 px-4 rounded-md bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-11 mt-4 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
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

                <p className="text-center text-sm text-gray-400 mt-2">
                    Don&apos;t have an account?{' '}
                    <Link href={`/${locale}/signup`} className="text-purple-400 hover:text-purple-300 font-semibold transition-colors underline underline-offset-4 decoration-purple-500/30 hover:decoration-purple-400">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}

