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

export default function AdminLayoutWrapper({ children, params }: { children: ReactNode, params: { locale: string } }) {
    return <AdminLayout locale={params.locale}>{children}</AdminLayout>;
}

async function AdminLayout({ children, locale }: { children: ReactNode, locale: string }) {
    const profile = await getAdminProfile();
    if (!profile || profile.role !== 'admin') {
        redirect(`/${locale}/dashboard`);
    }

    return <AdminLayoutClient locale={locale} profile={{ email: profile.email as string }}>{children}</AdminLayoutClient>;
}
