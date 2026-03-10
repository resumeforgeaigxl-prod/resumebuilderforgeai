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
                    className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 cursor-pointer text-slate-400 group"
                    onClick={() => setIsOpen(!isOpen)}
                    style={{ paddingLeft: `${depth * 1.5 + 1}rem` }}
                >
                    {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    <Folder className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                    <span className="text-sm font-medium">{node.name}</span>
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
            className={`flex items-center gap-2 px-4 py-2 hover:bg-white/5 cursor-pointer group ${isActive ? 'bg-blue-500/10 text-blue-400 border-r-2 border-blue-500' : 'text-slate-400'}`}
            onClick={() => onFileSelect(node.path)}
            style={{ paddingLeft: `${depth * 1.5 + 1}rem` }}
        >
            <div className="w-4" /> {/* Spacer instead of chevron */}
            <FileCode className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
            <span className="text-sm font-medium">{node.name}</span>
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
        <div className="py-4 h-full overflow-y-auto border-r border-white/5 bg-[#0a0a15]">
            <div className="px-4 mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Explorer</h3>
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

