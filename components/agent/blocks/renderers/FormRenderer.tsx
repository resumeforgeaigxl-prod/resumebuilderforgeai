'use client';

import React, { useState } from 'react';
import type { FormBlock, QuestionBlock, HandoffBlock } from '../types';
import { Button } from '@/components/ui/Button';
import { Check, HelpCircle, ShieldAlert, ArrowRight } from '@/components/icons';
import { cn } from '@/lib/utils';

interface FormRendererProps {
  block: FormBlock | QuestionBlock | HandoffBlock;
  onSubmit?: (values: Record<string, any>) => void;
}

export function FormRenderer({ block, onSubmit }: FormRendererProps) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);

  // Normalize block
  const isHandoff = block.type === 'handoff';
  const isQuestion = block.type === 'question';
  const title = (block as any).title || (block as any).prompt || 'Input Required';
  const description = (block as any).description || (block as any).reason || '';

  // Extract fields
  const fields = (block as any).fields || [
    {
      id: (block as any).questionKey || (block as any).id || 'answer',
      label: (block as any).prompt || 'Select an option',
      type: 'radio',
      options: (block as any).options || [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
      ],
      required: true,
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (onSubmit) {
      onSubmit(values);
    }
  };

  if (submitted) {
    return (
      <div className="my-2.5 rounded-xl border border-emerald-800/40 bg-emerald-950/40 p-3.5 flex items-center gap-2.5 text-xs text-emerald-400 font-medium animate-in fade-in">
        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Your response has been saved. Continuing with application...</span>
      </div>
    );
  }

  return (
    <div className={cn(
      "my-3 w-full rounded-xl border p-4.5 space-y-3.5 shadow-xs transition-all",
      isHandoff
        ? "border-amber-800/40 bg-amber-950/20 text-[#F5F5F5]"
        : "border-[#242424] bg-[#0A0A0A] text-[#F5F5F5]"
    )}>
      {/* Header */}
      <div className="flex items-start gap-2.5">
        <div className={cn(
          "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
          isHandoff ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-[#151515] text-[#8B5CF6] border border-[#242424]"
        )}>
          {isHandoff ? <ShieldAlert className="w-4 h-4" /> : <HelpCircle className="w-4 h-4" />}
        </div>
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-[#F5F5F5]">{title}</h4>
          {description && (
            <p className="text-[11px] text-[#BDBDBD] leading-relaxed">{description}</p>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-3 pt-1">
        {fields.map((field: any, idx: number) => {
          const fieldId = field.id || `field_${idx}`;
          const currentVal = values[fieldId];

          return (
            <div key={idx} className="space-y-1.5 text-xs">
              {field.label && field.type !== 'radio' && (
                <label className="block text-xs font-medium text-[#F5F5F5]">
                  {field.label} {field.required && <span className="text-rose-400">*</span>}
                </label>
              )}

              {/* Radio Group */}
              {field.type === 'radio' && (
                <div className="space-y-1.5">
                  {(field.options || []).map((opt: any, oIdx: number) => {
                    const isSelected = currentVal === opt.value;
                    return (
                      <label
                        key={oIdx}
                        className={cn(
                          "flex items-center gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition-all select-none",
                          isSelected
                            ? "border-[#8B5CF6] bg-[#151515] font-medium text-[#F5F5F5]"
                            : "border-[#242424] hover:border-[#2D2D2D] bg-[#151515] text-[#BDBDBD]"
                        )}
                      >
                        <input
                          type="radio"
                          name={fieldId}
                          value={opt.value}
                          checked={isSelected}
                          onChange={() => setValues(prev => ({ ...prev, [fieldId]: opt.value }))}
                          className="w-3.5 h-3.5 accent-[#8B5CF6]"
                        />
                        <span>{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Text Input */}
              {field.type === 'text' && (
                <input
                  type="text"
                  placeholder={field.placeholder || 'Type your answer...'}
                  value={currentVal || ''}
                  onChange={(e) => setValues(prev => ({ ...prev, [fieldId]: e.target.value }))}
                  required={field.required}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#242424] bg-[#151515] focus:outline-hidden focus:border-[#8B5CF6]/50 text-[#F5F5F5] placeholder:text-[#565656]"
                />
              )}

              {/* Textarea */}
              {field.type === 'textarea' && (
                <textarea
                  rows={3}
                  placeholder={field.placeholder || 'Type your response...'}
                  value={currentVal || ''}
                  onChange={(e) => setValues(prev => ({ ...prev, [fieldId]: e.target.value }))}
                  required={field.required}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#242424] bg-[#151515] focus:outline-hidden focus:border-[#8B5CF6]/50 text-[#F5F5F5] placeholder:text-[#565656]"
                />
              )}

              {/* Select */}
              {field.type === 'select' && (
                <select
                  value={currentVal || ''}
                  onChange={(e) => setValues(prev => ({ ...prev, [fieldId]: e.target.value }))}
                  required={field.required}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#242424] bg-[#151515] focus:outline-hidden focus:border-[#8B5CF6]/50 text-[#F5F5F5]"
                >
                  <option value="">Select an option...</option>
                  {(field.options || []).map((opt: any, oIdx: number) => (
                    <option key={oIdx} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              )}
            </div>
          );
        })}

        <div className="pt-2">
          <Button
            type="submit"
            size="sm"
            className="h-8 text-xs bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg gap-1.5 font-medium cursor-pointer"
          >
            <span>{(block as any).submitLabel || (block as any).actionLabel || 'Continue'}</span>
            <ArrowRight className="w-3 h-3 text-white" />
          </Button>
        </div>
      </form>
    </div>
  );
}
