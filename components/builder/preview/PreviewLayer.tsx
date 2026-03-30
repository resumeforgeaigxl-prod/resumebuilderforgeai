import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Monitor, Phone, Download, Layout, RefreshCw } from 'lucide-react';
import { ResumeData } from '@/types/resume';
import { ResumePreview } from './ResumePreview';

interface Props {
    resumeData: ResumeData;
    templateId: string;
    isWatermarked?: boolean;
    onDownload?: () => void;
    isDownloading?: boolean;
}

export const PreviewLayer: React.FC<Props> = ({ 
    resumeData, 
    templateId, 
    isWatermarked,
    onDownload,
    isDownloading 
}) => {
    const [zoom, setZoom] = useState(0.85);
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 800);
    };

    return (
        <div className="h-full flex flex-col bg-[#0d0d1a] border-l border-white/5 overflow-hidden">
            {/* Toolbar */}
            <div className="px-5 py-3 border-b border-white/5 bg-[#0a0a15] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-blue-500/10 rounded-lg">
                        <Layout className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white tracking-wide">Live Preview</h3>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">React-Based Rendering</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* View Switch */}
                    <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/5">
                        <button 
                            onClick={() => setViewMode('desktop')}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === 'desktop' ? 'bg-blue-600/20 text-blue-400 shadow-lg shadow-blue-600/10' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Monitor className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setViewMode('mobile')}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === 'mobile' ? 'bg-blue-600/20 text-blue-400 shadow-lg shadow-blue-600/10' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Phone className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="h-6 w-px bg-white/5" />

                    {/* Zoom Controls */}
                    <div className="flex items-center gap-3 px-3 py-1.5 bg-black/20 rounded-xl border border-white/5">
                        <button onClick={() => setZoom(Math.max(0.4, zoom - 0.1))} className="text-slate-400 hover:text-white transition-colors">
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className="text-[10px] font-black text-slate-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(Math.min(1.5, zoom + 0.1))} className="text-slate-400 hover:text-white transition-colors">
                            <ZoomIn className="w-4 h-4" />
                        </button>
                    </div>

                    <button onClick={handleRefresh} className={`p-2 hover:bg-white/5 rounded-xl transition-all ${isRefreshing ? 'animate-spin text-blue-400' : 'text-slate-500'}`}>
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 overflow-auto bg-[#070710] relative custom-scrollbar">
                {isRefreshing && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="flex flex-col items-center gap-2">
                            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                            <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Updating Template</p>
                        </div>
                    </div>
                )}

                <div 
                    className="flex justify-center py-10 transition-all duration-500 ease-out"
                    style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
                >
                    <div className={`transition-all duration-700 ${viewMode === 'mobile' ? 'max-w-[360px]' : ''}`}>
                        <ResumePreview 
                            resumeData={resumeData} 
                            templateId={templateId} 
                            isWatermarked={isWatermarked} 
                        />
                    </div>
                </div>
            </div>

            {/* Footer / Info */}
            <div className="px-5 py-4 bg-[#0a0a15] border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Syncing</span>
                </div>
                {onDownload && (
                    <button 
                        onClick={onDownload}
                        disabled={isDownloading}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-emerald-600/20"
                    >
                        {isDownloading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                        Download PDF
                    </button>
                )}
            </div>
            
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
};
