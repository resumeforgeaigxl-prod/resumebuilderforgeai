'use client';

import React, { useState } from 'react';
import { ALL_TEMPLATES } from '@/types/templates';
import { Search } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

interface TemplatesCatalogViewProps {
    activeResumeId?: string;
    locale: string;
}

export function TemplatesCatalogView({ activeResumeId, locale }: TemplatesCatalogViewProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBadge, setSelectedBadge] = useState<string>('All');
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('harvard');

    // Extract unique badges for filter
    const badges = ['All', ...Array.from(new Set(ALL_TEMPLATES.map(t => t.badge).filter(Boolean)))];

    const filteredTemplates = ALL_TEMPLATES.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.desc.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesBadge = selectedBadge === 'All' || t.badge === selectedBadge;
        return matchesSearch && matchesBadge;
    });

    const handleApplyTemplate = (templateId: string) => {
        setSelectedTemplateId(templateId);
        if (activeResumeId) {
            router.push(`/${locale}/builder/${activeResumeId}?template=${templateId}`);
        } else {
            router.push(`/${locale}/builder/new?template=${templateId}`);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in text-[#F5F5F5]">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div className="flex items-end gap-3">
                    <img src="/rail/rail-resume.png?v=ice" alt="" width={40} height={40} className="h-10 w-10 object-contain" />
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#8b909a]">Templates</p>
                        <h2 className="mt-1 text-[28px] font-normal leading-none text-[#f4f5f7]" style={{ fontFamily: 'var(--font-display)' }}>Choose a layout</h2>
                        <p className="mt-2 text-sm text-[#8b909a]">Layouts that stay readable to hiring systems.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm text-[#8b909a]">
                        {ALL_TEMPLATES.length} layouts
                    </span>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-[#7E7E7E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search templates..."
                        className="w-full rounded-xl border border-[#2a2c33] bg-[#0c0d10] py-2.5 pl-10 pr-4 text-sm text-[#f4f5f7] placeholder:text-[#8b909a] focus:border-[#3a3d46] focus:outline-none"
                    />
                </div>

                {/* Badges pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
                    {badges.map(badge => (
                        <button
                            key={badge}
                            onClick={() => setSelectedBadge(badge)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                                selectedBadge === badge
                                    ? 'border border-[#f4f5f7] bg-[#16171b] text-[#f4f5f7]'
                                    : 'border border-[#2a2c33] bg-[#0c0d10] text-[#8b909a] hover:text-[#f4f5f7]'
                            }`}
                        >
                            {badge}
                        </button>
                    ))}
                </div>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTemplates.map((template) => {
                    const isSelected = selectedTemplateId === template.id;
                    return (
                        <div
                            key={template.id}
                            className={`flex flex-col justify-between overflow-hidden rounded-2xl border bg-[#0c0d10] transition-all ${
                                isSelected ? 'border-[#d7e4f0]' : 'border-[#2a2c33] hover:border-[#3a3d46]'
                            }`}
                        >
                            {/* Visual Preview Miniature */}
                            <div className="p-4 bg-[#151515] border-b border-[#242424] h-48 flex flex-col justify-between relative overflow-hidden">
                                <div className="flex justify-between items-start">
                                    <span className="rounded-full border border-[#2a2c33] px-2 py-0.5 text-[10px] text-[#8b909a]">
                                        {template.id}
                                    </span>
                                    {template.badge && (
                                        <span className="text-[10px] font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                                            {template.badge}
                                        </span>
                                    )}
                                </div>

                                {/* Abstract Document Layout Wireframe */}
                                <div className="w-full bg-[#101010] border border-[#242424] rounded p-2.5 shadow-2xs space-y-2 select-none pointer-events-none opacity-85">
                                    <div className="w-1/2 h-2 bg-[#F5F5F5] rounded-xs" />
                                    <div className="w-1/3 h-1 bg-[#7E7E7E]/40 rounded-xs" />
                                    <div className="border-t border-[#242424] pt-1.5 space-y-1">
                                        <div className="w-full h-1 bg-[#7E7E7E]/30 rounded-xs" />
                                        <div className="w-5/6 h-1 bg-[#7E7E7E]/30 rounded-xs" />
                                        <div className="w-3/4 h-1 bg-[#7E7E7E]/30 rounded-xs" />
                                    </div>
                                    <div className="border-t border-[#242424] pt-1 space-y-1">
                                        <div className="w-4/6 h-1 bg-[#7E7E7E]/30 rounded-xs" />
                                        <div className="w-2/3 h-1 bg-[#7E7E7E]/30 rounded-xs" />
                                    </div>
                                </div>

                                <div className="text-[11px] text-[#8b909a]">
                                    Readable layout
                                </div>
                            </div>

                            {/* Info & Action */}
                            <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                                <div>
                                    <h4 className="text-base font-normal text-[#f4f5f7]" style={{ fontFamily: 'var(--font-display)' }}>
                                        {template.name}
                                    </h4>
                                    <p className="mt-1 text-sm leading-6 text-[#8b909a]">
                                        {template.desc}
                                    </p>
                                </div>

                                <div className="pt-2">
                                    <Button
                                        onClick={() => handleApplyTemplate(template.id)}
                                        variant={isSelected ? 'default' : 'outline'}
                                        className={`h-9 w-full cursor-pointer rounded-full text-xs font-medium ${
                                            isSelected
                                                ? 'bg-[#f4f5f7] text-[#0c0d10] hover:bg-white'
                                                : 'border border-[#2a2c33] bg-transparent text-[#f4f5f7] hover:bg-[#16171b]'
                                        }`}
                                    >
                                        {isSelected ? 'Using this layout' : 'Use this layout'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
