"use client";

import { useEffect, useRef, useCallback } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    ArrowUpIcon,
    Paperclip,
    SendIcon,
    XIcon,
    LoaderIcon,
    Command,
    FileText,
    Code2,
    Mic,
    Briefcase,
    GraduationCap,
    Rocket,
    MessageSquare,
    BrainCircuit,
    Bot
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react";

// ─── Auto-resize textarea hook ───────────────────────────────────────────────

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            textarea.style.height = `${minHeight}px`;
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

// ─── Typing dots animation ──────────────────────────────────────────────────

function TypingDots() {
    return (
        <div className="flex items-center ml-1">
            {[1, 2, 3].map((dot) => (
                <motion.div
                    key={dot}
                    className="w-1.5 h-1.5 bg-[#171717] rounded-full mx-0.5"
                    initial={{ opacity: 0.3 }}
                    animate={{
                        opacity: [0.3, 0.9, 0.3],
                        scale: [0.85, 1.1, 0.85],
                    }}
                    transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: dot * 0.15,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface CommandSuggestion {
    icon: React.ReactNode;
    label: string;
    description: string;
    prefix: string;
}

interface ForgeMode {
    id: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}

interface MentorForgeChatProps {
    value: string;
    onChange: (val: string) => void;
    onSend: (mode?: string) => void;
    isLoading: boolean;
    activeMode: string;
    onModeChange: (mode: string) => void;
    placeholder?: string;
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function MentorForgeChatInput({
    value,
    onChange,
    onSend,
    isLoading,
    activeMode,
    onModeChange,
    placeholder,
}: MentorForgeChatProps) {
    const [attachments, setAttachments] = useState<string[]>([]);
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [activeSuggestion, setActiveSuggestion] = useState<number>(-1);
    const commandPaletteRef = useRef<HTMLDivElement>(null);
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 56,
        maxHeight: 180,
    });

    const MODES: ForgeMode[] = [
        { id: "General", icon: Bot, color: "text-[#171717]" },
        { id: "Career", icon: Rocket, color: "text-[#171717]" },
        { id: "Coding", icon: Code2, color: "text-[#171717]" },
        { id: "Interview", icon: MessageSquare, color: "text-[#171717]" },
        { id: "Learning", icon: GraduationCap, color: "text-[#171717]" },
    ];

    const commandSuggestions: CommandSuggestion[] = [
        {
            icon: <FileText className="w-4 h-4" />,
            label: "Resume Review",
            description: "Analyze and improve your resume",
            prefix: "/resume",
        },
        {
            icon: <Code2 className="w-4 h-4" />,
            label: "Code Challenge",
            description: "Practice a coding problem",
            prefix: "/code",
        },
        {
            icon: <Mic className="w-4 h-4" />,
            label: "Mock Interview",
            description: "Start an interview simulation",
            prefix: "/interview",
        },
        {
            icon: <Briefcase className="w-4 h-4" />,
            label: "Career Plan",
            description: "Build your career roadmap",
            prefix: "/career",
        },
    ];

    // Command palette logic
    useEffect(() => {
        if (value.startsWith("/") && !value.includes(" ")) {
            setShowCommandPalette(true);
            const idx = commandSuggestions.findIndex((cmd) =>
                cmd.prefix.startsWith(value)
            );
            setActiveSuggestion(idx >= 0 ? idx : -1);
        } else {
            setShowCommandPalette(false);
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const btn = document.querySelector("[data-command-button]");
            if (
                commandPaletteRef.current &&
                !commandPaletteRef.current.contains(target) &&
                !btn?.contains(target)
            ) {
                setShowCommandPalette(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectCommand = (index: number) => {
        const cmd = commandSuggestions[index];
        onChange(cmd.prefix + " ");
        setShowCommandPalette(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showCommandPalette) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveSuggestion((p) =>
                    p < commandSuggestions.length - 1 ? p + 1 : 0
                );
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveSuggestion((p) =>
                    p > 0 ? p - 1 : commandSuggestions.length - 1
                );
            } else if (e.key === "Tab" || e.key === "Enter") {
                e.preventDefault();
                if (activeSuggestion >= 0) selectCommand(activeSuggestion);
            } else if (e.key === "Escape") {
                e.preventDefault();
                setShowCommandPalette(false);
            }
        } else if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim() && !isLoading) {
                onSend();
            }
        }
    };

    const handleAttachFile = () => {
        const name = `file-${Math.floor(Math.random() * 1000)}.pdf`;
        setAttachments((p) => [...p, name]);
    };

    const removeAttachment = (i: number) => {
        setAttachments((p) => p.filter((_, idx) => idx !== i));
    };

    return (
        <div className="w-full space-y-5">
            {/* Mode selector pills */}
            <div className="flex items-center justify-center flex-wrap gap-1.5">
                {MODES.map((mode) => (
                    <button
                        key={mode.id}
                        onClick={() => onModeChange(mode.id)}
                        className={cn(
                            "flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-semibold uppercase tracking-[0.15em] transition-all duration-200 border",
                            activeMode === mode.id
                                ? "bg-[#171717] border-[#171717] text-white shadow-sm"
                                : "bg-white border-[#EBEBEB] text-[#4D4D4D] hover:bg-[#FAFAFA] hover:text-[#171717]"
                        )}
                    >
                        <mode.icon
                            className={cn("w-3.5 h-3.5", mode.color)}
                        />
                        {mode.id}
                    </button>
                ))}
            </div>

            {/* Chat input container */}
            <motion.div
                className="relative bg-white rounded-xl border border-[#EBEBEB] shadow-sm"
                initial={{ scale: 0.98 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
            >
                {/* Command palette */}
                <AnimatePresence>
                    {showCommandPalette && (
                        <motion.div
                            ref={commandPaletteRef}
                            className="absolute left-4 right-4 bottom-full mb-2 bg-white rounded-lg z-50 shadow-lg border border-[#EBEBEB] overflow-hidden text-[#171717]"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            transition={{ duration: 0.15 }}
                        >
                            <div className="py-1">
                                {commandSuggestions.map((s, i) => (
                                    <motion.div
                                        key={s.prefix}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-2 text-xs cursor-pointer transition-colors",
                                            activeSuggestion === i
                                                ? "bg-[#FAFAFA] text-[#171717]"
                                                : "text-[#4D4D4D] hover:bg-[#FAFAFA]"
                                        )}
                                        onClick={() => selectCommand(i)}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.03 }}
                                    >
                                        <div
                                            className={cn(
                                                "w-5 h-5 flex items-center justify-center",
                                                activeSuggestion === i
                                                    ? "text-[#171717]"
                                                    : "text-[#8F8F8F]"
                                            )}
                                        >
                                            {s.icon}
                                        </div>
                                        <div className="font-medium">
                                            {s.label}
                                        </div>
                                        <div className="text-[#8F8F8F] text-[10px] ml-auto font-mono">
                                            {s.prefix}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Textarea */}
                <div className="p-4 pb-0">
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => {
                            onChange(e.target.value);
                            adjustHeight();
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={
                            placeholder ||
                            `Message ${activeMode} AI Assistant...`
                        }
                        className={cn(
                            "w-full px-2 py-2",
                            "resize-none",
                            "bg-transparent",
                            "border-none outline-none",
                            "text-[#171717] text-sm leading-relaxed",
                            "placeholder:text-[#8F8F8F]",
                            "min-h-[56px]",
                            "focus:ring-0 focus:outline-none"
                        )}
                        style={{ overflow: "hidden" }}
                    />
                </div>

                {/* Attachments */}
                <AnimatePresence>
                    {attachments.length > 0 && (
                        <motion.div
                            className="px-4 pb-2 flex gap-2 flex-wrap"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            {attachments.map((file, i) => (
                                <motion.div
                                    key={i}
                                    className="flex items-center gap-2 text-xs bg-[#FAFAFA] py-1.5 px-3 rounded-md text-[#4D4D4D] border border-[#EBEBEB]"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                >
                                    <span>{file}</span>
                                    <button
                                        onClick={() => removeAttachment(i)}
                                        className="text-[#8F8F8F] hover:text-[#EE0000] transition-colors"
                                    >
                                        <XIcon className="w-3 h-3" />
                                    </button>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bottom toolbar */}
                <div className="px-4 pb-4 pt-2 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1">
                        <motion.button
                            type="button"
                            onClick={handleAttachFile}
                            whileTap={{ scale: 0.94 }}
                            className="p-2 text-[#8F8F8F] hover:text-[#171717] rounded-md transition-colors hover:bg-[#FAFAFA]"
                        >
                            <Paperclip className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                            type="button"
                            data-command-button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowCommandPalette((p) => !p);
                            }}
                            whileTap={{ scale: 0.94 }}
                            className={cn(
                                "p-2 rounded-md transition-colors hover:bg-[#FAFAFA]",
                                showCommandPalette
                                    ? "bg-[#FAFAFA] text-[#171717]"
                                    : "text-[#8F8F8F] hover:text-[#171717]"
                            )}
                        >
                            <Command className="w-4 h-4" />
                        </motion.button>
                    </div>

                    <motion.button
                        type="button"
                        onClick={() => onSend()}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        disabled={isLoading || !value.trim()}
                        className={cn(
                            "px-4 py-2 rounded-md text-xs font-medium transition-all duration-200",
                            "flex items-center gap-2",
                            value.trim()
                                ? "bg-[#171717] text-white shadow-sm hover:bg-[#171717]/90"
                                : "bg-[#FAFAFA] text-[#8F8F8F] border border-[#EBEBEB]"
                        )}
                    >
                        {isLoading ? (
                            <LoaderIcon className="w-4 h-4 animate-spin text-[#8F8F8F]" />
                        ) : (
                            <SendIcon className="w-4 h-4" />
                        )}
                        <span>Send</span>
                    </motion.button>
                </div>
            </motion.div>

            {/* Version tag */}
            <div className="flex items-center justify-center gap-4 pt-1">
                <div className="h-px bg-[#EBEBEB] flex-1" />
                <p className="text-[8px] text-[#8F8F8F] font-bold uppercase tracking-[0.4em] flex items-center gap-2">
                    <Bot className="w-2.5 h-2.5 text-[#171717]" />
                    MentorForge Pro v3.1
                </p>
                <div className="h-px bg-[#EBEBEB] flex-1" />
            </div>
        </div>
    );
}

// ─── Typing indicator (for bottom of screen) ────────────────────────────────

export function MentorForgeTypingIndicator({ isTyping }: { isTyping: boolean }) {
    return (
        <AnimatePresence>
            {isTyping && (
                <motion.div
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-full px-5 py-2.5 shadow-lg border border-[#EBEBEB] z-50 text-[#171717]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#FAFAFA] flex items-center justify-center border border-[#EBEBEB]">
                            <BrainCircuit className="w-3.5 h-3.5 text-[#171717]" />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#4D4D4D] font-medium">
                            <span>Thinking</span>
                            <TypingDots />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
