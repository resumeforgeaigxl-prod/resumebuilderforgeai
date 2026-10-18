"use client";

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  Briefcase,
  User,
  MapPin,
  DollarSign,
  Clock,
  Globe,
  Save,
  RefreshCw,
  Plus,
  X,
  FileText,
  Building,
  Check,
  AlertCircle,
  ChevronDown
} from '@/components/icons';
import type { CandidateApplicationProfile, ApplicationAnswer } from '@/lib/capabilities/profile';
import { CustomSelect, type CustomSelectOption } from '@/components/ui/CustomSelect';

const WORK_AUTH_OPTIONS: CustomSelectOption[] = [
  { value: 'yes', label: 'Yes — Authorized without restriction' },
  { value: 'no', label: 'No — Not authorized' },
  { value: 'unknown', label: 'Not set' },
];

const VISA_SPONSORSHIP_NOW_OPTIONS: CustomSelectOption[] = [
  { value: 'no', label: 'No — Do not require sponsorship' },
  { value: 'yes', label: 'Yes — Require sponsorship now' },
  { value: 'unknown', label: 'Not set' },
];

const VISA_SPONSORSHIP_FUTURE_OPTIONS: CustomSelectOption[] = [
  { value: 'no', label: 'No — Will not require sponsorship' },
  { value: 'yes', label: 'Yes — May require future sponsorship' },
  { value: 'unknown', label: 'Not set' },
];

const NOTICE_PERIOD_OPTIONS: CustomSelectOption[] = [
  { value: 'Immediate', label: 'Immediate / Available Now' },
  { value: '15 days', label: '15 Days' },
  { value: '30 days', label: '30 Days (1 Month)' },
  { value: '60 days', label: '60 Days (2 Months)' },
  { value: '90 days', label: '90 Days (3 Months)' },
  { value: '', label: 'Not set' },
];

const CURRENCY_OPTIONS: CustomSelectOption[] = [
  { value: 'INR', label: 'INR (₹)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CAD', label: 'CAD ($)' },
  { value: 'SGD', label: 'SGD ($)' },
];

interface Props {
  initialProfile: CandidateApplicationProfile;
  locale: string;
}

