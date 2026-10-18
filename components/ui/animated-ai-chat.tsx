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
} from "@/components/icons";
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
                    className="w-1.5 h-1.5 bg-[#F5F5F5] rounded-full mx-0.5"
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
    activeMode?: string;
    onModeChange?: (mode: string) => void;
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
        minHeight: 32,
        maxHeight: 160,
    });

    useEffect(() => {
        adjustHeight();
    }, [value, adjustHeight]);

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
        <div className="w-full">
            {/* Chat input container */}
            <motion.div
                className="omni-composer relative flex items-end gap-2 rounded-2xl border border-[#2a2c33] bg-[#121214] px-3 py-2 transition-colors focus-within:border-[#3a3d46]"
            >
                {/* Command palette */}
                <AnimatePresence>
                    {showCommandPalette && (
                        <motion.div
                            ref={commandPaletteRef}
                            className="absolute left-4 right-4 bottom-full mb-2 bg-[#151515] rounded-lg z-50 shadow-2xl border border-[#242424] overflow-hidden text-[#F5F5F5]"
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
                                                ? "bg-[#1F1F1F] text-[#F5F5F5]"
                                                : "text-[#BDBDBD] hover:bg-[#1A1A1A]"
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
                                                    ? "text-[#8B5CF6]"
                                                    : "text-[#7E7E7E]"
                                            )}
                                        >
                                            {s.icon}
                                        </div>
                                        <div className="font-medium">
                                            {s.label}
                                        </div>
                                        <div className="text-[#7E7E7E] text-[10px] ml-auto font-mono">
                                            {s.prefix}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <textarea
                    ref={textareaRef}
                    value={value}
                    rows={1}
                    aria-label="Message Omni"
                    onChange={(e) => {
                        onChange(e.target.value);
                        adjustHeight();
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder || "Ask Omni..."}
                    className={cn(
                        "block min-w-0 flex-1 resize-none bg-transparent",
                        "border-none px-1 py-1.5 outline-none",
                        "text-sm leading-6 text-[#F5F5F5]",
                        "placeholder:text-[#8b909a]",
                        "min-h-[36px] max-h-[160px]",
                        "focus:ring-0 focus:outline-none"
                    )}
                />

                <button
                    type="button"
                    onClick={() => onSend()}
                    disabled={isLoading || !value.trim()}
                    aria-label="Send"
                    className={cn(
                        "mb-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
                        value.trim()
                            ? "bg-[#f4f5f7] text-[#0c0d10]"
                            : "text-[#5c616b]"
                    )}
                >
                    {isLoading ? (
                        <LoaderIcon className="h-4 w-4 animate-spin" />
                    ) : (
                        <SendIcon className="h-4 w-4" />
                    )}
                </button>
            </motion.div>
        </div>
    );
}

// ─── Typing indicator (for bottom of screen) ────────────────────────────────

export function MentorForgeTypingIndicator({ isTyping }: { isTyping: boolean }) {
    return (
        <AnimatePresence>
            {isTyping && (
                <motion.div
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#151515] rounded-full px-5 py-2.5 shadow-2xl border border-[#242424] z-50 text-[#F5F5F5]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#101010] flex items-center justify-center border border-[#242424]">
                            <BrainCircuit className="w-3.5 h-3.5 text-[#8B5CF6]" />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#BDBDBD] font-medium">
                            <span>Thinking</span>
                            <TypingDots />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
