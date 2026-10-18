'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

import { PlusCircle, Loader2 } from '@/components/icons'
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
                    className="gap-2 px-6 h-10 rounded-md border-[#242424] bg-[#101010] text-[#F5F5F5] hover:bg-[#151515] transition-colors cursor-pointer"
                >
                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin text-[#F5F5F5]" /> : <PlusCircle className="w-4 h-4 text-[#F5F5F5]" />}
                    Create Resume
                </Button>
                {error && <p className="text-rose-400 text-xs font-medium mt-2">{error}</p>}
            </div>
        )
    }

    return (
        <div className="flex flex-col items-end">
            <Button
                onClick={handleCreate}
                disabled={isCreating}
                className="gap-2 px-5 h-9 rounded-lg bg-[#F5F5F5] hover:bg-white text-[#050505] font-semibold text-xs transition-colors shadow-xs cursor-pointer"
            >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin text-[#050505]" /> : <PlusCircle className="w-4 h-4 text-[#050505]" />}
                Create Resume
            </Button>
            {error && <p className="text-rose-400 text-xs font-medium mt-2">{error}</p>}
        </div>
    )
}
