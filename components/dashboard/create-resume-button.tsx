'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

import { PlusCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function CreateResumeButton({ variant = 'primary' }: { variant?: 'primary' | 'secondary' }) {
    const router = useRouter()
    const params = useParams()
    const locale = params?.locale || 'en'
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
                throw new Error(data.error || data.details || 'Protocol Failure')
            }

            if (!data.id) {
                throw new Error('Signal Loss: No Resume ID')
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

            await new Promise(resolve => setTimeout(resolve, 300));
            router.push(`/${locale}/builder/${data.id}`)


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
                <Button
                    onClick={handleCreate}
                    disabled={isCreating}
                    variant="outline"
                    className="gap-2 px-8 rounded-xl border-white/5 bg-white/5 hover:bg-white/10"
                >
                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin text-indigo-400" /> : <PlusCircle className="w-4 h-4 text-indigo-400" />}
                    Initialize New Profile
                </Button>
                {error && <p className="text-red-400 text-[10px] font-black uppercase tracking-widest mt-3">{error}</p>}
            </div>
        )
    }

    return (
        <div className="flex flex-col items-end">
            <Button
                onClick={handleCreate}
                disabled={isCreating}
                variant="premium"
                className="gap-2 px-8 rounded-xl shadow-lg shadow-indigo-500/20"
            >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                Forge New Resume
            </Button>
            {error && <p className="text-red-400 text-[10px] font-black uppercase tracking-widest mt-2">{error}</p>}
        </div>
    )
}
