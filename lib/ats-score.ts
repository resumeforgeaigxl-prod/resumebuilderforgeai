import { ResumeData } from '@/types/resume';

export interface ATSScoreResult {
    score: number;
    details: {
        keywords: number;
        completeness: number;
        metrics: number;
        skills: number;
        projectLinks: number;
        cgpaBonus: number;
        certBonus: number;
    };
    feedback: string[];
    isMatch: boolean;
}

export function calculateATSScore(resume: ResumeData, jobDescription?: string): ATSScoreResult | null {
    const hasName = !!resume.name?.trim();
    const hasSkills = (resume.skills?.length ?? 0) >= 3 || (resume.skillCategories?.some(c => c.skills.length > 0) ?? false);
    const hasContent = (resume.experience?.length ?? 0) > 0 || (resume.projects?.length ?? 0) > 0;
    if (!hasName || !hasSkills || !hasContent) return null;

    const feedback: string[] = [];
    const allText = JSON.stringify(resume).toLowerCase();

    // 1. Keyword & Tech Stack Relevance (40%)
    const getKeywordScore = () => {
        let score = 0;
        const baseKeywords = ['rest api', 'scalable', 'optimization', 'frontend', 'backend', 'database', 'testing', 'security'];

        // Intelligent Tech Mapping
        const techStacks = [
            { id: 'Frontend', words: ['react', 'next.js', 'typescript', 'javascript', 'tailwind', 'css', 'html', 'vue'] },
            { id: 'Backend', words: ['node.js', 'python', 'django', 'go', 'java', 'spring', 'postgresql', 'mongodb', 'docker'] },
            { id: 'AI/ML', words: ['pytorch', 'tensorflow', 'scikit-learn', 'llm', 'generative ai', 'data science'] }
        ];

        // Reward depth in stacks
        techStacks.forEach(stack => {
            const count = stack.words.filter(w => allText.includes(w)).length;
            if (count >= 2) {
                score += 5;
            }
        });

        // Match vs JD if present
        if (jobDescription) {
            const jdWords = new Set(jobDescription.toLowerCase().split(/\W+/).filter(w => w.length > 3));
            if (jdWords.size > 0) {
                let matches = 0;
                jdWords.forEach(w => { if (allText.includes(w)) matches++; });
                const matchRatio = matches / Math.min(jdWords.size, 20); // Cap comparison to 20 key terms
                score += Math.min(25, matchRatio * 25);
            }
        } else {
            // General relevance if no JD
            score += Math.min(15, baseKeywords.filter(w => allText.includes(w)).length * 3);
        }

        return Math.min(40, score);
    };

    const keywordWeight = getKeywordScore();
    if (keywordWeight < 15) feedback.push('Include more specific technology and role-related keywords.');

    // 2. Action Verbs (25%)
    const actionVerbs = ['achieved', 'managed', 'developed', 'led', 'designed', 'created', 'improved', 'increased', 'decreased', 'resolved', 'spearheaded', 'built', 'implemented', 'optimized', 'automated'];
    let verbCount = 0;
    actionVerbs.forEach(v => { if (allText.includes(v)) verbCount++; });
    const verbsWeight = Math.min(25, (verbCount / 10) * 25);
    if (verbCount < 6) feedback.push('Use stronger action verbs to start your bullet points.');

    // 3. Measurable Impact / Metrics (15%) - Only if present
    let metricCount = 0;
    const metricRegex = /\d+%|\$\d+|\d+x|\d+ (users|ms|sec|hrs|k|m|clients|projects|million)/g;
    const matches = allText.match(metricRegex);
    if (matches) metricCount = matches.length;
    const metricsWeight = Math.min(15, (metricCount / 5) * 15);
    if (metricCount < 2) feedback.push('Add quantifiables (%, numbers, $) to show real impact.');

    // 4. Structure & Section Completeness (20%)
    let structPoints = 0;
    if (resume.summary?.trim()) structPoints += 4;
    if ((resume.experience?.length || 0) > 0) structPoints += 5;
    if ((resume.education?.length || 0) > 0) structPoints += 4;
    if ((resume.skills?.length || 0) >= 8 || (resume.skillCategories?.length || 0) >= 3) structPoints += 4;
    if ((resume.projects?.length || 0) > 0) structPoints += 3;
    const structWeight = Math.min(20, structPoints);
    if (structPoints < 15) feedback.push('Some key sections are sparse or missing.');

    // Final Total (Out of 100)
    let total = keywordWeight + verbsWeight + metricsWeight + structWeight;

    // Gradual Smoothing (Believable, no jumps)
    // Avoid showing excessive 90+ unless content is truly deep
    if (total > 85 && metricCount < 3) total = total * 0.95;

    total = Math.round(Math.min(100, Math.max(0, total)));

    return {
        score: total,
        details: {
            keywords: Math.round(keywordWeight),
            completeness: Math.round(structWeight),
            metrics: Math.round(metricsWeight),
            skills: Math.round(verbsWeight),
            projectLinks: 0,
            cgpaBonus: 0,
            certBonus: 0
        },
        feedback: feedback.slice(0, 3),
        isMatch: !!jobDescription,
    };
}

