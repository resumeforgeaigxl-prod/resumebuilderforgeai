'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Loader2,
  FileText,
  Search,
  Filter,
  RefreshCw,
  Zap,
  Bot,
  ShieldAlert,
  Play,
  Pause,
  Sliders,
  Check,
  X,
} from '@/components/icons';
import type {
  AutopilotPolicy,
  AutopilotMode,
  RemotePreference,
  AutopilotActivityStats,
  AutopilotReviewItem,
} from '@/lib/autopilot/types';

interface AutopilotControlCenterProps {
  locale?: string;
}

export function AutopilotControlCenter({ locale = 'en-in' }: AutopilotControlCenterProps) {
  const [policy, setPolicy] = useState<AutopilotPolicy | null>(null);
  const [stats, setStats] = useState<AutopilotActivityStats | null>(null);
  const [reviewQueue, setReviewQueue] = useState<AutopilotReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [runningCycle, setRunningCycle] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form states
  const [mode, setMode] = useState<AutopilotMode>('OFF');
  const [enabled, setEnabled] = useState(false);
  const [targetRolesInput, setTargetRolesInput] = useState('');
  const [locationsInput, setLocationsInput] = useState('');
  const [remotePreference, setRemotePreference] = useState<RemotePreference>('ANY');
  const [minMatchScore, setMinMatchScore] = useState(75);
  const [dailyPrepLimit, setDailyPrepLimit] = useState(5);
  const [dailySubLimit, setDailySubLimit] = useState(2);
  const [creditBudgetDay, setCreditBudgetDay] = useState(40);
  const [excludedCompaniesInput, setExcludedCompaniesInput] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [policyRes, reviewRes] = await Promise.all([
        fetch('/api/autopilot/policy'),
        fetch('/api/autopilot/review'),
      ]);

      const policyData = await policyRes.json();
      const reviewData = await reviewRes.json();

      if (policyData.success && policyData.policy) {
        const p: AutopilotPolicy = policyData.policy;
        setPolicy(p);
        setMode(p.mode);
        setEnabled(p.enabled);
        setTargetRolesInput(p.targetRoles.join(', '));
        setLocationsInput(p.preferredLocations.join(', '));
        setRemotePreference(p.remotePreference);
        setMinMatchScore(p.minMatchScore);
        setDailyPrepLimit(p.dailyPreparationLimit);
        setDailySubLimit(p.dailySubmissionLimit);
        setCreditBudgetDay(p.creditBudgetPerDay);
        setExcludedCompaniesInput(p.excludedCompanies.join(', '));
      }

      if (policyData.stats) {
        setStats(policyData.stats);
      }

      if (reviewData.success && reviewData.reviewQueue) {
        setReviewQueue(reviewData.reviewQueue);
      }
    } catch (err: any) {
      console.error('Failed to load Autopilot data:', err);
      setMessage({ text: 'Could not load Autopilot policy.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSavePolicy = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);

      const targetRoles = targetRolesInput
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);

      const preferredLocations = locationsInput
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean);

      const excludedCompanies = excludedCompaniesInput
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

      const res = await fetch('/api/autopilot/policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: {
            enabled,
            mode,
            targetRoles,
            preferredLocations,
            remotePreference,
            minMatchScore,
            dailyPreparationLimit: dailyPrepLimit,
            dailySubmissionLimit: dailySubLimit,
            creditBudgetPerDay: creditBudgetDay,
            excludedCompanies,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPolicy(data.policy);
        setStats(data.stats);
        setMessage({ text: 'Autopilot policy saved successfully.', type: 'success' });
      } else {
        setMessage({ text: data.error || 'Failed to save settings.', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Network error saving policy.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePause = async () => {
    if (!policy) return;
    try {
      setSaving(true);
      const action = policy.isPaused ? 'RESUME' : 'PAUSE';
      const res = await fetch('/api/autopilot/policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        setPolicy(data.policy);
        setMessage({
          text: policy.isPaused ? 'Autopilot resumed.' : 'Autopilot paused.',
          type: 'success',
        });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to toggle pause state.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleRunNow = async () => {
    try {
      setRunningCycle(true);
      setMessage(null);
      const res = await fetch('/api/autopilot/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success && data.run) {
        setMessage({
          text: `Autopilot cycle finished (${data.run.status}): ${data.run.applicationsPrepared} prepared, ${data.run.creditsSettled} credits settled.`,
          type: 'success',
        });
        await fetchData();
      } else {
        setMessage({ text: data.error || 'Autopilot run failed.', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Error triggering Autopilot.', type: 'error' });
    } finally {
      setRunningCycle(false);
    }
  };

  const handleApproveApplication = async (applicationId: string) => {
    try {
      const res = await fetch('/api/autopilot/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'APPROVE', applicationId }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Application approved for scheduled execution.', type: 'success' });
        await fetchData();
      }
    } catch {
      // Handled
    }
  };

  const handleSkipApplication = async (applicationId: string) => {
    try {
      const res = await fetch('/api/autopilot/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SKIP', applicationId }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Application skipped.', type: 'success' });
        await fetchData();
      }
    } catch {
      // Handled
    }
  };

  const isRunning = policy?.enabled && !policy?.isPaused && mode !== 'OFF';
  const isPaused = policy?.isPaused;

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4 text-[#F5F5F5] animate-fade-in">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#101010] border border-[#242424] flex items-center justify-center text-[#8B5CF6] shadow-xs">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-[0.22em] text-[#7E7E7E] font-mono">
                Omni Autopilot Engine
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${
                  isRunning
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                    : isPaused
                    ? 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                    : 'bg-[#151515] text-[#7E7E7E] border-[#242424]'
                }`}
              >
                {isRunning ? 'RUNNING' : isPaused ? 'PAUSED' : 'OFF'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F5F5F5] mt-1">
              Autopilot Control Center
            </h1>
            <p className="text-xs text-[#7E7E7E] mt-1">
              Policy-driven job discovery, automatic tailoring, and controlled execution within your budget.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {policy?.enabled && (
            <button
              onClick={handleTogglePause}
              disabled={saving}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                isPaused
                  ? 'border-emerald-800/50 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/40'
                  : 'border-[#242424] bg-[#101010] text-[#BDBDBD] hover:text-[#F5F5F5] hover:bg-[#151515]'
              }`}
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
          )}

          <button
            onClick={handleRunNow}
            disabled={runningCycle || !enabled || mode === 'OFF'}
            className="px-4 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          >
            {runningCycle ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Zap className="w-3.5 h-3.5" />
            )}
            <span>Run Cycle Now</span>
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'border-emerald-800/40 bg-emerald-950/40 text-emerald-300'
              : 'border-rose-800/40 bg-rose-950/40 text-rose-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Today's Activity Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl border border-[#242424] bg-[#0A0A0A]">
          <span className="text-[10px] font-mono text-[#7E7E7E] uppercase block">Evaluated Today</span>
          <span className="text-xl font-bold font-mono text-[#F5F5F5] mt-1 block">
            {stats?.jobsEvaluatedToday ?? 0}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl border border-[#242424] bg-[#0A0A0A]">
          <span className="text-[10px] font-mono text-[#7E7E7E] uppercase block">Eligible Matches</span>
          <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
            {stats?.jobsEligibleToday ?? 0}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl border border-[#242424] bg-[#0A0A0A]">
          <span className="text-[10px] font-mono text-[#7E7E7E] uppercase block">Prepared Today</span>
          <span className="text-xl font-bold font-mono text-[#8B5CF6] mt-1 block">
            {stats?.applicationsPreparedToday ?? 0}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl border border-[#242424] bg-[#0A0A0A]">
          <span className="text-[10px] font-mono text-[#7E7E7E] uppercase block">Submitted Today</span>
          <span className="text-xl font-bold font-mono text-[#C4B5FD] mt-1 block">
            {stats?.applicationsSubmittedToday ?? 0}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl border border-[#242424] bg-[#0A0A0A] col-span-2 sm:col-span-1">
          <span className="text-[10px] font-mono text-[#7E7E7E] uppercase block">Credits Remaining</span>
          <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">
            {stats?.creditsBudgetRemaining ?? 40} cr
          </span>
        </div>
      </div>

      {/* Main Settings & Policy Form */}
      <form onSubmit={handleSavePolicy} className="space-y-6">
        {/* Operating Modes Selection */}
        <div className="p-6 rounded-2xl border border-[#242424] bg-[#0A0A0A] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-[#F5F5F5]">
              Operating Mode
            </h2>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#BDBDBD]">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => {
                  setEnabled(e.target.checked);
                  if (!e.target.checked) setMode('OFF');
                  else if (mode === 'OFF') setMode('PREPARE');
                }}
                className="accent-[#8B5CF6] w-4 h-4"
              />
              <span>Enable Autopilot</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[
              {
                id: 'OFF',
                title: 'OFF',
                desc: 'No automated discovery or preparation.',
                color: 'border-[#242424]',
              },
              {
                id: 'DISCOVER',
                title: 'DISCOVER',
                desc: 'Finds and scores jobs. 0 credits burned.',
                color: 'border-blue-800/40 text-blue-400',
              },
              {
                id: 'PREPARE',
                title: 'PREPARE',
                desc: 'Matches & prepares tailored packages for review. (4 cr/app)',
                color: 'border-[#8B5CF6]/40 text-[#C4B5FD]',
              },
              {
                id: 'REVIEW_AND_EXECUTE',
                title: 'REVIEW & EXECUTE',
                desc: 'Prepares packages and executes approved browser submissions. (8 cr/sub)',
                color: 'border-emerald-800/40 text-emerald-400',
              },
            ].map((m) => {
              const selected = mode === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    setMode(m.id as AutopilotMode);
                    if (m.id !== 'OFF') setEnabled(true);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selected
                      ? 'border-[#8B5CF6] bg-[#8B5CF6]/10 shadow-xs'
                      : 'border-[#242424] bg-[#101010] hover:bg-[#151515]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold font-mono tracking-wider">{m.title}</span>
                    <input
                      type="radio"
                      name="autopilot_mode"
                      checked={selected}
                      onChange={() => {}}
                      className="accent-[#8B5CF6]"
                    />
                  </div>
                  <p className="text-[11px] text-[#7E7E7E] leading-relaxed">{m.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Candidate Target Criteria */}
        <div className="p-6 rounded-2xl border border-[#242424] bg-[#0A0A0A] space-y-4">
          <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-[#F5F5F5]">
            Target Criteria & Preferences
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-mono uppercase text-[#7E7E7E] block mb-1.5">
                Target Job Roles (Comma Separated)
              </label>
              <input
                type="text"
                placeholder="Backend Engineer, Fullstack Developer, Software Engineer"
                value={targetRolesInput}
                onChange={(e) => setTargetRolesInput(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-[#242424] bg-[#101010] text-xs text-[#F5F5F5] placeholder:text-[#7E7E7E] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-[#7E7E7E] block mb-1.5">
                Preferred Locations (Comma Separated)
              </label>
              <input
                type="text"
                placeholder="India, Bangalore, Remote"
                value={locationsInput}
                onChange={(e) => setLocationsInput(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-[#242424] bg-[#101010] text-xs text-[#F5F5F5] placeholder:text-[#7E7E7E] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-[#7E7E7E] block mb-1.5">
                Workplace Remote Preference
              </label>
              <select
                value={remotePreference}
                onChange={(e) => setRemotePreference(e.target.value as RemotePreference)}
                className="w-full h-10 px-3 rounded-xl border border-[#242424] bg-[#101010] text-xs text-[#F5F5F5] focus:outline-none focus:border-[#8B5CF6]"
              >
                <option value="REMOTE">Remote Only (Strict)</option>
                <option value="HYBRID">Hybrid Allowed</option>
                <option value="ONSITE">On-Site Allowed</option>
                <option value="ANY">Any (Remote, Hybrid, or On-Site)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-[#7E7E7E] block mb-1.5">
                Minimum Match Score Threshold ({minMatchScore}%)
              </label>
              <input
                type="range"
                min={50}
                max={95}
                step={5}
                value={minMatchScore}
                onChange={(e) => setMinMatchScore(Number(e.target.value))}
                className="w-full accent-[#8B5CF6]"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#7E7E7E] mt-1">
                <span>50% (Broad)</span>
                <span>75% (Balanced)</span>
                <span>95% (Strict)</span>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-[11px] font-mono uppercase text-[#7E7E7E] block mb-1.5">
                Excluded Companies (Will Never Prepare or Apply)
              </label>
              <input
                type="text"
                placeholder="Current Employer, Specific staffing agencies..."
                value={excludedCompaniesInput}
                onChange={(e) => setExcludedCompaniesInput(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-[#242424] bg-[#101010] text-xs text-[#F5F5F5] placeholder:text-[#7E7E7E] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>
          </div>
        </div>

        {/* Limits & Budgets */}
        <div className="p-6 rounded-2xl border border-[#242424] bg-[#0A0A0A] space-y-4">
          <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-[#F5F5F5]">
            Execution Limits & Credit Budgets
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-[11px] font-mono uppercase text-[#7E7E7E] block mb-1.5">
                Daily Prep Limit
              </label>
              <input
                type="number"
                min={1}
                max={15}
                value={dailyPrepLimit}
                onChange={(e) => setDailyPrepLimit(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl border border-[#242424] bg-[#101010] text-xs text-[#F5F5F5] focus:outline-none focus:border-[#8B5CF6]"
              />
              <span className="text-[10px] text-[#7E7E7E] mt-1 block">Max packages prepared / day</span>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-[#7E7E7E] block mb-1.5">
                Daily Submission Limit
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={dailySubLimit}
                onChange={(e) => setDailySubLimit(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl border border-[#242424] bg-[#101010] text-xs text-[#F5F5F5] focus:outline-none focus:border-[#8B5CF6]"
              />
              <span className="text-[10px] text-[#7E7E7E] mt-1 block">Approved submissions / day</span>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-[#7E7E7E] block mb-1.5">
                Daily Credit Budget
              </label>
              <input
                type="number"
                min={10}
                max={200}
                value={creditBudgetDay}
                onChange={(e) => setCreditBudgetDay(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl border border-[#242424] bg-[#101010] text-xs text-[#F5F5F5] focus:outline-none focus:border-[#8B5CF6]"
              />
              <span className="text-[10px] text-[#7E7E7E] mt-1 block">Credits spent limit / day</span>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 h-11 rounded-xl bg-[#F5F5F5] hover:bg-white text-black font-semibold text-xs flex items-center gap-2 transition-all shadow-xs"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>Save Autopilot Settings</span>
          </button>
        </div>
      </form>

      {/* Candidate Review Queue */}
      {reviewQueue.length > 0 && (
        <div className="p-6 rounded-2xl border border-[#242424] bg-[#0A0A0A] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-[#F5F5F5]">
                Candidate Review Queue ({reviewQueue.length})
              </h2>
            </div>
            <span className="text-xs text-[#7E7E7E]">
              Prepared applications requiring candidate approval
            </span>
          </div>

          <div className="space-y-3">
            {reviewQueue.map((item) => (
              <div
                key={item.applicationId}
                className="p-4 rounded-xl border border-[#242424] bg-[#101010] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono uppercase font-semibold text-[#8B5CF6] truncate">
                      {item.companyName}
                    </span>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold border border-emerald-800/40 bg-emerald-950/40 text-emerald-400">
                      {item.matchScore}% Match
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#F5F5F5] truncate">{item.roleTitle}</h3>
                  <p className="text-xs text-[#7E7E7E] truncate">{item.matchSummary}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleSkipApplication(item.applicationId)}
                    className="h-8 px-3 rounded-lg border border-[#242424] bg-[#151515] hover:bg-[#1E1E1E] text-xs font-semibold text-[#7E7E7E] hover:text-[#F5F5F5]"
                  >
                    Skip
                  </button>
                  <button
                    onClick={() => handleApproveApplication(item.applicationId)}
                    className="h-8 px-4 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Schedule</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
