'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlusCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const DEFAULT_RESUME_JSON = {
    name: "",
    email: "",
    phone: "",
    linkedin: "",
    github: "",
    summary: "",
    skills: [],
    experience: [],
    projects: [],
    education: []
}

export function CreateResumeButton({ userId, variant = 'primary' }: { userId: string, variant?: 'primary' | 'secondary' }) {
    const router = useRouter()
    const supabase = createClient()
    const [isCreating, setIsCreating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleCreate = async () => {
        setIsCreating(true)
        setError(null)
        try {
            const { data, error } = await supabase
                .from('resumes')
                .insert({
                    user_id: userId,
                    title: 'Untitled Resume',
                    resume_json: DEFAULT_RESUME_JSON,
                    template_selected: 'modern'
                })
                .select('id')
                .single()

            if (error) throw error

            if (data?.id) {
                router.push(`/builder/${data.id}`)
            } else {
                throw new Error("Failed to create resume: No ID returned")
            }
        } catch (err: unknown) {
            console.error('Error creating resume:', err)
            setError(err instanceof Error ? err.message : 'Error creating resume')
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
