"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
    UserCheck, Loader2, ChevronLeft, ChevronRight, 
    Check, Sparkles, AlertCircle, ShieldAlert, Award
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

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
    const totalSteps = 7;

    const [form, setForm] = useState({
        referralSource: '',
        fullName: '',
        phone: '',
        experience: 'Beginner',
        college: '',
        skills: [] as string[]
    });
    const [skillInput, setSkillInput] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);

    // College suggestions states
    const [collegeSuggestions, setCollegeSuggestions] = useState<string[]>([]);
    const [showCollegeSuggestions, setShowCollegeSuggestions] = useState(false);
    const [isCollegeLoading, setIsCollegeLoading] = useState(false);
    const [justSelectedCollege, setJustSelectedCollege] = useState(false);
    
    // Target role recommendation state
    const [selectedRole, setSelectedRole] = useState('');

    // College autocomplete search logic
    useEffect(() => {
        if (justSelectedCollege) return;
        
        const query = form.college.trim();
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
    }, [form.college, justSelectedCollege]);

    // Handle selection from dropdown
    const handleSelectCollege = (collegeName: string) => {
        setJustSelectedCollege(true);
        setForm(prev => ({ ...prev, college: collegeName }));
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
                    setForm(prev => ({
                        ...prev,
                        fullName: data.user.full_name || '',
                        phone: data.user.phone_number || ''
                    }));
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
            case 4: return !!form.experience;
            case 5: return !!form.college.trim();
            case 6: return form.skills.length > 0;
            case 7: return termsAccepted;
            default: return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
                    college: form.college,
                    skills: form.skills.join(', '),
                    experience: form.experience,
                    referralSource: form.referralSource
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
            setCurrentStep(7); // Jump back to review screen to display error
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
                                <Sparkles className="w-5 h-5 text-[#171717] animate-pulse" />
                                <span className="text-sm font-semibold text-[#171717] tracking-tight">ResumeForge AI</span>
                            </div>
                            <p className="text-xs text-[#4D4D4D] leading-relaxed">
                                Complete your profile to allow our AI engine to tailor professional resumes, run ATS checks, and match your skills to matching developer job opportunities.
                            </p>
                        </div>
                    </div>

                    {/* Right Pane: Wizard Steps */}
                    <div className="w-full md:w-1/2 flex flex-col justify-center p-6 md:p-12 bg-white min-h-[500px]">
                        <div className="w-full max-w-md mx-auto space-y-6">
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

                        {/* STEP 4: Experience */}
                        {currentStep === 4 && (
                            <div className="space-y-5 animate-slide-in">
                                <div className="space-y-1.5">
                                    <h2 className="text-xl font-semibold tracking-tight text-[#171717]">What is your career level?</h2>
                                    <p className="text-xs text-[#8F8F8F]">This adjusts the baseline suggestions of our AI engine.</p>
                                </div>
                                <div className="flex flex-col gap-3 pt-2">
                                    {[
                                        { level: 'Beginner', title: 'Beginner / Student', desc: 'Entry-level credentials, college degree, or self-taught seeker.' },
                                        { level: 'Intermediate', title: 'Intermediate Professional', desc: '1 to 3 years of active engineering role experience.' },
                                        { level: 'Senior', title: 'Senior Leader', desc: '4+ years of leading architectures, tech stacks, or engineering teams.' }
                                    ].map((opt) => {
                                        const isSelected = form.experience === opt.level;
                                        return (
                                            <button
                                                key={opt.level}
                                                type="button"
                                                onClick={() => {
                                                    setForm(prev => ({ ...prev, experience: opt.level }));
                                                    setTimeout(nextStep, 250);
                                                }}
                                                className={`p-4 text-left border rounded-xl transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-white border-[#171717] ring-1 ring-[#171717]'
                                                        : 'bg-white border-[#EBEBEB] hover:bg-[#FAFAFA]'
                                                }`}
                                            >
                                                <div className="font-semibold text-xs text-[#171717]">{opt.title}</div>
                                                <div className="text-[11px] text-[#8F8F8F] mt-1">{opt.desc}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* STEP 5: College/Institution */}
                        {currentStep === 5 && (
                            <div className="space-y-5 animate-slide-in college-autocomplete-wrapper relative">
                                <div className="space-y-1.5">
                                    <h2 className="text-xl font-semibold tracking-tight text-[#171717]">Where are you currently active?</h2>
                                    <p className="text-xs text-[#8F8F8F]">Enter your university name or current company employer.</p>
                                </div>
                                <div className="pt-2 relative">
                                    <input 
                                        type="text"
                                        required
                                        autoFocus
                                        value={form.college}
                                        onChange={e => {
                                            setJustSelectedCollege(false);
                                            setForm({ ...form, college: e.target.value });
                                            setShowCollegeSuggestions(true);
                                        }}
                                        onFocus={() => setShowCollegeSuggestions(true)}
                                        className="w-full px-5 py-4 bg-gradient-to-r from-[#FAFAFA] to-white hover:from-[#F5F5F5] hover:to-[#FAFAFA] border border-[#EBEBEB] focus:border-[#171717] focus:ring-1 focus:ring-[#171717] rounded-xl text-[#171717] placeholder:text-[#8F8F8F] focus:outline-none transition-all font-medium shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] text-sm"
                                        placeholder="University, College, or Company name"
                                    />
                                    {isCollegeLoading && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
                                            <Loader2 className="w-4 h-4 animate-spin text-[#8F8F8F]" />
                                        </div>
                                    )}

                                    {/* Autocomplete Dropdown overlay */}
                                    {showCollegeSuggestions && collegeSuggestions.length > 0 && (
                                        <div className="absolute left-0 right-0 mt-1 bg-white border border-[#EBEBEB] rounded-xl shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
                                            {collegeSuggestions.map((suggestion) => (
                                                <button
                                                    key={suggestion}
                                                    type="button"
                                                    onClick={() => handleSelectCollege(suggestion)}
                                                    className="w-full px-5 py-3 text-left text-xs font-semibold text-[#4D4D4D] hover:bg-[#FAFAFA] hover:text-[#171717] transition-all border-b border-[#F2F2F2] last:border-0 cursor-pointer block"
                                                >
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* STEP 6: Skills */}
                        {currentStep === 6 && (
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
                                            {Object.keys(ROLE_SKILLS_MAP).map(role => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Recommendation Badges */}
                                    {selectedRole && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-mono font-semibold text-[#8F8F8F] uppercase tracking-wider">Recommended Skills</label>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const skillsToAdd = ROLE_SKILLS_MAP[selectedRole].filter(skill => !form.skills.includes(skill));
                                                        if (skillsToAdd.length > 0) {
                                                            setForm(prev => ({
                                                                ...prev,
                                                                skills: [...prev.skills, ...skillsToAdd]
                                                            }));
                                                        }
                                                    }}
                                                    className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                                                >
                                                    + Add All {ROLE_SKILLS_MAP[selectedRole].length} Skills
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 p-3 bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl max-h-[140px] overflow-y-auto">
                                                {ROLE_SKILLS_MAP[selectedRole].map(skill => {
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

                        {/* STEP 7: Terms & Finish */}
                        {currentStep === 7 && (
                            <div className="space-y-5 animate-slide-in">
                                <div className="space-y-1.5">
                                    <h2 className="text-xl font-semibold tracking-tight text-[#171717]">Review & Integration</h2>
                                    <p className="text-xs text-[#8F8F8F]">Accept terms to complete the setup and start using the Forges.</p>
                                </div>

                                <div className="p-4 bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl space-y-2 text-xs text-[#4D4D4D]">
                                    <div><strong>Name</strong>: {form.fullName}</div>
                                    <div><strong>Contact</strong>: {form.phone}</div>
                                    <div><strong>Level</strong>: {form.experience}</div>
                                    <div><strong>Institution</strong>: {form.college}</div>
                                    <div className="truncate"><strong>Skills</strong>: {form.skills.join(', ')}</div>
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
                                            <Sparkles className="w-4 h-4 text-amber-500" />
                                            Complete Onboarding
                                        </div>
                                    )}
                                </Button>
                            )}
                        </div>

                            </form>
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

