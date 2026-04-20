import React from 'react';
import { ResumeData } from '@/types/resume';
import { ATSTemplateRenderer } from '@/components/templates/ATSTemplateRenderer';

interface Props {
    resumeData: ResumeData;
    templateId: string;
    isWatermarked?: boolean;
    scale?: number;
}

export const ResumePreview: React.FC<Props> = ({ resumeData, templateId, scale = 1 }) => {
    return (
        <div className="flex justify-center bg-gray-100 p-8 min-h-screen overflow-auto">
             <ATSTemplateRenderer 
                data={resumeData} 
                templateId={templateId} 
                mode="preview" 
                scale={scale} 
            />
        </div>
    );
};
