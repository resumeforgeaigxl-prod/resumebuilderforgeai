import React from 'react';
import { TemplateProps } from './Classic';
import { Section, BulletList, EntryHeader } from './base';

export const ModernHeader: React.FC<TemplateProps> = ({ data, theme }) => {
  const fontClass = theme.fontFamily === 'Inter' ? 'font-inter' : 'font-sans';
  
  return (
    <div className={`bg-white w-[210mm] min-h-[297mm] p-10 mx-auto ${fontClass} text-black`}>
      <header className="flex justify-between items-start mb-10 border-b-4 border-black pb-4">
        <div>
          <h1 className="text-[28px] font-black leading-none">{data.name}</h1>
          <p className="text-[12px] font-bold mt-1 uppercase tracking-widest">{data.experience[0]?.role || 'Professional'}</p>
        </div>
        <div className="text-right text-[10px] space-y-0.5">
          <div>{data.email}</div>
          <div>{data.phone}</div>
          <div>{data.location}</div>
          <div>{data.linkedin}</div>
        </div>
      </header>

      <div className="space-y-6">
        <Section title="Profile">
          <p className="text-[11px] leading-relaxed">{data.summary}</p>
        </Section>

        <Section title="Expertise">
          <div className="grid grid-cols-2 gap-4 text-[11px]">
            <div><span className="font-bold">Languages & Tools:</span> {data.skills.languages.concat(data.skills.tools).join(', ')}</div>
            <div><span className="font-bold">Frameworks:</span> {data.skills.frameworks.join(', ')}</div>
          </div>
        </Section>

        <Section title="Career Path">
          {data.experience.map(exp => (
            <div key={exp.id} className="mb-4">
              <EntryHeader title={exp.role} subtitle={exp.company} rightText={exp.duration} />
              <BulletList items={exp.points} />
            </div>
          ))}
        </Section>

        <Section title="Education">
          {data.education.map(edu => (
            <EntryHeader key={edu.id} title={edu.institution} subtitle={edu.degree} rightText={edu.year} />
          ))}
        </Section>
      </div>
    </div>
  );
};
