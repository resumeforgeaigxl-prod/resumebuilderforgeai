"use client";

import React from 'react';
import { Folder, FileCode, ChevronRight, ChevronDown } from 'lucide-react';

interface FileTreeProps {
    files: Array<{ path: string; code: string }>;
    onFileSelect: (path: string) => void;
    activeFile?: string;
}

interface Node {
    name: string;
    path: string;
    children?: Record<string, Node>;
    isFolder: boolean;
}

interface FileTreeNodeProps {
    node: Node;
    depth: number;
    onFileSelect: (path: string) => void;
    activeFile?: string;
}

function FileTreeNode({ node, depth, onFileSelect, activeFile }: FileTreeNodeProps) {
    const [isOpen, setIsOpen] = React.useState(true);

    if (node.isFolder) {
        return (
            <div key={node.path} className="select-none">
                <div
                    className="flex items-center gap-2 px-4 py-2 hover:bg-[#171717]/5 cursor-pointer text-[#4D4D4D] group transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                    style={{ paddingLeft: `${depth * 1.5 + 1}rem` }}
                >
                    {isOpen ? <ChevronDown className="w-4 h-4 text-[#8F8F8F]" /> : <ChevronRight className="w-4 h-4 text-[#8F8F8F]" />}
                    <Folder className="w-4 h-4 text-[#0070F3]" />
                    <span className="text-sm font-medium text-[#171717]">{node.name}</span>
                </div>
                {isOpen && node.children && (
                    <div>
                        {Object.values(node.children).map(child => (
                            <FileTreeNode
                                key={child.path}
                                node={child}
                                depth={depth + 1}
                                onFileSelect={onFileSelect}
                                activeFile={activeFile}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    const isActive = activeFile === node.path;

    return (
        <div
            key={node.path}
            className={`flex items-center gap-2 px-4 py-2 hover:bg-[#171717]/5 cursor-pointer group transition-all ${isActive ? 'bg-blue-50 text-[#0070F3] border-r-2 border-[#0070F3]' : 'text-[#4D4D4D]'}`}
            onClick={() => onFileSelect(node.path)}
            style={{ paddingLeft: `${depth * 1.5 + 1}rem` }}
        >
            <div className="w-4" /> {/* Spacer instead of chevron */}
            <FileCode className={`w-4 h-4 ${isActive ? 'text-[#0070F3]' : 'text-[#8F8F8F] group-hover:text-[#171717]'}`} />
            <span className="text-sm font-medium text-[#171717]">{node.name}</span>
        </div>
    );
}

export default function FileTree({ files, onFileSelect, activeFile }: FileTreeProps) {
    const root: Node = { name: 'root', path: '', children: {}, isFolder: true };

    // Build the tree
    files.forEach(file => {
        const parts = file.path.split('/');
        let current = root;
        let currentPath = '';

        parts.forEach((part, index) => {
            currentPath = currentPath ? `${currentPath}/${part}` : part;
            const isLast = index === parts.length - 1;

            if (!current.children) current.children = {};

            if (!current.children[part]) {
                current.children[part] = {
                    name: part,
                    path: currentPath,
                    isFolder: !isLast,
                    children: isLast ? undefined : {}
                };
            }
            current = current.children[part];
        });
    });

    return (
        <div className="py-4 h-full overflow-y-auto border-r border-[#EBEBEB] bg-[#FFFFFF]">
            <div className="px-4 mb-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8F8F8F] font-mono">Explorer</h3>
            </div>
            {root.children && Object.values(root.children).map(child => (
                <FileTreeNode
                    key={child.path}
                    node={child}
                    depth={0}
                    onFileSelect={onFileSelect}
                    activeFile={activeFile}
                />
            ))}
        </div>
    );
}
