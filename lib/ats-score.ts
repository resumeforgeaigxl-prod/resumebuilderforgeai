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

    // 1. Completeness (20 pts)
    let completeness = 0;
    if (hasName) completeness += 4;
    if (resume.summary?.trim()) completeness += 4; else feedback.push('Add a professional summary.');
    if ((resume.skills?.length ?? 0) >= 5 || (resume.skillCategories?.flatMap(c => c.skills).length ?? 0) >= 5) completeness += 4;
    else feedback.push('Add at least 5 skills across categories.');
    if ((resume.experience?.length ?? 0) >= 1) completeness += 4;
    if ((resume.education?.length ?? 0) >= 1) completeness += 4;

    // 2. Measurable metrics (20 pts)
    let metricCount = 0;
    (resume.experience ?? []).forEach(e => e.points?.forEach(p => { if (/\d+%|\$\d+|\d+x|\d+ (users|ms|sec|hrs|k|M)/.test(p)) metricCount++; }));
    (resume.projects ?? []).forEach(p => p.description?.forEach(d => { if (/\d+%|\$\d+|\d+x|\d+ /.test(d)) metricCount++; }));
    const metrics = Math.min(20, metricCount * 5);
    if (metricCount < 2) feedback.push('Quantify achievements with metrics (%, numbers, $).');

    // 3. Skills breadth (15 pts)
    const totalSkills = (resume.skillCategories?.flatMap(c => c.skills).length ?? 0) || (resume.skills?.length ?? 0);
    const skills = Math.min(15, totalSkills * 1.2);
    if (totalSkills < 10) feedback.push('Add more technical skills across categories for a higher score.');

    // 4. Project links (10 pts)
    let projLinks = 0;
    (resume.projects ?? []).forEach(p => {
        if (p.liveLink?.trim()) projLinks += 3;
        if (p.githubLink?.trim()) projLinks += 2;
    });
    projLinks = Math.min(10, projLinks);
    if (projLinks === 0 && (resume.projects?.length ?? 0) > 0) feedback.push('Add GitHub/live links to projects.');

    // 5. CGPA bonus (3 pts)
    const cgpaBonus = (resume.education ?? []).some(e => e.cgpa?.trim()) ? 3 : 0;

    // 6. Certifications bonus (5 pts)
    const certCount = resume.certifications?.length ?? 0;
    const certBonus = Math.min(5, certCount * 2);
    if (certCount === 0) feedback.push('Add certifications (AWS, GCP, etc.) for a higher ATS score.');

    // 7. Keyword match vs JD (27 pts if JD, else 17)
    let keywords = 0;
    if (jobDescription) {
        const jdWords = new Set(jobDescription.toLowerCase().split(/\W+/).filter(w => w.length > 3));
        const text = JSON.stringify(resume).toLowerCase();
        let matches = 0;
        jdWords.forEach(w => { if (text.includes(w)) matches++; });
        keywords = Math.min(27, Math.round((matches / Math.max(jdWords.size, 1)) * 54));
        if (keywords < 18) feedback.push('Your resume lacks key terms from the job description. AI Optimize can help.');
    } else {
        keywords = (resume.experience?.length ?? 0) > 0 ? 17 : 10;
    }

    const total = Math.min(100, Math.round(completeness + metrics + skills + projLinks + cgpaBonus + certBonus + keywords));

    return {
        score: total,
        details: { completeness, metrics, skills: Math.round(skills), keywords, projectLinks: projLinks, cgpaBonus, certBonus },
        feedback: feedback.slice(0, 3),
        isMatch: !!jobDescription,
    };
}
