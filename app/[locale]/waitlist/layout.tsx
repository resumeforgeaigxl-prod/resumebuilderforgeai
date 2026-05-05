import { ReactNode } from 'react';

export default function WaitlistLayout({ children }: { children: ReactNode }) {
    return (
        <div className="waitlist-container relative min-h-screen">
            {/* Custom Header for Waitlist (Optional, or just logo) */}
            <div className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center pointer-events-none">
                <div className="pointer-events-auto">
                    {/* Minimal Logo */}
                    <div className="flex items-center gap-2">
                         <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-600/20">✦</div>
                         <span className="text-white font-black text-xl tracking-tighter">ResumeForge<span className="text-indigo-500">AI</span></span>
                    </div>
                </div>
            </div>

            {children}

            {/* Global CSS to hide the main navigation header if it exists */}
            <style dangerouslySetInnerHTML={{ __html: `
                header, nav { display: none !important; }
                .waitlist-container header, .waitlist-container nav { display: flex !important; }
                /* Ensure our specific minimal header stays visible */
                .z-50 { display: flex !important; }
            `}} />
        </div>
    );
}
