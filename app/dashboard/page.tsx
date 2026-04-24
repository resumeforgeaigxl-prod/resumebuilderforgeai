export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';

export default function DashboardRedirect() {
    redirect('/en-in/dashboard');
}
