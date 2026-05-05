import { calculateATSScore } from '@/lib/ats-score';
import { ResumeData } from '@/types/resume';

describe('calculateATSScore', () => {
    const mockResume: ResumeData = {
        id: '1',
        summary: 'Experienced React Developer with 5 years of experience in building scalable web applications using Next.js and Node.js.',
        experience: [
            {
                company: 'Tech Corp',
                role: 'Senior Developer',
                duration: '2020 - Present',
                description: 'Led a team of 5 developers to optimize the performance of the main dashboard, resulting in a 40% increase in load speed. Automated CI/CD pipelines using Docker and AWS.'
            }
        ],
        projects: [
            {
                name: 'E-commerce Platform',
                description: 'Built a high-performance e-commerce platform using Next.js and PostgreSQL.'
            }
        ],
        education: [
            {
                institution: 'Tech University',
                degree: 'Bachelor of Science in Computer Science',
                year: '2019'
            }
        ],
        skills: {
            languages: ['JavaScript', 'TypeScript', 'Python'],
            frameworks: ['React', 'Next.js', 'Node.js', 'Tailwind'],
            tools: ['Git', 'Docker', 'AWS'],
            other: ['System Design', 'Agile']
        }
    } as any;

    it('should calculate a high score for a valid, rich resume', () => {
        const result = calculateATSScore(mockResume);
        expect(result).not.toBeNull();
        expect(result?.isValid).toBe(true);
        expect(result?.score).toBeGreaterThan(70);
    });

    it('should detect invalid/gibberish content', () => {
        const gibberishResume: ResumeData = {
            summary: 'asdfasdf asdfasdf asdfasdf asdfasdf asdfasdf asdfasdf asdfasdf asdfasdf',
            experience: [],
            projects: [],
            education: [],
            skills: { languages: [], frameworks: [], tools: [], other: [] }
        } as any;

        const result = calculateATSScore(gibberishResume);
        expect(result?.isValid).toBe(false);
        expect(result?.score).toBe(0);
    });

    it('should align score with job description keywords', () => {
        const jd = 'Looking for a React developer proficient in Next.js, TypeScript, and AWS.';
        const result = calculateATSScore(mockResume, jd);
        
        expect(result?.isMatch).toBe(true);
        expect(result?.score).toBeGreaterThan(80);
    });
});
