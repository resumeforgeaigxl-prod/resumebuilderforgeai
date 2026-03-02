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

    // 1. Keyword & Tech Stack Relevance (JD Alignment) - 35%
    const getKeywordScore = () => {
        let score = 0;

        // Match vs JD if present
        if (jobDescription) {
            const jdTerms = jobDescription.toLowerCase().split(/\W+/).filter(w => w.length > 3);
            const jdWords = new Set(jdTerms);

            if (jdWords.size > 0) {
                let matches = 0;
                jdWords.forEach(w => { if (allText.includes(w)) matches++; });

                // matchRatio is matches relative to unique JD keywords (capped at 15 for fairness)
                const matchRatio = matches / Math.min(jdWords.size, 15);
                score = Math.min(35, matchRatio * 35);
            }
        } else {
            // General relevance if no JD - Lower weight
            const baseKeywords = ['rest api', 'scalable', 'optimization', 'frontend', 'backend', 'database', 'testing', 'security', 'agile', 'git', 'ci/cd'];
            const matches = baseKeywords.filter(w => allText.includes(w)).length;
            score = Math.min(20, matches * 2);
        }

        return score;
    };

    const keywordWeight = getKeywordScore();
    if (jobDescription && keywordWeight < 15) feedback.push('Low JD alignment. Add missing technologies mentioned in the job description.');

    // 2. Skill Match & Tech Depth - 25%
    const getSkillScore = () => {
        let score = 0;
        const techStacks = [
            { id: 'Frontend', words: ['react', 'next.js', 'typescript', 'javascript', 'tailwind', 'css', 'html', 'vue', 'angular', 'redux'] },
            { id: 'Backend', words: ['node.js', 'python', 'django', 'go', 'java', 'spring', 'postgresql', 'mongodb', 'docker', 'kubernetes', 'aws', 'graphql'] },
            { id: 'Mobile', words: ['react native', 'flutter', 'swift', 'kotlin'] },
            { id: 'AI/ML', words: ['pytorch', 'tensorflow', 'scikit-learn', 'llm', 'opencv', 'pandas'] }
        ];

        techStacks.forEach(stack => {
            const count = stack.words.filter(w => allText.includes(w)).length;
            if (count >= 3) score += 8;
            else if (count >= 1) score += 3;
        });

        return Math.min(25, score);
    };

    const skillsWeight = getSkillScore();

    // 3. Action Verbs & Professionalism (20%)
    const actionVerbs = ['achieved', 'managed', 'developed', 'led', 'designed', 'created', 'improved', 'increased', 'decreased', 'resolved', 'spearheaded', 'built', 'implemented', 'optimized', 'automated', 'orchestrated', 'streamlined'];
    let verbCount = 0;
    actionVerbs.forEach(v => { if (allText.includes(v)) verbCount++; });
    const verbsWeight = Math.min(20, (verbCount / 8) * 20);
    if (verbCount < 5) feedback.push('Use stronger action verbs to describe your contributions.');

    // 4. Measurable Impact / Metrics (10%) - HARD TO GET
    let metricCount = 0;
    const metricRegex = /\d+%|\d+x|\d+ (users|ms|sec|hrs|k|m|clients|projects|million|percent)/g;
    const matches = allText.match(metricRegex);
    if (matches) metricCount = matches.length;
    const metricsWeight = Math.min(10, (metricCount / 4) * 10);
    if (metricCount < 1) feedback.push('Quantify your impact with numbers or percentages where possible.');

    // 5. Structure & Section Completeness (10%)
    let structPoints = 0;
    if (resume.summary?.trim() && resume.summary.length > 50) structPoints += 2;
    if ((resume.experience?.length || 0) > 0) structPoints += 3;
    if ((resume.education?.length || 0) > 0) structPoints += 2;
    if ((resume.skills?.length || 0) >= 5 || (resume.skillCategories?.length || 0) >= 2) structPoints += 2;
    if ((resume.projects?.length || 0) > 0) structPoints += 1;
    const structWeight = Math.min(10, structPoints);

    // Final Total (Out of 100)
    let total = keywordWeight + skillsWeight + verbsWeight + metricsWeight + structWeight;

    // Strictness: Cap score for sparse content
    if (allText.length < 1000) total = Math.min(total, 65);
    if (metricCount === 0 && total > 85) total = 85; // Cannot be "Perfect" without metrics

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

