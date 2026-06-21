'use client';

import { useState, useEffect } from 'react';
import {
    Bell, Mail, Plus, X,
    CheckCircle2, Loader2, Briefcase, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function JobAlertsManager() {
    const [alert, setAlert] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [skillInput, setSkillInput] = useState('');
    const [locationInput, setLocationInput] = useState('');

    useEffect(() => {
        fetch('/api/job-alerts/subscribe')
            .then(r => r.json())
            .then(d => {
                if (d.success) setAlert(d.alert || { skills: [], locations: [], frequency: 'daily', is_active: true });
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/job-alerts/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(alert)
            });
            if (res.ok) {
                toast.success('Preferences updated successfully!');
            } else {
                toast.error('Failed to update preferences');
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred while saving preferences');
        } finally {
            setSaving(false);
        }
    };

    const handleSendTestEmail = async () => {
        setTesting(true);
        try {
            // First save preferences to make sure the test uses the latest criteria
            const saveRes = await fetch('/api/job-alerts/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(alert)
            });
            
            if (!saveRes.ok) {
                toast.error('Failed to save preferences before sending test email');
                setTesting(false);
                return;
            }

            const res = await fetch('/api/job-alerts/dispatch?test=true');
            const data = await res.json();
            
            if (res.ok && data.success) {
                toast.success('Test email sent successfully! Please check your inbox.');
            } else {
                toast.error(data.error || 'Failed to send test email');
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred while sending the test email');
        } finally {
            setTesting(false);
        }
    };

    const addSkill = () => {
        if (!skillInput.trim()) return;
        if (alert.skills.includes(skillInput.trim())) return;
        setAlert({ ...alert, skills: [...alert.skills, skillInput.trim()] });
        setSkillInput('');
    };

    const removeSkill = (skill: string) => {
        setAlert({ ...alert, skills: alert.skills.filter((s: string) => s !== skill) });
    };

    const addLocation = () => {
        if (!locationInput.trim()) return;
        if (alert.locations.includes(locationInput.trim())) return;
        setAlert({ ...alert, locations: [...alert.locations, locationInput.trim()] });
        setLocationInput('');
    };

    const removeLocation = (loc: string) => {
        setAlert({ ...alert, locations: alert.locations.filter((l: string) => l !== loc) });
    };

    if (loading) return (
        <div className="h-48 flex items-center justify-center">
            <Loader2 className="animate-spin h-6 w-6 text-[#171717]" />
        </div>
    );

    return (
        <div className="space-y-6 text-[#171717] max-w-5xl mx-auto">
            <div className="flex items-center justify-between pb-6 border-b border-[#EBEBEB]">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-[#171717] flex items-center gap-2">
                        <Bell className="w-5 h-5 text-[#171717]" /> Daily Job Alerts
                    </h2>
                    <p className="text-[#8F8F8F] text-xs mt-1">Get notified about jobs matching your profile.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-semibold text-[#8F8F8F] uppercase tracking-wider">Active</span>
                    <button
                        onClick={() => setAlert({ ...alert, is_active: !alert.is_active })}
                        className={`w-10 h-5 rounded-full transition-all relative ${alert.is_active ? 'bg-[#171717]' : 'bg-[#EBEBEB]'}`}
                    >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${alert.is_active ? 'left-5.5' : 'left-0.5'}`} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Keywords / Skills */}
                <div className="space-y-3">
                    <label className="text-[10px] font-semibold text-[#8F8F8F] uppercase tracking-wider flex items-center gap-1.5 ml-1">
                        <Briefcase className="w-3.5 h-3.5 text-[#171717]" /> Target Skills
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                            placeholder="e.g. React, Python, Product Management"
                            className="w-full px-4 h-10 bg-white border border-[#EBEBEB] rounded-md text-[#171717] text-xs focus:ring-1 focus:ring-[#171717] focus:border-[#171717] transition-all outline-none placeholder:text-[#8F8F8F]"
                        />
                        <button
                            onClick={addSkill}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-[#FAFAFA] rounded-md transition-all text-[#171717]"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <AnimatePresence>
                            {alert?.skills?.map((skill: string) => (
                                <motion.span
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    key={skill}
                                    className="px-2.5 py-1 rounded bg-[#FAFAFA] border border-[#EBEBEB] text-[#171717] text-xs font-medium flex items-center gap-1.5 group"
                                >
                                    {skill}
                                    <button onClick={() => removeSkill(skill)} className="text-[#8F8F8F] hover:text-[#EE0000]">
                                        <X className="w-3 h-3" />
                                    </button>
                                </motion.span>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Locations */}
                <div className="space-y-3">
                    <label className="text-[10px] font-semibold text-[#8F8F8F] uppercase tracking-wider flex items-center gap-1.5 ml-1">
                        <MapPin className="w-3.5 h-3.5 text-[#171717]" /> Preferred Locations
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={locationInput}
                            onChange={(e) => setLocationInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addLocation()}
                            placeholder="e.g. Remote, Bangalore, London"
                            className="w-full px-4 h-10 bg-white border border-[#EBEBEB] rounded-md text-[#171717] text-xs focus:ring-1 focus:ring-[#171717] focus:border-[#171717] transition-all outline-none placeholder:text-[#8F8F8F]"
                        />
                        <button
                            onClick={addLocation}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-[#FAFAFA] rounded-md transition-all text-[#171717]"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <AnimatePresence>
                            {alert?.locations?.map((loc: string) => (
                                <motion.span
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    key={loc}
                                    className="px-2.5 py-1 rounded bg-[#FAFAFA] border border-[#EBEBEB] text-[#171717] text-xs font-medium flex items-center gap-1.5 group"
                                >
                                    {loc}
                                    <button onClick={() => removeLocation(loc)} className="text-[#8F8F8F] hover:text-[#EE0000]">
                                        <X className="w-3 h-3" />
                                    </button>
                                </motion.span>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-[#EBEBEB] flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <input
                            type="radio"
                            id="daily"
                            name="freq"
                            checked={alert.frequency === 'daily'}
                            onChange={() => setAlert({ ...alert, frequency: 'daily' })}
                            className="accent-[#171717]"
                        />
                        <label htmlFor="daily" className="text-xs font-semibold text-[#4D4D4D] cursor-pointer">Daily Summary</label>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="radio"
                            id="weekly"
                            name="freq"
                            checked={alert.frequency === 'weekly'}
                            onChange={() => setAlert({ ...alert, frequency: 'weekly' })}
                            className="accent-[#171717]"
                        />
                        <label htmlFor="weekly" className="text-xs font-semibold text-[#4D4D4D] cursor-pointer">Weekly Digest</label>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={handleSendTestEmail}
                        disabled={testing || saving}
                        className="px-4 h-10 rounded-md border border-[#EBEBEB] bg-white hover:bg-[#FAFAFA] text-[#171717] font-semibold text-xs transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {testing ? <>Sending Test... <Loader2 className="w-3.5 h-3.5 animate-spin" /></> : <>Send Test Email <Mail className="w-3.5 h-3.5" /></>}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 h-10 rounded-md bg-[#171717] hover:bg-[#171717]/90 text-white font-semibold text-xs transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm"
                    >
                        {saving ? <>Saving... <Loader2 className="w-3.5 h-3.5 animate-spin" /></> : <>Update Preferences <CheckCircle2 className="w-3.5 h-3.5" /></>}
                    </button>
                </div>
            </div>

            <div className="p-4 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] flex gap-4 items-center">
                <div className="w-8 h-8 rounded-full bg-white border border-[#EBEBEB] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-[#171717]" />
                </div>
                <p className="text-xs text-[#8F8F8F] italic">
                    Alerts will be sent to the email associated with your account. You can unsubscribe at any time.
                </p>
            </div>
        </div>
    );
}
