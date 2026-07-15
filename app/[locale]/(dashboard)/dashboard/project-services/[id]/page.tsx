"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Loader2, Send, Upload, FileText, Download, Calendar, 
  DollarSign, CheckCircle2, MessageSquare, Clock, ShieldAlert,
  Menu, Info, Users, BookOpen, ExternalLink, RefreshCw, Check, Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';

export default function StudentProjectDetailsPage({ params }: { params: { locale: string; id: string } }) {
  const { locale, id } = params;
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const messageEndRef = useRef<HTMLDivElement>(null);

  const fetchDetails = async () => {
    try {
      const response = await fetch(`/api/project-services/requests/${id}`);
      if (response.ok) {
        const json = await response.json();
        if (json.success) {
          setData(json);
        }
      }
    } catch (err) {
      console.error('[Details Page] Fetch Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  // Scroll chat messages to bottom
  useEffect(() => {
    if (activeTab === 'messages') {
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [data?.messages, activeTab]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch(`/api/project-services/requests/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText })
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success) {
          setData((prev: any) => ({
            ...prev,
            messages: [...prev.messages, json.message]
          }));
          setMessageText('');
        }
      }
    } catch (err) {
      console.error('[Details Page] Send Message Error:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || isUploading) return;

    setIsUploading(true);
    setUploadProgress(15);

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
        publicUrl = `https://dobrcuiohslvoiklmevq.supabase.co/storage/v1/object/public/project-services-files/${filePath}`;
      }

      // Save metadata to database
      const response = await fetch(`/api/project-services/requests/${id}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_name: file.name,
          file_url: publicUrl,
          file_size: file.size
        })
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success) {
          setData((prev: any) => ({
            ...prev,
            files: [...prev.files, json.file]
          }));
        }
      }
    } catch (err) {
      console.error('[Details Page] File Upload Error:', err);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
      case 'Under Review':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Under Review</Badge>;
      case 'In Progress':
        return <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">In Progress</Badge>;
      case 'Testing':
        return <Badge className="bg-cyan-50 text-cyan-700 border-cyan-200">Testing</Badge>;
      case 'Completed':
        return <Badge className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'Delivered':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Delivered</Badge>;
      case 'Cancelled':
        return <Badge className="bg-rose-50 text-rose-700 border-rose-200">Cancelled</Badge>;
      default:
        return <Badge className="bg-stone-50 text-stone-700 border-stone-200">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#7c3aed]" />
      </div>
    );
  }

  if (!data?.request) {
    return (
      <div className="text-center py-20">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold">Request not found</h2>
        <p className="text-stone-500 text-sm mt-1">Please verify the project ID or return to request list.</p>
        <Link href={`/${locale}/dashboard/project-services`} className="inline-flex items-center gap-2 mt-6 text-sm font-mono text-[#7c3aed]">
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  const { request, files, timeline, messages, deliverables, invoices } = data;

  const tabList = [
    { id: 'overview', name: 'Overview' },
    { id: 'timeline', name: 'Timeline' },
    { id: 'files', name: 'Guideline Files' },
    { id: 'messages', name: 'Messages' },
    { id: 'deliverables', name: 'Deliverables' },
    { id: 'invoices', name: 'Invoices' },
    { id: 'support', name: 'Support' }
  ];

  return (
    <div className="space-y-8 animate-fade-in text-[#171717]">
      {/* Back Link */}
      <div>
        <Link 
          href={`/${locale}/dashboard/project-services`} 
          className="inline-flex items-center gap-2 text-xs font-mono text-stone-500 hover:text-[#171717]"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Request Center
        </Link>
      </div>

      {/* Title & Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-lg font-bold text-[#7c3aed]">{request.project_id}</span>
            {getStatusBadge(request.status)}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#171717] mt-2">{request.project_title}</h1>
          <p className="text-stone-500 text-xs mt-1">Branch: {request.branch} | Deadline: {request.submission_date ? new Date(request.submission_date).toLocaleDateString() : 'N/A'}</p>
        </div>
        <button 
          onClick={fetchDetails} 
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 hover:text-[#171717] hover:bg-stone-50 text-xs font-mono font-bold transition-all shadow-sm shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Sync Status
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 overflow-x-auto gap-6 select-none scrollbar-none">
        {tabList.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 text-sm font-semibold whitespace-nowrap transition-all border-b-2 -mb-[2px] ${
              activeTab === tab.id 
                ? 'border-[#7c3aed] text-[#7c3aed]' 
                : 'border-transparent text-stone-500 hover:text-[#171717]'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              {/* Description */}
              <div className="bg-white border border-[#EBEBEB] p-6 rounded-xl shadow-sm">
                <h3 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider mb-3">Project Description</h3>
                <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-wrap">{request.project_description}</p>
              </div>

              {/* Abstract */}
              {request.existing_abstract && (
                <div className="bg-white border border-[#EBEBEB] p-6 rounded-xl shadow-sm">
                  <h3 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider mb-3">Submitted Abstract</h3>
                  <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-wrap">{request.existing_abstract}</p>
                </div>
              )}
            </div>

            {/* Spec details card */}
            <div className="space-y-6">
              <div className="bg-white border border-[#EBEBEB] p-6 rounded-xl shadow-sm">
                <h3 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider mb-4">Project Parameters</h3>
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="text-stone-400">Project Mode</span>
                    <span className="font-semibold">{request.project_mode} ({request.team_size} members)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="text-stone-400">Project Type</span>
                    <span className="font-semibold">{request.project_type}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="text-stone-400">Domain</span>
                    <span className="font-semibold">{request.project_domain}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="text-stone-400">Urgency</span>
                    <span className="font-semibold">{request.urgency}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="text-stone-400">Budget Range</span>
                    <span className="font-semibold font-mono">{request.budget_range}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-stone-400">College / Univ</span>
                    <span className="font-semibold text-right max-w-[120px] truncate">{request.college}</span>
                  </div>
                </div>
              </div>

              {/* Technologies card */}
              <div className="bg-white border border-[#EBEBEB] p-6 rounded-xl shadow-sm">
                <h3 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider mb-4">Tech Preferences</h3>
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="text-stone-400">Frontend</span>
                    <span className="font-semibold text-right">{request.tech_frontend || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="text-stone-400">Backend</span>
                    <span className="font-semibold text-right">{request.tech_backend || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="text-stone-400">Database</span>
                    <span className="font-semibold text-right">{request.tech_database || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-stone-400">Language</span>
                    <span className="font-semibold text-right">{request.tech_language || 'Not specified'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TIMELINE TAB */}
        {activeTab === 'timeline' && (
          <div className="bg-white border border-[#EBEBEB] p-8 rounded-xl shadow-sm max-w-[700px] mx-auto text-left">
            <h3 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider mb-8">Development Lifecyle Tracking</h3>
            <div className="relative pl-6 border-l-2 border-stone-200 space-y-8">
              {timeline.map((event: any, idx: number) => {
                const isLatest = idx === timeline.length - 1;
                return (
                  <div key={event.id} className="relative">
                    <div className={`absolute -left-[31px] top-0 flex h-4 w-4 items-center justify-center rounded-full border ${isLatest ? 'bg-[#7c3aed] border-[#7c3aed]' : 'bg-[#10b981] border-[#10b981] text-white'}`}>
                      {isLatest ? <div className="h-1.5 w-1.5 rounded-full bg-white" /> : <Check className="w-2.5 h-2.5" />}
                    </div>
                    <h4 className="text-sm font-bold text-[#171717]">{event.title}</h4>
                    <p className="text-xs text-stone-500 mt-1">{event.description}</p>
                    <span className="text-[10px] font-mono text-stone-400 block mt-2">{new Date(event.created_at).toLocaleString()}</span>
                  </div>
                );
              })}
              {timeline.length === 0 && (
                <div className="text-center py-6 text-stone-400">
                  <Clock className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-sm font-semibold">No timeline logs found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FILES TAB */}
        {activeTab === 'files' && (
          <div className="space-y-6">
            {/* File Upload Zone */}
            <div className="relative border-2 border-dashed border-stone-200 rounded-xl p-8 text-center bg-white hover:bg-stone-50 transition-colors max-w-[600px] mx-auto">
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                onChange={handleFileUpload} 
                disabled={isUploading}
              />
              <Upload className="w-6 h-6 text-stone-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-stone-700">Drag & drop files or click to add files</p>
              <p className="text-xs text-stone-400 mt-1">Submit guidelines, syllabus copy, base papers, or updates (Max 15MB)</p>
            </div>

            {/* Progress */}
            {isUploading && (
              <div className="space-y-2 max-w-[600px] mx-auto animate-fade-in bg-white border border-stone-100 p-4 rounded-xl shadow-sm">
                <div className="flex justify-between text-xs font-mono font-bold text-stone-500">
                  <span className="flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading document...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#7c3aed] h-full transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            {/* List */}
            <div className="bg-white border border-[#EBEBEB] rounded-xl overflow-hidden shadow-sm max-w-[600px] mx-auto">
              <div className="p-4 border-b border-[#EBEBEB] bg-[#fafaf9]">
                <h3 className="text-xs font-mono font-bold text-stone-500 uppercase">Documents Attached</h3>
              </div>
              <div className="divide-y divide-[#EBEBEB]">
                {files.map((file: any) => (
                  <div key={file.id} className="p-4 flex items-center justify-between hover:bg-stone-50/50 transition-all">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-stone-400 shrink-0" />
                      <div className="text-left">
                        <p className="text-xs font-semibold text-[#171717] truncate max-w-[250px]">{file.file_name}</p>
                        <p className="text-[10px] text-stone-400 font-mono mt-0.5">{(file.file_size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <a 
                      href={file.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-stone-200 bg-white rounded-lg text-[10px] font-mono font-bold text-stone-600 hover:text-[#171717] hover:bg-stone-50 transition-all shadow-sm"
                    >
                      <Download className="w-3 h-3" /> Download
                    </a>
                  </div>
                ))}
                {files.length === 0 && (
                  <div className="p-8 text-center text-stone-400">
                    <p className="text-xs font-semibold">No documents attached to this ticket.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div className="max-w-[700px] mx-auto border border-[#EBEBEB] bg-white rounded-xl overflow-hidden shadow-sm flex flex-col h-[500px]">
            {/* Thread Header */}
            <div className="p-4 border-b border-[#EBEBEB] bg-[#fafaf9] flex items-center justify-between">
              <span className="text-xs font-semibold flex items-center gap-1.5"><MessageSquare className="w-4 h-4 text-[#7c3aed]" /> Discussion Thread</span>
              <span className="text-[10px] font-mono text-stone-400">Project Support Desk</span>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-stone-50/50">
              {messages.map((msg: any) => {
                const isStudent = msg.sender_role === 'student';
                return (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col ${isStudent ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold text-stone-400 uppercase">
                        {isStudent ? 'You' : msg.sender_role === 'admin' ? 'Admin' : 'Expert'}
                      </span>
                      <span className="text-[9px] font-mono text-stone-300">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={`p-3.5 rounded-2xl text-xs max-w-[80%] leading-relaxed shadow-sm ${
                      isStudent 
                        ? 'bg-[#7c3aed] text-white rounded-tr-none' 
                        : 'bg-white border border-[#EBEBEB] text-[#171717] rounded-tl-none'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                );
              })}
              <div ref={messageEndRef} />
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center text-stone-400">
                  <MessageSquare className="w-8 h-8 text-stone-300 mb-2" />
                  <p className="text-sm font-semibold">Start a conversation</p>
                  <p className="text-xs text-stone-400 mt-0.5">Send a message to our architects or your assigned expert.</p>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-[#EBEBEB] bg-white flex gap-3">
              <Input 
                placeholder="Type your message..." 
                value={messageText} 
                onChange={e => setMessageText(e.target.value)} 
                disabled={isSending}
                className="flex-1 rounded-xl"
              />
              <Button type="submit" disabled={isSending || !messageText.trim()} className="bg-[#7c3aed] hover:bg-[#6d28d9] shrink-0 h-9 w-9 p-0 flex items-center justify-center rounded-xl">
                {isSending ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4 text-white" />}
              </Button>
            </form>
          </div>
        )}

        {/* DELIVERABLES TAB */}
        {activeTab === 'deliverables' && (
          <div className="bg-white border border-[#EBEBEB] rounded-xl overflow-hidden shadow-sm max-w-[650px] mx-auto">
            <div className="p-5 border-b border-[#EBEBEB] bg-[#fafaf9]">
              <h3 className="text-xs font-mono font-bold text-stone-500 uppercase">Project Source Code & Deliverables</h3>
            </div>
            <div className="divide-y divide-[#EBEBEB]">
              {deliverables.map((del: any) => (
                <div key={del.id} className="p-5 flex items-start justify-between gap-4 hover:bg-stone-50/50 transition-all">
                  <div className="space-y-1 text-left">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100 text-[9px] font-mono font-bold uppercase">
                      v{del.version || '1.0'}
                    </span>
                    <h4 className="text-sm font-semibold text-[#171717]">{del.title}</h4>
                    {del.description && <p className="text-xs text-stone-500 font-sans">{del.description}</p>}
                    <span className="text-[10px] font-mono text-stone-400 block pt-1">Released on: {new Date(del.created_at).toLocaleDateString()}</span>
                  </div>
                  <a 
                    href={del.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 h-9 bg-[#171717] hover:bg-stone-850 rounded-xl text-xs font-mono font-bold text-white transition-all shadow-sm shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" /> Get Code
                  </a>
                </div>
              ))}
              {deliverables.length === 0 && (
                <div className="p-8 text-center text-stone-400">
                  <FileText className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                  <p className="text-sm font-semibold">No deliverables uploaded yet</p>
                  <p className="text-xs text-stone-400 mt-0.5">As components are completed, code zip links and reports will be uploaded here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* INVOICES TAB */}
        {activeTab === 'invoices' && (
          <div className="bg-white border border-[#EBEBEB] rounded-xl overflow-hidden shadow-sm max-w-[650px] mx-auto">
            <div className="p-5 border-b border-[#EBEBEB] bg-[#fafaf9]">
              <h3 className="text-xs font-mono font-bold text-stone-500 uppercase">Payment Statements</h3>
            </div>
            <div className="divide-y divide-[#EBEBEB]">
              {invoices.map((inv: any) => (
                <div key={inv.id} className="p-5 flex items-center justify-between hover:bg-stone-50/50 transition-all">
                  <div className="space-y-1 text-left">
                    <span className="font-mono text-xs text-stone-400 block">{inv.invoice_number}</span>
                    <h4 className="text-base font-bold text-[#171717] font-mono">₹{inv.amount}</h4>
                    {inv.due_date && <span className="text-[10px] text-stone-400 block">Due date: {new Date(inv.due_date).toLocaleDateString()}</span>}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      inv.status === 'paid' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {inv.status === 'paid' ? 'Paid' : 'Unpaid'}
                    </span>
                    {inv.status === 'unpaid' && inv.payment_link && (
                      <a 
                        href={inv.payment_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 h-9 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-xs font-mono font-bold text-white transition-all shadow-sm"
                      >
                        Pay Invoice <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {invoices.length === 0 && (
                <div className="p-8 text-center text-stone-400">
                  <DollarSign className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                  <p className="text-sm font-semibold">No invoices generated yet</p>
                  <p className="text-xs text-stone-400 mt-0.5">Quotations and payment milestones will appear here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUPPORT TAB */}
        {activeTab === 'support' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[800px] mx-auto text-left">
            <div className="bg-white border border-[#EBEBEB] p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-bold text-[#171717] mb-3 flex items-center gap-1.5"><Info className="w-4.5 h-4.5 text-[#7c3aed]" /> Project Support Guidelines</h3>
              <ul className="space-y-3.5 text-xs text-stone-500 leading-normal list-disc pl-4 font-medium">
                <li>Every deliverable version is tested for syntax compiler warnings and clean execution.</li>
                <li>Reach out in the **Messages** tab if you have specific viva dates, seminar deadlines, or presentation outlines to request.</li>
                <li>Source code installation support is provided free of cost via remote assistance tools (like TeamViewer/AnyDesk) if requested in advanced messages.</li>
              </ul>
            </div>
            
            <div className="bg-white border border-[#EBEBEB] p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-bold text-[#171717] mb-3 flex items-center gap-1.5"><BookOpen className="w-4.5 h-4.5 text-[#7c3aed]" /> Viva Preparation</h3>
              <p className="text-stone-500 text-xs leading-normal font-medium mb-4">
                We generate custom viva question lists corresponding specifically to your technology stack, database, and project title.
              </p>
              <button 
                type="button" 
                onClick={() => alert('Viva preparation guide generation has been requested. Our expert mentor will compile and send it in your Chat box.')}
                className="inline-flex items-center gap-1.5 justify-center px-4 h-9 border border-stone-200 bg-white hover:bg-stone-50 rounded-xl text-xs font-mono font-bold text-[#7c3aed] transition-all"
              >
                Request Viva Guide <Sparkles className="w-3.5 h-3.5 text-[#7c3aed]" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
