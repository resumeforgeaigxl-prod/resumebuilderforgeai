"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Loader2, Save, RefreshCw, Settings, Info, 
  DollarSign, Hash, ShieldAlert, FileText, Percent, ShieldCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AdminSettingsPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Editable Form states
  const [defaultMajor, setDefaultMajor] = useState(15000);
  const [defaultMinor, setDefaultMinor] = useState(8000);
  const [defaultMini, setDefaultMini] = useState(4000);
  const [currency, setCurrency] = useState('INR');
  const [taxPercent, setTaxPercent] = useState(18);

  const [urgencyNormal, setUrgencyNormal] = useState(1.0);
  const [urgencyUrgent, setUrgencyUrgent] = useState(1.25);
  const [urgencyCritical, setUrgencyCritical] = useState(1.5);

  const [prefixQuote, setPrefixQuote] = useState('QTN-PRJ-');
  const [prefixInvoice, setPrefixInvoice] = useState('INV-PRJ-');
  const [prefixProject, setPrefixProject] = useState('PRJ-');

  const [maxSizeMb, setMaxSizeMb] = useState(15);
  const [allowedTypes, setAllowedTypes] = useState('pdf, docx, zip, png, jpg');

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/project-services/admin/settings');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.settings) {
          const s = json.settings;
          setSettings(s);

          // Pricing
          if (s.pricing) {
            setDefaultMajor(s.pricing.default_major || 15000);
            setDefaultMinor(s.pricing.default_minor || 8000);
            setDefaultMini(s.pricing.default_mini || 4000);
            setCurrency(s.pricing.currency || 'INR');
            setTaxPercent(s.pricing.tax_percent || 18);
          }

          // Multipliers
          if (s.urgency_multipliers) {
            setUrgencyNormal(s.urgency_multipliers.Normal || 1.0);
            setUrgencyUrgent(s.urgency_multipliers.Urgent || 1.25);
            setUrgencyCritical(s.urgency_multipliers.Critical || 1.5);
          }

          // Prefixes
          if (s.prefixes) {
            setPrefixQuote(s.prefixes.quotation || 'QTN-PRJ-');
            setPrefixInvoice(s.prefixes.invoice || 'INV-PRJ-');
            setPrefixProject(s.prefixes.project || 'PRJ-');
          }

          // Restrictions
          if (s.file_restrictions) {
            setMaxSizeMb(s.file_restrictions.max_size_mb || 15);
            setAllowedTypes((s.file_restrictions.allowed_types || []).join(', '));
          }
        }
      }
    } catch (err) {
      console.error('[Admin Settings] Fetch Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSetting = async (key: string, value: any) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/project-services/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
      if (!res.ok) {
        throw new Error('Save failed');
      }
    } catch (err) {
      console.error('[Admin Settings] Save Error:', err);
      alert(`Failed to save settings for key: ${key}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);

    try {
      // Pricing
      await handleSaveSetting('pricing', {
        default_major: Number(defaultMajor),
        default_minor: Number(defaultMinor),
        default_mini: Number(defaultMini),
        currency,
        tax_percent: Number(taxPercent)
      });

      // Urgency
      await handleSaveSetting('urgency_multipliers', {
        Normal: Number(urgencyNormal),
        Urgent: Number(urgencyUrgent),
        Critical: Number(urgencyCritical)
      });

      // Prefixes
      await handleSaveSetting('prefixes', {
        quotation: prefixQuote,
        invoice: prefixInvoice,
        project: prefixProject
      });

      // Restrictions
      await handleSaveSetting('file_restrictions', {
        max_size_mb: Number(maxSizeMb),
        allowed_types: allowedTypes.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
      });

      alert('All settings saved successfully!');
      fetchSettings();
    } catch (err) {
      console.error('[Settings Save All Error]', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
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

      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold tracking-widest text-[11px] font-mono uppercase mb-1">
            <Settings className="w-3.5 h-3.5" /> Platform Parameters
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#171717]">Settings Control</h1>
          <p className="text-stone-500 text-xs mt-1">Configure default prices, prefix naming rules, multipliers, and upload restrictions.</p>
        </div>
        <Button 
          onClick={handleSaveAll} 
          disabled={isSaving}
          className="bg-[#7c3aed] hover:bg-[#6d28d9] text-xs font-mono font-bold text-white rounded-xl h-10 px-5 shrink-0"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-white mr-1.5" /> : <Save className="w-4 h-4 text-white mr-1.5" />}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
        {/* pricing */}
        <Card className="bg-white border border-[#EBEBEB] shadow-sm">
          <CardHeader className="pb-3 border-b border-[#EBEBEB]">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#7c3aed]" /> Default Pricing Structures
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono font-bold text-stone-400 uppercase block mb-1.5">Major Project Price</label>
                <Input 
                  type="number"
                  value={defaultMajor}
                  onChange={e => setDefaultMajor(Number(e.target.value))}
                  className="font-mono text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-mono font-bold text-stone-400 uppercase block mb-1.5">Minor Project Price</label>
                <Input 
                  type="number"
                  value={defaultMinor}
                  onChange={e => setDefaultMinor(Number(e.target.value))}
                  className="font-mono text-xs font-semibold"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-mono font-bold text-stone-400 uppercase block mb-1.5">Mini Project Price</label>
                <Input 
                  type="number"
                  value={defaultMini}
                  onChange={e => setDefaultMini(Number(e.target.value))}
                  className="font-mono text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-mono font-bold text-stone-400 uppercase block mb-1.5">Tax (GST %)</label>
                <div className="relative">
                  <Input 
                    type="number"
                    value={taxPercent}
                    onChange={e => setTaxPercent(Number(e.target.value))}
                    className="font-mono text-xs font-semibold pr-7"
                  />
                  <Percent className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* multipliers */}
        <Card className="bg-white border border-[#EBEBEB] shadow-sm">
          <CardHeader className="pb-3 border-b border-[#EBEBEB]">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Percent className="w-4 h-4 text-[#7c3aed]" /> Urgency Price Multipliers
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-mono font-bold text-stone-400 uppercase block mb-1.5">Normal</label>
                <Input 
                  type="number"
                  step="0.05"
                  value={urgencyNormal}
                  onChange={e => setUrgencyNormal(Number(e.target.value))}
                  className="font-mono text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-mono font-bold text-stone-400 uppercase block mb-1.5">Urgent</label>
                <Input 
                  type="number"
                  step="0.05"
                  value={urgencyUrgent}
                  onChange={e => setUrgencyUrgent(Number(e.target.value))}
                  className="font-mono text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-mono font-bold text-stone-400 uppercase block mb-1.5">Critical</label>
                <Input 
                  type="number"
                  step="0.05"
                  value={urgencyCritical}
                  onChange={e => setUrgencyCritical(Number(e.target.value))}
                  className="font-mono text-xs font-semibold"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* prefixes */}
        <Card className="bg-white border border-[#EBEBEB] shadow-sm">
          <CardHeader className="pb-3 border-b border-[#EBEBEB]">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Hash className="w-4 h-4 text-[#7c3aed]" /> Naming & Invoice Prefixes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-mono font-bold text-stone-400 uppercase block mb-1.5">Quotation</label>
                <Input 
                  value={prefixQuote}
                  onChange={e => setPrefixQuote(e.target.value)}
                  className="font-mono text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-mono font-bold text-stone-400 uppercase block mb-1.5">Invoice</label>
                <Input 
                  value={prefixInvoice}
                  onChange={e => setPrefixInvoice(e.target.value)}
                  className="font-mono text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-mono font-bold text-stone-400 uppercase block mb-1.5">Project ID</label>
                <Input 
                  value={prefixProject}
                  onChange={e => setPrefixProject(e.target.value)}
                  className="font-mono text-xs font-semibold"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload sizes */}
        <Card className="bg-white border border-[#EBEBEB] shadow-sm">
          <CardHeader className="pb-3 border-b border-[#EBEBEB]">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#7c3aed]" /> File Upload Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <label className="text-xs font-mono font-bold text-stone-400 uppercase block mb-1.5">Max Size (MB)</label>
                <Input 
                  type="number"
                  value={maxSizeMb}
                  onChange={e => setMaxSizeMb(Number(e.target.value))}
                  className="font-mono text-xs font-semibold"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-mono font-bold text-stone-400 uppercase block mb-1.5">Allowed Extensions</label>
                <Input 
                  value={allowedTypes}
                  onChange={e => setAllowedTypes(e.target.value)}
                  className="font-mono text-xs font-semibold"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Warning Banner */}
      <div className="flex gap-2.5 items-start text-stone-400 text-xs bg-stone-50 border border-stone-200/50 p-4 rounded-xl max-w-[800px] mx-auto select-none">
        <Info className="w-4.5 h-4.5 text-stone-400 shrink-0 mt-0.5" />
        <p className="leading-normal text-left">Updating pricing structures does not retroactively change existing quotes, tickets, or invoice records. Changes only apply to newly generated projects, quotes, and files.</p>
      </div>

    </div>
  );
}
