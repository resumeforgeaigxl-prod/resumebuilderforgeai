'use client';

import { MapPin, Link as LinkIcon, Briefcase, Code, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface UserProfile {
  username: string;
  full_name?: string;
}

interface UserResume {
  summary?: string;
  skills?: string | string[];
}

export default function PublicProfileUI({ user, resume }: { user: UserProfile, resume?: UserResume | null }) {
  const skills = Array.isArray(resume?.skills) ? resume.skills : (resume?.skills as string)?.split(',') || [];

  return (
    <div className="min-h-screen bg-[#050508] text-slate-200 selection:bg-indigo-500/30">
      <div className="max-w-5xl mx-auto px-6 py-20 space-y-12">
        {/* Header Section */}
        <section className="flex flex-col md:flex-row items-center md:items-start gap-10 text-center md:text-left">
          <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-black shadow-[0_20px_50px_rgba(79,70,229,0.3)] shrink-0">
            {user.full_name?.charAt(0) || user.username?.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-4 flex-1">
            <div className="space-y-1">
              <h1 className="text-5xl font-bold tracking-tighter text-white">{user.full_name}</h1>
              <p className="text-xl text-indigo-400 font-medium">@{user.username}</p>
            </div>
            <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
              {resume?.summary || "Developer, exploring new technologies and building amazing things."}
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
              <Button className="bg-indigo-600 hover:bg-indigo-700 h-10 px-6 rounded-xl font-bold">
                Connect on LinkedIn
              </Button>
              <Button variant="outline" className="border-white/10 hover:bg-white/5 h-10 px-6 rounded-xl">
                <Share2 className="w-4 h-4 mr-2" /> Share Profile
              </Button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Skills */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Code className="w-6 h-6 text-indigo-400" /> Technical Arsenal
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string, i: number) => (
                  <Badge key={i} className="bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 py-1.5 px-3 rounded-lg text-sm transition-all">
                    {skill.trim()}
                  </Badge>
                ))}
                {skills.length === 0 && <p className="text-slate-600 italic">No skills listed.</p>}
              </div>
            </section>

            {/* Experience Placeholder */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Briefcase className="w-6 h-6 text-purple-400" /> Career Journey
              </h2>
              <Card className="p-8 bg-white/[0.01] border-white/5 rounded-3xl flex flex-col items-center justify-center text-center py-16 gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-600">
                  <Rocket className="w-6 h-6" />
                </div>
                <p className="text-slate-500 max-w-xs">Building the future of recruitment with ResumeForgeAI.</p>
              </Card>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <Card className="p-6 bg-white/[0.02] border-white/5 rounded-3xl space-y-6">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest leading-none">Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-400">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">Global</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <LinkIcon className="w-4 h-4" />
                  <span className="text-sm">resumeforgeai.in/u/{user.username}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-indigo-600 to-purple-700 border-none rounded-3xl space-y-4 text-white">
              <h3 className="text-xl font-bold leading-tight">Ready to build your own portfolio?</h3>
              <p className="text-indigo-100 text-sm opacity-80">Join 10,000+ developers using ResumeForgeAI to accelerate their career.</p>
              <Button className="w-full bg-white text-indigo-600 hover:bg-slate-100 font-bold h-11 rounded-xl">
                Get Started Free
              </Button>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Footer Branding */}
      <footer className="py-20 border-t border-white/5 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 grayscale opacity-50">
          <span className="text-sm font-bold text-slate-600 uppercase tracking-widest">Powered by ResumeForgeAI</span>
        </div>
        <p className="text-[10px] text-slate-700 uppercase tracking-[0.2em]">Crafted with Precision • 2026</p>
      </footer>
    </div>
  );
}

const Rocket = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.71-2.13.09-2.91a2.18 2.18 0 0 0-3.09-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3"/><path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5"/></svg>
);
