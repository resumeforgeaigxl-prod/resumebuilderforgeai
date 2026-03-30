import React from 'react';
import { ResumeData } from '@/types/resume';
import { HarvardPreview } from './HarvardPreview';
import { ConfigurableAtsPreview } from './ConfigurableAtsPreview';
import { ATS_CONFIG_MAP } from '@/templates/configs';

interface Props {
    resumeData: ResumeData;
    templateId: string;
    isWatermarked?: boolean;
}

export const ResumePreview: React.FC<Props> = ({ resumeData, templateId, isWatermarked }) => {
    // Check if it's a configurable template (cfg-*)
    if (templateId.startsWith('cfg-')) {
        const config = ATS_CONFIG_MAP.get(templateId);
        if (config) {
            return <ConfigurableAtsPreview resumeData={resumeData} config={config} isWatermarked={isWatermarked} />;
        }
    }

    // Default to Harvard for legacy templates in this preview
    // In a full implementation, we'd add StanfordPreview, ModernPreview etc.
    // For now, Harvard serves as the high-quality React preview.
    return <HarvardPreview resumeData={resumeData} isWatermarked={isWatermarked} />;
};
