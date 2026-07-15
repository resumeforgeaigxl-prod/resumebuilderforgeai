"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Loader2, Save, RefreshCw, Users, UserPlus, Info, 
  CheckCircle2, XCircle, Code, ShieldCheck, Mail, Phone, Tag
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

export default function AdminExpertsPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const [experts, setExperts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form input states
  const [selectedExpert, setSelectedExpert] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [spec, setSpec] = useState('');
  const [skills, setSkills] = useState('');
  const [domains, setDomains] = useState('');
  const [availability, setAvailability] = useState(true);
  const [status, setStatus] = useState('Active');

  const fetchExperts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/project-services/admin/experts');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setExperts(json.experts || []);
        }
      }
    } catch (err) {
      console.error('[Admin Experts] Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExperts();
  }, []);

  const handleEditClick = (exp: any) => {
    setSelectedExpert(exp);
    setName(exp.name);
    setEmail(exp.email);
    setPhone(exp.phone || '');
    setSpec(exp.specialization || '');
    setSkills((exp.skills || []).join(', '));
    setDomains((exp.domains || []).join(', '));
    setAvailability(exp.availability !== undefined ? exp.availability : true);
    setStatus(exp.status || 'Active');
  };

  const handleResetForm = () => {
    setSelectedExpert(null);
    setName('');
    setEmail('');
    setPhone('');
    setSpec('');
    setSkills('');
    setDomains('');
    setAvailability(true);
    setStatus('Active');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/project-services/admin/experts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedExpert?.id || undefined,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          specialization: spec.trim() || undefined,
          skills: skills.split(',').map(s => s.trim()).filter(Boolean),
          domains: domains.split(',').map(s => s.trim()).filter(Boolean),
          availability,
          status
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          alert(selectedExpert ? 'Expert updated!' : 'New expert added!');
          handleResetForm();
          fetchExperts();
        }
      }
    } catch (err) {
      console.error('[Admin Experts] Submit Error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && experts.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#7c3aed]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-[#171717]">
      {/* Back Link */}
      <div>
        <Link 
          href={`/${locale}/admin/project-services`} 
          className="inline-flex items-center gap-2 text-xs font-mono text-stone-500 hover:text-[#171717]"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold tracking-widest text-[11px] font-mono uppercase mb-1">
            <Users className="w-3.5 h-3.5" /> Developer Roster
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#171717]">Experts Manager</h1>
          <p className="text-stone-500 text-xs mt-1">Register developers, check active workloads, and toggle availabilities.</p>
        </div>
        <button 
          onClick={fetchExperts} 
          className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 hover:text-[#171717] transition-all shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        {/* Table List of Experts */}
        <div className="lg:col-span-2 border border-[#EBEBEB] bg-white rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#EBEBEB] bg-[#fafaf9]">
            <h3 className="text-xs font-mono font-bold text-stone-500 uppercase">Expert Register</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50/50 border-b border-[#EBEBEB] text-[#8F8F8F] font-mono uppercase tracking-wider">
                  <th className="p-4 font-bold">Name</th>
                  <th className="p-4 font-bold">Specialization</th>
                  <th className="p-4 font-bold">Workload</th>
                  <th className="p-4 font-bold">Availability</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBEBEB]">
                {experts.map((exp) => (
                  <tr key={exp.id} className="hover:bg-stone-50/50 transition-all">
                    <td className="p-4">
                      <p className="font-semibold text-[#171717]">{exp.name}</p>
                      <p className="text-[10px] text-stone-400 mt-0.5">{exp.email}</p>
                    </td>
                    <td className="p-4 text-stone-500 font-medium">{exp.specialization || 'General'}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <span className="text-indigo-600 font-bold font-mono">{exp.active_projects || 0} Active</span>
                        <span className="text-emerald-600 font-bold font-mono">{exp.completed_projects || 0} Done</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {exp.availability ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600"><CheckCircle2 className="w-3.5 h-3.5" /> Available</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600"><XCircle className="w-3.5 h-3.5" /> Busy</span>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge className={exp.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-stone-50 text-stone-500 border-stone-150'}>
                        {exp.status || 'Active'}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleEditClick(exp)}
                        className="text-xs font-mono font-bold text-[#7c3aed] hover:text-[#6d28d9]"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {experts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-stone-400 font-medium">
                      No expert developers registered.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Form */}
        <Card className="bg-white border border-[#EBEBEB] shadow-sm">
          <CardHeader className="pb-3 border-b border-[#EBEBEB]">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#7c3aed]" /> {selectedExpert ? 'Modify Expert' : 'Add New Expert'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-xs font-mono font-bold text-stone-400 uppercase block mb-1.5 font-semibold">Full Name *</label>
                <Input 
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-mono font-bold text-stone-400 uppercase block mb-1.5 font-semibold">Email Address *</label>
                <Input 
                  type="email"
                  placeholder="e.g. expert@resumeforge.ai"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-mono font-bold text-stone-400 uppercase block mb-1.5 font-semibold">Mobile Number</label>
                <Input 
                  placeholder="e.g. +91 9876543210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-mono font-bold text-stone-400 uppercase block mb-1.5 font-semibold">Specialization</label>
                <Input 
                  placeholder="e.g. Full Stack / Deep Learning"
                  value={spec}
                  onChange={e => setSpec(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-mono font-bold text-stone-400 uppercase block mb-1.5 font-semibold">Skills (Comma Separated)</label>
                <Input 
                  placeholder="e.g. React, Node.js, Python, OpenCV"
                  value={skills}
                  onChange={e => setSkills(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-mono font-bold text-stone-400 uppercase block mb-1.5 font-semibold">Domains (Comma Separated)</label>
                <Input 
                  placeholder="e.g. AI, Full Stack, Computer Vision"
                  value={domains}
                  onChange={e => setDomains(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono font-bold text-stone-400 uppercase block mb-1.5 font-semibold">Status</label>
                  <select
                    className="w-full h-10 border border-stone-200 bg-white px-3 rounded-xl text-xs font-semibold text-stone-600 focus:outline-none focus:ring-1 focus:ring-[#7c3aed] transition-all"
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-mono font-bold text-stone-400 uppercase block mb-1.5 font-semibold">Availability</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAvailability(true)}
                      className={`flex-1 py-2 px-3 border rounded-xl text-xs font-semibold uppercase transition-all ${
                        availability 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvailability(false)}
                      className={`flex-1 py-2 px-3 border rounded-xl text-xs font-semibold uppercase transition-all ${
                        !availability 
                          ? 'bg-rose-500 border-rose-500 text-white' 
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      Busy
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-1 bg-[#7c3aed] hover:bg-[#6d28d9] text-xs font-mono font-bold text-white rounded-xl h-10"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-white mr-1.5" /> : null}
                  {selectedExpert ? 'Update Developer' : 'Add Developer'}
                </Button>
                {selectedExpert && (
                  <button 
                    type="button" 
                    onClick={handleResetForm}
                    className="px-4 border border-stone-200 bg-white text-[#171717] text-xs font-mono font-bold hover:bg-stone-50 rounded-xl"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
