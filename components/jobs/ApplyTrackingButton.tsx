'use client';

import { ArrowRight } from 'lucide-react';

interface ApplyButtonProps {
    job: {
        id: string;
        title: string;
        company: string;
        apply_url: string | null;
    };
}

export default function ApplyTrackingButton({ job }: ApplyButtonProps) {
    const handleApply = async () => {
        window.open(job.apply_url || '#', '_blank');
        try {
            await fetch('/api/jobs/track-apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    job_id: job.id,
                    job_title: job.title,
                    company: job.company,
                    apply_url: job.apply_url
                })
            });
        } catch (e) {
            console.error('Failed to track application:', e);
        }
    };

    return (
        <button
            onClick={handleApply}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl flex items-center gap-2 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 text-xs sm:text-sm"
        >
            Apply Now <ArrowRight className="w-5 h-5" />
        </button>
    );
}
