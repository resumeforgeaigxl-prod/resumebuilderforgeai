'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlusCircle, Loader2 } from 'lucide-react'

export function CreateResumeButton({ variant = 'primary' }: { variant?: 'primary' | 'secondary' }) {
    const router = useRouter()
    const [isCreating, setIsCreating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleCreate = async () => {
        setIsCreating(true)
        setError(null)
        try {
            const res = await fetch('/api/resume/create', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || data.details || 'Failed to create resume')
            }

            if (!data.id) {
                throw new Error('Server did not return a valid Resume ID')
            }

            // Tracking
            try {
                const posthog = (await import('@/lib/posthog')).default;
                posthog.capture('resume_created', {
                    resume_id: data.id
                });
            } catch (err) {
                console.error('[PostHog] Event error:', err);
            }

            // Small delay to ensure DB consistency before redirect
            await new Promise(resolve => setTimeout(resolve, 300));
            router.push(`/builder/${data.id}`)

        } catch (err: unknown) {
            console.error('[CreateButton] Error:', err)
            const msg = err instanceof Error ? err.message : String(err)
            setError(msg)
            setIsCreating(false)
        }
    }

    if (variant === 'secondary') {
        return (
            <div className="flex flex-col items-center">
                <button
                    onClick={handleCreate}
                    disabled={isCreating}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
                >
                    {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
                    Create Resume
                </button>
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>
        )
    }

    return (
        <div className="flex flex-col items-end">
            <button
                onClick={handleCreate}
                disabled={isCreating}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
            >
                {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
                Create New Resume
            </button>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
    )
}
