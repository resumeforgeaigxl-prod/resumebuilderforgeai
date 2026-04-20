export interface ResumeExperience {
    id: string;
    company: string;
    role: string;
    duration: string;
    points: string[];
}

export interface ResumeProject {
    id: string;
    name: string; // was title
    tech: string[];
    description: string[];
    link?: string; // consolidated liveLink/githubLink
    // Legacy support
    title?: string;
    liveLink?: string;
    githubLink?: string;
}

export interface ResumeEducation {
    id: string;
    institution: string; // was school
    degree: string;
    year: string; // was duration
    score?: string; // was cgpa
    // Legacy support
    school?: string;
    duration?: string;
    cgpa?: string;
}

export interface Certification {
    id: string;
    title: string;
    issuer: string;
    year: string;
}

export interface ResumeSkills {
    languages: string[];
    frameworks: string[];
    tools: string[];
    other: string[];
}

export interface ResumeData {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    summary: string;
    skills: ResumeSkills;
    experience: ResumeExperience[];
    projects: ResumeProject[];
    education: ResumeEducation[];
    certifications: Certification[];
    // Legacy support
    skillCategories?: { category: string; skills: string[] }[];
    country?: string;
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
