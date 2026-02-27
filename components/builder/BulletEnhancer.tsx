'use client';
import { useState } from 'react';
import { Wand2, Loader2, AlertCircle } from 'lucide-react';

interface Props {
    bullet: string;
    onEnhanced: (newBullet: string) => void;
    faangMode?: boolean;
}

export function BulletEnhancer({ bullet, onEnhanced, faangMode = false }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const enhance = async () => {
        if (!bullet.trim()) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/resume/enhance-bullet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bulletText: bullet, faangMode })
            });
            const data = await res.json();
            if (data.success && data.optimizedBullet) {
                onEnhanced(data.optimizedBullet);
            } else {
                setError(data.error || 'Failed to enhance');
            }
        } catch {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={enhance}
                disabled={loading || !bullet.trim()}
                title="Enhance with AI"
                className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-md transition-all disabled:opacity-50"
            >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
            </button>
            {error && <span className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</span>}
        </div>
    );
}
