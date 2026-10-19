'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import {
  FolderTree,
  Code,
  Layers,
  ChevronRight,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Cpu,
  FileCode
} from '@/components/icons';
import { cn } from '@/lib/utils';

export interface ProjectFile {
  path: string;
  code: string;
}

export interface ProjectArtifact {
  success?: boolean;
  tool?: 'generate_project_blueprint' | string;
  projectName?: string;
  techStack?: string[];
  folderStructure?: string;
  filesCount?: number;
  files?: ProjectFile[];
  explanation?: string;
}

interface ProjectArtifactCardProps {
  artifact: ProjectArtifact;
  locale: string;
  onInspectFile?: (file: ProjectFile) => void;
}

export function ProjectArtifactCard({
  artifact,
  locale,
  onInspectFile
}: ProjectArtifactCardProps) {
  const router = useRouter();
  const [activeFileIdx, setActiveFileIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const projectName = artifact.projectName || 'Full-Stack Portfolio Project';
  const techStack = artifact.techStack || ['Next.js', 'TypeScript', 'Tailwind CSS'];
  const files = artifact.files || [];
  const currentFile = files[activeFileIdx];

  const handleCopyCode = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3.5 w-full rounded-xl border border-[#242424] bg-[#0A0A0A] p-5 shadow-sm space-y-4 hover:border-[#303030] transition-all text-[#F5F5F5]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-[#242424] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#151515] border border-[#242424] flex items-center justify-center shrink-0 shadow-xs">
            <Cpu className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-[#F5F5F5] tracking-tight">
                {projectName}
              </h4>
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border text-emerald-400 bg-emerald-950/40 border-emerald-800/40">
                Production Blueprint
              </span>
              <span className="text-[10px] font-mono text-[#BDBDBD] bg-[#121212] border border-[#242424] px-2 py-0.5 rounded-md">
                {files.length} Starter Files
              </span>
            </div>
            <p className="text-xs text-[#7E7E7E] mt-0.5 font-mono">
              Proof of Work • Production Grade Architecture
            </p>
          </div>
        </div>
      </div>

      {/* Tech Stack Chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        {techStack.map((tech, idx) => (
          <span
            key={idx}
            className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-lg bg-[#121212] border border-[#242424] text-[#F5F5F5] shadow-xs"
          >
            #{tech}
          </span>
        ))}
      </div>

      {/* Overview Explanation */}
      {artifact.explanation && (
        <p className="text-xs text-[#BDBDBD] leading-relaxed bg-[#121212] border border-[#242424] p-3 rounded-lg font-sans">
          {artifact.explanation}
        </p>
      )}

      {/* Files Tab & Code Viewer */}
      {files.length > 0 && (
        <div className="rounded-lg border border-[#242424] overflow-hidden bg-[#050505] text-white">
          {/* File selector bar */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#121212] border-b border-[#242424] overflow-x-auto text-xs font-mono">
            <div className="flex items-center gap-1">
              {files.map((file, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveFileIdx(idx)}
                  className={cn(
                    'px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1.5 cursor-pointer',
                    activeFileIdx === idx
                      ? 'bg-[#1E1E1E] text-white font-medium border border-[#2E2E2E]'
                      : 'text-[#7E7E7E] hover:text-white'
                  )}
                >
                  <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{file.path.split('/').pop() || file.path}</span>
                </button>
              ))}
            </div>

            {currentFile && (
              <button
                onClick={() => handleCopyCode(currentFile.code)}
                className="flex items-center gap-1 text-[11px] text-[#7E7E7E] hover:text-white px-2 py-1 rounded hover:bg-[#1E1E1E] transition-colors shrink-0 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Code Snippet */}
          {currentFile && (
            <pre className="p-4 text-xs font-mono leading-relaxed text-[#D4D4D4] max-h-56 overflow-y-auto custom-scrollbar">
              <code>{currentFile.code.slice(0, 1000)}{currentFile.code.length > 1000 ? '\n// ... truncated for preview' : ''}</code>
            </pre>
          )}
        </div>
      )}

      {/* Footer Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[#242424]">
        <Button
          onClick={() => router.push(`/${locale}/projectforge`)}
          size="sm"
          className="min-h-[44px] h-auto py-2.5 rounded-lg bg-[#1A1A1A] hover:bg-[#222222] text-[#F5F5F5] border border-[#2E2E2E] text-xs font-medium px-3 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <FolderTree className="w-3.5 h-3.5 text-[#7E7E7E]" />
          Build Project in Studio
        </Button>

        <span className="text-[10px] font-mono text-[#7E7E7E]">
          Ready to export to GitHub or add to your resume
        </span>
      </div>
    </div>
  );
}
