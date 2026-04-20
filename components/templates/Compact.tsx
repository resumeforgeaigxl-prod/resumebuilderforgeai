import React from 'react';
import { TemplateProps } from './Classic';
import { Section, EntryHeader } from './base';

export const Compact: React.FC<TemplateProps> = ({ data, theme }) => {
  const fontClass = theme.fontFamily === 'Inter' ? 'font-inter' : 'font-sans';
  
  return (
    <div 
      className={`bg-white w-[210mm] min-h-[297mm] p-8 mx-auto ${fontClass} text-black antialiased`}
      style={{ lineHeight: '1.25' }}
    >
      <header className="border-b-2 border-black pb-2 mb-4">
        <h1 className="text-[20px] font-black uppercase text-center">{data.name}</h1>
        <div className="flex justify-center flex-wrap gap-x-3 text-[10px] mt-1">
          <span>{data.email}</span> • <span>{data.phone}</span> • <span>{data.location}</span>
        </div>
      </header>

      <div className="space-y-3">
        <Section title="Summary">
          <p className="text-[10px]">{data.summary}</p>
        </Section>

        <Section title="Skills">
           <div className="text-[10px] grid grid-cols-2 gap-x-4">
            <div><span className="font-bold">Langs:</span> {data.skills.languages.join(', ')}</div>
            <div><span className="font-bold">Frameworks:</span> {data.skills.frameworks.join(', ')}</div>
            <div><span className="font-bold">Tools:</span> {data.skills.tools.join(', ')}</div>
            <div><span className="font-bold">Other:</span> {data.skills.other.join(', ')}</div>
          </div>
        </Section>

        <Section title="Experience">
          {data.experience.map(exp => (
            <div key={exp.id} className="mb-2 last:mb-0">
               <EntryHeader 
                title={exp.role} 
                subtitle={exp.company} 
                rightText={exp.duration} 
              />
              <ul className="list-disc ml-4 text-[10px]">
                {exp.points.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          ))}
        </Section>

        <Section title="Projects">
          {data.projects.map(p => (
            <div key={p.id} className="mb-1">
              <EntryHeader title={p.name} subtitle={p.tech.join(', ')} rightText={p.link} />
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
