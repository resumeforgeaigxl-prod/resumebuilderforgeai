import React from 'react';
import { ResumeData } from '@/types/resume';
import { ATSTemplates, TemplateComponentMap } from './TemplateRegistry';

interface Props {
  data: ResumeData;
  templateId: string;
  mode?: 'preview' | 'print';
  scale?: number;
}

export const ATSTemplateRenderer: React.FC<Props> = ({ data, templateId, mode = 'print', scale = 1 }) => {
  const variant = ATSTemplates.find(t => t.id === templateId) || ATSTemplates[0];
  const Component = TemplateComponentMap[variant.base];

  if (!data) return null;

  return (
    <div 
      className={`relative overflow-hidden ${mode === 'preview' ? 'shadow-2xl origin-top' : ''}`}
      style={mode === 'preview' ? { transform: `scale(${scale})` } : {}}
    >
      <Component data={data} theme={variant.theme} />
    </div>
  );
};
