import { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/jwt';
import AdminLayoutClient from './client-layout';

async function getAdminProfile() {
    const session = await getSession();
    if (!session) return null;
    const supabase = createClient();
    const { data } = await supabase.from('users').select('role, email').eq('id', session.userId).single() as { data: { role: string; email: string } };
    return data;
}

export default function AdminLayoutWrapper({ children }: { children: ReactNode }) {
    return <AdminLayout>{children}</AdminLayout>;
}

async function AdminLayout({ children }: { children: ReactNode }) {
    const profile = await getAdminProfile();
    if (!profile || profile.role !== 'admin') {
        redirect('/dashboard');
    }

    return <AdminLayoutClient profile={{ email: profile.email as string }}>{children}</AdminLayoutClient>;
}
