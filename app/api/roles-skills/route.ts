export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const LEGACY_ROLE_SKILLS_MAP: Record<string, string[]> = {
    "Frontend Developer": ["React", "TypeScript", "Next.js", "HTML5", "CSS3", "Tailwind CSS", "Redux Toolkit", "JavaScript (ES6+)", "Webpack", "Vite", "Sass", "Jest", "Cypress", "GraphQL", "REST APIs", "Git"],
    "Backend Developer": ["Node.js", "Express", "Python", "Django", "FastAPI", "Go", "PostgreSQL", "Redis", "Docker", "MongoDB", "REST APIs", "GraphQL", "Microservices", "AWS", "SQL", "Firebase"],
    "Full Stack Developer": ["React", "Node.js", "Express", "TypeScript", "Next.js", "PostgreSQL", "Docker", "Git", "Tailwind CSS", "MongoDB", "AWS", "REST APIs", "GraphQL", "HTML5", "CSS3", "Redis"],
    "DevOps Engineer": ["AWS", "Docker", "Kubernetes", "CI/CD", "GitHub Actions", "Terraform", "Linux", "Ansible", "Nginx", "Prometheus", "Grafana", "Jenkins", "Bash Scripting", "Google Cloud (GCP)", "Microsoft Azure"],
    "Data Analyst / Scientist": ["Python", "SQL", "Pandas", "NumPy", "Tableau", "PowerBI", "Machine Learning", "Scikit-Learn", "Jupyter Notebooks", "R", "Excel", "Matplotlib", "Seaborn", "Statistics", "BigQuery"],
    "Mobile App Developer": ["React Native", "Flutter", "Swift", "Kotlin", "iOS", "Android", "Firebase", "Dart", "Objective-C", "App Store Connect", "Google Play Console", "Native Modules"],
    "UI/UX Designer": ["Figma", "Adobe XD", "Wireframing", "Prototyping", "User Research", "Design Systems", "Framer", "Illustrator", "Photoshop", "Interaction Design", "User Flows"],
    "QA / Testing Engineer": ["Selenium", "Jest", "Cypress", "Postman", "Automation", "Manual Testing", "Playwright", "Mocha", "Chai", "CI/CD Integration", "Bug Tracking", "API Testing"]
};

export async function GET() {
    try {
        const supabase = createClient();
        
        // Fetch seeded roles and skills from the database
        const { data, error } = await supabase
            .from('role_skills_map')
            .select('role_name, categories, all_skills');
            
        if (error || !data || data.length === 0) {
            console.warn('[RolesSkillsAPI] Table empty or query failed, serving legacy fallback. Details:', error?.message);
            return NextResponse.json({
                success: true,
                roles: LEGACY_ROLE_SKILLS_MAP,
                fallback: true
            });
        }

        const rolesMap: Record<string, string[]> = {};
        const categorizedMap: Record<string, Record<string, string[]>> = {};

        // Parse database values into API contract formatting
        data.forEach(row => {
            const roleName = row.role_name;
            const cats = typeof row.categories === 'string' ? JSON.parse(row.categories) : row.categories;
            
            // Format categories: extract all values to form a clean flat list of strings
            const flatSkills: string[] = [];
            Object.values(cats).forEach((skillArr) => {
                if (Array.isArray(skillArr)) {
                    flatSkills.push(...skillArr);
                }
            });

            rolesMap[roleName] = flatSkills.length > 0 ? flatSkills : (row.all_skills || []);
            categorizedMap[roleName] = cats;
        });

        return NextResponse.json({
            success: true,
            roles: rolesMap,
            rolesCategorized: categorizedMap,
            fallback: false
        });

    } catch (err: unknown) {
        console.error('[RolesSkillsAPI] Unexpected route error, serving legacy fallback:', err);
        return NextResponse.json({
            success: true,
            roles: LEGACY_ROLE_SKILLS_MAP,
            fallback: true
        });
    }
}
