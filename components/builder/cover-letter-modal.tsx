'use client';

import { useState } from 'react';
import { Wand2, Loader2, X, Download, Save, FileText, CheckCircle } from 'lucide-react';
import { ResumeData } from '@/types/resume';
import { jsPDF } from 'jspdf';

interface CoverLetterModalProps {
    resumeId: string;
    resumeData: ResumeData;
    onClose: () => void;
}

export function CoverLetterModal({ resumeId, resumeData, onClose }: CoverLetterModalProps) {
    const [jobDescription, setJobDescription] = useState('');
    const [roleTitle, setRoleTitle] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState('');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    const [options, setOptions] = useState({
        isFormal: false,
        isConcise: false,
        isDetailed: false
    });

    const handleGenerate = async () => {
        if (!jobDescription || !roleTitle) {
            alert('Please provide Job Description and Role Title');
            return;
        }

        setIsGenerating(true);
        setGeneratedContent('');
        setSaveStatus('idle');

        try {
            const response = await fetch('/api/cover-letter/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeData,
                    jobDescription,
                    roleTitle,
                    companyName,
                    options
                })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setGeneratedContent(data.content);
            } else {
                alert(data.error || 'Failed to generate cover letter');
            }
        } catch (error: unknown) {
            console.error('Gen Error:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!generatedContent) return;

        setSaveStatus('saving');
        try {
            const response = await fetch('/api/cover-letter/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeId,
                    roleTitle,
                    companyName,
                    content: generatedContent
                })
            });

            if (response.ok) {
                setSaveStatus('success');
                setTimeout(() => setSaveStatus('idle'), 3000);
            } else {
                setSaveStatus('error');
            }
        } catch {
            setSaveStatus('error');
        }
    };

    const handleDownload = () => {
        if (!generatedContent) return;

        const doc = new jsPDF();

        // Settings based on requirements
        const margin = 20;
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        const maxLineWidth = pageWidth - (margin * 2);

        // Font: Times New Roman (jsPDF default 'times')
        doc.setFont('times', 'normal');
        doc.setFontSize(11);

        // Split text by lines to handle paragraphs properly
        const lines = generatedContent.split('\n');
        let cursorY = margin + 10;

        lines.forEach((line) => {
            const trimmedLine = line.trim();
            if (trimmedLine === '') {
                cursorY += 5; // Spacing between paragraphs
                return;
            }

            const splitText = doc.splitTextToSize(trimmedLine, maxLineWidth);

            // Check if we need a new page
            if (cursorY + (splitText.length * 5) > pageHeight - margin) {
                doc.addPage();
                cursorY = margin;
            }

            doc.text(splitText, margin, cursorY);
            cursorY += (splitText.length * 5);
        });

        doc.save(`${roleTitle.replace(/\s+/g, '_')}_Cover_Letter.pdf`);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#171717]/80 backdrop-blur-md">
            <div className="bg-[#FFFFFF] border border-[#EBEBEB] w-full max-w-4xl rounded-xl flex flex-col md:flex-row overflow-hidden shadow-2xl max-h-[90vh]">

                {/* Left Panel: Inputs */}
                <div className="w-full md:w-1/3 p-6 sm:p-8 border-b md:border-b-0 md:border-r border-[#EBEBEB] bg-[#FAFAFA] overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-[#171717]">
                            <Wand2 className="w-5 h-5 text-[#0070f3]" />
                            AI Cover Letter
                        </h2>
                        <button onClick={onClose} className="md:hidden p-2 hover:bg-[#FAFAFA] rounded-full text-[#8F8F8F] hover:text-[#171717]">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-[#8F8F8F] uppercase tracking-wider mb-1.5 block">Role Title *</label>
                            <input
                                type="text"
                                value={roleTitle}
                                onChange={e => setRoleTitle(e.target.value)}
                                placeholder="e.g. Senior Frontend Engineer"
                                className="w-full bg-[#FFFFFF] border border-[#EBEBEB] rounded-md px-4 py-2.5 text-sm focus:border-[#171717] outline-none text-[#171717] placeholder-[#8F8F8F] transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-[#8F8F8F] uppercase tracking-wider mb-1.5 block">Company Name</label>
                            <input
                                type="text"
                                value={companyName}
                                onChange={e => setCompanyName(e.target.value)}
                                placeholder="e.g. Google"
                                className="w-full bg-[#FFFFFF] border border-[#EBEBEB] rounded-md px-4 py-2.5 text-sm focus:border-[#171717] outline-none text-[#171717] placeholder-[#8F8F8F] transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-[#8F8F8F] uppercase tracking-wider mb-1.5 block">Job Description *</label>
                            <textarea
                                value={jobDescription}
                                onChange={e => setJobDescription(e.target.value)}
                                placeholder="Paste the job requirements here..."
                                rows={6}
                                className="w-full bg-[#FFFFFF] border border-[#EBEBEB] rounded-md px-4 py-3 text-sm focus:border-[#171717] outline-none text-[#171717] placeholder-[#8F8F8F] transition-all resize-none"
                            />
                        </div>

                        <div className="pt-2 space-y-2">
                            <label className="text-xs font-semibold text-[#8F8F8F] uppercase tracking-wider mb-1 block">Style Options</label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { key: 'isFormal', label: 'More Formal' },
                                    { key: 'isConcise', label: 'Concise (250w)' },
                                    { key: 'isDetailed', label: 'Detailed (450w)' }
                                ].map(opt => (
                                    <button
                                        key={opt.key}
                                        onClick={() => setOptions(prev => ({ ...prev, [opt.key]: !prev[opt.key as keyof typeof prev] }))}
                                        className={`px-3 py-1.5 rounded-md text-[11px] font-medium border transition-all ${options[opt.key as keyof typeof options]
                                            ? 'bg-blue-50 border-blue-200 text-blue-600'
                                            : 'bg-[#FFFFFF] border-[#EBEBEB] text-[#4D4D4D] hover:bg-[#FAFAFA]'
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !jobDescription || !roleTitle}
                            className="w-full py-3 bg-[#171717] hover:bg-[#333333] text-white rounded-md font-bold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 transition-all mt-4"
                        >
                            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Wand2 className="w-4 h-4" /> Generate Letter</>}
                        </button>
                    </div>
                </div>

                {/* Right Panel: Output */}
                <div className="flex-1 flex flex-col min-h-0 bg-[#FFFFFF]">
                    <div className="p-6 sm:p-8 flex items-center justify-between border-b border-[#EBEBEB]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 border border-blue-100 rounded-md">
                                <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-[#171717]">Generated Cover Letter</h3>
                                <p className="text-[10px] text-[#8F8F8F] uppercase tracking-wider font-mono">AI Crafted Professional Draft</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {generatedContent && (
                                <>
                                    <button
                                        onClick={handleSave}
                                        disabled={saveStatus === 'saving'}
                                        className="p-2.5 bg-[#FFFFFF] hover:bg-[#FAFAFA] border border-[#EBEBEB] rounded-md transition-all text-[#171717] group relative"
                                    >
                                        {saveStatus === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> :
                                            saveStatus === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Save className="w-4 h-4" />}
                                        <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Save to DB</span>
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        className="p-2.5 bg-[#FFFFFF] hover:bg-[#FAFAFA] border border-[#EBEBEB] rounded-md transition-all text-[#171717] group relative"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Download PDF</span>
                                    </button>
                                </>
                            )}
                            <button onClick={onClose} className="hidden md:flex p-2.5 hover:bg-[#FAFAFA] rounded-md transition-all text-[#8F8F8F]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
                        {isGenerating ? (
                            <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-40">
                                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                                <p className="text-sm font-medium animate-pulse text-[#4D4D4D]">Analyzing JD and mapping your skills...</p>
                            </div>
                        ) : generatedContent ? (
                            <div className="prose max-w-none">
                                <p className="whitespace-pre-wrap text-[#4D4D4D] leading-relaxed text-sm lg:text-base">
                                    {generatedContent}
                                </p>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                <div className="p-4 bg-[#FAFAFA] rounded-lg border border-[#EBEBEB]" title="AI Memory">
                                    <FileText className="w-10 h-10 text-[#8F8F8F]" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#8F8F8F]">Ready to boost your application?</h4>
                                    <p className="text-sm text-[#4D4D4D] max-w-[280px] mt-1">Provide the role details on the left to generate a personalized cover letter.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {saveStatus === 'success' && (
                        <div className="mx-8 mb-6 p-3 bg-emerald-50 border border-emerald-100 rounded-md flex items-center gap-2 text-emerald-700 text-xs animate-in slide-in-from-bottom-2">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Saved successfully to your dashboard!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
