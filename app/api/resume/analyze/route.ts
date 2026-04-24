export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';

// Heuristic analysis patterns
const ACTION_VERBS = ['achieved', 'managed', 'developed', 'led', 'designed', 'created', 'improved', 'increased', 'decreased', 'resolved', 'spearheaded', 'orchestrated', 'built', 'implemented', 'optimized'];
const WEAK_WORDS = ['helped', 'worked', 'responsible for', 'duties included', 'assisted', 'handled'];
const METRIC_REGEX = /\b(\d+%|\$\d+|\d+x|\d+ million|\d+ billion|\d+ thousand|\d+)\b/i;

function analyzeResumeData(resumeText: string, words: string[]) {
    const textLower = resumeText.toLowerCase();

    // 1. Keyword Score (Density of action verbs)
    let actionHitCount = 0;
    ACTION_VERBS.forEach(verb => { if (textLower.includes(verb)) actionHitCount++; });
    const actionScore = Math.min(100, Math.round((actionHitCount / 10) * 100)); // Cap at 10 verbs for 100%

    // 2. Impact Score (Metrics presence)
    let metricsFound = 0;
    const bullets = textLower.split('\n').filter(l => l.trim().length > 10);
    bullets.forEach(b => { if (METRIC_REGEX.test(b)) metricsFound++; });
    const impactScore = Math.min(100, Math.round((metricsFound / 5) * 100)); // Cap at 5 quantified bullets for 100%

    // 3. Readability & Weak Words
    let weakWordCount = 0;
    WEAK_WORDS.forEach(word => { if (textLower.includes(word)) weakWordCount++; });
    // Penalty for long sentences or weak words
    const readabilityScore = Math.max(0, 100 - (weakWordCount * 10));

    // 4. Scan Time estimate (Avg recruiter scan is 7 seconds. Too wordy = harder to scan)
    const wordCount = words.length;
    let scanTime = 7;
    if (wordCount > 600) scanTime = 12;      // Too much text, takes longer to parse
    else if (wordCount < 200) scanTime = 4;  // Very sparse
    else if (wordCount > 400) scanTime = 9;

    // Overall keyword diversity score based on length
    const keywordScore = Math.min(100, Math.round((words.length / 500) * 100));

    return {
        actionScore,
        impactScore,
        readabilityScore,
        keywordScore,
        scanTime
    };
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { resumeId, resumeData } = body;

        if (!resumeId || !resumeData) {
            return NextResponse.json({ error: 'Missing resumeId or payload' }, { status: 400 });
        }

        const supabase = createClient();

        // Ensure owner
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: ownership } = await (supabase as any)
            .from('resumes')
            .select('id')
            .eq('id', resumeId)
            .eq('user_id', session.userId)
            .single();

        if (!ownership) return NextResponse.json({ error: 'Resume not found' }, { status: 404 });

        // Compile text fields for heuristic analysis
        const allText = `
        ${resumeData.summary || ''}
        ${resumeData.experience?.map((e: { points?: string[] }) => e.points?.join('\n') || '').join('\n') || ''}
        ${resumeData.projects?.map((p: { description?: string[] }) => p.description?.join('\n') || '').join('\n') || ''}
        ${resumeData.skills?.join(' ') || ''}
        `;
        const words = allText.split(/\s+/).filter(w => w.length > 2);

        const metrics = analyzeResumeData(allText, words);

        // Upsert analysis
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('resume_analysis')
            .upsert({
                resume_id: resumeId,
                keyword_score: metrics.keywordScore,
                impact_score: metrics.impactScore,
                action_score: metrics.actionScore,
                readability_score: metrics.readabilityScore,
                recruiter_scan_time: metrics.scanTime,
                created_at: new Date().toISOString()
            }, { onConflict: 'resume_id' })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, analysis: data });

    } catch (e) {
        console.error('[Resume Analyze]', e);
        return NextResponse.json({ error: 'Failed to analyze resume' }, { status: 500 });
    }
}



