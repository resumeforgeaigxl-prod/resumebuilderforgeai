// Portfolio types — structured JSON only, no raw HTML

export interface PortfolioProject {
    title: string;
    description: string;
    tech: string[];
    github?: string;
    live?: string;
}

export interface PortfolioExperience {
    company: string;
    role: string;
    duration: string;
    points: string[];
}

export interface PortfolioEducation {
    school: string;
    degree: string;
    duration: string;
    cgpa?: string;
}

export interface PortfolioCertification {
    title: string;
    issuer: string;
    year: string;
}

export interface PortfolioData {
    name: string;
    headline: string;
    about: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    github?: string;
    website?: string;
    skills: string[];
    projects: PortfolioProject[];
    experience: PortfolioExperience[];
    education: PortfolioEducation[];
    certifications: PortfolioCertification[];
}

export type PortfolioTheme = 'minimal' | 'developer' | 'corporate';

export interface Portfolio {
    id: string;
    user_id: string;
    username: string;
    data: PortfolioData;
    theme: PortfolioTheme;
    is_public: boolean;
    preview_token: string | null;
    created_at: string;
    updated_at: string;
}

export const PORTFOLIO_THEMES: Array<{
    id: PortfolioTheme;
    name: string;
    desc: string;
    badge: string;
    proOnly: boolean;
}> = [
        { id: 'minimal', name: 'Minimal', desc: 'Clean, light, content-first', badge: '✨ Free', proOnly: false },
        { id: 'developer', name: 'Developer', desc: 'Dark terminal, code-inspired design', badge: '⚡ Pro', proOnly: true },
        { id: 'corporate', name: 'Corporate', desc: 'Dark navy, glass cards, executive', badge: '💼 Pro', proOnly: true },
    ];

// Valid username: lowercase letters, numbers, hyphens, 3-30 chars
export function isValidUsername(u: string): boolean {
    return /^[a-z0-9-]{3,30}$/.test(u);
}
