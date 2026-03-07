'use client';

import posthog from '@/lib/posthog';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function PostHogInit({ user }: { user: { id: string; email?: string; name?: string; plan_type?: string } | null }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Handle identification and reset
    useEffect(() => {
        try {
            if (user && posthog) {
                posthog.identify(user.id, {
                    email: user.email,
                    name: user.name,
                    plan_type: user.plan_type || 'free',
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
            if (posthog) {
                if (searchParams?.get('message')?.includes('Account created')) {
                    posthog.capture('user_signed_up');
                }
                if (searchParams?.get('message')?.includes('Logged in successfully')) {
                    posthog.capture('user_logged_in');
                }
            }
        } catch (err) {
            console.error('[PostHog] Auth track error:', err);
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
