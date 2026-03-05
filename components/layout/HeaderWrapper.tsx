'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export default function HeaderWrapper({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    // Hide main header on all admin and chat routes
    if (pathname?.startsWith('/admin') || pathname?.includes('/jobforgeai')) {
        return null; // Return empty (hidden header)
    }

    return <>{children}</>;
}
