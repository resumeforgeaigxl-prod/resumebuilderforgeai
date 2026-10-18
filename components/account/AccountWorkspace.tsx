"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  User,
  Crown,
  Calendar,
  ShieldCheck,
  CreditCard,
  ChevronRight,
  Briefcase,
  Edit,
  Phone,
  Linkedin,
  Github,
  Globe,
  Settings,
  Lock,
  LogOut,
  Info,
  CheckCircle2,
  ClipboardCheck,
  Zap
} from '@/components/icons';
import Link from 'next/link';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/Badge';
import { CandidateApplicationProfileView } from '@/components/profile/CandidateApplicationProfileView';
import type { CandidateApplicationProfile } from '@/lib/capabilities/profile';
import { WalletModal } from '@/components/billing/WalletModal';

interface AccountWorkspaceProps {
  user: any;
  profile: CandidateApplicationProfile;
  locale: string;
}

export function AccountWorkspace({ user, profile, locale }: AccountWorkspaceProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialTab = searchParams?.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState<'profile' | 'application-profile' | 'billing'>(
    initialTab === 'application-profile' ? 'application-profile' : initialTab === 'billing' ? 'billing' : 'profile'
  );
  const [walletBalance, setWalletBalance] = useState<{ available_balance: number; reserved_balance: number } | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const fetchWallet = async () => {
    try {
      const res = await fetch('/api/credits/balance');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.balance) {
          setWalletBalance({
            available_balance: data.balance.available_balance,
            reserved_balance: data.balance.reserved_balance,
          });
        }
      }
    } catch (e) {
      // Ignore background fetch error
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  useEffect(() => {
    const tabParam = searchParams?.get('tab');
    if (tabParam === 'application-profile' || tabParam === 'billing' || tabParam === 'profile') {
      setActiveTab(tabParam);
    }
    if (tabParam === 'billing') {
      fetchWallet();
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'profile' | 'application-profile' | 'billing') => {
    setActiveTab(tab);
    if (tab === 'billing') {
      fetchWallet();
    }
    router.replace(`${pathname}?tab=${tab}`, { scroll: false });
  };

  const isAdmin = user.role === 'admin';
  const planType = user.plan_type?.toUpperCase() || 'FREE';
  const isPlanActive = user.plan_end ? new Date(user.plan_end) > new Date() : false;
  const activePlan = isAdmin ? 'ADMIN' : ((planType !== 'FREE' && isPlanActive) ? planType : 'FREE');

  const profileFields = [
    user.full_name,
    user.phone_number,
    user.linkedin_url,
    user.github_url,
    user.portfolio_url,
    user.college || user.education?.btech?.institution,
    user.skills && user.skills.length > 0,
    user.experience_level,
    user.target_role,
    user.preferred_work_mode,
    user.professional_summary
  ];
  const filledCount = profileFields.filter(Boolean).length;
  const completenessPercentage = Math.round((filledCount / profileFields.length) * 100);

  const planBadgeStyles: Record<string, string> = {
    FREE: 'bg-[#242424] text-[#BDBDBD] border-[#2D2D2D]',
    PRO: 'bg-[#8B5CF6]/15 text-[#C4B5FD] border-[#8B5CF6]/30',
    PREMIUM: 'bg-[#8B5CF6]/15 text-[#C4B5FD] border-[#8B5CF6]/30',
    CAREER: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    ADMIN: 'bg-[#8B5CF6]/20 text-[#C4B5FD] border-[#8B5CF6]/40',
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-6 text-[#F5F5F5]">
      {/* ─── HEADER ───────────────────────────────────────────────────────── */}
      <header className="flex items-end gap-4">
        <img src="/rail/rail-account.png?v=ice" alt="" width={48} height={48} className="h-12 w-12 object-contain" />
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#8b909a]">You</p>
          <h1 className="mt-2 !text-[40px] font-normal leading-none text-[#f4f5f7]" style={{ fontFamily: 'var(--font-display)' }}>
            Account
          </h1>
        </div>
      </header>

      {/* ─── NAVIGATION TABS ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-[#242424] pb-px">
        <button
          onClick={() => handleTabChange('profile')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'border-[#f4f5f7] text-[#f4f5f7]'
              : 'border-transparent text-[#7E7E7E] hover:text-[#F5F5F5] hover:border-[#2D2D2D]'
          }`}
        >
          <User className="w-4 h-4" />
          General Profile
        </button>

        <button
          onClick={() => handleTabChange('application-profile')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'application-profile'
              ? 'border-[#f4f5f7] text-[#f4f5f7]'
              : 'border-transparent text-[#7E7E7E] hover:text-[#F5F5F5] hover:border-[#2D2D2D]'
          }`}
        >
          <ClipboardCheck className="h-4 w-4 text-[#9bb4c9]" />
          Application Profile
          {profile.readiness.status === 'READY' ? (
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => handleTabChange('billing')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'billing'
              ? 'border-[#f4f5f7] text-[#f4f5f7]'
              : 'border-transparent text-[#7E7E7E] hover:text-[#F5F5F5] hover:border-[#2D2D2D]'
          }`}
        >
          <Crown className="w-4 h-4 text-amber-400" />
          Billing & Access
        </button>
      </div>

      {/* ─── TAB 1: APPLICATION PROFILE (LEVEL 6 CANONICAL PROFILE) ───────── */}
      {activeTab === 'application-profile' && (
        <CandidateApplicationProfileView initialProfile={profile} locale={locale} />
      )}

      {/* ─── TAB 2: GENERAL PROFILE (IDENTITY + CAREER PASSPORT) ──────────── */}
      {activeTab === 'profile' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Identity Core */}
            <div className="bg-[#101010] border border-[#242424] rounded-xl p-6 md:p-8 space-y-6 shadow-xs">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#151515] border border-[#242424] flex items-center justify-center shadow-xs">
                  <User className="w-5 h-5 text-[#F5F5F5]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-[#F5F5F5]">Identity</h2>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#7E7E7E]">
                    Full Name
                  </label>
                  <div className="px-3.5 py-2.5 bg-[#151515] border border-[#242424] rounded-lg text-[#F5F5F5] font-medium text-sm flex items-center gap-2.5">
                    <span className="text-[#7E7E7E]">#</span> {user.full_name || 'Not Configured'}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#7E7E7E]">
                    Email Address
                  </label>
                  <div className="px-3.5 py-2.5 bg-[#151515] border border-[#242424] rounded-lg text-[#F5F5F5] font-medium text-sm flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-[#7E7E7E]" /> {user.email}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#7E7E7E]">
                    Phone Number
                  </label>
                  <div className="px-3.5 py-2.5 bg-[#151515] border border-[#242424] rounded-lg text-[#F5F5F5] font-medium text-sm flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-[#7E7E7E]" /> {user.phone_number || 'Not Configured'}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Access to Application Profile */}
            <div className="bg-[#101010] border border-[#242424] rounded-xl p-6 md:p-8 space-y-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#F5F5F5]">
                  Application Profile
                </h3>

                <div className="mt-4 flex items-center gap-4 bg-[#151515] border border-[#242424] p-4 rounded-xl">
                  <div className="text-2xl font-bold font-mono text-[#F5F5F5]">{profile.completeness.percentage}%</div>
                  <div>
                    <div className="text-xs font-semibold text-[#F5F5F5]">{profile.readiness.summary}</div>
                    <div className="text-[10px] text-[#7E7E7E] mt-0.5">Status: {profile.readiness.status}</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleTabChange('application-profile')}
                className="w-full h-10 bg-[#151515] hover:bg-[#202020] border border-[#242424] text-[#F5F5F5] font-medium text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Edit Application Profile</span>
                <ChevronRight className="w-4 h-4 text-[#7E7E7E]" />
              </button>
            </div>
          </div>

          {/* Professional Identity */}
          <div className="relative overflow-hidden rounded-xl border border-[#242424] bg-[#101010] p-6 md:p-8 shadow-xs text-[#F5F5F5]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#242424]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#151515] border border-[#242424] flex items-center justify-center shadow-xs">
                  <Briefcase className="w-5 h-5 text-[#8B5CF6]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-[#F5F5F5]">
                    Career Identity
                  </h2>
                </div>
              </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
              {/* Left Pane */}
              <div className="lg:col-span-5 space-y-6">
                <div className="p-5 rounded-xl border border-[#242424] bg-[#151515] space-y-3 shadow-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[9px] font-bold text-[#7E7E7E] uppercase tracking-wider">Candidate</div>
                      <h3 className="font-semibold text-base text-[#F5F5F5] mt-0.5">{user.full_name || 'Anonymous User'}</h3>
                    </div>
                    <div className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 text-[8px] font-bold uppercase tracking-wider border border-emerald-800/60">
                      Active
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-2 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-[#242424]">
                      <span className="text-[#7E7E7E]">Target Role</span>
                      <span className="font-semibold text-[#F5F5F5]">{user.target_role || 'Not Configured'}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-[#242424]">
                      <span className="text-[#7E7E7E]">Experience Level</span>
                      <span className="font-semibold text-[#F5F5F5]">{user.experience_level || 'Beginner'}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[#7E7E7E]">Work Mode</span>
                      <span className="font-semibold text-[#F5F5F5]">{user.preferred_work_mode || 'Remote'}</span>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#7E7E7E]">Social Links</label>
                  <div className="grid grid-cols-3 gap-2">
                    {user.linkedin_url ? (
                      <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-[#151515] border border-[#242424] rounded-lg flex items-center justify-center gap-1.5 text-[10px] font-semibold text-[#BDBDBD] hover:text-white hover:border-[#303030] transition-colors">
                        <Linkedin className="w-3.5 h-3.5 text-[#0077B5]" /> LinkedIn
                      </a>
                    ) : (
                      <div className="px-3 py-2 bg-[#101010] border border-[#242424] rounded-lg flex items-center justify-center text-[10px] text-[#565656]">
                        No LinkedIn
                      </div>
                    )}
                    {user.github_url ? (
                      <a href={user.github_url} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-[#151515] border border-[#242424] rounded-lg flex items-center justify-center gap-1.5 text-[10px] font-semibold text-[#BDBDBD] hover:text-[#F5F5F5] hover:border-[#303030] transition-colors">
                        <Github className="w-3.5 h-3.5 text-[#F5F5F5]" /> GitHub
                      </a>
                    ) : (
                      <div className="px-3 py-2 bg-[#101010] border border-[#242424] rounded-lg flex items-center justify-center text-[10px] text-[#565656]">
                        No GitHub
                      </div>
                    )}
                    {user.portfolio_url ? (
                      <a href={user.portfolio_url} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-[#151515] border border-[#242424] rounded-lg flex items-center justify-center gap-1.5 text-[10px] font-semibold text-[#BDBDBD] hover:text-white hover:border-[#303030] transition-colors">
                        <Globe className="w-3.5 h-3.5 text-[#8B5CF6]" /> Website
                      </a>
                    ) : (
                      <div className="px-3 py-2 bg-[#101010] border border-[#242424] rounded-lg flex items-center justify-center text-[10px] text-[#565656]">
                        No Website
                      </div>
                    )}
                  </div>
                </div>

                {/* Professional Summary */}
                {user.professional_summary && (
                  <div className="p-4 rounded-xl border border-[#242424] bg-[#151515] space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#7E7E7E]">Summary</label>
                    <p className="text-xs text-[#BDBDBD] leading-relaxed">
                      "{user.professional_summary}"
                    </p>
                  </div>
                )}
              </div>

              {/* Right Pane */}
              <div className="lg:col-span-7 space-y-6">
                {/* Skills */}
                <div className="p-5 rounded-xl border border-[#242424] bg-[#151515] space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#7E7E7E]">Skills</label>
                    <span className="text-[10px] font-semibold text-[#C4B5FD] bg-[#8B5CF6]/15 px-2 py-0.5 rounded-full border border-[#8B5CF6]/30">
                      {Array.isArray(user.skills) ? user.skills.length : 0} Skills
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(user.skills) && user.skills.length > 0 ? (
                      user.skills.map((skill: string, index: number) => (
                        <Badge key={index} className="bg-[#101010] border border-[#242424] text-[#BDBDBD] text-[10px] font-semibold uppercase py-1 px-2.5 rounded-md shadow-2xs">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-[#7E7E7E]">No skills listed yet.</span>
                    )}
                  </div>
                </div>

                {/* Education */}
                {user.education && (
                  <div className="p-5 rounded-xl border border-[#242424] bg-[#151515] space-y-3">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#7E7E7E]">Education</label>
                    <div className="space-y-3 text-xs">
                      {user.education.masters?.institution && (
                        <div className="border-l-2 border-[#8B5CF6] pl-3">
                          <div className="text-[9px] font-bold text-[#C4B5FD] uppercase">Masters</div>
                          <div className="font-semibold text-[#F5F5F5]">{user.education.masters.institution}</div>
                          <div className="text-[10px] text-[#7E7E7E]">Year: {user.education.masters.passingYear} | Score: {user.education.masters.score}</div>
                        </div>
                      )}
                      {user.education.btech?.institution && (
                        <div className="border-l-2 border-[#8B5CF6] pl-3">
                          <div className="text-[9px] font-bold text-[#C4B5FD] uppercase">Undergraduate</div>
                          <div className="font-semibold text-[#F5F5F5]">{user.education.btech.institution}</div>
                          <div className="text-[10px] text-[#7E7E7E]">Year: {user.education.btech.passingYear} | Score: {user.education.btech.score}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: BILLING & ACCESS ──────────────────────────────────────── */}
      {activeTab === 'billing' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#101010] border border-[#242424] rounded-xl p-6 md:p-8 space-y-6 shadow-xs">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#151515] border border-[#242424] flex items-center justify-center shadow-xs">
                  <Crown className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-[#F5F5F5]">Current Plan</h2>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#151515] border border-[#242424] space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${planBadgeStyles[activePlan] || planBadgeStyles.FREE}`}>
                    {activePlan} PLAN
                  </span>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> ACTIVE
                  </span>
                </div>

                <div>
                  {user.plan_end ? (
                    <div className="flex items-center gap-2 text-[#BDBDBD] text-xs">
                      <Calendar className="w-4 h-4 text-[#7E7E7E]" />
                      <span>Expires: {format(new Date(user.plan_end), 'dd MMM yyyy')}</span>
                    </div>
                  ) : activePlan !== 'FREE' ? (
                    <p className="text-emerald-400 font-semibold text-xs uppercase">Lifetime Access Active</p>
                  ) : null}
                </div>

                <Link href={`/${locale}/dashboard/billing`} className="block">
                  <button className="w-full h-10 bg-white hover:bg-[#EBEBEB] text-[#050505] font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer">
                    {activePlan === 'FREE' ? 'Upgrade Plan' : 'Manage Subscription'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Invoices and Sign Out */}
            <div className="bg-[#101010] border border-[#242424] rounded-xl p-6 md:p-8 space-y-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#F5F5F5]">Invoices & Session</h3>
              </div>

              <div className="space-y-3">
                <Link
                  href={`/${locale}/dashboard/invoices`}
                  className="flex items-center justify-between p-3.5 rounded-lg bg-[#151515] border border-[#242424] hover:bg-[#202020] transition-all shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-[#7E7E7E]" />
                    <span className="text-xs font-semibold text-[#BDBDBD]">Payment History & Invoices</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#7E7E7E]" />
                </Link>

                <form action="/api/auth/signout" method="post">
                  <button className="w-full flex items-center justify-between p-3.5 rounded-lg border border-red-900/40 hover:bg-red-950/20 text-red-400 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <LogOut className="w-4 h-4" />
                      <span className="text-xs font-semibold">Sign Out from Device</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Credit Economy Wallet Box */}
          <div className="bg-[#101010] border border-[#242424] rounded-xl p-6 md:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-xs">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-[#F5F5F5]">Credits & Compute</h2>
                </div>
              </div>
              <button
                onClick={() => setIsWalletModalOpen(true)}
                className="h-9 px-4 bg-[#151515] hover:bg-[#202020] border border-[#242424] text-[#F5F5F5] font-medium text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Top Up Credits</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#151515] border border-[#242424]">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7E7E7E]">Available Balance</span>
                <p className="text-2xl font-bold text-[#F5F5F5] mt-1 font-mono">
                  {walletBalance !== null ? walletBalance.available_balance : '...'} <span className="text-xs font-normal text-[#7E7E7E]">credits</span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#151515] border border-[#242424]">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7E7E7E]">In-Flight Reservations</span>
                <p className="text-2xl font-bold text-[#F5F5F5] mt-1 font-mono">
                  {walletBalance !== null ? walletBalance.reserved_balance : 0} <span className="text-xs font-normal text-[#7E7E7E]">credits</span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#151515] border border-[#242424]">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7E7E7E]">Action Rates</span>
                <div className="mt-1 space-y-0.5 text-[11px] text-[#BDBDBD]">
                  <div className="flex justify-between"><span>Tailor Resume</span><span className="font-semibold text-[#F5F5F5]">4 cr</span></div>
                  <div className="flex justify-between"><span>ATS Scan</span><span className="font-semibold text-[#F5F5F5]">2 cr</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onTopUpSuccess={() => {
          fetchWallet();
        }}
      />

      {/* ─── SUPPORT FOOTER ─────────────────────────────────────────────────── */}
      <div className="p-5 rounded-xl border border-[#242424] bg-[#101010] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <Info className="w-4 h-4 text-[#8B5CF6]" />
          <div>
            <h4 className="text-sm font-semibold text-[#F5F5F5]">Need assistance?</h4>
          </div>
        </div>
        <Link href={`/${locale}/dashboard/support`}>
          <button className="h-8 px-3.5 rounded-lg border border-[#242424] bg-[#151515] hover:bg-[#202020] text-[#F5F5F5] font-medium text-xs shadow-xs transition-all cursor-pointer">
            Contact Support
          </button>
        </Link>
      </div>
    </div>
  );
}
