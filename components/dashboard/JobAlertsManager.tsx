'use client';

import { useState, useEffect } from 'react';
import {
    Bell, Mail, Plus, X,
    CheckCircle2, Loader2, Briefcase, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function JobAlertsManager() {
    const [alert, setAlert] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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
                // Show success state briefly
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Bell className="w-6 h-6 text-indigo-400" /> Daily Job Alerts
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Get notified about jobs matching your profile.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active</span>
                    <button
                        onClick={() => setAlert({ ...alert, is_active: !alert.is_active })}
                        className={`w-12 h-6 rounded-full transition-all relative ${alert.is_active ? 'bg-indigo-500' : 'bg-slate-700'}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${alert.is_active ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Keywords / Skills */}
                <div className="space-y-4">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <Briefcase className="w-3.5 h-3.5" /> Target Skills
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                            placeholder="e.g. React, Python, Product Management"
                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:border-indigo-500 transition-all outline-none"
                        />
                        <button
                            onClick={addSkill}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-xl transition-all"
                        >
                            <Plus className="w-4 h-4 text-indigo-400" />
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
                                    className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center gap-1.5 group"
                                >
                                    {skill}
                                    <button onClick={() => removeSkill(skill)} className="hover:text-white">
                                        <X className="w-3 h-3" />
                                    </button>
                                </motion.span>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Locations */}
                <div className="space-y-4">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <MapPin className="w-3.5 h-3.5" /> Preferred Locations
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={locationInput}
                            onChange={(e) => setLocationInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addLocation()}
                            placeholder="e.g. Remote, Bangalore, London"
                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:border-indigo-500 transition-all outline-none"
                        />
                        <button
                            onClick={addLocation}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-xl transition-all"
                        >
                            <Plus className="w-4 h-4 text-emerald-400" />
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
                                    className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1.5 group"
                                >
                                    {loc}
                                    <button onClick={() => removeLocation(loc)} className="hover:text-white">
                                        <X className="w-3 h-3" />
                                    </button>
                                </motion.span>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <input
                            type="radio"
                            id="daily"
                            name="freq"
                            checked={alert.frequency === 'daily'}
                            onChange={() => setAlert({ ...alert, frequency: 'daily' })}
                            className="accent-indigo-500"
                        />
                        <label htmlFor="daily" className="text-xs font-bold text-slate-400 cursor-pointer">Daily Summary</label>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="radio"
                            id="weekly"
                            name="freq"
                            checked={alert.frequency === 'weekly'}
                            onChange={() => setAlert({ ...alert, frequency: 'weekly' })}
                            className="accent-indigo-500"
                        />
                        <label htmlFor="weekly" className="text-xs font-bold text-slate-400 cursor-pointer">Weekly Digest</label>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-500/25 hover:opacity-90 transition-all flex items-center gap-3 disabled:opacity-50"
                >
                    {saving ? <>Saving... <Loader2 className="w-4 h-4 animate-spin" /></> : <>Update Preferences <CheckCircle2 className="w-4 h-4" /></>}
                </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 flex gap-4 items-center">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-indigo-400" />
                </div>
                <p className="text-xs text-slate-500 italic">
                    Alerts will be sent to the email associated with your account. You can unsubscribe at any time.
                </p>
            </div>
        </div>
    );
}
