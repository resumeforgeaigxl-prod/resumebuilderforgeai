'use client';

import posthog from '@/lib/posthog';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function PostHogInit({ user }: { user: { id: string; email?: string; name?: string } | null }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Handle identification and reset
    useEffect(() => {
        try {
            if (user && posthog) {
                posthog.identify(user.id, {
                    email: user.email,
                    name: user.name,
                });
            } else if (!user && posthog) {
                posthog.reset();
            }
        } catch (err) {
            console.error('[PostHog] Identity error:', err);
        }
    }, [user]);

    useEffect(() => {
        try {
            if (searchParams?.get('message')?.includes('Account created') && posthog) {
                posthog.capture('user_signed_up');
            }
        } catch (err) {
            console.error('[PostHog] Signup track error:', err);
        }
    }, [searchParams]);

    useEffect(() => {
        try {
            if (pathname && posthog && typeof window !== 'undefined') {
                let url = window.location.origin + pathname;
                if (searchParams && searchParams.toString()) {
                    url = url + `?${searchParams.toString()}`;
                }
                posthog.capture('$pageview', {
                    $current_url: url,
                });
            }
        } catch (err) {
            console.error('[PostHog] Pageview error:', err);
        }
    }, [pathname, searchParams]);

    return null;
}
