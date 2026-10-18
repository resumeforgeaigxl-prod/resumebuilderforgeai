/**
 * Auth intent and destination resolution for ResumeForge.
 * Preserves user flow context (e.g. Try Omni, Find Jobs, Check My Match, Prepare Application)
 * across Sign In, Sign Up, and OAuth redirects.
 */

export function resolvePostAuthDestination(
    searchParams: URLSearchParams | { get: (key: string) => string | null } | null | undefined,
    locale: string = 'en-in',
    profileCompleted: boolean = false
): string {
    if (!searchParams) {
        return profileCompleted ? `/${locale}/dashboard` : `/${locale}/complete-profile`;
    }

    const redirect = searchParams.get('redirect');
    if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
        return redirect;
    }

    const intent = searchParams.get('intent');
    const jobId = searchParams.get('jobId') || searchParams.get('job_id') || searchParams.get('matchJobId');
    const action = searchParams.get('action');
    const prompt = searchParams.get('prompt');

    // Intent: Find jobs
    if (intent === 'find_jobs' || intent === 'find_jobs_for_me') {
        return `/${locale}/omni?prompt=${encodeURIComponent('Find jobs for me')}`;
    }

    // Intent: Try Omni
    if (intent === 'try_omni' || intent === 'omni') {
        return `/${locale}/omni`;
    }

    // Intent: Check match for a job
    if ((intent === 'check_match' || intent === 'CHECK_MATCH') && jobId) {
        return `/${locale}/jobs/${jobId}?intent=check_match`;
    }

    // Intent: Apply / prepare application with Omni
    if ((intent === 'prepare_application' || intent === 'APPLY_WITH_OMNI') && jobId) {
        return `/${locale}/omni?jobId=${jobId}&action=prepare`;
    }

    if (action === 'prepare' && jobId) {
        return `/${locale}/omni?jobId=${jobId}&action=prepare`;
    }

    if (jobId) {
        return `/${locale}/jobs/${jobId}`;
    }

    if (prompt) {
        return `/${locale}/omni?prompt=${encodeURIComponent(prompt)}`;
    }

    // If profile is incomplete, route to complete profile first
    if (!profileCompleted) {
        return `/${locale}/complete-profile`;
    }

    return `/${locale}/dashboard`;
}
