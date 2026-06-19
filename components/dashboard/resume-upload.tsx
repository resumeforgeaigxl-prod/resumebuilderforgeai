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
                className={`relative group cursor-pointer rounded-xl border-2 border-dashed transition-all p-8 text-center
                    ${isDragActive ? 'border-[#0070F3] bg-[#0070F3]/5' : 'border-[#EBEBEB] hover:border-[#171717]/25 bg-white'}
                    ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
            >
                <input {...getInputProps()} />

                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all border
                        ${isDragActive ? 'bg-[#0070F3] text-white scale-110 border-[#0070F3]' : 'bg-[#FAFAFA] border-[#EBEBEB] text-[#4D4D4D] group-hover:border-[#171717] group-hover:text-[#171717]'}`}>
                        {isUploading ? (
                            <Loader2 className="w-8 h-8 animate-spin" />
                        ) : (
                            <Upload className="w-8 h-8" />
                        )}
                    </div>

                    <div className="space-y-1">
                        <p className="text-lg font-semibold text-[#171717]">
                            {isUploading ? 'Parsing Resume...' : 'Upload Existing Resume'}
                        </p>
                        <p className="text-sm text-[#4D4D4D]">
                            Drag and drop your PDF or DOCX file here, or click to browse
                        </p>
                        <p className="text-xs text-[#8F8F8F]">
                            Max size: 5MB (PDF or DOCX)
                        </p>
                    </div>
                </div>

                {isUploading && (
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-[#FAFAFA] border-t border-[#EBEBEB] overflow-hidden rounded-b-xl">
                        <div
                            className="h-full bg-[#0070F3] transition-all duration-300 ease-out"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
