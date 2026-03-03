import { ResumeData } from '@/types/resume';

export interface ATSScoreResult {
    score: number;
    isValid: boolean;
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

// Semantic Validation Dictionaries
const VALID_SKILLS = new Set([
    'react', 'next.js', 'node.js', 'typescript', 'javascript', 'python', 'java', 'go', 'rust', 'c++', 'c#',
    'postgresql', 'mongodb', 'mysql', 'redis', 'elasticsearch', 'docker', 'kubernetes', 'aws', 'azure', 'gcp',
    'html', 'css', 'tailwind', 'sass', 'redux', 'graphql', 'rest api', 'ci/cd', 'git', 'terraform', 'ansible',
    'pytorch', 'tensorflow', 'scikit-learn', 'pandas', 'numpy', 'opencv', 'llm', 'nlp', 'system design',
    'distributed systems', 'microservices', 'agile', 'scrum', 'backend', 'frontend', 'devops', 'testing', 'security'
]);

const ACTION_VERBS = new Set([
    'achieved', 'managed', 'developed', 'led', 'designed', 'created', 'improved', 'increased', 'decreased',
    'resolved', 'spearheaded', 'built', 'implemented', 'optimized', 'automated', 'orchestrated', 'streamlined',
    'pioneered', 'transformed', 'delivered', 'integrated', 'architected', 'maintained', 'mentored'
]);

export function calculateATSScore(resume: ResumeData, jobDescription?: string): ATSScoreResult | null {
    const feedback: string[] = [];
    const allText = JSON.stringify(resume).toLowerCase();
    const words = allText.split(/\W+/).filter(w => w.length > 2);

    // --- SEMANTIC VALIDATION LAYER ---
    const checkSemanticValidity = () => {
        if (words.length < 15) return false; // Too short to be valid

        // 1. Check for long random strings (gibberish)
        const longStrings = words.filter(w => w.length > 25);
        if (longStrings.length > 2) return false;

        // 2. Dictionary/Keyword Match Ratio
        const knownTokens = words.filter(w =>
            VALID_SKILLS.has(w) ||
            ACTION_VERBS.has(w) ||
            ['summary', 'experience', 'projects', 'education', 'skills', 'university', 'college', 'engineer', 'developer', 'manager', 'lead', 'achieved', 'managed'].includes(w)
        );

        const semanticRatio = knownTokens.length / Math.max(words.length, 1);

        // If less than 5% of content is recognizable career context, it's likely gibberish
        if (semanticRatio < 0.05 && words.length > 40) return false;

        return true;
    };

    const isValid = checkSemanticValidity();

    if (!isValid && words.length > 8) {
        return {
            score: 0,
            isValid: false,
            details: { keywords: 0, completeness: 0, metrics: 0, skills: 0, projectLinks: 0, cgpaBonus: 0, certBonus: 0 },
            feedback: ['Resume content appears invalid or contains mostly gibberish.'],
            isMatch: !!jobDescription
        };
    }

    // 1. Keyword & Tech Stack Relevance (JD Alignment) - 40%
    const getKeywordScore = () => {
        let score = 0;

        if (jobDescription) {
            const jdTerms = jobDescription.toLowerCase().split(/\W+/).filter(w => w.length > 3);
            const jdWords = new Set(jdTerms);

            if (jdWords.size > 0) {
                let matches = 0;
                jdWords.forEach(w => { if (allText.includes(w)) matches++; });

                const matchRatio = matches / Math.min(jdWords.size, 15);
                score = Math.min(40, matchRatio * 40);
            }
        } else {
            const baseKeywords = ['rest api', 'scalable', 'optimization', 'frontend', 'backend', 'database', 'testing', 'security', 'agile', 'git', 'ci/cd'];
            const matches = baseKeywords.filter(w => allText.includes(w)).length;
            score = Math.min(25, matches * 2.5);
        }

        return score;
    };

    const keywordWeight = getKeywordScore();

    // 2. Skill Match & Tech Depth - 25% (Now strictly uses VALID_SKILLS)
    const getSkillScore = () => {
        const foundSkills = Array.from(VALID_SKILLS).filter(s => allText.includes(s));
        let score = 0;

        if (foundSkills.length >= 8) score = 25;
        else if (foundSkills.length >= 5) score = 15;
        else if (foundSkills.length >= 2) score = 8;

        return score;
    };

    const skillsWeight = getSkillScore();

    // 3. Experience Match & Action Verbs - 20%
    const getExperienceScore = () => {
        const foundVerbs = Array.from(ACTION_VERBS).filter(v => allText.includes(v));
        return Math.min(20, (foundVerbs.length / 6) * 20);
    };

    const expWeight = getExperienceScore();

    // 4. Resume Completeness - 15%
    const getCompletenessScore = () => {
        let points = 0;
        if (resume.summary?.trim() && resume.summary.length > 25) points += 3;
        if ((resume.experience?.length || 0) > 0) points += 4;
        if ((resume.projects?.length || 0) > 0) points += 3;
        if ((resume.education?.length || 0) > 0) points += 2;
        if ((resume.skills?.length || 0) > 0 || (resume.skillCategories?.some(c => c.skills.length > 0))) points += 3;

        return points;
    };

    const completenessWeight = getCompletenessScore();

    // Final Total
    let total = keywordWeight + skillsWeight + expWeight + completenessWeight;

    // Strictness caps
    if (allText.length < 300) total = Math.min(total, 30);
    else if (allText.length < 800) total = Math.min(total, 70);

    total = Math.round(Math.min(100, Math.max(0, total)));

    return {
        score: total,
        isValid: true,
        details: {
            keywords: Math.round(keywordWeight),
            completeness: Math.round(completenessWeight),
            metrics: Math.round(expWeight),
            skills: Math.round(skillsWeight),
            projectLinks: 0,
            cgpaBonus: 0,
            certBonus: 0
        },
        feedback: feedback.slice(0, 3),
        isMatch: !!jobDescription,
    };
}

