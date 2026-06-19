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
        <div className="h-full flex flex-col bg-[#FAFAFA] border-l border-[#EBEBEB] overflow-hidden">
            {/* Toolbar */}
            <div className="px-5 py-3 border-b border-[#EBEBEB] bg-[#FFFFFF] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-blue-50 border border-blue-100 rounded-md">
                        <Layout className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-[#171717] tracking-wide">Live Preview</h3>
                        <p className="text-[10px] text-[#8F8F8F] font-medium uppercase tracking-tighter">React-Based Rendering</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* View Switch */}
                    <div className="flex items-center bg-[#FAFAFA] p-1 rounded-lg border border-[#EBEBEB]">
                        <button 
                            onClick={() => setViewMode('desktop')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'desktop' ? 'bg-[#FFFFFF] text-[#171717] shadow-sm border border-[#EBEBEB]' : 'text-[#8F8F8F] hover:text-[#171717] border border-transparent'}`}
                        >
                            <Monitor className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setViewMode('mobile')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'mobile' ? 'bg-[#FFFFFF] text-[#171717] shadow-sm border border-[#EBEBEB]' : 'text-[#8F8F8F] hover:text-[#171717] border border-transparent'}`}
                        >
                            <Phone className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="h-6 w-px bg-[#EBEBEB]" />

                    {/* Zoom Controls */}
                    <div className="flex items-center gap-3 px-3 py-1.5 bg-[#FAFAFA] rounded-lg border border-[#EBEBEB]">
                        <button onClick={() => setZoom(Math.max(0.4, zoom - 0.1))} className="text-[#8F8F8F] hover:text-[#171717] transition-colors">
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className="text-[10px] font-black text-[#8F8F8F] w-10 text-center">{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(Math.min(1.5, zoom + 0.1))} className="text-[#8F8F8F] hover:text-[#171717] transition-colors">
                            <ZoomIn className="w-4 h-4" />
                        </button>
                    </div>

                    <button onClick={handleRefresh} className={`p-2 hover:bg-[#FAFAFA] rounded-md transition-all ${isRefreshing ? 'animate-spin text-blue-600' : 'text-[#8F8F8F] hover:text-[#171717]'}`}>
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 overflow-auto bg-[#F2F2F2] relative custom-scrollbar">
                {isRefreshing && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#FFFFFF]/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="flex flex-col items-center gap-2">
                            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                            <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Updating Template</p>
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
            <div className="px-5 py-4 bg-[#FFFFFF] border-t border-[#EBEBEB] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-[#8F8F8F] uppercase tracking-widest">Live Syncing</span>
                </div>
                {onDownload && (
                    <button 
                        onClick={onDownload}
                        disabled={isDownloading}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md transition-all disabled:opacity-50 shadow-sm"
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
                    background: rgba(0, 0, 0, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 0, 0, 0.1);
                }
            `}</style>
        </div>
    );
};
