'use client';
import { useState, useEffect } from 'react';
import { Loader2, History, RotateCcw } from 'lucide-react';

interface Version {
    id: string;
    version_number: number;
    created_at: string;
}

interface Props {
    resumeId: string;
    onRestore: (data: any) => void;
}

export function VersionHistory({ resumeId, onRestore }: Props) {
    const [versions, setVersions] = useState<Version[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [restoringId, setRestoringId] = useState<string | null>(null);

    const fetchVersions = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/resume/${resumeId}/versions`);
            const data = await res.json();
            if (data.success) {
                setVersions(data.versions);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) fetchVersions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const restoreVersion = async (versionId: string) => {
        setRestoringId(versionId);
        try {
            const res = await fetch(`/api/resume/${resumeId}/versions/${versionId}`);
            const data = await res.json();
            if (data.success && data.version?.data) {
                onRestore(data.version.data);
                setOpen(false); // close panel after successful restore
            } else {
                alert('Failed to load version data.');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setRestoringId(null);
        }
    };

    return (
        <div className="mb-6">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
                <History className="w-4 h-4" /> Version History
            </button>

            {open && (
                <div className="mt-3 p-4 bg-black/20 border border-white/5 rounded-xl space-y-3">
                    {loading ? (
                        <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-slate-500" /></div>
                    ) : versions.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-2">No previous versions saved yet. Versions are auto-saved occasionally.</p>
                    ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {versions.map(v => (
                                <div key={v.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10">
                                    <div>
                                        <p className="text-sm font-bold text-slate-300">Version {v.version_number}</p>
                                        <p className="text-xs text-slate-500">{new Date(v.created_at).toLocaleString()}</p>
                                    </div>
                                    <button
                                        onClick={() => restoreVersion(v.id)}
                                        disabled={restoringId === v.id}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-medium rounded-md transition-colors disabled:opacity-50"
                                    >
                                        {restoringId === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                                        Restore
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
