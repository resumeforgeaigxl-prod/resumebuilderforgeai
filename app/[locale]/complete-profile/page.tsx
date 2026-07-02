"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
    UserCheck, Loader2, ChevronLeft, ChevronRight, 
    Check, Briefcase, AlertCircle, ShieldAlert, Award,
    Linkedin, Github
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ResumeUpload } from '@/components/dashboard/resume-upload';

const REFERRAL_OPTIONS = [
    { label: "LinkedIn", value: "linkedin" },
    { label: "Google Search", value: "google" },
    { label: "X / Twitter", value: "twitter" },
    { label: "GitHub", value: "github" },
    { label: "YouTube", value: "youtube" },
    { label: "Friend / Word of Mouth", value: "word_of_mouth" },
    { label: "Other", value: "other" }
];
const INDIAN_COLLEGES_FALLBACK = [
    "Indian Institute of Technology Delhi (IIT Delhi)",
    "Indian Institute of Technology Bombay (IIT Bombay)",
    "Indian Institute of Technology Madras (IIT Madras)",
    "Indian Institute of Technology Kharagpur (IIT Kharagpur)",
    "Indian Institute of Technology Kanpur (IIT Kanpur)",
    "Indian Institute of Technology Roorkee (IIT Roorkee)",
    "Indian Institute of Science Bangalore (IISc)",
    "Birla Institute of Technology and Science, Pilani (BITS Pilani)",
    "National Institute of Technology, Trichy (NIT Trichy)",
    "National Institute of Technology, Surathkal (NIT Surathkal)",
    "International Institute of Information Technology, Hyderabad (IIIT Hyderabad)",
    "International Institute of Information Technology, Bangalore (IIIT Bangalore)",
    "Delhi Technological University (DTU)",
    "Netaji Subhas University of Technology (NSUT)",
    "Vellore Institute of Technology (VIT Vellore)",
    "SRM Institute of Science and Technology (SRM University)",
    "Manipal Institute of Technology (MIT Manipal)",
    "R.V. College of Engineering (RVCE)",
    "PES University (PESU)",
    "Delhi University (DU)",
    "Mumbai University",
    "Anna University",
    "Jawaharlal Nehru University (JNU)"
];

const ROLE_SKILLS_MAP: Record<string, string[]> = {
    "Frontend Developer": ["React", "TypeScript", "Next.js", "HTML5", "CSS3", "Tailwind CSS", "Redux Toolkit", "JavaScript (ES6+)", "Webpack", "Vite", "Sass", "Jest", "Cypress", "GraphQL", "REST APIs", "Git"],
    "Backend Developer": ["Node.js", "Express", "Python", "Django", "FastAPI", "Go", "PostgreSQL", "Redis", "Docker", "MongoDB", "REST APIs", "GraphQL", "Microservices", "AWS", "SQL", "Firebase"],
    "Full Stack Developer": ["React", "Node.js", "Express", "TypeScript", "Next.js", "PostgreSQL", "Docker", "Git", "Tailwind CSS", "MongoDB", "AWS", "REST APIs", "GraphQL", "HTML5", "CSS3", "Redis"],
    "DevOps Engineer": ["AWS", "Docker", "Kubernetes", "CI/CD", "GitHub Actions", "Terraform", "Linux", "Ansible", "Nginx", "Prometheus", "Grafana", "Jenkins", "Bash Scripting", "Google Cloud (GCP)", "Microsoft Azure"],
    "Data Analyst / Scientist": ["Python", "SQL", "Pandas", "NumPy", "Tableau", "PowerBI", "Machine Learning", "Scikit-Learn", "Jupyter Notebooks", "R", "Excel", "Matplotlib", "Seaborn", "Statistics", "BigQuery"],
    "Mobile App Developer": ["React Native", "Flutter", "Swift", "Kotlin", "iOS", "Android", "Firebase", "Dart", "Objective-C", "App Store Connect", "Google Play Console", "Native Modules"],
    "UI/UX Designer": ["Figma", "Adobe XD", "Wireframing", "Prototyping", "User Research", "Design Systems", "Framer", "Illustrator", "Photoshop", "Interaction Design", "User Flows"],
    "QA / Testing Engineer": ["Selenium", "Jest", "Cypress", "Postman", "Automation", "Manual Testing", "Playwright", "Mocha", "Chai", "CI/CD Integration", "Bug Tracking", "API Testing"]
};

