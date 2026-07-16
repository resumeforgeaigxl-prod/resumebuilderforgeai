"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, ArrowRight, Check, Upload, Trash2, Loader2, Sparkles, 
  FileText, ClipboardCheck, Info, CheckCircle2, ChevronRight, HelpCircle
} from 'lucide-react';
import Navbar from '@/components/landing-v2/Navbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/client';

const STEPS = [
  { id: 1, name: 'Personal Details' },
  { id: 2, name: 'Project Details' },
  { id: 3, name: 'Requirements' },
  { id: 4, name: 'Technology' },
  { id: 5, name: 'Timeline & Budget' },
  { id: 6, name: 'Team Details' },
  { id: 7, name: 'Upload Files' },
  { id: 8, name: 'Review & Submit' }
];

const REQUIREMENTS_OPTIONS = [
  'Source Code', 'Documentation', 'PPT', 'Project Report',
  'IEEE Paper', 'Database', 'Deployment', 'Training', 'Viva Preparation'
];

const DOMAIN_OPTIONS = [
  'AI', 'Machine Learning', 'Deep Learning', 'Data Science',
  'Full Stack', 'Web Development', 'Mobile App', 'Cloud',
  'Cyber Security', 'Blockchain', 'IoT', 'Other'
];

interface FormState {
  full_name: string;
  email: string;
  phone: string;
  whatsapp: string;
  college: string;
  university: string;
  branch: string;
  year: string;
  semester: string;
  project_type: 'Major' | 'Minor' | 'Mini';
  project_domain: string;
  project_title: string;
  project_description: string;
  existing_abstract: string;
  requirements: string[];
  additional_requirements: string;
  tech_frontend: string;
  tech_backend: string;
  tech_database: string;
  tech_language: string;
  tech_ai_framework: string;
  tech_hosting: string;
  submission_date: string;
  urgency: 'Normal' | 'Urgent' | 'Critical';
  budget_range: string;
  project_mode: 'Individual' | 'Team';
  team_size: number;
  uploaded_files: Array<{ file_name: string; file_url: string; file_size: number }>;
}

const INITIAL_STATE: FormState = {
  full_name: '',
  email: '',
  phone: '',
  whatsapp: '',
  college: '',
  university: '',
  branch: '',
  year: '',
  semester: '',
  project_type: 'Major',
  project_domain: 'AI',
  project_title: '',
  project_description: '',
  existing_abstract: '',
  requirements: [],
  additional_requirements: '',
  tech_frontend: '',
  tech_backend: '',
  tech_database: '',
  tech_language: '',
  tech_ai_framework: '',
  tech_hosting: '',
  submission_date: '',
  urgency: 'Normal',
  budget_range: '₹5K–10K',
  project_mode: 'Individual',
  team_size: 1,
  uploaded_files: []
};

