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
  X,
  ShieldCheck,
  User,
  Bot,
  Calendar,
  Building,
  MapPin,
  Check,
} from '@/components/icons';
import type {
  ApplicationDetailView,
  ApplicationStatus,
  ApplicationStatusEvent,
  ApplicationEvidence,
} from '@/lib/application-tracker/types';
import { APPLICATION_STATUS_CONFIG } from '@/lib/application-tracker/types';

interface ApplicationDetailDrawerProps {
  applicationId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated?: () => void;
}

export function ApplicationDetailDrawer({
  applicationId,
  isOpen,
  onClose,
  onStatusUpdated,
}: ApplicationDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'evidence'>('overview');
  const [detail, setDetail] = useState<ApplicationDetailView | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Status update modal state
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedNextStatus, setSelectedNextStatus] = useState<ApplicationStatus>('INTERVIEW');
  const [statusNotes, setStatusNotes] = useState('');
  const [attestationConfirmed, setAttestationConfirmed] = useState(false);
  const [submittingStatus, setSubmittingStatus] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && applicationId) {
      fetchDetail();
    } else {
      setDetail(null);
      setError(null);
      setIsUpdateModalOpen(false);
    }
  }, [isOpen, applicationId]);

  const fetchDetail = async () => {
    if (!applicationId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/applications/tracker?id=${applicationId}`);
      const data = await res.json();
      if (data.success && data.application) {
        setDetail(data.application);
      } else {
        setError(data.error || 'Failed to load application detail');
      }
    } catch (err: any) {
      console.error('Error fetching application detail:', err);
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationId) return;
    if (!attestationConfirmed) {
      setUpdateError('Please confirm the attestation checkbox before saving.');
      return;
    }

    try {
      setSubmittingStatus(true);
      setUpdateError(null);
      const res = await fetch('/api/applications/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'USER_REPORTED_STATUS',
          applicationId,
          nextStatus: selectedNextStatus,
          notes: statusNotes,
          attestationText: statusNotes || `User self-reported status update to ${selectedNextStatus}`,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setUpdateError(data.error || 'Failed to update status');
        return;
      }

      setIsUpdateModalOpen(false);
      setStatusNotes('');
      setAttestationConfirmed(false);
      await fetchDetail();
      onStatusUpdated?.();
    } catch (err: any) {
      setUpdateError(err.message || 'Failed to submit status update');
    } finally {
      setSubmittingStatus(false);
    }
  };

  if (!isOpen) return null;

  const currentConfig = detail?.status ? APPLICATION_STATUS_CONFIG[detail.status] : null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="w-full max-w-2xl bg-[#0A0A0A] border-l border-[#242424] h-full flex flex-col shadow-2xl text-[#F5F5F5] overflow-hidden">
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#242424] bg-[#050505] flex items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold text-[#8B5CF6]">
                {detail?.companyName || 'Employer Application'}
              </span>
              {currentConfig && (
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border tracking-tight"
                  style={{
                    backgroundColor: currentConfig.badgeBg,
                    color: currentConfig.badgeText,
                    borderColor: currentConfig.borderColor,
                  }}
                >
                  {currentConfig.label.toUpperCase()}
                </span>
              )}
              {detail?.submissionMethod === 'OMNI_BROWSER' && (
                <span className="px-2 py-0.5 rounded-md bg-[#101010] border border-[#242424] text-[10px] font-mono text-[#BDBDBD] flex items-center gap-1">
                  <Bot className="w-3 h-3 text-[#8B5CF6]" />
                  <span>Omni Agent</span>
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#F5F5F5] truncate">
              {detail?.roleTitle || 'Position Details'}
            </h2>
            <p className="text-xs text-[#7E7E7E]">
              Canonical ID: <span className="font-mono">{detail?.id}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsUpdateModalOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-[#8B5CF6]/40 bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 text-[#C4B5FD] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>Update Status</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-[#242424] bg-[#101010] hover:bg-[#151515] text-[#7E7E7E] hover:text-[#F5F5F5] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#242424] bg-[#0A0A0A] px-6 gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-[#8B5CF6] text-[#F5F5F5]'
                : 'border-transparent text-[#7E7E7E] hover:text-[#BDBDBD]'
            }`}
          >
            Overview & Receipt
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'border-[#8B5CF6] text-[#F5F5F5]'
                : 'border-transparent text-[#7E7E7E] hover:text-[#BDBDBD]'
            }`}
          >
            <span>Activity Timeline</span>
            {detail?.timeline && detail.timeline.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#151515] border border-[#242424] text-[#BDBDBD]">
                {detail.timeline.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'evidence'
                ? 'border-[#8B5CF6] text-[#F5F5F5]'
                : 'border-transparent text-[#7E7E7E] hover:text-[#BDBDBD]'
            }`}
          >
            <span>Evidence Records</span>
            {detail?.evidence && detail.evidence.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#151515] border border-[#242424] text-[#BDBDBD]">
                {detail.evidence.length}
              </span>
            )}
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#8B5CF6]" />
              <p className="text-xs text-[#7E7E7E]">Loading application evidence and history...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/40 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          ) : detail ? (
            <>
              {/* TAB 1: OVERVIEW & RECEIPT */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div
                    className="p-4 rounded-2xl border space-y-1"
                    style={{
                      backgroundColor: currentConfig?.badgeBg || '#101010',
                      borderColor: currentConfig?.borderColor || '#242424',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs font-bold uppercase tracking-wider font-mono"
                        style={{ color: currentConfig?.badgeText || '#F5F5F5' }}
                      >
                        {currentConfig?.label}
                      </span>
                      {detail.appliedAt && (
                        <span className="text-[11px] text-[#7E7E7E] font-mono">
                          Applied {new Date(detail.appliedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#BDBDBD]">{currentConfig?.description}</p>
                  </div>

                  {/* SUBMISSION RECEIPT CARD */}
                  {detail.submissionReceipt ? (
                    <div className="p-5 rounded-2xl border border-[#8B5CF6]/30 bg-[#101010] space-y-4 shadow-sm">
                      <div className="flex items-center justify-between border-b border-[#242424] pb-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#8B5CF6]" />
                          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F5F5F5]">
                            Verified Submission Receipt
                          </h3>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-800/50 bg-emerald-950/50 text-emerald-400 flex items-center gap-1 font-mono">
                          <ShieldCheck className="w-3 h-3" />
                          <span>{detail.submissionReceipt.verificationStatus}</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] text-[#7E7E7E] font-mono uppercase block">Confirmation Code</span>
                          <span className="font-mono font-bold text-[#F5F5F5]">
                            {detail.submissionReceipt.confirmationCode || 'CONFIRMED'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#7E7E7E] font-mono uppercase block">ATS Provider</span>
                          <span className="font-mono font-bold text-[#8B5CF6]">
                            {detail.submissionReceipt.atsProvider || 'DIRECT PORTAL'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#7E7E7E] font-mono uppercase block">Submitted At</span>
                          <span className="font-mono text-[#BDBDBD]">
                            {new Date(detail.submissionReceipt.submittedAt).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#7E7E7E] font-mono uppercase block">Resume Attached</span>
                          <span className="font-mono text-[#BDBDBD] truncate block">
                            {detail.submissionReceipt.resumeTitle || detail.resumeVersionId || 'Tailored Resume'}
                          </span>
                        </div>
                      </div>

                      {detail.submissionReceipt.confirmationMessage && (
                        <div className="p-3 rounded-xl bg-[#050505] border border-[#242424] text-xs text-[#BDBDBD] font-mono">
                          "{detail.submissionReceipt.confirmationMessage}"
                        </div>
                      )}
                    </div>
                  ) : detail.status === 'APPLIED' ? (
                    <div className="p-4 rounded-xl border border-[#242424] bg-[#101010] text-xs text-[#BDBDBD] flex items-center gap-2">
                      <User className="w-4 h-4 text-[#8B5CF6]" />
                      <span>Application marked as Applied based on candidate reporting.</span>
                    </div>
                  ) : null}

                  {/* Job Snapshot */}
                  <div className="p-5 rounded-2xl border border-[#242424] bg-[#101010] space-y-3">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#7E7E7E]">
                      Position Snapshot
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-[#F5F5F5]">
                        <Building className="w-3.5 h-3.5 text-[#7E7E7E]" />
                        <span className="font-semibold">{detail.companyName}</span>
                      </div>
                      {detail.jobSnapshot?.location && (
                        <div className="flex items-center gap-2 text-[#BDBDBD]">
                          <MapPin className="w-3.5 h-3.5 text-[#7E7E7E]" />
                          <span>{detail.jobSnapshot.location}</span>
                        </div>
                      )}
                      {detail.jobSnapshot?.applyUrl && (
                        <div className="pt-2">
                          <a
                            href={detail.jobSnapshot.applyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-[#8B5CF6] hover:text-[#A78BFA] transition-colors"
                          >
                            <span>Open Employer Job Posting</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Candidate Notes */}
                  {detail.notes && (
                    <div className="p-4 rounded-xl border border-[#242424] bg-[#101010] space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#7E7E7E]">Notes</span>
                      <p className="text-xs text-[#BDBDBD] whitespace-pre-wrap">{detail.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: ACTIVITY TIMELINE */}
              {activeTab === 'timeline' && (
                <div className="space-y-4">
                  <div className="text-xs text-[#7E7E7E]">
                    Immutable audit log of all state transitions and verified hiring milestones.
                  </div>

                  {detail.timeline.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-[#242424] rounded-xl text-xs text-[#7E7E7E]">
                      No recorded events yet.
                    </div>
                  ) : (
                    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#242424]">
                      {detail.timeline.map((evt, idx) => {
                        const isBrowser = evt.source === 'BROWSER_CONFIRMATION';
                        const isUser = evt.source === 'USER_REPORTED';

                        return (
                          <div key={evt.id || idx} className="relative group">
                            {/* Dot */}
                            <div
                              className={`absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 ${
                                isBrowser
                                  ? 'bg-[#8B5CF6] border-[#0A0A0A]'
                                  : isUser
                                  ? 'bg-emerald-400 border-[#0A0A0A]'
                                  : 'bg-[#7E7E7E] border-[#0A0A0A]'
                              }`}
                            />

                            <div className="p-4 rounded-xl border border-[#242424] bg-[#101010] space-y-2">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-[#F5F5F5]">
                                    {evt.previousStatus ? `${evt.previousStatus} → ` : ''}
                                    <span className="text-[#8B5CF6]">{evt.nextStatus}</span>
                                  </span>
                                  <span
                                    className={`px-2 py-0.2 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider border ${
                                      isBrowser
                                        ? 'bg-[#8B5CF6]/15 border-[#8B5CF6]/30 text-[#C4B5FD]'
                                        : isUser
                                        ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400'
                                        : 'bg-[#151515] border-[#242424] text-[#7E7E7E]'
                                    }`}
                                  >
                                    {evt.source.replace('_', ' ')}
                                  </span>
                                </div>
                                <span className="text-[10px] font-mono text-[#7E7E7E]">
                                  {new Date(evt.occurredAt).toLocaleString()}
                                </span>
                              </div>

                              {evt.notes && (
                                <p className="text-xs text-[#BDBDBD] leading-relaxed">{evt.notes}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: EVIDENCE RECORDS */}
              {activeTab === 'evidence' && (
                <div className="space-y-4">
                  <div className="text-xs text-[#7E7E7E]">
                    Verifiable artifacts, employer portal confirmations, and user attestations.
                  </div>

                  {detail.evidence.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-[#242424] rounded-xl text-xs text-[#7E7E7E]">
                      No evidence records recorded for this application.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {detail.evidence.map((evi) => (
                        <div
                          key={evi.id}
                          className="p-4 rounded-xl border border-[#242424] bg-[#101010] space-y-2.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-[#F5F5F5]">
                                {evi.type}
                              </span>
                              <span className="text-[10px] font-mono text-[#7E7E7E]">
                                ({evi.source})
                              </span>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${
                                evi.verificationStatus === 'VERIFIED'
                                  ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400'
                                  : evi.verificationStatus === 'USER_REPORTED'
                                  ? 'bg-[#8B5CF6]/15 border-[#8B5CF6]/30 text-[#C4B5FD]'
                                  : 'bg-[#151515] border-[#242424] text-[#7E7E7E]'
                              }`}
                            >
                              {evi.verificationStatus}
                            </span>
                          </div>

                          {evi.externalReference && (
                            <div className="text-xs text-[#BDBDBD]">
                              Ref: <span className="font-mono font-semibold">{evi.externalReference}</span>
                            </div>
                          )}

                          {evi.metadata && Object.keys(evi.metadata).length > 0 && (
                            <pre className="p-2.5 rounded-lg bg-[#050505] border border-[#242424] text-[10px] font-mono text-[#7E7E7E] overflow-x-auto">
                              {JSON.stringify(evi.metadata, null, 2)}
                            </pre>
                          )}

                          <div className="text-[10px] font-mono text-[#7E7E7E] pt-1">
                            Captured {new Date(evi.capturedAt).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Status Update Modal */}
        {isUpdateModalOpen && (
          <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#101010] border border-[#242424] rounded-2xl p-6 shadow-2xl space-y-4 animate-scale-up">
              <div className="flex items-center justify-between border-b border-[#242424] pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                  <h3 className="text-sm font-bold text-[#F5F5F5]">Update Application Milestone</h3>
                </div>
                <button
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="text-[#7E7E7E] hover:text-[#F5F5F5]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {updateError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-xs text-rose-300">
                  {updateError}
                </div>
              )}

              <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-[#7E7E7E] block mb-1.5">
                    New Hiring Status
                  </label>
                  <select
                    value={selectedNextStatus}
                    onChange={(e) => setSelectedNextStatus(e.target.value as ApplicationStatus)}
                    className="w-full h-10 px-3 rounded-xl border border-[#242424] bg-[#050505] text-xs text-[#F5F5F5] focus:outline-none focus:border-[#8B5CF6]"
                  >
                    <option value="APPLIED">Applied (Manual direct apply)</option>
                    <option value="IN_REVIEW">In Review (Employer acknowledged)</option>
                    <option value="ASSESSMENT">Assessment (Assignment / Test)</option>
                    <option value="INTERVIEW">Interview (Screening / Round scheduled)</option>
                    <option value="OFFER">Offer (Job offer received)</option>
                    <option value="REJECTED">Not Selected (Employer rejection)</option>
                    <option value="WITHDRAWN">Withdrawn (Candidate withdrew)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-[#7E7E7E] block mb-1.5">
                    Notes / Evidence Details
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Scheduled 45m screen with Engineering Manager for Friday at 3pm."
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#242424] bg-[#050505] text-xs text-[#F5F5F5] placeholder:text-[#7E7E7E] focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>

                <div className="p-3.5 rounded-xl border border-[#242424] bg-[#050505] flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="attestationCheck"
                    checked={attestationConfirmed}
                    onChange={(e) => setAttestationConfirmed(e.target.checked)}
                    className="mt-0.5 accent-[#8B5CF6]"
                  />
                  <label htmlFor="attestationCheck" className="text-xs text-[#BDBDBD] leading-snug cursor-pointer">
                    <strong>Candidate Attestation:</strong> I confirm this status update reflects real employer communication or intentional action.
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsUpdateModalOpen(false)}
                    className="flex-1 h-9 rounded-xl border border-[#242424] bg-[#151515] text-xs font-semibold text-[#7E7E7E] hover:text-[#F5F5F5]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingStatus || !attestationConfirmed}
                    className="flex-1 h-9 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    {submittingStatus ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Save Update</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