export default function CompleteProfilePage() {
    const params = useParams() as { locale: string };
    const locale = params.locale || 'en-in';
    const router = useRouter();
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 8;

    const [showManualOnboarding, setShowManualOnboarding] = useState(false);
    const [isAutoUploading, setIsAutoUploading] = useState(false);

    const handleResumeUploadSuccess = useCallback(async () => {
        setIsAutoUploading(true);
        try {
            const res = await fetch('/api/user/profile');
            if (res.ok) {
                const data = await res.json();
                if (data?.user?.profile_completed) {
                    router.push(`/${locale}/dashboard?onboarding=success`);
                    router.refresh();
                    return;
                }
            }
            router.push(`/${locale}/dashboard?onboarding=success`);
            router.refresh();
        } catch (err) {
            console.error("Profile complete redirect failed", err);
            setError("Resume parsed, but session refresh failed. Please refresh your page.");
        } finally {
            setIsAutoUploading(false);
        }
    }, [locale, router]);

    const handleResumeUploadError = useCallback((errStr: string) => {
        setError(errStr);
    }, []);

    const [form, setForm] = useState({
        referralSource: '',
        fullName: '',
        phone: '',
        experience: 'Beginner',
        college: '',
        skills: [] as string[],
        linkedinUrl: '',
        githubUrl: '',
        portfolioUrl: '',
        targetRole: '',
        preferredWorkMode: 'Remote',
        professionalSummary: '',
        education: {
            tenth: { institution: '', passingYear: '', score: '' },
            twelfth: { institution: '', passingYear: '', score: '' },
            diploma: { institution: '', passingYear: '', score: '', enabled: false },
            btech: { institution: '', passingYear: '', score: '' },
            masters: { institution: '', passingYear: '', score: '', enabled: false }
        }
    });
    const [skillInput, setSkillInput] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);

    // College suggestions states
    const [collegeSuggestions, setCollegeSuggestions] = useState<string[]>([]);
    const [showCollegeSuggestions, setShowCollegeSuggestions] = useState(false);
    const [isCollegeLoading, setIsCollegeLoading] = useState(false);
    const [justSelectedCollege, setJustSelectedCollege] = useState(false);
    const [collegeQuery, setCollegeQuery] = useState('');
    const [activeEducationTab, setActiveEducationTab] = useState<'tenth' | 'twelfth' | 'diploma' | 'btech' | 'masters'>('tenth');
    
    // Target role recommendation state
    const [selectedRole, setSelectedRole] = useState('');
    const [roleSkillsMap, setRoleSkillsMap] = useState<Record<string, string[]>>(ROLE_SKILLS_MAP);

    useEffect(() => {
        const fetchRoleSkills = async () => {
            try {
                const res = await fetch('/api/roles-skills');
                if (res.ok) {
                    const data = await res.json();
                    if (data?.success && data?.roles) {
                        setRoleSkillsMap(data.roles);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch database role skills", err);
            }
        };
        fetchRoleSkills();
    }, []);


    // College autocomplete search logic
    useEffect(() => {
        if (justSelectedCollege) return;
        
        const query = collegeQuery.trim();
        if (query.length < 2) {
            setCollegeSuggestions([]);
            return;
        }

        // 1. Filter local fallback list
        const localMatches = INDIAN_COLLEGES_FALLBACK.filter(c => 
            c.toLowerCase().includes(query.toLowerCase())
        );
        setCollegeSuggestions(localMatches);

        // 2. Fetch from HipoLabs API (debounced)
        setIsCollegeLoading(true);
        const delayDebounce = setTimeout(async () => {
            try {
                const res = await fetch(`http://universities.hipolabs.com/search?name=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json() as Array<{ name: string; country: string }>;
                    const apiMatches = data.map(item => item.name);
                    
                    setCollegeSuggestions(prev => {
                        const merged = Array.from(new Set([...prev, ...apiMatches]));
                        return merged.slice(0, 8); // Top 8 suggestions
                    });
                }
            } catch (err) {
                console.error("Failed to fetch college suggestions", err);
            } finally {
                setIsCollegeLoading(false);
            }
        }, 300);

        return () => {
            clearTimeout(delayDebounce);
            setIsCollegeLoading(false);
        };
    }, [collegeQuery, justSelectedCollege]);

    // Handle selection from dropdown
    const handleSelectCollege = (collegeName: string) => {
        setJustSelectedCollege(true);
        setForm(prev => ({
            ...prev,
            education: {
                ...prev.education,
                [activeEducationTab]: {
                    ...prev.education[activeEducationTab],
                    institution: collegeName
                }
            }
        }));
        setShowCollegeSuggestions(false);
    };

    // Close suggestions dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.college-autocomplete-wrapper')) {
                setShowCollegeSuggestions(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const checkAuth = useCallback(async () => {
        try {
            const res = await fetch('/api/user/profile');
            if (res.ok) {
                const data = await res.json();
                if (data.user) {
                    setForm(prev => {
                        const loadedEducation = data.user.education || {};
                        return {
                            ...prev,
                            fullName: data.user.full_name || prev.fullName,
                            phone: data.user.phone_number || prev.phone,
                            referralSource: data.user.referral_source || prev.referralSource,
                            experience: data.user.experience_level || prev.experience,
                            linkedinUrl: data.user.linkedin_url || prev.linkedinUrl,
                            githubUrl: data.user.github_url || prev.githubUrl,
                            portfolioUrl: data.user.portfolio_url || prev.portfolioUrl,
                            targetRole: data.user.target_role || prev.targetRole,
                            preferredWorkMode: data.user.preferred_work_mode || prev.preferredWorkMode || 'Remote',
                            professionalSummary: data.user.professional_summary || prev.professionalSummary,
                            skills: data.user.skills || prev.skills,
                            education: {
                                tenth: loadedEducation.tenth || prev.education.tenth,
                                twelfth: loadedEducation.twelfth || prev.education.twelfth,
                                diploma: {
                                    institution: loadedEducation.diploma?.institution || '',
                                    passingYear: loadedEducation.diploma?.passingYear || '',
                                    score: loadedEducation.diploma?.score || '',
                                    enabled: !!loadedEducation.diploma?.institution
                                },
                                btech: loadedEducation.btech || prev.education.btech,
                                masters: {
                                    institution: loadedEducation.masters?.institution || '',
                                    passingYear: loadedEducation.masters?.passingYear || '',
                                    score: loadedEducation.masters?.score || '',
                                    enabled: !!loadedEducation.masters?.institution
                                }
                            }
                        };
                    });
                }
            }
        } catch (err) {
            console.error("Auth check failed", err);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const handleAddSkill = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const trimmed = skillInput.trim().replace(/,/g, '');
            if (trimmed && !form.skills.includes(trimmed)) {
                setForm(prev => ({
                    ...prev,
                    skills: [...prev.skills, trimmed]
                }));
            }
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setForm(prev => ({
            ...prev,
            skills: prev.skills.filter(s => s !== skillToRemove)
        }));
    };

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Validation per step
    const canContinue = () => {
        switch (currentStep) {
            case 1: return !!form.referralSource;
            case 2: return !!form.fullName.trim();
            case 3: return form.phone.length >= 10;
            case 4: return true; // Social links are optional
            case 5: return form.targetRole.trim().length > 0 && !!form.preferredWorkMode && form.professionalSummary.trim().length >= 10;
            case 6: {
                const { tenth, twelfth, diploma, btech, masters } = form.education;
                
                const isTenthValid = !!(tenth.institution.trim() && tenth.passingYear && tenth.score.trim());
                const isBtechValid = !!(btech.institution.trim() && btech.passingYear && btech.score.trim());
                
                let isTwelfthOrDiplomaValid = false;
                if (diploma.enabled) {
                    isTwelfthOrDiplomaValid = !!(diploma.institution.trim() && diploma.passingYear && diploma.score.trim());
                } else {
                    isTwelfthOrDiplomaValid = !!(twelfth.institution.trim() && twelfth.passingYear && twelfth.score.trim());
                }
                
                let isMastersValid = true;
                if (masters.enabled) {
                    isMastersValid = !!(masters.institution.trim() && masters.passingYear && masters.score.trim());
                }
                
                return isTenthValid && isBtechValid && isTwelfthOrDiplomaValid && isMastersValid;
            }
            case 7: return form.skills.length > 0;
            case 8: return termsAccepted;
            default: return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentStep < totalSteps) {
            if (canContinue()) {
                nextStep();
            }
            return;
        }
        
        if (!canContinue()) return;
        
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/user/complete-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: form.fullName,
                    phone: form.phone,
                    college: form.education.btech.institution || form.college,
                    skills: form.skills.join(', '),
                    experience: form.experience,
                    referralSource: form.referralSource,
                    linkedinUrl: form.linkedinUrl,
                    githubUrl: form.githubUrl,
                    portfolioUrl: form.portfolioUrl,
                    targetRole: form.targetRole,
                    preferredWorkMode: form.preferredWorkMode,
                    education: form.education,
                    professionalSummary: form.professionalSummary
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to update profile');
            }

            router.push(`/${locale}/dashboard?onboarding=success`);
            router.refresh();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong.');
            setCurrentStep(8); // Jump back to review screen to display error
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fafaf9] select-none font-sans relative flex flex-col justify-between">
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-in {
                    animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}} />

            <div className="max-w-[1200px] w-full mx-auto border-x border-[#e7e5e4] bg-white flex flex-col justify-between min-h-screen shadow-sm">
                {/* Onboarding Header (matching the landing page navbar layout) */}
                <header className="flex h-16 items-center justify-between px-6 border-b border-[#e7e5e4] bg-white select-none shrink-0">
                    <Link href={`/${locale}`} className="flex items-center gap-2.5 select-none">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#171717]">
                            <span className="text-white font-bold text-[12px] tracking-tight">RF</span>
                        </div>
                        <span className="text-[#171717] font-semibold text-sm tracking-tight">ResumeForge AI</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-semibold text-[#8F8F8F] uppercase tracking-wider">Onboarding Wizard</span>
                    </div>
                </header>

                {/* Main Split Body */}
                <div className="flex-1 flex flex-col md:flex-row border-b border-[#e7e5e4] overflow-hidden">
                    {/* Left Pane: Pixel Art Illustration */}
                    <div className="hidden md:flex md:w-1/2 bg-[#fafaf9] border-r border-[#e7e5e4] items-center justify-center p-8 relative overflow-hidden">
                        <div className="absolute inset-0 bg-cover bg-center opacity-90" style={{ backgroundImage: "url('/hero-landscape.png')" }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
                        
                        {/* Floating overlay card for premium look */}
                        <div className="z-10 bg-white/90 backdrop-blur-md border border-[#EBEBEB] p-6 rounded-2xl max-w-sm shadow-[0_4px_24px_rgba(0,0,0,0.06)] space-y-3">
                            <div className="flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-[#171717]" />
                                <span className="text-sm font-semibold text-[#171717] tracking-tight">ResumeForge AI</span>
                            </div>
                            <p className="text-xs text-[#4D4D4D] leading-relaxed">
                                Complete your profile to allow our AI engine to tailor professional resumes, run ATS checks, and match your skills to matching developer job opportunities.
                            </p>
                        </div>
                    </div>

                    {/* Right Pane: Onboarding Form or Resume Upload */}
                    <div className="w-full md:w-1/2 flex flex-col justify-center p-6 md:p-12 bg-white min-h-[500px]">
                        <div className="w-full max-w-md mx-auto space-y-6">
                            {!showManualOnboarding ? (
                                <div className="space-y-6 animate-slide-in">
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-bold tracking-tight text-[#171717]">
                                            Complete Your Profile Instantly
                                        </h2>
                                        <p className="text-sm text-[#4D4D4D] leading-relaxed">
                                            Upload your resume to automatically import your education, skills, target role, and experience in 1 click.
                                        </p>
                                    </div>

                                    {error && (
                                        <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-600 flex items-start gap-2.5">
                                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    {isAutoUploading ? (
                                        <div className="py-12 flex flex-col items-center justify-center space-y-3">
                                            <Loader2 className="w-8 h-8 animate-spin text-[#171717]" />
                                            <p className="text-xs font-mono text-stone-500">Creating your account workspace...</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <ResumeUpload 
                                                onUploadSuccess={handleResumeUploadSuccess} 
                                                onUploadError={handleResumeUploadError} 
                                            />

                                            <div className="relative flex py-2 items-center">
                                                <div className="flex-grow border-t border-[#EBEBEB]" />
                                                <span className="flex-shrink mx-4 text-[10px] font-mono text-stone-455 uppercase tracking-widest text-stone-400">Or</span>
                                                <div className="flex-grow border-t border-[#EBEBEB]" />
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setShowManualOnboarding(true)}
                                                className="w-full py-3.5 bg-[#FAFAFA] border border-[#EBEBEB] hover:bg-[#F5F5F5] hover:border-[#171717]/25 text-[#171717] rounded-xl text-xs font-semibold transition-all cursor-pointer text-center"
                                            >
                                                Fill details manually (8 steps)
                                            </button>
                                        </div>
                                    )}

                                    <p className="text-[10px] text-center text-[#8F8F8F] leading-normal px-4">
                                        By uploading your resume, you agree to our <Link href={`/${locale}/terms`} className="underline hover:text-[#171717]">Terms of Service</Link> and <Link href={`/${locale}/privacy`} className="underline hover:text-[#171717]">Privacy Policy</Link>.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Step Indicator */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 bg-[#171717] rounded-full flex items-center justify-center font-bold text-white text-[10px] tracking-tight border border-[#171717] shadow-sm select-none">
                                                RF
                                            </div>
                                            <span className="text-[#171717] font-semibold text-xs tracking-tight">Onboarding</span>
                                        </div>
                                        <span className="text-[10px] font-mono font-semibold text-[#8F8F8F] uppercase tracking-wider">
                                            Step {currentStep} of {totalSteps}
                                        </span>
                                    </div>
                                    
                                    {/* Progress Bar */}
                                    <div className="w-full bg-[#FAFAFA] border border-[#EBEBEB] h-1.5 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-[#171717] h-full transition-all duration-300 rounded-full"
                                            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                                        />
                                    </div>

                                    {/* Form Screen wrapper */}
                                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* STEP 1: Referral */}
                        {currentStep === 1 && (
                            <div className="space-y-5 animate-slide-in">
                                <div className="space-y-1.5">
                                    <h2 className="text-xl font-semibold tracking-tight text-[#171717]">Where did you find out about us?</h2>
                                    <p className="text-xs text-[#8F8F8F]">Help us understand how you discovered the ResumeForge AI platform.</p>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                                    {REFERRAL_OPTIONS.map((opt) => {
                                        const isSelected = form.referralSource === opt.value;
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => {
                                                    setForm(prev => ({ ...prev, referralSource: opt.value }));
                                                    setTimeout(nextStep, 250); // Small delay for visual selection feedback
                                                }}
                                                className={`px-4 py-3 border text-xs font-semibold rounded-lg text-center transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-[#171717] border-[#171717] text-white shadow-sm'
                                                        : 'bg-white border-[#EBEBEB] text-[#4D4D4D] hover:bg-[#FAFAFA] hover:text-[#171717]'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Full Name */}
                        {currentStep === 2 && (
                            <div className="space-y-5 animate-slide-in">
                                <div className="space-y-1.5">
                                    <h2 className="text-xl font-semibold tracking-tight text-[#171717]">What is your full name?</h2>
                                    <p className="text-xs text-[#8F8F8F]">Please enter your complete professional name for the resumes.</p>
                                </div>
                                <div className="pt-2">
                                    <input 
                                        type="text"
                                        required
                                        autoFocus
                                        value={form.fullName}
                                        onChange={e => setForm({ ...form, fullName: e.target.value })}
                                        className="w-full px-5 py-4 bg-gradient-to-r from-[#FAFAFA] to-white hover:from-[#F5F5F5] hover:to-[#FAFAFA] border border-[#EBEBEB] focus:border-[#171717] focus:ring-1 focus:ring-[#171717] rounded-xl text-[#171717] placeholder:text-[#8F8F8F] focus:outline-none transition-all font-medium shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] text-sm"
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Phone */}
                        {currentStep === 3 && (
                            <div className="space-y-5 animate-slide-in">
                                <div className="space-y-1.5">
                                    <h2 className="text-xl font-semibold tracking-tight text-[#171717]">What is your mobile number?</h2>
                                    <p className="text-xs text-[#8F8F8F]">Required for secure job application contact fields.</p>
                                </div>
                                <div className="pt-2">
                                    <input 
                                        type="tel"
                                        required
                                        autoFocus
                                        value={form.phone}
                                        onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                                        className="w-full px-5 py-4 bg-gradient-to-r from-[#FAFAFA] to-white hover:from-[#F5F5F5] hover:to-[#FAFAFA] border border-[#EBEBEB] focus:border-[#171717] focus:ring-1 focus:ring-[#171717] rounded-xl text-[#171717] placeholder:text-[#8F8F8F] focus:outline-none transition-all font-medium shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] text-sm"
                                        placeholder="Enter 10-digit number"
                                    />
                                </div>
                            </div>
                        )}

                        {/* STEP 4: Social Profiles */}
                        {currentStep === 4 && (
                            <div className="space-y-4 animate-slide-in">
                                <div className="space-y-1">
                                    <h2 className="text-xl font-semibold tracking-tight text-[#171717]">Professional Profiles</h2>
                                    <p className="text-xs text-[#8F8F8F]">Link your professional network and code repositories (optional).</p>
                                </div>
                                <div className="space-y-3 pt-1">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-mono font-semibold text-[#8F8F8F] uppercase tracking-wider flex items-center gap-1">
                                            <Linkedin className="w-3.5 h-3.5 text-[#0077b5]" /> LinkedIn URL
                                        </label>
                                        <input 
                                            type="url"
                                            value={form.linkedinUrl}
                                            onChange={e => setForm({ ...form, linkedinUrl: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gradient-to-r from-[#FAFAFA] to-white hover:from-[#F5F5F5] hover:to-[#FAFAFA] border border-[#EBEBEB] focus:border-[#171717] focus:ring-1 focus:ring-[#171717] rounded-xl text-xs text-[#171717] placeholder:text-[#8F8F8F] focus:outline-none transition-all font-medium shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                                            placeholder="https://linkedin.com/in/username"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-mono font-semibold text-[#8F8F8F] uppercase tracking-wider flex items-center gap-1">
                                            <Github className="w-3.5 h-3.5 text-[#171717]" /> GitHub URL
                                        </label>
                                        <input 
                                            type="url"
                                            value={form.githubUrl}
                                            onChange={e => setForm({ ...form, githubUrl: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gradient-to-r from-[#FAFAFA] to-white hover:from-[#F5F5F5] hover:to-[#FAFAFA] border border-[#EBEBEB] focus:border-[#171717] focus:ring-1 focus:ring-[#171717] rounded-xl text-xs text-[#171717] placeholder:text-[#8F8F8F] focus:outline-none transition-all font-medium shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                                            placeholder="https://github.com/username"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-mono font-semibold text-[#8F8F8F] uppercase tracking-wider flex items-center gap-1">
                                            <Award className="w-3.5 h-3.5 text-indigo-500" /> Portfolio / Website URL
                                        </label>
                                        <input 
                                            type="url"
                                            value={form.portfolioUrl}
                                            onChange={e => setForm({ ...form, portfolioUrl: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gradient-to-r from-[#FAFAFA] to-white hover:from-[#F5F5F5] hover:to-[#FAFAFA] border border-[#EBEBEB] focus:border-[#171717] focus:ring-1 focus:ring-[#171717] rounded-xl text-xs text-[#171717] placeholder:text-[#8F8F8F] focus:outline-none transition-all font-medium shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                                            placeholder="https://yourportfolio.com"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 5: Career Focus & Summary */}
                        {currentStep === 5 && (
                            <div className="space-y-4 animate-slide-in">
                                <div className="space-y-1">
                                    <h2 className="text-xl font-semibold tracking-tight text-[#171717]">Career Focus</h2>
                                    <p className="text-xs text-[#8F8F8F]">Help us understand your target role and work style preferences.</p>
                                </div>
                                <div className="space-y-3 pt-1">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-mono font-semibold text-[#8F8F8F] uppercase tracking-wider">Target Job Title / Role</label>
                                            <input 
                                                type="text"
                                                required
                                                value={form.targetRole}
                                                onChange={e => setForm({ ...form, targetRole: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-gradient-to-r from-[#FAFAFA] to-white hover:from-[#F5F5F5] hover:to-[#FAFAFA] border border-[#EBEBEB] focus:border-[#171717] focus:ring-1 focus:ring-[#171717] rounded-xl text-xs text-[#171717] placeholder:text-[#8F8F8F] focus:outline-none transition-all font-medium shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                                                placeholder="e.g. Full Stack Developer"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] font-mono font-semibold text-[#8F8F8F] uppercase tracking-wider">Preferred Work Mode</label>
                                            <select
                                                required
                                                value={form.preferredWorkMode}
                                                onChange={e => setForm({ ...form, preferredWorkMode: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#EBEBEB] focus:border-[#171717] rounded-xl text-xs font-semibold text-[#4D4D4D] focus:outline-none transition-all cursor-pointer shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                                            >
                                                <option value="Remote">Remote</option>
                                                <option value="Hybrid">Hybrid</option>
                                                <option value="On-site">On-site</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Quick Role Suggestions */}
                                    <div className="flex flex-wrap gap-1">
                                        {["Frontend Developer", "Backend Developer", "Full Stack Developer", "DevOps Engineer"].map(role => (
                                            <button
                                                key={role}
                                                type="button"
                                                onClick={() => setForm({ ...form, targetRole: role })}
                                                className="px-2 py-0.5 text-[9px] font-semibold rounded bg-[#FAFAFA] border border-[#EBEBEB] text-[#4D4D4D] hover:border-[#171717] hover:text-[#171717] transition-all cursor-pointer"
                                            >
                                                {role}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-mono font-semibold text-[#8F8F8F] uppercase tracking-wider">Describe Yourself (Professional Bio)</label>
                                        <textarea 
                                            required
                                            rows={3}
                                            value={form.professionalSummary}
                                            onChange={e => setForm({ ...form, professionalSummary: e.target.value })}
                                            className="w-full px-4 py-3 bg-gradient-to-r from-[#FAFAFA] to-white hover:from-[#F5F5F5] hover:to-[#FAFAFA] border border-[#EBEBEB] focus:border-[#171717] focus:ring-1 focus:ring-[#171717] rounded-xl text-xs text-[#171717] placeholder:text-[#8F8F8F] focus:outline-none transition-all font-medium resize-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                                            placeholder="e.g. Passionate software engineer with experience in React and Node.js. Skilled in building scalable web applications and collaborating with cross-functional teams."
                                        />
                                        <div className="flex justify-between items-center text-[9px] font-mono text-[#8F8F8F] mt-0.5">
                                            <span>Min 10 characters required</span>
                                            <span>{form.professionalSummary.length} characters</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 6: Education Details */}
                        {currentStep === 6 && (
                            <div className="space-y-5 animate-slide-in relative">
                                <div className="space-y-1.5">
                                    <h2 className="text-xl font-semibold tracking-tight text-[#171717]">Academic Credentials</h2>
                                    <p className="text-xs text-[#8F8F8F]">Enter your marks/grades, year of passing, and institute details.</p>
                                </div>

                                {/* Tab Buttons */}
                                <div className="flex flex-wrap gap-1 border-b border-[#EBEBEB] pb-2">
                                    {[
                                        { key: 'tenth', label: '10th' },
                                        { key: 'twelfth', label: '12th' },
                                        { key: 'diploma', label: 'Diploma' },
                                        { key: 'btech', label: 'B.Tech / Degree' },
                                        { key: 'masters', label: 'Masters / M.Tech' }
                                    ].map(tab => {
                                        const isSelected = activeEducationTab === tab.key;
                                        const isEnabled = tab.key === 'tenth' || tab.key === 'btech' || tab.key === 'twelfth' || 
                                            (tab.key === 'diploma' && form.education.diploma.enabled) ||
                                            (tab.key === 'masters' && form.education.masters.enabled);
                                            
                                        if (tab.key === 'twelfth' && form.education.diploma.enabled) return null;
                                        if (tab.key === 'diploma' && !form.education.diploma.enabled && activeEducationTab === 'diploma') return null;
                                        if (tab.key === 'masters' && !form.education.masters.enabled && activeEducationTab === 'masters') return null;

                                        const item = form.education[tab.key as keyof typeof form.education];
                                        const isFilled = !!(item.institution.trim() && item.passingYear && item.score.trim());

                                        return (
                                            <button
                                                key={tab.key}
                                                type="button"
                                                onClick={() => setActiveEducationTab(tab.key as any)}
                                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                                                    isSelected
                                                        ? 'bg-[#171717] border-[#171717] text-white shadow-sm'
                                                        : isEnabled
                                                            ? 'bg-white border-[#EBEBEB] text-[#4D4D4D] hover:bg-[#FAFAFA]'
                                                            : 'hidden'
                                                }`}
                                            >
                                                {tab.label}
                                                {isEnabled && isFilled && <Check className="w-3 h-3 text-green-500" />}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Optional Toggles */}
                                <div className="flex gap-4 text-xs">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input 
                                            type="checkbox"
                                            checked={form.education.diploma.enabled}
                                            onChange={e => {
                                                const checked = e.target.checked;
                                                setForm(prev => ({
                                                    ...prev,
                                                    education: {
                                                        ...prev.education,
                                                        diploma: { ...prev.education.diploma, enabled: checked }
                                                    }
                                                }));
                                                if (checked) {
                                                    setActiveEducationTab('diploma');
                                                } else {
                                                    setActiveEducationTab('twelfth');
                                                }
                                            }}
                                            className="w-3.5 h-3.5 rounded border-[#EBEBEB] accent-[#171717]"
                                        />
                                        <span className="text-[#8F8F8F] font-semibold">I did a Diploma</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input 
                                            type="checkbox"
                                            checked={form.education.masters.enabled}
                                            onChange={e => {
                                                const checked = e.target.checked;
                                                setForm(prev => ({
                                                    ...prev,
                                                    education: {
                                                        ...prev.education,
                                                        masters: { ...prev.education.masters, enabled: checked }
                                                    }
                                                }));
                                                if (checked) {
                                                    setActiveEducationTab('masters');
                                                } else {
                                                    setActiveEducationTab('btech');
                                                }
                                            }}
                                            className="w-3.5 h-3.5 rounded border-[#EBEBEB] accent-[#171717]"
                                        />
                                        <span className="text-[#8F8F8F] font-semibold">I have a Masters / M.Tech</span>
                                    </label>
                                </div>

                                {/* Form Fields for active tab */}
                                <div className="space-y-4 pt-2 relative">
                                    <div className="space-y-1.5 college-autocomplete-wrapper relative">
                                        <label className="text-[10px] font-mono font-semibold text-[#8F8F8F] uppercase tracking-wider">
                                            {activeEducationTab === 'tenth' ? 'School Name' : activeEducationTab === 'twelfth' ? 'Junior College / School' : 'College / University Name'}
                                        </label>
                                        <input 
                                            type="text"
                                            required
                                            value={form.education[activeEducationTab].institution}
                                            onChange={e => {
                                                const val = e.target.value;
                                                setJustSelectedCollege(false);
                                                setCollegeQuery(val);
                                                setShowCollegeSuggestions(true);
                                                setForm(prev => ({
                                                    ...prev,
                                                    education: {
                                                        ...prev.education,
                                                        [activeEducationTab]: {
                                                            ...prev.education[activeEducationTab],
                                                            institution: val
                                                        }
                                                    }
                                                }));
                                            }}
                                            onFocus={() => {
                                                setCollegeQuery(form.education[activeEducationTab].institution);
                                                setShowCollegeSuggestions(true);
                                            }}
                                            className="w-full px-5 py-3.5 bg-gradient-to-r from-[#FAFAFA] to-white hover:from-[#F5F5F5] hover:to-[#FAFAFA] border border-[#EBEBEB] focus:border-[#171717] focus:ring-1 focus:ring-[#171717] rounded-xl text-sm text-[#171717] focus:outline-none transition-all font-medium"
                                            placeholder={activeEducationTab === 'tenth' ? 'e.g. St. Xavier School' : activeEducationTab === 'twelfth' ? 'e.g. Delhi Public School' : 'e.g. Indian Institute of Technology Bombay'}
                                        />
                                        {isCollegeLoading && (
                                            <div className="absolute right-4 top-[38px] flex items-center justify-center">
                                                <Loader2 className="w-4 h-4 animate-spin text-[#8F8F8F]" />
                                            </div>
                                        )}

                                        {/* Autocomplete Dropdown overlay */}
                                        {showCollegeSuggestions && collegeSuggestions.length > 0 && (
                                            <div className="absolute left-0 right-0 mt-1 bg-white border border-[#EBEBEB] rounded-xl shadow-lg z-50 overflow-hidden max-h-40 overflow-y-auto">
                                                {collegeSuggestions.map((suggestion) => (
                                                    <button
                                                        key={suggestion}
                                                        type="button"
                                                        onClick={() => handleSelectCollege(suggestion)}
                                                        className="w-full px-5 py-2.5 text-left text-xs font-semibold text-[#4D4D4D] hover:bg-[#FAFAFA] hover:text-[#171717] transition-all border-b border-[#F2F2F2] last:border-0 cursor-pointer block"
                                                    >
                                                        {suggestion}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Passing Year & Score Row */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-mono font-semibold text-[#8F8F8F] uppercase tracking-wider">Passing Year</label>
                                            <select
                                                required
                                                value={form.education[activeEducationTab].passingYear}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setForm(prev => ({
                                                        ...prev,
                                                        education: {
                                                            ...prev.education,
                                                            [activeEducationTab]: {
                                                                ...prev.education[activeEducationTab],
                                                                passingYear: val
                                                            }
                                                        }
                                                    }));
                                                }}
                                                className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#EBEBEB] focus:border-[#171717] rounded-xl text-xs font-semibold text-[#4D4D4D] focus:outline-none transition-all cursor-pointer"
                                            >
                                                <option value="">-- Select Year --</option>
                                                {Array.from({ length: 26 }, (_, i) => 2010 + i).map(year => (
                                                    <option key={year} value={year}>{year}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-mono font-semibold text-[#8F8F8F] uppercase tracking-wider">Score (CGPA / %)</label>
                                            <input 
                                                type="text"
                                                required
                                                value={form.education[activeEducationTab].score}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setForm(prev => ({
                                                        ...prev,
                                                        education: {
                                                            ...prev.education,
                                                            [activeEducationTab]: {
                                                                ...prev.education[activeEducationTab],
                                                                score: val
                                                            }
                                                        }
                                                    }));
                                                }}
                                                className="w-full px-5 py-3.5 bg-gradient-to-r from-[#FAFAFA] to-white hover:from-[#F5F5F5] hover:to-[#FAFAFA] border border-[#EBEBEB] focus:border-[#171717] focus:ring-1 focus:ring-[#171717] rounded-xl text-sm text-[#171717] focus:outline-none transition-all font-medium"
                                                placeholder={activeEducationTab === 'tenth' || activeEducationTab === 'twelfth' ? 'e.g. 92% or 9.5 CGPA' : 'e.g. 8.8 CGPA'}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 7: Skills */}
                        {currentStep === 7 && (
                            <div className="space-y-5 animate-slide-in">
                                <div className="space-y-1.5">
                                    <h2 className="text-xl font-semibold tracking-tight text-[#171717]">What are your technical skills?</h2>
                                    <p className="text-xs text-[#8F8F8F]">Choose a role below to load recommendations, or type a custom skill.</p>
                                </div>
                                <div className="space-y-4 pt-2">
                                    {/* Role dropdown for suggested skills */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-mono font-semibold text-[#8F8F8F] uppercase tracking-wider">Select target career path</label>
                                        <select
                                            value={selectedRole}
                                            onChange={e => setSelectedRole(e.target.value)}
                                            className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#EBEBEB] focus:border-[#171717] rounded-xl text-xs font-semibold text-[#4D4D4D] focus:outline-none transition-all cursor-pointer shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                                        >
                                            <option value="">-- Choose a role for skill recommendations --</option>
                                            {Object.keys(roleSkillsMap).map(role => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Recommendation Badges */}
                                    {selectedRole && roleSkillsMap[selectedRole] && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-mono font-semibold text-[#8F8F8F] uppercase tracking-wider">Recommended Skills</label>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const skillsToAdd = roleSkillsMap[selectedRole].filter(skill => !form.skills.includes(skill));
                                                        if (skillsToAdd.length > 0) {
                                                            setForm(prev => ({
                                                                ...prev,
                                                                skills: [...prev.skills, ...skillsToAdd]
                                                            }));
                                                        }
                                                    }}
                                                    className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                                                >
                                                    + Add All {roleSkillsMap[selectedRole].length} Skills
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 p-3 bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl max-h-[140px] overflow-y-auto">
                                                {roleSkillsMap[selectedRole].map(skill => {
                                                    const isAdded = form.skills.includes(skill);
                                                    return (
                                                        <button
                                                            key={skill}
                                                            type="button"
                                                            disabled={isAdded}
                                                            onClick={() => {
                                                                setForm(prev => ({
                                                                    ...prev,
                                                                    skills: [...prev.skills, skill]
                                                                }));
                                                            }}
                                                            className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-all cursor-pointer select-none ${
                                                                isAdded
                                                                    ? 'bg-[#F2F2F2] border-[#EBEBEB] text-[#A1A1A1] cursor-not-allowed'
                                                                    : 'bg-white border-[#EBEBEB] text-[#4D4D4D] hover:border-[#171717] hover:text-[#171717] shadow-sm'
                                                            }`}
                                                        >
                                                            {skill} {isAdded && '✓'}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-mono font-semibold text-[#8F8F8F] uppercase tracking-wider">Add Custom Skill</label>
                                        <input 
                                            type="text"
                                            value={skillInput}
                                            onChange={e => setSkillInput(e.target.value)}
                                            onKeyDown={handleAddSkill}
                                            className="w-full px-5 py-4 bg-gradient-to-r from-[#FAFAFA] to-white hover:from-[#F5F5F5] hover:to-[#FAFAFA] border border-[#EBEBEB] focus:border-[#171717] focus:ring-1 focus:ring-[#171717] rounded-xl text-[#171717] placeholder:text-[#8F8F8F] focus:outline-none transition-all font-medium shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] text-sm"
                                            placeholder="Type custom skill (e.g., Python, Docker) and press Enter"
                                        />
                                    </div>
                                    
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-mono font-semibold text-[#8F8F8F] uppercase tracking-wider">Your selected skills</label>
                                        <div className="flex flex-wrap gap-1.5 min-h-[40px] max-h-[100px] overflow-y-auto p-3 bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl">
                                            {form.skills.length === 0 ? (
                                                <span className="text-xs text-[#8F8F8F] self-center pl-2 italic">No skills added yet...</span>
                                            ) : (
                                                form.skills.map((skill) => (
                                                    <span 
                                                        key={skill} 
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#EBEBEB] text-[#171717] font-semibold text-xs rounded-md shadow-sm select-none"
                                                    >
                                                        {skill}
                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleRemoveSkill(skill)}
                                                            className="text-[#8F8F8F] hover:text-red-500 font-bold ml-1"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 8: Terms & Finish / Review */}
                        {currentStep === 8 && (
                            <div className="space-y-5 animate-slide-in">
                                <div className="space-y-1.5">
                                    <h2 className="text-xl font-semibold tracking-tight text-[#171717]">Review & Integration</h2>
                                    <p className="text-xs text-[#8F8F8F]">Accept terms to complete the setup and start using the Forges.</p>
                                </div>

                                <div className="p-4 bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl space-y-2 text-xs text-[#4D4D4D] max-h-56 overflow-y-auto">
                                    <div><strong>Name</strong>: {form.fullName}</div>
                                    <div><strong>Contact</strong>: {form.phone}</div>
                                    <div><strong>Level</strong>: {form.experience}</div>
                                    {form.targetRole && <div><strong>Target Role</strong>: {form.targetRole} ({form.preferredWorkMode})</div>}
                                    {form.linkedinUrl && <div><strong>LinkedIn</strong>: {form.linkedinUrl}</div>}
                                    {form.githubUrl && <div><strong>GitHub</strong>: {form.githubUrl}</div>}
                                    {form.portfolioUrl && <div><strong>Portfolio</strong>: {form.portfolioUrl}</div>}
                                    {form.professionalSummary && <div className="italic text-[#8f8f8f] border-l-2 border-[#EBEBEB] pl-2 py-0.5 truncate">"{form.professionalSummary}"</div>}
                                    
                                    <div className="border-t border-[#EBEBEB] pt-2 mt-2 space-y-1">
                                        <div className="text-[10px] font-mono text-[#8f8f8f] uppercase">Academic Credentials</div>
                                        <div><strong>10th</strong>: {form.education.tenth.institution} ({form.education.tenth.passingYear}) - {form.education.tenth.score}</div>
                                        {form.education.diploma.enabled ? (
                                            <div><strong>Diploma</strong>: {form.education.diploma.institution} ({form.education.diploma.passingYear}) - {form.education.diploma.score}</div>
                                        ) : (
                                            <div><strong>12th</strong>: {form.education.twelfth.institution} ({form.education.twelfth.passingYear}) - {form.education.twelfth.score}</div>
                                        )}
                                        <div><strong>B.Tech / Degree</strong>: {form.education.btech.institution} ({form.education.btech.passingYear}) - {form.education.btech.score}</div>
                                        {form.education.masters.enabled && (
                                            <div><strong>Masters</strong>: {form.education.masters.institution} ({form.education.masters.passingYear}) - {form.education.masters.score}</div>
                                        )}
                                    </div>
                                    
                                    <div className="truncate border-t border-[#EBEBEB] pt-2"><strong>Skills</strong>: {form.skills.join(', ')}</div>
                                </div>

                                <div className="pt-2">
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <input 
                                            type="checkbox"
                                            checked={termsAccepted}
                                            onChange={e => setTermsAccepted(e.target.checked)}
                                            className="mt-1 w-4 h-4 rounded border-[#EBEBEB] bg-[#FAFAFA] text-[#171717] focus:ring-[#171717]/25 cursor-pointer accent-[#171717]"
                                        />
                                        <span className="text-xs text-[#8F8F8F] group-hover:text-[#4D4D4D] transition-colors leading-relaxed">
                                            I accept the <a href="/terms" className="text-[#171717] font-semibold hover:underline">Terms & Conditions</a> and agree to allow AI-guided telemetry.
                                        </span>
                                    </label>
                                </div>

                                {error && (
                                    <div className="p-3 rounded-xl bg-red-50/50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Action Panel */}
                        <div className="flex items-center justify-between pt-6 border-t border-[#EBEBEB]">
                            {currentStep > 1 ? (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="text-xs font-semibold text-[#8F8F8F] hover:text-[#171717] flex items-center gap-1 py-2 cursor-pointer transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Back
                                </button>
                            ) : (
                                <div />
                            )}

                            {currentStep < totalSteps ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={!canContinue()}
                                    className={`px-5 py-2.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-sm cursor-pointer select-none ${
                                        canContinue()
                                            ? 'bg-[#171717] hover:bg-[#333333] text-white active:scale-98'
                                            : 'bg-[#FAFAFA] border border-[#EBEBEB] text-[#8F8F8F] cursor-not-allowed'
                                    }`}
                                >
                                    Continue <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <Button 
                                    type="submit"
                                    disabled={isLoading || !termsAccepted}
                                    className={`px-6 py-2.5 rounded-lg font-semibold text-xs tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer ${
                                        termsAccepted ? 'bg-[#171717] hover:bg-[#333333] text-white shadow-[#171717]/10' : 'bg-[#FAFAFA] text-[#8F8F8F] border border-[#EBEBEB]'
                                    }`}
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                    ) : (
                                        <div className="flex items-center justify-center gap-1.5">
                                            <UserCheck className="w-4 h-4" />
                                            Complete Onboarding
                                        </div>
                                    )}
                                </Button>
                            )}
                        </div>

                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Minimal Onboarding Footer (AutoSend Pattern) */}
                <div className="w-full bg-[#fafaf9] border-t border-[#e7e5e4] py-4 px-6 select-none shrink-0">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left text-[11px] font-mono text-[#8F8F8F] uppercase tracking-wider">
                        <span>© 2026 ResumeForge AI</span>
                        <span>Made for developers. Built By GrowXlabsTech</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

