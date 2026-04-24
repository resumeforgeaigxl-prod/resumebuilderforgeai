'use client';
import { useEffect } from 'react';

import { ShieldAlert } from 'lucide-react';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        if (process.env.NODE_ENV !== 'production') {
            console.error('[App Error Boundary]', error);
        }
    }, [error]);


    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#070710] text-slate-100 p-4 selection:bg-rose-500/30">
            <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-rose-600/10 blur-[150px] -z-10" />

            <div className="text-center max-w-md relative z-10 border border-white/5 bg-white/[0.02] p-10 rounded-3xl backdrop-blur-xl">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-rose-600/10 border border-rose-500/30 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                        <ShieldAlert className="w-8 h-8 text-rose-500" />
                    </div>
                </div>
                <h1 className="text-4xl font-black mb-4">Something Went Wrong</h1>
                <p className="text-slate-400 mb-4 font-medium">
                    Our servers encountered an error while processing your request.
                </p>
                {/* Debug info */}
                <div className="bg-black/40 border border-white/5 p-4 rounded-xl mb-8 text-left overflow-auto max-h-40">
                    <p className="text-rose-400 text-xs font-mono font-bold uppercase tracking-widest mb-2">Error Detail</p>
                    <p className="text-slate-500 text-[11px] font-mono whitespace-pre-wrap leading-relaxed">
                        {error.message || 'Unknown runtime exception'}
                        {error.digest && `\n\nDigest: ${error.digest}`}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => window.location.href = '/en-in/dashboard'}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 text-center"
                    >
                        Go to Dashboard
                    </button>
                    <button
                        onClick={() => reset()}
                        className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl font-bold transition-all active:scale-95 text-center"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        </div>
    );
}
