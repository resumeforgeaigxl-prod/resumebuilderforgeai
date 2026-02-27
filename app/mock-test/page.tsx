'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, Briefcase, FileText, ChevronRight, Brain, Target, BookOpen, Zap, Mic } from 'lucide-react';

const FEATURES = [
    { icon: Brain, label: 'Technical MCQs', desc: 'Role-specific tech questions from JD' },
    { icon: Target, label: 'Aptitude', desc: 'Quant, DI & math problems' },
    { icon: BookOpen, label: 'Verbal Ability', desc: 'Grammar, comprehension, vocabulary' },
    { icon: Zap, label: 'Logical Reasoning', desc: 'Patterns, sequences, puzzles' },
    { icon: Mic, label: 'Interview Questions', desc: 'Behavioural & situational questions' },
];

export default function MockTestSetupPage() {
    const router = useRouter();
    const [jobTitle, setJobTitle] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [resumeText, setResumeText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleGenerate() {
        if (jobDescription.trim().length < 50) {
            setError('Please paste a complete job description (at least 50 characters).');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/mock-test/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobTitle, jobDescription, resumeText }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                router.push(`/mock-test/${data.testId}`);
            } else {
                setError(data.error || 'Failed to generate test. Please try again.');
                setLoading(false);
            }
        } catch {
            setError('Network error. Please check your connection and try again.');
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#070710] text-slate-200">
            {/* Header */}
            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600/15 border border-blue-500/20 rounded-full text-blue-400 text-sm mb-4">
                        <Sparkles className="w-4 h-4" /> AI-Powered Mock Interview Engine
                    </div>
                    <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        JD-Based Mock Test
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Generate 50 role-specific questions from any job description. Crack your next interview.
                    </p>
                </div>

                {/* Feature Pills */}
                <div className="flex flex-wrap justify-center gap-3 mb-10">
                    {FEATURES.map(f => (
                        <div key={f.label} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-slate-400">
                            <f.icon className="w-3.5 h-3.5 text-blue-400" />
                            {f.label}
                        </div>
                    ))}
                </div>

                {/* Form */}
                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 space-y-6 backdrop-blur-sm">
                    {/* Job Title */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                            <Briefcase className="w-3.5 h-3.5" /> Job Title (optional)
                        </label>
                        <input
                            value={jobTitle}
                            onChange={e => setJobTitle(e.target.value)}
                            placeholder="e.g. Senior Frontend Engineer"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        />
                    </div>

                    {/* Job Description */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                            <Target className="w-3.5 h-3.5 text-blue-400" /> Job Description <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            value={jobDescription}
                            onChange={e => setJobDescription(e.target.value)}
                            placeholder="Paste the full job description here — the more detail, the better the questions..."
                            rows={8}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none transition-all"
                        />
                        <p className="text-xs text-slate-600 mt-1">{jobDescription.length} characters {jobDescription.length < 50 && jobDescription.length > 0 ? '— needs at least 50' : ''}</p>
                    </div>

                    {/* Resume Text (optional) */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                            <FileText className="w-3.5 h-3.5" /> Your Resume Summary (optional — improves technical questions)
                        </label>
                        <textarea
                            value={resumeText}
                            onChange={e => setResumeText(e.target.value)}
                            placeholder="Paste key sections of your resume — skills, experience, projects..."
                            rows={4}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none transition-all"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={loading || jobDescription.trim().length < 50}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 text-base shadow-lg shadow-blue-600/20">
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Generating 50 questions — this takes ~30 seconds…
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Generate Mock Test
                                <ChevronRight className="w-5 h-5" />
                            </>
                        )}
                    </button>

                    <p className="text-xs text-slate-600 text-center">
                        Free users get 5 questions preview. Upgrade or use a coupon for full access.
                    </p>
                </div>
            </div>
        </div>
    );
}
