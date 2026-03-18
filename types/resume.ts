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

// TemplateId is a plain string — covers both legacy and config-based IDs
export type TemplateId = string;
