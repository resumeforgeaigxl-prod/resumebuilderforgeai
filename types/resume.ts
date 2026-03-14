export interface ResumeExperience {
    id: string;
    company: string;
    role: string;
    duration: string;
    points: string[];
}

export interface ResumeProject {
    id: string;
    title: string;
    tech: string[];
    description: string[];
    liveLink?: string;
    githubLink?: string;
}

export interface ResumeEducation {
    id: string;
    school: string;
    degree: string;
    duration: string;
    cgpa?: string;
}

export interface Certification {
    id: string;
    title: string;
    issuer: string;
    year: string;
}

export interface SkillCategory {
    category: string;
    skills: string[];
}

export interface ResumeData {
    name: string;
    email: string;
    phone: string;
    location?: string;
    country?: string;
    linkedin: string;
    github: string;
    summary: string;
    skills: string[];
    skillCategories?: SkillCategory[];
    experience: ResumeExperience[];
    projects: ResumeProject[];
    education: ResumeEducation[];
    certifications?: Certification[];
}

export interface ResumeRecord {
    id: string;
    user_id: string;
    title: string;
    resume_json: ResumeData;
    template_selected: string;
    created_at: string;
    updated_at: string;
}

export const TEMPLATE_LIST = [
    { id: 'harvard', name: 'Harvard Classic', desc: 'Serif, centered name, bold headers', badge: '⭐ Top ATS' },
    { id: 'stanford', name: 'Stanford Clean', desc: 'Serif, left-aligned, authoritative', badge: '🎓 Academic' },
    { id: 'modern', name: 'Modern Minimal', desc: 'Sans-serif, thin ruled dividers', badge: '🎯 Tech Roles' },
    { id: 'compact', name: 'Compact Engineer', desc: 'Space-optimised, SDE layout', badge: '⚡ Max Content' },
    { id: 'executive', name: 'Executive Pro', desc: 'Bold headers, authoritative weight', badge: '💼 Leadership' },
    { id: 'minimal-divider', name: 'Minimal Divider', desc: 'No lines, clean whitespace hierarchy', badge: '✨ Ultra Clean' },
    { id: 'academic', name: 'Academic Structured', desc: 'Indented clean, academic format', badge: '📚 Research' },
    { id: 'ats-light', name: 'Ultra ATS Light', desc: 'Pure text, maximum ATS compatibility', badge: '🤖 ATS Safe' },
] as const;

export type TemplateId = (typeof TEMPLATE_LIST)[number]['id'];
