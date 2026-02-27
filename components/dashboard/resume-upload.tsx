'use client';

import { useState, useCallback } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

import { ResumeData } from '@/types/resume';

interface ResumeUploadProps {
    onUploadSuccess: (data: ResumeData) => void;
    onUploadError: (error: string) => void;
}

export function ResumeUpload({ onUploadSuccess, onUploadError }: ResumeUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        // Validation
        if (file.size > 5 * 1024 * 1024) {
            onUploadError('File size exceeds 5MB limit.');
            return;
        }

        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (!allowedTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
            onUploadError('Unsupported file type. Please upload PDF or DOCX.');
            return;
        }

        setIsUploading(true);
        setUploadProgress(10);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('returnJson', 'true'); // Flag to return JSON instead of saving

            const response = await fetch('/api/resume/parse', {
                method: 'POST',
                body: formData,
            });

            setUploadProgress(80);
            const result = await response.json();

            if (response.ok && result.success) {
                onUploadSuccess(result.data);
                setUploadProgress(100);
            } else {
                onUploadError(result.error || 'Failed to parse resume.');
            }
        } catch (error) {
            console.error('Upload error:', error);
            onUploadError('An error occurred during upload.');
        } finally {
            setIsUploading(false);
            setTimeout(() => setUploadProgress(0), 1000);
        }
    }, [onUploadSuccess, onUploadError]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        multiple: false,
        disabled: isUploading
    });

    return (
        <div className="mb-8">
            <div
                {...getRootProps()}
                className={`relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all p-8 text-center
                    ${isDragActive ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 hover:border-white/20 bg-white/5'}
                    ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
            >
                <input {...getInputProps()} />

                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all
                        ${isDragActive ? 'bg-blue-500 text-white scale-110' : 'bg-white/5 text-slate-400 group-hover:bg-white/10'}`}>
                        {isUploading ? (
                            <Loader2 className="w-8 h-8 animate-spin" />
                        ) : (
                            <Upload className="w-8 h-8" />
                        )}
                    </div>

                    <div className="space-y-1">
                        <p className="text-lg font-semibold text-white">
                            {isUploading ? 'Parsing Resume...' : 'Upload Existing Resume'}
                        </p>
                        <p className="text-sm text-slate-400">
                            Drag and drop your PDF or DOCX file here, or click to browse
                        </p>
                        <p className="text-xs text-slate-500">
                            Max size: 5MB (PDF or DOCX)
                        </p>
                    </div>
                </div>

                {isUploading && (
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-white/5 overflow-hidden rounded-b-2xl">
                        <div
                            className="h-full bg-blue-500 transition-all duration-300 ease-out"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
