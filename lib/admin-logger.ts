/**
 * Centralised event logger for admin monitoring.
 * Uses the Supabase service-role client so it always writes regardless of RLS.
 * All functions are fire-and-forget — they NEVER throw.
 */
import { createClient } from '@supabase/supabase-js';

function getAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

// ─── Centralised audit log ─────────────────────────────────────────────────
export async function logAction(
    userId: string,
    action: string,
    metadata: Record<string, unknown> = {}
) {
    try {
        await getAdmin().from('audit_logs').insert({ user_id: userId, action, metadata });
    } catch (e) {
        console.warn('[logAction] Failed to write audit log:', e);
    }
}

// ─── ATS Score Event ──────────────────────────────────────────────────────────
export async function logATSScore(params: {
    userId: string;
    resumeId?: string | null;
    score: number;
    keywordMatch?: number;
    skillMatch?: number;
    experienceMatch?: number;
    completeness?: number;
    jobDescription?: string;
}) {
    try {
        const admin = getAdmin();
        await Promise.all([
            admin.from('resume_scores').insert({
                user_id: params.userId,
                resume_id: params.resumeId || null,
                score: params.score,
                keyword_match: params.keywordMatch ?? 0,
                skill_match: params.skillMatch ?? 0,
                experience_match: params.experienceMatch ?? 0,
                completeness: params.completeness ?? 0,
                job_description: (params.jobDescription || '').slice(0, 500)
            }),
            logAction(params.userId, 'ATS_CHECKED', {
                score: params.score,
                resume_id: params.resumeId
            })
        ]);
    } catch (e) {
        console.warn('[logATSScore] Failed:', e);
    }
}

// ─── PDF Download Event ────────────────────────────────────────────────────────
export async function logPDFDownload(params: {
    userId: string;
    resumeId?: string | null;
    resumeName?: string;
    template?: string;
    watermarked?: boolean;
}) {
    try {
        const admin = getAdmin();
        await Promise.all([
            admin.from('pdf_downloads').insert({
                user_id: params.userId,
                resume_id: params.resumeId || null,
                resume_name: params.resumeName || 'Untitled',
                template: params.template || 'unknown',
                watermarked: params.watermarked ?? true
            }),
            logAction(params.userId, 'PDF_DOWNLOADED', {
                template: params.template,
                watermarked: params.watermarked
            })
        ]);
    } catch (e) {
        console.warn('[logPDFDownload] Failed:', e);
    }
}

// ─── Cover Letter Generated Event ─────────────────────────────────────────────
export async function logCoverLetter(params: {
    userId: string;
    resumeId?: string | null;
    roleTitle?: string;
    companyName?: string;
    content?: string;
}) {
    try {
        const admin = getAdmin();
        const wordCount = (params.content || '').trim().split(/\s+/).length;
        await Promise.all([
            admin.from('cover_letters').insert({
                user_id: params.userId,
                resume_id: params.resumeId || null,
                role_title: params.roleTitle || '',
                company_name: params.companyName || '',
                content: params.content || '',
                word_count: wordCount
            }),
            logAction(params.userId, 'COVER_LETTER_GENERATED', {
                role_title: params.roleTitle,
                company_name: params.companyName,
                word_count: wordCount
            })
        ]);
    } catch (e) {
        console.warn('[logCoverLetter] Failed:', e);
    }
}

// ─── Resume Created Event ──────────────────────────────────────────────────────
export async function logResumeCreated(userId: string, resumeId: string) {
    await logAction(userId, 'RESUME_CREATED', { resume_id: resumeId });
}

// ─── Resume Updated Event ──────────────────────────────────────────────────────
export async function logResumeUpdated(userId: string, resumeId: string) {
    await logAction(userId, 'RESUME_UPDATED', { resume_id: resumeId });
}

// ─── Resume Deleted Event ──────────────────────────────────────────────────────
export async function logResumeDeleted(userId: string, resumeId: string) {
    await logAction(userId, 'RESUME_DELETED', { resume_id: resumeId });
}

// ─── Mock Test Generated Event ─────────────────────────────────────────────────
export async function logMockTestGenerated(params: {
    userId: string;
    testId: string;
    jobTitle?: string;
    totalQuestions?: number;
}) {
    await logAction(params.userId, 'MOCK_TEST_GENERATED', {
        test_id: params.testId,
        job_title: params.jobTitle,
        total_questions: params.totalQuestions
    });
}

// ─── Job Applied Event ────────────────────────────────────────────────────────
export async function logJobApplied(params: {
    userId: string;
    jobId?: string;
    jobTitle?: string;
    company?: string;
    applyUrl?: string;
}) {
    try {
        const admin = getAdmin();
        await Promise.all([
            admin.from('job_applications').insert({
                user_id: params.userId,
                job_id: params.jobId || null,
                job_title: params.jobTitle || '',
                company: params.company || '',
                apply_url: params.applyUrl || ''
            }),
            logAction(params.userId, 'JOB_APPLIED', {
                job_title: params.jobTitle,
                company: params.company
            })
        ]);
    } catch (e) {
        console.warn('[logJobApplied] Failed:', e);
    }
}
