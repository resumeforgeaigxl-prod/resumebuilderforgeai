import { Loader2 } from 'lucide-react';

export default function BuilderLoading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#070710]">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
            <p className="text-slate-400 font-medium">Loading your resume...</p>
        </div>
    );
}