export function CandidateApplicationProfileView({ initialProfile, locale }: Props) {
  const [profile, setProfile] = useState<CandidateApplicationProfile>(initialProfile);
  const [saving, setSaving] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Identity Form State
  const [identity, setIdentity] = useState({
    fullName: initialProfile.identity.fullName || '',
    preferredName: initialProfile.identity.preferredName || '',
    email: initialProfile.identity.email || '',
    phoneNumber: initialProfile.identity.phoneNumber || '',
    currentCity: initialProfile.identity.currentCity || '',
    currentState: initialProfile.identity.currentState || '',
    country: initialProfile.identity.country || 'India',
    postalCode: initialProfile.identity.postalCode || '',
  });

  // Career Form State
  const [career, setCareer] = useState({
    currentRole: initialProfile.career.currentRole || '',
    totalExperienceYears: initialProfile.career.totalExperienceYears ?? '',
    currentCompany: initialProfile.career.currentCompany || '',
    portfolioUrl: initialProfile.career.portfolioUrl || '',
    githubUrl: initialProfile.career.githubUrl || '',
    linkedinUrl: initialProfile.career.linkedinUrl || '',
    personalWebsite: initialProfile.career.personalWebsite || '',
    professionalSummary: initialProfile.career.professionalSummary || '',
  });

  const [skills, setSkills] = useState<string[]>(initialProfile.career.skills || []);
  const [newSkillInput, setNewSkillInput] = useState('');

  const [primaryStack, setPrimaryStack] = useState<string[]>(initialProfile.career.primaryTechStack || []);
  const [newStackInput, setNewStackInput] = useState('');

  // Preferences Form State
  const [preferences, setPreferences] = useState({
    remotePreference: initialProfile.preferences.remotePreference ?? true,
    hybridPreference: initialProfile.preferences.hybridPreference ?? true,
    onsitePreference: initialProfile.preferences.onsitePreference ?? false,
    minExpectedSalary: initialProfile.preferences.minExpectedSalary ?? '',
    preferredSalaryMin: initialProfile.preferences.preferredSalaryMin ?? '',
    preferredSalaryMax: initialProfile.preferences.preferredSalaryMax ?? '',
    salaryCurrency: initialProfile.preferences.salaryCurrency || 'INR',
    willingToRelocate: initialProfile.preferences.willingToRelocate ?? false,
    willingToTravel: initialProfile.preferences.willingToTravel ?? false,
  });

  const [targetRoles, setTargetRoles] = useState<string[]>(initialProfile.preferences.targetRoles || []);
  const [newRoleInput, setNewRoleInput] = useState('');

  const [preferredLocations, setPreferredLocations] = useState<string[]>(initialProfile.preferences.preferredLocations || []);
  const [newLocationInput, setNewLocationInput] = useState('');

  const [employmentTypes, setEmploymentTypes] = useState<string[]>(initialProfile.preferences.employmentTypes || ['Full-time']);

  // Verified Answers State
  const [answers, setAnswers] = useState<Record<string, ApplicationAnswer>>(initialProfile.answers || {});

  // Sync when initialProfile changes
  useEffect(() => {
    setProfile(initialProfile);
    setAnswers(initialProfile.answers || {});
  }, [initialProfile]);

  // Skill Add/Remove
  const handleAddSkill = () => {
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };
  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  // Stack Add/Remove
  const handleAddStack = () => {
    if (newStackInput.trim() && !primaryStack.includes(newStackInput.trim())) {
      setPrimaryStack([...primaryStack, newStackInput.trim()]);
      setNewStackInput('');
    }
  };
  const handleRemoveStack = (tech: string) => {
    setPrimaryStack(primaryStack.filter((t) => t !== tech));
  };

  // Role Add/Remove
  const handleAddRole = () => {
    if (newRoleInput.trim() && !targetRoles.includes(newRoleInput.trim())) {
      setTargetRoles([...targetRoles, newRoleInput.trim()]);
      setNewRoleInput('');
    }
  };
  const handleRemoveRole = (role: string) => {
    setTargetRoles(targetRoles.filter((r) => r !== role));
  };

  // Location Add/Remove
  const handleAddLocation = () => {
    if (newLocationInput.trim() && !preferredLocations.includes(newLocationInput.trim())) {
      setPreferredLocations([...preferredLocations, newLocationInput.trim()]);
      setNewLocationInput('');
    }
  };
  const handleRemoveLocation = (loc: string) => {
    setPreferredLocations(preferredLocations.filter((l) => l !== loc));
  };

  // Employment Type Toggle
  const toggleEmploymentType = (type: string) => {
    if (employmentTypes.includes(type)) {
      setEmploymentTypes(employmentTypes.filter((t) => t !== type));
    } else {
      setEmploymentTypes([...employmentTypes, type]);
    }
  };

  // Update Answer helper
  const updateAnswerField = (key: string, value: any, status: 'VERIFIED' | 'UNVERIFIED' | 'UNKNOWN' = 'VERIFIED') => {
    setAnswers((prev) => ({
      ...prev,
      [key]: {
        field: key,
        value,
        valueType: typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'string',
        status,
        verified: status === 'VERIFIED',
        verifiedAt: status === 'VERIFIED' ? new Date().toISOString() : null,
        source: 'user',
      },
    }));
  };

  // Pre-fill from Resume
  const handleEnrichFromResume = async () => {
    setEnriching(true);
    setSaveMessage(null);
    try {
      const res = await fetch('/api/candidate-profile/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        setIdentity({
          fullName: data.profile.identity.fullName || identity.fullName,
          preferredName: data.profile.identity.preferredName || identity.preferredName,
          email: data.profile.identity.email || identity.email,
          phoneNumber: data.profile.identity.phoneNumber || identity.phoneNumber,
          currentCity: data.profile.identity.currentCity || identity.currentCity,
          currentState: data.profile.identity.currentState || identity.currentState,
          country: data.profile.identity.country || identity.country,
          postalCode: data.profile.identity.postalCode || identity.postalCode,
        });
        setCareer({
          currentRole: data.profile.career.currentRole || career.currentRole,
          totalExperienceYears: data.profile.career.totalExperienceYears ?? career.totalExperienceYears,
          currentCompany: data.profile.career.currentCompany || career.currentCompany,
          portfolioUrl: data.profile.career.portfolioUrl || career.portfolioUrl,
          githubUrl: data.profile.career.githubUrl || career.githubUrl,
          linkedinUrl: data.profile.career.linkedinUrl || career.linkedinUrl,
          personalWebsite: data.profile.career.personalWebsite || career.personalWebsite,
          professionalSummary: data.profile.career.professionalSummary || career.professionalSummary,
        });
        if (data.profile.career.skills?.length > 0) {
          setSkills(data.profile.career.skills);
        }
        setAnswers(data.profile.answers || {});
        setSaveMessage({
          type: 'success',
          text: `Enriched ${data.result?.updatedCount || 0} missing fields from your latest resume without overwriting existing data.`,
        });
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Failed to enrich profile' });
      }
    } catch (err: any) {
      setSaveMessage({ type: 'error', text: err.message || 'Error enriching profile' });
    } finally {
      setEnriching(false);
    }
  };

  // Save Candidate Profile
  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const payload = {
        identity: {
          fullName: identity.fullName,
          preferredName: identity.preferredName || undefined,
          phoneNumber: identity.phoneNumber || undefined,
          currentCity: identity.currentCity || undefined,
          currentState: identity.currentState || undefined,
          country: identity.country || undefined,
          postalCode: identity.postalCode || undefined,
        },
        career: {
          currentRole: career.currentRole || undefined,
          totalExperienceYears: career.totalExperienceYears ? Number(career.totalExperienceYears) : undefined,
          currentCompany: career.currentCompany || undefined,
          skills,
          primaryTechStack: primaryStack,
          portfolioUrl: career.portfolioUrl || undefined,
          githubUrl: career.githubUrl || undefined,
          linkedinUrl: career.linkedinUrl || undefined,
          personalWebsite: career.personalWebsite || undefined,
          professionalSummary: career.professionalSummary || undefined,
        },
        preferences: {
          targetRoles,
          preferredLocations,
          remotePreference: preferences.remotePreference,
          hybridPreference: preferences.hybridPreference,
          onsitePreference: preferences.onsitePreference,
          minExpectedSalary: preferences.minExpectedSalary ? Number(preferences.minExpectedSalary) : undefined,
          preferredSalaryMin: preferences.preferredSalaryMin ? Number(preferences.preferredSalaryMin) : undefined,
          preferredSalaryMax: preferences.preferredSalaryMax ? Number(preferences.preferredSalaryMax) : undefined,
          salaryCurrency: preferences.salaryCurrency,
          employmentTypes,
          willingToRelocate: preferences.willingToRelocate,
          willingToTravel: preferences.willingToTravel,
        },
        answers,
      };

      const res = await fetch('/api/candidate-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        setSaveMessage({ type: 'success', text: 'Candidate Application Profile saved and verified!' });
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Failed to save profile' });
      }
    } catch (err: any) {
      setSaveMessage({ type: 'error', text: err.message || 'Error saving profile' });
    } finally {
      setSaving(false);
    }
  };

  const readiness = profile.readiness;
  const completeness = profile.completeness;

  return (
    <div className="space-y-8">
      {/* ─── READINESS & COMPLETENESS BANNER ─────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-xl border border-[#242424] bg-[#101010] p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-4 border-b border-[#242424]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {readiness.status === 'READY' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-800/60">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Ready
                </span>
              )}
              {readiness.status === 'READY_WITH_CONFIRMATION' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Needs Confirmation
                </span>
              )}
              {readiness.status === 'NOT_READY' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  Incomplete
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-[#F5F5F5]">
              Candidate Application Profile
            </h2>
          </div>

          {/* Completeness Ring & Action */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-3 bg-[#151515] border border-[#242424] px-4 py-2 rounded-lg">
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#7E7E7E]">Completeness</div>
                <div className="text-base font-bold font-mono text-[#F5F5F5]">{completeness.percentage}%</div>
              </div>
              <div className="w-9 h-9 relative flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="18" cy="18" r="14" className="stroke-[#242424] fill-none" strokeWidth="2.5" />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    className="stroke-[#8B5CF6] fill-none transition-all duration-700"
                    strokeWidth="2.5"
                    strokeDasharray={`${2 * Math.PI * 14}`}
                    strokeDashoffset={`${2 * Math.PI * 14 * (1 - completeness.percentage / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            <button
              onClick={handleEnrichFromResume}
              disabled={enriching}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#151515] border border-[#242424] hover:bg-[#202020] text-[#F5F5F5] rounded-lg text-xs font-medium shadow-xs transition-all cursor-pointer disabled:opacity-50"
              title="Pre-fill empty fields from your most recent resume"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${enriching ? 'animate-spin' : ''}`} />
              {enriching ? 'Syncing...' : 'Pre-fill from Resume'}
            </button>
          </div>
        </div>

        {/* Missing Blockers */}
        {readiness.blockers.length > 0 && (
          <div className="mt-4 p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs text-amber-300">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-200">Required:</span>
              <ul className="mt-1 list-disc list-inside space-y-0.5 text-amber-300/90">
                {readiness.blockers.map((blocker, i) => (
                  <li key={i}>{blocker}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Feedback Message */}
        {saveMessage && (
          <div
            className={`mt-4 p-3 rounded-lg text-xs flex items-center gap-2 ${
              saveMessage.type === 'success'
                ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60'
                : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
            }`}
          >
            {saveMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
            <span>{saveMessage.text}</span>
          </div>
        )}
      </div>

      {/* ─── SECTION 1: IDENTITY & CONTACT ──────────────────────────────────── */}
      <div className="bg-[#101010] border border-[#242424] rounded-xl p-6 md:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-3 pb-4 border-b border-[#242424]">
          <div className="w-9 h-9 rounded-lg bg-[#151515] border border-[#242424] flex items-center justify-center">
            <User className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#F5F5F5]">Identity & Contact</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#7E7E7E] block mb-1.5">
              Full Legal Name *
            </label>
            <input
              type="text"
              value={identity.fullName}
              onChange={(e) => setIdentity({ ...identity, fullName: e.target.value })}
              className="w-full px-3 py-2 bg-[#151515] border border-[#242424] rounded-lg text-sm text-[#F5F5F5] placeholder:text-[#565656] focus:outline-none focus:border-[#8B5CF6]"
              placeholder="e.g. Sai Varshith"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#7E7E7E] block mb-1.5">
              Preferred Name
            </label>
            <input
              type="text"
              value={identity.preferredName}
              onChange={(e) => setIdentity({ ...identity, preferredName: e.target.value })}
              className="w-full px-3 py-2 bg-[#151515] border border-[#242424] rounded-lg text-sm text-[#F5F5F5] placeholder:text-[#565656] focus:outline-none focus:border-[#8B5CF6]"
              placeholder="e.g. Sai"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#7E7E7E] block mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              value={identity.email}
              disabled
              className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#242424] rounded-lg text-sm text-[#565656] cursor-not-allowed"
              title="Managed via your primary login account"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#7E7E7E] block mb-1.5">
              Phone Number *
            </label>
            <input
              type="tel"
              value={identity.phoneNumber}
              onChange={(e) => setIdentity({ ...identity, phoneNumber: e.target.value })}
              className="w-full px-3 py-2 bg-[#151515] border border-[#242424] rounded-lg text-sm text-[#F5F5F5] placeholder:text-[#565656] focus:outline-none focus:border-[#8B5CF6]"
              placeholder="+91 98765 43210"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#7E7E7E] block mb-1.5">
              Current City
            </label>
            <input
              type="text"
              value={identity.currentCity}
              onChange={(e) => setIdentity({ ...identity, currentCity: e.target.value })}
              className="w-full px-3 py-2 bg-[#151515] border border-[#242424] rounded-lg text-sm text-[#F5F5F5] placeholder:text-[#565656] focus:outline-none focus:border-[#8B5CF6]"
              placeholder="e.g. Bangalore"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#7E7E7E] block mb-1.5">
              Current State / Province
            </label>
            <input
              type="text"
              value={identity.currentState}
              onChange={(e) => setIdentity({ ...identity, currentState: e.target.value })}
              className="w-full px-3 py-2 bg-[#151515] border border-[#242424] rounded-lg text-sm text-[#F5F5F5] placeholder:text-[#565656] focus:outline-none focus:border-[#8B5CF6]"
              placeholder="e.g. Karnataka"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#7E7E7E] block mb-1.5">
              Country
            </label>
            <input
              type="text"
              value={identity.country}
              onChange={(e) => setIdentity({ ...identity, country: e.target.value })}
              className="w-full px-3 py-2 bg-[#151515] border border-[#242424] rounded-lg text-sm text-[#F5F5F5] placeholder:text-[#565656] focus:outline-none focus:border-[#8B5CF6]"
              placeholder="e.g. India"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#7E7E7E] block mb-1.5">
              Postal / PIN Code
            </label>
            <input
              type="text"
              value={identity.postalCode}
              onChange={(e) => setIdentity({ ...identity, postalCode: e.target.value })}
              className="w-full px-3 py-2 bg-[#151515] border border-[#242424] rounded-lg text-sm text-[#F5F5F5] placeholder:text-[#565656] focus:outline-none focus:border-[#8B5CF6]"
              placeholder="e.g. 560001"
            />
          </div>
        </div>
      </div>

      {/* ─── SECTION 2: CAREER FACTS & CREDENTIALS ──────────────────────────── */}
      <div className="bg-[#101010] border border-[#242424] rounded-xl p-6 md:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-3 pb-4 border-b border-[#242424]">
          <div className="w-9 h-9 rounded-lg bg-[#151515] border border-[#242424] flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#F5F5F5]">Career & Experience</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#7E7E7E] block mb-1.5">
              Current / Most Recent Role
            </label>
            <input
              type="text"
              value={career.currentRole}
              onChange={(e) => setCareer({ ...career, currentRole: e.target.value })}
              className="w-full px-3 py-2 bg-[#151515] border border-[#242424] rounded-lg text-sm text-[#F5F5F5] placeholder:text-[#565656] focus:outline-none focus:border-[#8B5CF6]"
              placeholder="e.g. Full Stack Engineer"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#7E7E7E] block mb-1.5">
              Total Experience (Years)
            </label>
            <input
              type="number"
              step="0.5"
              value={career.totalExperienceYears}
              onChange={(e) => setCareer({ ...career, totalExperienceYears: e.target.value })}
              className="w-full px-3 py-2 bg-[#151515] border border-[#242424] rounded-lg text-sm text-[#F5F5F5] placeholder:text-[#565656] focus:outline-none focus:border-[#8B5CF6]"
              placeholder="e.g. 2.5"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#7E7E7E] block mb-1.5">
              Current / Last Company
            </label>
            <input
              type="text"
              value={career.currentCompany}
              onChange={(e) => setCareer({ ...career, currentCompany: e.target.value })}
              className="w-full px-3 py-2 bg-[#151515] border border-[#242424] rounded-lg text-sm text-[#F5F5F5] placeholder:text-[#565656] focus:outline-none focus:border-[#8B5CF6]"
              placeholder="e.g. TechCorp Solutions"
            />
          </div>
        </div>

        {/* Primary Tech Stack */}
        <div className="space-y-2">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-[#7E7E7E] block">
            Primary Tech Stack (Top 5 Technologies)
          </label>
          <div className="flex flex-wrap gap-2 items-center min-h-[38px] p-2 bg-[#151515] border border-[#242424] rounded-xl">
            {primaryStack.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#242424] border border-[#2D2D2D] text-[#F5F5F5] shadow-xs"
              >
                {tech}
                <button
                  type="button"
                  onClick={() => handleRemoveStack(tech)}
                  className="hover:text-red-400 text-[#7E7E7E] cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={newStackInput}
                onChange={(e) => setNewStackInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddStack())}
                placeholder="Add tech..."
                className="px-2 py-1 text-xs bg-transparent focus:outline-none text-[#F5F5F5] placeholder:text-[#7E7E7E]"
              />
              <button
                type="button"
                onClick={handleAddStack}
                className="p-1 rounded-md hover:bg-[#242424] text-[#BDBDBD] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-[#7E7E7E] block">
            Verified Skills Library ({skills.length})
          </label>
          <div className="flex flex-wrap gap-2 items-center min-h-[46px] p-2.5 bg-[#151515] border border-[#242424] rounded-xl">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#101010] border border-[#242424] text-[#BDBDBD] shadow-xs"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-red-400 text-[#7E7E7E] cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                placeholder="Add skill..."
                className="px-2 py-1 text-xs bg-transparent focus:outline-none text-[#F5F5F5] placeholder:text-[#7E7E7E]"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="p-1 rounded-md hover:bg-[#242424] text-[#BDBDBD] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#7E7E7E] block mb-1.5">
              LinkedIn URL
            </label>
            <input
              type="url"
              value={career.linkedinUrl}
              onChange={(e) => setCareer({ ...career, linkedinUrl: e.target.value })}
              className="w-full px-3 py-2 bg-[#151515] border border-[#242424] rounded-lg text-sm text-[#F5F5F5] placeholder:text-[#565656] focus:outline-none focus:border-[#8B5CF6]"
              placeholder="https://linkedin.com/in/username"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#7E7E7E] block mb-1.5">
              GitHub URL
            </label>
            <input
              type="url"
              value={career.githubUrl}
              onChange={(e) => setCareer({ ...career, githubUrl: e.target.value })}
              className="w-full px-3 py-2 bg-[#151515] border border-[#242424] rounded-lg text-sm text-[#F5F5F5] placeholder:text-[#565656] focus:outline-none focus:border-[#8B5CF6]"
              placeholder="https://github.com/username"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#7E7E7E] block mb-1.5">
              Portfolio / Website URL
            </label>
            <input
              type="url"
              value={career.portfolioUrl}
              onChange={(e) => setCareer({ ...career, portfolioUrl: e.target.value })}
              className="w-full px-3 py-2 bg-[#151515] border border-[#242424] rounded-lg text-sm text-[#F5F5F5] placeholder:text-[#565656] focus:outline-none focus:border-[#8B5CF6]"
              placeholder="https://yourportfolio.dev"
            />
          </div>
        </div>
      </div>

      {/* ─── SECTION 3: JOB & LOCATION PREFERENCES ──────────────────────────── */}
      <div className="bg-[#101010] border border-[#242424] rounded-xl p-6 md:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-3 pb-4 border-b border-[#242424]">
          <div className="w-9 h-9 rounded-lg bg-[#151515] border border-[#242424] flex items-center justify-center">
            <MapPin className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#F5F5F5]">Job Preferences</h3>
          </div>
        </div>

        {/* Target Roles */}
        <div className="space-y-2">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-[#7E7E7E] block">
            Target Roles
          </label>
          <div className="flex flex-wrap gap-2 items-center min-h-[38px] p-2 bg-[#151515] border border-[#242424] rounded-xl">
            {targetRoles.map((role) => (
              <span
                key={role}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#242424] border border-[#2D2D2D] text-[#F5F5F5] shadow-xs"
              >
                {role}
                <button
                  type="button"
                  onClick={() => handleRemoveRole(role)}
                  className="hover:text-red-400 text-[#7E7E7E] cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={newRoleInput}
                onChange={(e) => setNewRoleInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRole())}
                placeholder="Add target role..."
                className="px-2 py-1 text-xs bg-transparent focus:outline-none text-[#F5F5F5] placeholder:text-[#7E7E7E]"
              />
              <button
                type="button"
                onClick={handleAddRole}
                className="p-1 rounded-md hover:bg-[#242424] text-[#BDBDBD] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Preferred Locations */}
        <div className="space-y-2">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-[#7E7E7E] block">
            Preferred Job Locations
          </label>
          <div className="flex flex-wrap gap-2 items-center min-h-[38px] p-2 bg-[#151515] border border-[#242424] rounded-xl">
            {preferredLocations.map((loc) => (
              <span
                key={loc}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#101010] border border-[#242424] text-[#BDBDBD] shadow-xs"
              >
                {loc}
                <button
                  type="button"
                  onClick={() => handleRemoveLocation(loc)}
                  className="hover:text-red-400 text-[#7E7E7E] cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={newLocationInput}
                onChange={(e) => setNewLocationInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLocation())}
                placeholder="Add city or region..."
                className="px-2 py-1 text-xs bg-transparent focus:outline-none text-[#F5F5F5] placeholder:text-[#7E7E7E]"
              />
              <button
                type="button"
                onClick={handleAddLocation}
                className="p-1 rounded-md hover:bg-[#242424] text-[#BDBDBD] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Work Modes & Employment Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#7E7E7E] block">
              Work Mode Acceptance
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-[#F5F5F5] cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.remotePreference}
                  onChange={(e) => setPreferences({ ...preferences, remotePreference: e.target.checked })}
                  className="rounded border-[#242424] bg-[#151515] text-[#8B5CF6] focus:ring-0"
                />
                Remote
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-[#F5F5F5] cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.hybridPreference}
                  onChange={(e) => setPreferences({ ...preferences, hybridPreference: e.target.checked })}
                  className="rounded border-[#242424] bg-[#151515] text-[#8B5CF6] focus:ring-0"
                />
                Hybrid
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-[#F5F5F5] cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.onsitePreference}
                  onChange={(e) => setPreferences({ ...preferences, onsitePreference: e.target.checked })}
                  className="rounded border-[#242424] bg-[#151515] text-[#8B5CF6] focus:ring-0"
                />
                On-site
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#7E7E7E] block">
              Employment Types
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {['Full-time', 'Contract', 'Internship', 'Part-time'].map((type) => (
                <label key={type} className="flex items-center gap-2 text-xs font-semibold text-[#F5F5F5] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={employmentTypes.includes(type)}
                    onChange={() => toggleEmploymentType(type)}
                    className="rounded border-[#242424] bg-[#151515] text-[#8B5CF6] focus:ring-0"
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Salary Expectations */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#7E7E7E] block mb-1.5">
              Currency
            </label>
            <CustomSelect
              value={preferences.salaryCurrency}
              onChange={(val) => setPreferences({ ...preferences, salaryCurrency: val })}
              options={CURRENCY_OPTIONS}
              placeholder="Select currency..."
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#7E7E7E] block mb-1.5">
              Minimum Acceptable Salary
            </label>
            <input
              type="number"
              value={preferences.minExpectedSalary}
              onChange={(e) => setPreferences({ ...preferences, minExpectedSalary: e.target.value })}
              className="w-full px-3 py-2 bg-[#151515] border border-[#242424] rounded-lg text-sm text-[#F5F5F5] placeholder:text-[#565656] focus:outline-none focus:border-[#8B5CF6]"
              placeholder="e.g. 1000000"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#7E7E7E] block mb-1.5">
              Preferred Salary (Min)
            </label>
            <input
              type="number"
              value={preferences.preferredSalaryMin}
              onChange={(e) => setPreferences({ ...preferences, preferredSalaryMin: e.target.value })}
              className="w-full px-3 py-2 bg-[#151515] border border-[#242424] rounded-lg text-sm text-[#F5F5F5] placeholder:text-[#565656] focus:outline-none focus:border-[#8B5CF6]"
              placeholder="e.g. 1200000"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#7E7E7E] block mb-1.5">
              Preferred Salary (Max)
            </label>
            <input
              type="number"
              value={preferences.preferredSalaryMax}
              onChange={(e) => setPreferences({ ...preferences, preferredSalaryMax: e.target.value })}
              className="w-full px-3 py-2 bg-[#151515] border border-[#242424] rounded-lg text-sm text-[#F5F5F5] placeholder:text-[#565656] focus:outline-none focus:border-[#8B5CF6]"
              placeholder="e.g. 1800000"
            />
          </div>
        </div>

        {/* Relocation & Travel */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-[#F5F5F5] cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.willingToRelocate}
              onChange={(e) => setPreferences({ ...preferences, willingToRelocate: e.target.checked })}
              className="rounded border-[#242424] bg-[#151515] text-[#8B5CF6] focus:ring-0"
            />
            Willing to Relocate for Roles
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold text-[#F5F5F5] cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.willingToTravel}
              onChange={(e) => setPreferences({ ...preferences, willingToTravel: e.target.checked })}
              className="rounded border-[#242424] bg-[#151515] text-[#8B5CF6] focus:ring-0"
            />
            Willing to Travel for Work
          </label>
        </div>
      </div>

      {/* ─── SECTION 4: APPLICATION ANSWERS & WORK AUTH ─────────────── */}
      <div className="bg-[#101010] border border-[#242424] rounded-xl p-6 md:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#242424]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#151515] border border-[#242424] flex items-center justify-center">
              <Clock className="w-4 h-4 text-[#8B5CF6]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#F5F5F5]">Application Answers & Work Authorization</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {/* Work Authorization */}
          <div className="rounded-xl bg-[#0A0A0A] border border-[#242424] hover:border-[#303030] p-4 transition-colors flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-[#BDBDBD] tracking-wide">
                Work Authorization *
              </label>
              {answers['work_authorization']?.status === 'VERIFIED' && answers['work_authorization']?.value !== 'unknown' ? (
                <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              ) : (
                <span className="text-[10px] font-medium text-[#7E7E7E] bg-[#141414] border border-[#242424] px-2 py-0.5 rounded-full">
                  Not set
                </span>
              )}
            </div>
            <CustomSelect
              value={answers['work_authorization']?.value || 'unknown'}
              onChange={(val) =>
                updateAnswerField(
                  'work_authorization',
                  val,
                  val === 'unknown' ? 'UNKNOWN' : 'VERIFIED'
                )
              }
              options={WORK_AUTH_OPTIONS}
              placeholder="Select status..."
            />
          </div>

          {/* Visa Sponsorship Now */}
          <div className="rounded-xl bg-[#0A0A0A] border border-[#242424] hover:border-[#303030] p-4 transition-colors flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-[#BDBDBD] tracking-wide">
                Visa Sponsorship Now
              </label>
              {answers['visa_sponsorship_now']?.status === 'VERIFIED' && answers['visa_sponsorship_now']?.value !== 'unknown' ? (
                <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              ) : (
                <span className="text-[10px] font-medium text-[#7E7E7E] bg-[#141414] border border-[#242424] px-2 py-0.5 rounded-full">
                  Not set
                </span>
              )}
            </div>
            <CustomSelect
              value={answers['visa_sponsorship_now']?.value || 'unknown'}
              onChange={(val) =>
                updateAnswerField(
                  'visa_sponsorship_now',
                  val,
                  val === 'unknown' ? 'UNKNOWN' : 'VERIFIED'
                )
              }
              options={VISA_SPONSORSHIP_NOW_OPTIONS}
              placeholder="Select status..."
            />
          </div>

          {/* Visa Sponsorship Future */}
          <div className="rounded-xl bg-[#0A0A0A] border border-[#242424] hover:border-[#303030] p-4 transition-colors flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-[#BDBDBD] tracking-wide">
                Visa Sponsorship (Future)
              </label>
              {answers['visa_sponsorship_future']?.status === 'VERIFIED' && answers['visa_sponsorship_future']?.value !== 'unknown' ? (
                <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              ) : (
                <span className="text-[10px] font-medium text-[#7E7E7E] bg-[#141414] border border-[#242424] px-2 py-0.5 rounded-full">
                  Not set
                </span>
              )}
            </div>
            <CustomSelect
              value={answers['visa_sponsorship_future']?.value || 'unknown'}
              onChange={(val) =>
                updateAnswerField(
                  'visa_sponsorship_future',
                  val,
                  val === 'unknown' ? 'UNKNOWN' : 'VERIFIED'
                )
              }
              options={VISA_SPONSORSHIP_FUTURE_OPTIONS}
              placeholder="Select status..."
            />
          </div>

          {/* Notice Period */}
          <div className="rounded-xl bg-[#0A0A0A] border border-[#242424] hover:border-[#303030] p-4 transition-colors flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-[#BDBDBD] tracking-wide">
                Notice Period *
              </label>
              {answers['notice_period']?.status === 'VERIFIED' && answers['notice_period']?.value ? (
                <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              ) : (
                <span className="text-[10px] font-medium text-[#7E7E7E] bg-[#141414] border border-[#242424] px-2 py-0.5 rounded-full">
                  Not set
                </span>
              )}
            </div>
            <CustomSelect
              value={answers['notice_period']?.value || ''}
              onChange={(val) =>
                updateAnswerField('notice_period', val, val ? 'VERIFIED' : 'UNKNOWN')
              }
              options={NOTICE_PERIOD_OPTIONS}
              placeholder="Select notice period..."
            />
          </div>

          {/* Available Start Date */}
          <div className="rounded-xl bg-[#0A0A0A] border border-[#242424] hover:border-[#303030] p-4 transition-colors flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-[#BDBDBD] tracking-wide">
                Earliest Start Date
              </label>
              {answers['available_start_date']?.status === 'VERIFIED' && answers['available_start_date']?.value ? (
                <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              ) : (
                <span className="text-[10px] font-medium text-[#7E7E7E] bg-[#141414] border border-[#242424] px-2 py-0.5 rounded-full">
                  Optional
                </span>
              )}
            </div>
            <input
              type="date"
              value={answers['available_start_date']?.value || ''}
              onChange={(e) => updateAnswerField('available_start_date', e.target.value, e.target.value ? 'VERIFIED' : 'UNKNOWN')}
              className="w-full h-10 bg-[#121212] hover:bg-[#161616] border border-[#242424] hover:border-[#383838] focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]/40 rounded-lg px-3.5 text-xs font-medium text-[#F5F5F5] transition-colors outline-none scheme-dark"
            />
          </div>

          {/* Current CTC */}
          <div className="rounded-xl bg-[#0A0A0A] border border-[#242424] hover:border-[#303030] p-4 transition-colors flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-[#BDBDBD] tracking-wide">
                Current Compensation
              </label>
              {answers['current_ctc']?.status === 'VERIFIED' && answers['current_ctc']?.value ? (
                <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              ) : (
                <span className="text-[10px] font-medium text-[#7E7E7E] bg-[#141414] border border-[#242424] px-2 py-0.5 rounded-full">
                  Optional
                </span>
              )}
            </div>
            <input
              type="text"
              value={answers['current_ctc']?.value || ''}
              onChange={(e) => updateAnswerField('current_ctc', e.target.value, e.target.value ? 'VERIFIED' : 'UNKNOWN')}
              placeholder="e.g. ₹9 LPA or $85,000"
              className="w-full h-10 bg-[#121212] hover:bg-[#161616] border border-[#242424] hover:border-[#383838] focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]/40 rounded-lg px-3.5 text-xs font-medium text-[#F5F5F5] placeholder-[#555555] transition-colors outline-none"
            />
          </div>
        </div>
      </div>

      {/* ─── FOOTER ACTIONS ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-4 p-4 rounded-xl bg-[#101010] border border-[#242424] shadow-xs">
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg text-xs font-medium shadow-xs transition-all cursor-pointer disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5 text-white" />
          {saving ? 'Saving Profile...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}
