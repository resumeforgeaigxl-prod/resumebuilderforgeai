'use client';

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Briefcase,
  Lock,
  ChevronRight,
  ShieldCheck,
  Send,
  Loader2,
  ExternalLink,
  Sparkles,
} from '@/components/icons';
import type { ApplicationPackage } from '@/lib/application-engine/types';
import { CustomSelect } from '@/components/ui/CustomSelect';

interface PackageReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageData: ApplicationPackage | null;
  onAnswersUpdated?: () => void;
}

export function PackageReviewModal({
  isOpen,
  onClose,
  packageData,
  onAnswersUpdated,
}: PackageReviewModalProps) {
  const [activeTab, setActiveTab] = useState<'answers' | 'missing' | 'documents'>('answers');
  const [formAnswers, setFormAnswers] = useState<Record<string, any>>({});
  const [savingAnswers, setSavingAnswers] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  if (!isOpen || !packageData) return null;

  const pkg = packageData;
  const isReady = pkg.status === 'READY';
  const needsUser = pkg.status === 'NEEDS_USER';
  const isBlocked = pkg.status === 'BLOCKED';

  const unknownQuestions = pkg.unknownQuestions || [];
  const requiredUnknowns = unknownQuestions.filter((q) => q.required);

  const handleAnswerChange = (key: string, value: any) => {
    setFormAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmitAnswers = async () => {
    try {
      setSavingAnswers(true);
      setSaveSuccessMessage(null);

      const res = await fetch('/api/applications/package/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: pkg.id,
          answers: formAnswers,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccessMessage('Answers recorded successfully! Package updated.');
        onAnswersUpdated?.();
      }
    } catch (err) {
      console.error('Error saving answers:', err);
    } finally {
      setSavingAnswers(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#151515] border border-[#242424] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-[#F5F5F5]">
        {/* Header */}
        <div className="p-6 border-b border-[#242424] flex items-start justify-between gap-4 bg-[#101010]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono uppercase font-semibold text-[#7E7E7E] tracking-wide">
                Application Package • v{pkg.version}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight border ${
                  isReady
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                    : needsUser
                    ? 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                    : 'bg-rose-950/40 text-rose-400 border-rose-800/40'
                }`}
              >
                {isReady ? '✓ READY' : needsUser ? '! NEEDS YOUR INPUT' : 'BLOCKED'}
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#F5F5F5]">
              {pkg.jobSnapshot.company} — {pkg.jobSnapshot.title}
            </h2>
            <div className="flex items-center gap-3 mt-1 text-xs text-[#BDBDBD]">
              <span>Readiness: <strong className="text-[#F5F5F5]">{pkg.readinessScore}%</strong></span>
              <span>•</span>
              <span>Match Fit: <strong className="text-[#F5F5F5]">{pkg.matchSnapshot?.score ?? 88}%</strong></span>
              <span>•</span>
              <span>Job Status: <strong className="text-emerald-400">{pkg.jobSnapshot.status}</strong></span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7E7E7E] hover:text-[#F5F5F5] hover:bg-[#151515] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-[#242424] px-6 bg-[#101010] gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('answers')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'answers'
                ? 'border-[#8B5CF6] text-[#F5F5F5]'
                : 'border-transparent text-[#7E7E7E] hover:text-[#F5F5F5]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verified Answers ({Object.keys(pkg.answers || {}).length})</span>
          </button>
          {needsUser && (
            <button
              onClick={() => setActiveTab('missing')}
              className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'missing'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-amber-400/70 hover:text-amber-300'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              <span>Missing Questions ({requiredUnknowns.length})</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'documents'
                ? 'border-[#8B5CF6] text-[#F5F5F5]'
                : 'border-transparent text-[#7E7E7E] hover:text-[#F5F5F5]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Documents ({pkg.documents?.length || 1})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: VERIFIED ANSWERS */}
          {activeTab === 'answers' && (
            <div className="space-y-4">
              <p className="text-xs text-[#7E7E7E]">
                Truthful, verified candidate facts compiled for this application. The future application agent uses these answers without guessing.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {Object.entries(pkg.answers || {}).map(([key, field]: [string, any]) => (
                  <div
                    key={key}
                    className="p-3.5 rounded-xl border border-[#242424] bg-[#101010] flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase font-mono font-semibold text-[#7E7E7E]">
                        {field.label || key}
                      </span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border ${
                          field.status === 'VERIFIED'
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                            : field.status === 'DERIVED_SAFE'
                            ? 'bg-[#8B5CF6]/15 text-[#C4B5FD] border-[#8B5CF6]/30'
                            : field.status === 'GENERATED_DRAFT'
                            ? 'bg-violet-950/40 text-violet-300 border-violet-800/40'
                            : 'bg-[#151515] text-[#BDBDBD] border-[#242424]'
                        }`}
                      >
                        {field.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#F5F5F5] mt-1.5 break-words">
                      {typeof field.value === 'boolean'
                        ? field.value ? 'Yes' : 'No'
                        : String(field.value || '—')}
                    </p>
                    {field.evidence && (
                      <p className="text-[10px] text-[#7E7E7E] italic mt-1">{field.evidence}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: MISSING QUESTIONS */}
          {activeTab === 'missing' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-300">
                <strong>Attention Required:</strong> The employer requires answers to the following questions. Provide your answers below to advance this package to <strong>READY</strong>. Reusable answers will automatically update your profile.
              </div>

              {saveSuccessMessage && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300 font-medium">
                  {saveSuccessMessage}
                </div>
              )}

              <div className="space-y-4">
                {unknownQuestions.map((q) => (
                  <div key={q.key} className="p-4 rounded-xl border border-[#242424] bg-[#101010] space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#F5F5F5]">{q.question}</label>
                      {q.required && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#7E7E7E]">{q.reason}</p>

                    {q.allowedOptions && q.allowedOptions.length > 0 ? (
                      <CustomSelect
                        value={formAnswers[q.key] ?? ''}
                        onChange={(val) => handleAnswerChange(q.key, val)}
                        options={q.allowedOptions.map((opt: string) => ({ value: opt, label: opt }))}
                        placeholder="Select an option..."
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder="Enter your answer..."
                        value={formAnswers[q.key] ?? ''}
                        onChange={(e) => handleAnswerChange(q.key, e.target.value)}
                        className="w-full h-9 rounded-lg border border-[#242424] bg-[#151515] px-3 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#8B5CF6]/50"
                      />
                    )}
                  </div>
                ))}

                <button
                  onClick={handleSubmitAnswers}
                  disabled={savingAnswers || Object.keys(formAnswers).length === 0}
                  className="w-full h-10 bg-[#F5F5F5] hover:bg-white text-black font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  {savingAnswers ? (
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Save Answers & Finalize Package</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <p className="text-xs text-[#7E7E7E]">
                Verified documents linked to this application package.
              </p>

              <div className="space-y-3">
                {pkg.documents?.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-[#242424] bg-[#101010] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#151515] border border-[#242424] flex items-center justify-center text-[#8B5CF6]">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#F5F5F5]">{doc.title}</p>
                        <p className="text-[11px] text-[#7E7E7E]">
                          Type: {doc.type} • Status: {doc.status}
                        </p>
                      </div>
                    </div>
                    {doc.url && doc.url !== '#draft_cover_letter' && (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg border border-[#242424] bg-[#151515] hover:bg-[#202020] text-xs font-semibold flex items-center gap-1.5 shadow-xs text-[#F5F5F5]"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))}

                {pkg.tailoringEvidence && (
                  <div className="p-4 rounded-xl border border-violet-800/40 bg-violet-950/20 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-violet-300 font-bold">
                      <Sparkles className="w-4 h-4 text-violet-400" />
                      <span>Truth-Preserving Tailoring Provenance</span>
                    </div>
                    <p className="text-violet-200 text-[11px]">
                      Tailoring Status: <strong>{pkg.tailoringStatus}</strong>
                    </p>
                    {pkg.tailoringEvidence.emphasizedSkills?.length > 0 && (
                      <p className="text-violet-200 text-[11px]">
                        Emphasized verified skills: {pkg.tailoringEvidence.emphasizedSkills.join(', ')}
                      </p>
                    )}
                    <ul className="list-disc list-inside text-violet-300/80 text-[11px] space-y-0.5">
                      {pkg.tailoringEvidence.factualChanges?.map((ch, i) => (
                        <li key={i}>{ch}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#242424] bg-[#101010] flex items-center justify-between gap-4">
          <span className="text-[11px] text-[#7E7E7E]">
            {isReady
              ? '✓ Ready for Future Application Agent submission'
              : needsUser
              ? `! ${requiredUnknowns.length} required answer(s) pending`
              : 'Blocked due to hard requirement'}
          </span>
          <button
            onClick={onClose}
            className="px-5 h-9 bg-[#151515] hover:bg-[#202020] border border-[#242424] text-[#F5F5F5] font-semibold text-xs rounded-lg transition-all shadow-xs"
          >
            Close Review
          </button>
        </div>
      </div>
    </div>
  );
}
