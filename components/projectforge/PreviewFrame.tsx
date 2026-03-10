"use client";

import React from 'react';
import { Monitor, Layout, RefreshCw } from 'lucide-react';

interface PreviewFrameProps {
    html: string;
}

export default function PreviewFrame({ html }: PreviewFrameProps) {
    const [isLoading, setIsLoading] = React.useState(true);

    const handleLoad = () => {
        setIsLoading(false);
    };

    return (
        <div className="h-full w-full bg-[#0d0d1a] border-l border-white/5 flex flex-col">
            <div className="px-5 py-3 border-b border-white/5 bg-[#0a0a15] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Layout className="w-5 h-5 text-blue-400" />
                    <h3 className="text-sm font-bold text-white tracking-wide uppercase">UI Preview</h3>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
            </div>

            <div className="flex-1 relative bg-white/5 overflow-hidden">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#070710]/80 backdrop-blur-sm z-10 transition-opacity duration-500">
                        <div className="flex flex-col items-center gap-4">
                            <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
                            <p className="text-blue-400 font-bold uppercase tracking-widest text-xs animate-pulse">Rendering Design...</p>
                        </div>
                    </div>
                )}
                <iframe
                    srcDoc={html}
                    title="Project Preview"
                    sandbox="allow-same-origin"
                    className={`w-full h-full border-0 bg-white transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={handleLoad}
                    style={{ colorScheme: 'light' }}
                />
            </div>

            <div className="px-4 py-2 bg-[#050510] border-t border-white/5 flex items-center justify-center gap-6">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                    <Monitor className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[10px] uppercase font-black text-blue-400 tracking-widest">Desktop View</span>
                </div>
                <div className="h-4 w-px bg-white/5" />
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Static HTML/CSS Render</p>
            </div>
        </div>
    );
}