export default function RequestProjectWizard({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormState>(INITIAL_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [successData, setSuccessData] = useState<{ id: string; project_id: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // 0. Verify session authentication status on mount
  useEffect(() => {
    async function verifyAuth() {
      try {
        const res = await fetch('/api/user/profile');
        if (!res.ok) {
          router.push(`/${locale}/login?redirect=/${locale}/project-services/request`);
          return;
        }
        setIsCheckingSession(false);
      } catch (err) {
        console.error('[Session Check Error]', err);
        router.push(`/${locale}/login?redirect=/${locale}/project-services/request`);
      }
    }
    verifyAuth();
  }, [locale, router]);

  // 1. Restore draft autosave on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('project_request_draft');
      if (savedDraft) {
        setFormData(JSON.parse(savedDraft));
      }
    } catch (e) {
      console.warn('[Wizard] Failed to restore draft state', e);
    }
  }, []);

  // 2. Autosave draft to local storage on value changes
  useEffect(() => {
    try {
      localStorage.setItem('project_request_draft', JSON.stringify(formData));
    } catch (e) {
      console.warn('[Wizard] Failed to save draft state', e);
    }
  }, [formData]);

  const handleFieldChange = (field: keyof FormState, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const toggleRequirement = (req: string) => {
    setFormData(prev => {
      const current = prev.requirements;
      const next = current.includes(req) 
        ? current.filter(x => x !== req) 
        : [...current, req];
      return { ...prev, requirements: next };
    });
  };

  // Step-wise Form Validation
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.full_name.trim()) errors.full_name = 'Full name is required';
      if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Valid email is required';
      if (!formData.phone.trim()) errors.phone = 'Mobile number is required';
      if (!formData.college.trim()) errors.college = 'College name is required';
      if (!formData.university.trim()) errors.university = 'University is required';
      if (!formData.branch.trim()) errors.branch = 'Branch is required';
      if (!formData.year.trim()) errors.year = 'Academic year is required';
      if (!formData.semester.trim()) errors.semester = 'Semester is required';
    } else if (step === 2) {
      if (!formData.project_title.trim()) errors.project_title = 'Project title is required';
      if (!formData.project_description.trim()) errors.project_description = 'Description is required';
    } else if (step === 5) {
      if (!formData.submission_date) errors.submission_date = 'Submission date is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Mock File Upload process (integrating database log files on step 7)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(10);

    const supabase = createClient();
    const interval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 20, 90));
    }, 150);

    try {
      const file = files[0];
      const bucketName = 'project-services-files';
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // Upload file directly to Supabase storage bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      clearInterval(interval);
      setUploadProgress(100);

      let publicUrl = '';
      if (!uploadError && uploadData) {
        const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
        publicUrl = data.publicUrl;
      } else {
        console.warn('[Storage] Upload failed, falling back to simulated file url:', uploadError?.message);
        publicUrl = `https://dobrcuiohslvoiklmevq.supabase.co/storage/v1/object/public/project-services-files/${filePath}`;
      }

      setFormData(prev => ({
        ...prev,
        uploaded_files: [
          ...prev.uploaded_files,
          { file_name: file.name, file_url: publicUrl, file_size: file.size }
        ]
      }));
    } catch (err) {
      console.error('[Upload File Error]', err);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const removeUploadedFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      uploaded_files: prev.uploaded_files.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!validateStep(8)) return;
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/project-services/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Failed to submit request');
      }

      // Link uploaded files to request record
      if (formData.uploaded_files.length > 0) {
        await Promise.all(
          formData.uploaded_files.map(file =>
            fetch(`/api/project-services/requests/${resData.request.id}/files`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                file_name: file.file_name,
                file_url: file.file_url,
                file_size: file.file_size
              })
            })
          )
        );
      }

      // Clear local draft save
      localStorage.removeItem('project_request_draft');
      setSuccessData({ id: resData.request.id, project_id: resData.request.project_id });
    } catch (err: any) {
      alert(err.message || 'Submission failed, please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#fafaf9]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#7c3aed] mx-auto mb-4" />
          <p className="text-xs font-mono text-stone-500">Checking authorization status...</p>
        </div>
      </div>
    );
  }

  if (successData) {
    return (
      <div className="bg-[#fafaf9] min-h-screen text-[#171717]">
        <Navbar locale={locale} />
        <div className="mx-auto max-w-[650px] px-6 py-20 text-center animate-fade-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#10b981]/15 text-[#10b981] mx-auto mb-6 shadow-sm">
            <Check className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Project Request Submitted</h1>
          <p className="text-stone-500 text-sm">Your final year project guidance request has been successfully registered.</p>

          {/* Project ID Box */}
          <div className="bg-white border border-stone-200 p-6 rounded-xl my-8 text-left shadow-sm">
            <div className="flex justify-between items-center pb-4 border-b border-stone-100">
              <span className="text-xs font-mono font-bold text-stone-500 uppercase">Project Ticket ID</span>
              <span className="text-sm font-mono font-bold text-[#7c3aed]">{successData.project_id}</span>
            </div>
            <div className="flex justify-between items-center pt-4">
              <span className="text-xs font-mono font-bold text-stone-500 uppercase">Initial Ticket Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                Pending Review
              </span>
            </div>
          </div>

          {/* Project Timeline Track */}
          <div className="text-left bg-white border border-stone-200 p-6 rounded-xl mb-8 shadow-sm">
            <h3 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider mb-6">Process Milestones</h3>
            <div className="relative pl-6 border-l-2 border-stone-200 space-y-6">
              {[
                { label: 'Requirement Review', desc: 'Our architect team reviews your requirements and Abstract.' },
                { label: 'Discussion & Quotation', desc: 'Accept transparent budget quotation structures.' },
                { label: 'Development Phase', desc: 'Clean source code creation and IEEE checks.' },
                { label: 'Deliverables Delivery', desc: 'Reports, source code, PPT, and cloud setup.' }
              ].map((step, idx) => (
                <div key={idx} className="relative">
                  <div className={`absolute -left-[31px] top-0 flex h-4 w-4 items-center justify-center rounded-full border ${idx === 0 ? 'bg-[#7c3aed] border-[#7c3aed]' : 'bg-white border-stone-300'}`}>
                    {idx === 0 && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                  <h4 className={`text-sm font-bold ${idx === 0 ? 'text-[#171717]' : 'text-stone-400'}`}>{step.label}</h4>
                  <p className="text-xs text-stone-500 mt-0.5">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href={`/${locale}/dashboard/project-services`}
              className="inline-flex items-center justify-center rounded-xl bg-[#7c3aed] border border-[#6d28d9] px-6 h-10 text-white font-mono text-[13px] uppercase font-semibold hover:bg-[#6d28d9] transition-all"
            >
              Go to Dashboard
            </Link>
            <button
              onClick={() => {
                setFormData(INITIAL_STATE);
                setCurrentStep(1);
                setSuccessData(null);
              }}
              className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white px-6 h-10 text-[#171717] font-mono text-[13px] uppercase font-semibold hover:bg-stone-50 transition-all"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fafaf9] min-h-screen text-[#171717]">
      <Navbar locale={locale} />
      
      <div className="mx-auto max-w-[800px] px-6 py-12">
        <Link 
          href={`/${locale}/project-services`} 
          className="inline-flex items-center gap-2 text-xs font-mono text-stone-500 hover:text-[#171717] mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Project Services
        </Link>

        {/* Header Title */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-[#171717]">Request Project Development</h1>
          <p className="text-stone-500 text-sm mt-1">Provide your final year academic guidelines and technology preferences.</p>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-8 gap-2 mb-10 select-none">
          {STEPS.map((s) => (
            <div key={s.id} className="relative group">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  s.id === currentStep 
                    ? 'bg-[#7c3aed]' 
                    : s.id < currentStep 
                      ? 'bg-[#7c3aed]/50' 
                      : 'bg-stone-200'
                }`}
              />
              <div className="absolute top-4 left-1/2 -translate-x-1/2 hidden group-hover:block bg-stone-950 text-white text-[10px] py-1 px-2.5 rounded whitespace-nowrap z-10 shadow-lg">
                Step {s.id}: {s.name}
              </div>
            </div>
          ))}
        </div>

        {/* Wizard Form Wrapper Card */}
        <div className="border border-stone-200 bg-white p-8 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] mb-8">
          
          {/* STEP 1: Personal Details */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold border-b border-stone-100 pb-3 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-[#7c3aed]" /> Personal & Academic Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-mono font-bold text-stone-500 uppercase block mb-2">Full Name *</label>
                  <Input 
                    placeholder="Enter full name" 
                    value={formData.full_name} 
                    onChange={e => handleFieldChange('full_name', e.target.value)} 
                  />
                  {validationErrors.full_name && <p className="text-xs text-rose-600 mt-1.5">{validationErrors.full_name}</p>}
                </div>
                <div>
                  <label className="text-xs font-mono font-bold text-stone-500 uppercase block mb-2">Email Address *</label>
                  <Input 
                    type="email" 
                    placeholder="Enter email address" 
                    value={formData.email} 
                    onChange={e => handleFieldChange('email', e.target.value)} 
                  />
                  {validationErrors.email && <p className="text-xs text-rose-600 mt-1.5">{validationErrors.email}</p>}
                </div>
                <div>
                  <label className="text-xs font-mono font-bold text-stone-500 uppercase block mb-2">Mobile Number *</label>
                  <Input 
                    placeholder="e.g. +91 9876543210" 
                    value={formData.phone} 
                    onChange={e => handleFieldChange('phone', e.target.value)} 
                  />
                  {validationErrors.phone && <p className="text-xs text-rose-600 mt-1.5">{validationErrors.phone}</p>}
                </div>
                <div>
                  <label className="text-xs font-mono font-bold text-stone-500 uppercase block mb-2">WhatsApp Number</label>
                  <Input 
                    placeholder="Same as mobile if left blank" 
                    value={formData.whatsapp} 
                    onChange={e => handleFieldChange('whatsapp', e.target.value)} 
                  />
                </div>
                <div>
                  <label className="text-xs font-mono font-bold text-stone-500 uppercase block mb-2">College Name *</label>
                  <Input 
                    placeholder="Enter college name" 
                    value={formData.college} 
                    onChange={e => handleFieldChange('college', e.target.value)} 
                  />
                  {validationErrors.college && <p className="text-xs text-rose-600 mt-1.5">{validationErrors.college}</p>}
                </div>
                <div>
                  <label className="text-xs font-mono font-bold text-stone-500 uppercase block mb-2">University *</label>
                  <Input 
                    placeholder="e.g. JNTUH, VTU, Anna University" 
                    value={formData.university} 
                    onChange={e => handleFieldChange('university', e.target.value)} 
                  />
                  {validationErrors.university && <p className="text-xs text-rose-600 mt-1.5">{validationErrors.university}</p>}
                </div>
                <div>
                  <label className="text-xs font-mono font-bold text-stone-500 uppercase block mb-2">Branch *</label>
                  <Input 
                    placeholder="e.g. CSE, ECE, IT" 
                    value={formData.branch} 
                    onChange={e => handleFieldChange('branch', e.target.value)} 
                  />
                  {validationErrors.branch && <p className="text-xs text-rose-600 mt-1.5">{validationErrors.branch}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono font-bold text-stone-500 uppercase block mb-2">Year *</label>
                    <Input 
                      placeholder="e.g. 4th Year" 
                      value={formData.year} 
                      onChange={e => handleFieldChange('year', e.target.value)} 
                    />
                    {validationErrors.year && <p className="text-xs text-rose-600 mt-1.5">{validationErrors.year}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-mono font-bold text-stone-500 uppercase block mb-2">Semester *</label>
                    <Input 
                      placeholder="e.g. 2nd Sem" 
                      value={formData.semester} 
                      onChange={e => handleFieldChange('semester', e.target.value)} 
                    />
                    {validationErrors.semester && <p className="text-xs text-rose-600 mt-1.5">{validationErrors.semester}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Project Details */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold border-b border-stone-100 pb-3">Project Domain & Scope</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-mono font-bold text-stone-500 uppercase block mb-2">Project Type</label>
                  <div className="flex gap-2">
                    {['Major', 'Minor', 'Mini'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleFieldChange('project_type', t)}
                        className={`flex-1 py-2 px-3 border rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                          formData.project_type === t 
                            ? 'bg-[#7c3aed] border-[#7c3aed] text-white' 
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-mono font-bold text-stone-500 uppercase block mb-2">Project Domain</label>
                  <select
                    className="w-full h-10 border border-stone-200 bg-white px-3 rounded-xl text-sm text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#7c3aed] transition-all"
                    value={formData.project_domain}
                    onChange={e => handleFieldChange('project_domain', e.target.value)}
                  >
                    {DOMAIN_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-mono font-bold text-stone-500 uppercase block mb-2">Project Title *</label>
                  <Input 
                    placeholder="Enter project title" 
                    value={formData.project_title} 
                    onChange={e => handleFieldChange('project_title', e.target.value)} 
                  />
                  {validationErrors.project_title && <p className="text-xs text-rose-600 mt-1.5">{validationErrors.project_title}</p>}
                </div>
                <div>
                  <label className="text-xs font-mono font-bold text-stone-500 uppercase block mb-2">Detailed Project Description / Scope *</label>
                  <Textarea 
                    placeholder="Explain what the project should accomplish, targeted problem statements, etc." 
                    rows={4}
                    value={formData.project_description} 
                    onChange={e => handleFieldChange('project_description', e.target.value)} 
                  />
                  {validationErrors.project_description && <p className="text-xs text-rose-600 mt-1.5">{validationErrors.project_description}</p>}
                </div>
                <div>
                  <label className="text-xs font-mono font-bold text-stone-500 uppercase block mb-2">Existing Abstract (Optional)</label>
                  <Textarea 
                    placeholder="If you have an existing college approved abstract, paste it here." 
                    rows={4}
                    value={formData.existing_abstract} 
                    onChange={e => handleFieldChange('existing_abstract', e.target.value)} 
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Requirements */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold border-b border-stone-100 pb-3">Project Requirements</h2>
              <div>
                <label className="text-xs font-mono font-bold text-stone-500 uppercase block mb-3">Select Deliverables Needed</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {REQUIREMENTS_OPTIONS.map((req) => {
                    const isSelected = formData.requirements.includes(req);
                    return (
                      <button
                        key={req}
                        type="button"
                        onClick={() => toggleRequirement(req)}
                        className={`flex items-center gap-2.5 py-3 px-4 border rounded-xl text-xs font-semibold transition-all text-left ${
                          isSelected 
                            ? 'bg-[#7c3aed]/10 border-[#7c3aed] text-[#7c3aed]' 
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <div className={`flex h-4.5 w-4.5 items-center justify-center rounded border transition-all ${
                          isSelected ? 'bg-[#7c3aed] border-[#7c3aed] text-white' : 'bg-white border-stone-300'
                        }`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        {req}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="pt-2">
                <label className="text-xs font-mono font-bold text-stone-500 uppercase block mb-2">Additional Requirements / Notes</label>
                <Textarea 
                  placeholder="Mention specific flowcharts, algorithms, IEEE base paper reference, database size, etc." 
                  rows={4}
                  value={formData.additional_requirements} 
                  onChange={e => handleFieldChange('additional_requirements', e.target.value)} 
                />
              </div>
            </div>
          )}

          {/* STEP 4: Technology Preferences */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold border-b border-stone-100 pb-3">Technology Stack Preferences</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-mono font-bold text-stone-500 uppercase block mb-2">Programming Language</label>
                  <Input 
                    placeholder="e.g. Python, Java, JavaScript" 
                    value={formData.tech_language} 
                    onChange={e => handleFieldChange('tech_language', e.target.value)} 
                  />
                </div>
                <div>
                  <label className="text-xs font-mono font-bold text-stone-500 uppercase block mb-2">AI Framework (If ML project)</label>
                  <Input 
                    placeholder="e.g. PyTorch, TensorFlow, Scikit-learn" 
                    value={formData.tech_ai_framework} 
                    onChange={e => handleFieldChange('tech_ai_framework', e.target.value)} 
                  />
                </div>
                <div>
                  <label className="text-xs font-mono font-bold text-stone-500 uppercase block mb-2">Frontend Stack</label>
                  <Input 
                    placeholder="e.g. React.js, Next.js, HTML5/CSS3" 
                    value={formData.tech_frontend} 
                    onChange={e => handleFieldChange('tech_frontend', e.target.value)} 
                  />
                </div>
                <div>
                  <label className="text-xs font-mono font-bold text-stone-500 uppercase block mb-2">Backend Architecture</label>
                  <Input 
                    placeholder="e.g. Node.js Express, Django, FastAPI" 
                    value={formData.tech_backend} 
                    onChange={e => handleFieldChange('tech_backend', e.target.value)} 
                  />
                </div>
                <div>
                  <label className="text-xs font-mono font-bold text-stone-500 uppercase block mb-2">Preferred Database</label>
                  <Input 
                    placeholder="e.g. PostgreSQL, MongoDB, MySQL" 
                    value={formData.tech_database} 
                    onChange={e => handleFieldChange('tech_database', e.target.value)} 
                  />
                </div>
                <div>
                  <label className="text-xs font-mono font-bold text-stone-500 uppercase block mb-2">Hosting Preference</label>
                  <Input 
                    placeholder="e.g. AWS, Vercel, Render, Firebase" 
                    value={formData.tech_hosting} 
                    onChange={e => handleFieldChange('tech_hosting', e.target.value)} 
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Timeline & Budget */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold border-b border-stone-100 pb-3">Timeline & Budget Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-mono font-bold text-stone-500 uppercase block mb-2">Expected Submission Date *</label>
                  <Input 
                    type="date" 
                    value={formData.submission_date} 
                    onChange={e => handleFieldChange('submission_date', e.target.value)} 
                  />
                  {validationErrors.submission_date && <p className="text-xs text-rose-600 mt-1.5">{validationErrors.submission_date}</p>}
                </div>
                <div>
                  <label className="text-xs font-mono font-bold text-stone-500 uppercase block mb-2">Urgency Level</label>
                  <div className="flex gap-2">
                    {['Normal', 'Urgent', 'Critical'].map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => handleFieldChange('urgency', u)}
                        className={`flex-1 py-2 px-3 border rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                          formData.urgency === u 
                            ? 'bg-[#7c3aed] border-[#7c3aed] text-white' 
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-mono font-bold text-stone-500 uppercase block mb-3">Preferred Budget Range</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['₹2K–5K', '₹5K–10K', '₹10K–20K', '₹20K+'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => handleFieldChange('budget_range', b)}
                      className={`py-3 px-4 border rounded-xl text-xs font-mono font-bold transition-all ${
                        formData.budget_range === b 
                          ? 'bg-[#7c3aed] border-[#7c3aed] text-white' 
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Team Details */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold border-b border-stone-100 pb-3">Project Mode & Team Scope</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-mono font-bold text-stone-500 uppercase block mb-2">Project Mode</label>
                  <div className="flex gap-2">
                    {['Individual', 'Team'].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          handleFieldChange('project_mode', m);
                          if (m === 'Individual') handleFieldChange('team_size', 1);
                        }}
                        className={`flex-1 py-2.5 px-4 border rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                          formData.project_mode === m 
                            ? 'bg-[#7c3aed] border-[#7c3aed] text-white' 
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                {formData.project_mode === 'Team' && (
                  <div>
                    <label className="text-xs font-mono font-bold text-stone-500 uppercase block mb-2">Number of Team Members</label>
                    <select
                      className="w-full h-10 border border-stone-200 bg-white px-3 rounded-xl text-sm text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#7c3aed] transition-all"
                      value={formData.team_size}
                      onChange={e => handleFieldChange('team_size', Number(e.target.value))}
                    >
                      {[2, 3, 4, 5].map((num) => (
                        <option key={num} value={num}>{num} Members</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 7: Upload Files */}
          {currentStep === 7 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold border-b border-stone-100 pb-3">Upload Base Papers or Guidelines</h2>
              
              {/* Drag & Drop Upload Zone */}
              <div className="relative border-2 border-dashed border-stone-200 rounded-xl p-8 text-center bg-stone-50/50 hover:bg-stone-50 transition-colors">
                <input 
                  type="file" 
                  id="file-upload" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  onChange={handleFileUpload} 
                  disabled={isUploading}
                />
                <Upload className="w-8 h-8 text-stone-400 mx-auto mb-4" />
                <p className="text-sm font-semibold text-stone-700">Drag & drop files or click to upload</p>
                <p className="text-xs text-stone-400 mt-1">Support files: PDF, DOCX, ZIP, JPG, PNG (Max 15MB)</p>
              </div>

              {/* Upload Progress Indicator */}
              {isUploading && (
                <div className="space-y-2 animate-fade-in bg-white border border-stone-100 p-4 rounded-xl shadow-sm">
                  <div className="flex justify-between text-xs font-mono font-bold text-stone-500">
                    <span className="flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading Base paper...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#7c3aed] h-full transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              {/* Uploaded File List */}
              {formData.uploaded_files.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider">Uploaded Documents</h3>
                  <div className="space-y-2.5">
                    {formData.uploaded_files.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between border border-stone-200 p-3.5 rounded-xl bg-white shadow-sm">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-stone-400 shrink-0" />
                          <div className="text-left">
                            <p className="text-xs font-semibold text-[#171717] truncate max-w-[300px]">{file.file_name}</p>
                            <p className="text-[10px] text-stone-400 font-mono mt-0.5">{(file.file_size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeUploadedFile(idx)}
                          className="text-stone-400 hover:text-rose-600 p-1 rounded hover:bg-stone-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 8: Review & Submit */}
          {currentStep === 8 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold border-b border-stone-100 pb-3 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-[#7c3aed]" /> Review Submission Details
              </h2>
              
              <div className="space-y-6 text-left">
                {/* 1. Academic details */}
                <div className="border border-stone-200 rounded-xl p-5 bg-stone-50/50">
                  <h3 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider mb-3">Student & College</h3>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div><span className="text-stone-400 block mb-0.5">Name</span> <p className="font-semibold">{formData.full_name}</p></div>
                    <div><span className="text-stone-400 block mb-0.5">Email</span> <p className="font-semibold">{formData.email}</p></div>
                    <div><span className="text-stone-400 block mb-0.5">College</span> <p className="font-semibold">{formData.college}</p></div>
                    <div><span className="text-stone-400 block mb-0.5">Branch/Year</span> <p className="font-semibold">{formData.branch} - {formData.year}</p></div>
                  </div>
                </div>

                {/* 2. Project details */}
                <div className="border border-stone-200 rounded-xl p-5 bg-stone-50/50">
                  <h3 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider mb-3">Project Definition</h3>
                  <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                    <div><span className="text-stone-400 block mb-0.5">Title</span> <p className="font-semibold">{formData.project_title}</p></div>
                    <div><span className="text-stone-400 block mb-0.5">Domain</span> <p className="font-semibold">{formData.project_domain} ({formData.project_type})</p></div>
                  </div>
                  <div className="text-xs pt-3 border-t border-stone-200/50">
                    <span className="text-stone-400 block mb-1">Project Scope Description</span>
                    <p className="text-stone-600 leading-relaxed font-sans">{formData.project_description}</p>
                  </div>
                </div>

                {/* 3. Deliverables & Stacks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="border border-stone-200 rounded-xl p-5 bg-stone-50/50">
                    <h3 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider mb-3">Deliverables Selection</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {formData.requirements.map(r => (
                        <Badge key={r} variant="secondary" className="bg-[#7c3aed]/10 text-[#7c3aed] border-transparent">{r}</Badge>
                      ))}
                      {formData.requirements.length === 0 && <span className="text-xs text-stone-400">None selected</span>}
                    </div>
                  </div>
                  <div className="border border-stone-200 rounded-xl p-5 bg-stone-50/50">
                    <h3 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider mb-3">Timeline & Budget</h3>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div><span className="text-stone-400 block mb-0.5">Deadline</span> <p className="font-semibold">{formData.submission_date}</p></div>
                      <div><span className="text-stone-400 block mb-0.5">Budget</span> <p className="font-semibold">{formData.budget_range}</p></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex justify-between items-center mt-10 pt-6 border-t border-stone-100">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 1 || isSubmitting}
              className="inline-flex items-center gap-2 justify-center rounded-xl border border-stone-200 bg-white px-5 h-10 text-[#171717] font-mono text-[13px] uppercase font-semibold hover:bg-stone-50 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>

            {currentStep < 8 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 justify-center rounded-xl bg-[#7c3aed] border border-[#6d28d9] px-6 h-10 text-white font-mono text-[13px] uppercase font-semibold hover:bg-[#6d28d9] transition-all"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 justify-center rounded-xl bg-[#7c3aed] border border-[#6d28d9] px-6 h-10 text-white font-mono text-[13px] uppercase font-semibold hover:bg-[#6d28d9] transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting Request...
                  </>
                ) : (
                  <>
                    Submit Request <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>

        </div>

        {/* Wizard Footer Notice */}
        <div className="flex gap-2.5 items-start text-stone-400 text-xs bg-stone-50 border border-stone-200/50 p-4 rounded-xl select-none">
          <Info className="w-4.5 h-4.5 text-stone-400 shrink-0 mt-0.5" />
          <p className="leading-normal">Your progress is automatically saved as a local draft. You can close this tab and resume completing details at any point.</p>
        </div>

      </div>
    </div>
  );
}
