'use server'

import { redirect } from 'next/navigation'
import { clearSession } from '@/lib/auth/jwt'

export async function signInWithGoogle() {
    redirect('/api/auth/google')
}

export async function signOut() {
    clearSession()
    return redirect('/login')
}
