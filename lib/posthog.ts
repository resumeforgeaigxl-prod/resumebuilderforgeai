import posthog from 'posthog-js';

if (typeof window !== 'undefined') {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

    if (posthogKey && posthogHost) {
        posthog.init(posthogKey, {
            api_host: posthogHost,
            capture_pageview: true,
            autocapture: true,
            persistence: 'localStorage',
        });
    }
}

export default posthog;
