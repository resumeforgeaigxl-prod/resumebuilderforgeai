'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Share2, Check, Copy } from '@/components/icons';

interface BlogShareButtonProps {
  title: string;
  description?: string;
  url?: string;
}

export default function BlogShareButton({ title, description, url }: BlogShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const getShareUrl = () => {
    if (url) return url;
    if (typeof window !== 'undefined') return window.location.href;
    return 'https://resumeforgeai.in/en-in/blogs';
  };

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const copyToClipboard = async () => {
    try {
      const shareUrl = getShareUrl();
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleMainClick = async () => {
    // If native share is available and user is on mobile / supported environment, try native share
    if (typeof navigator !== 'undefined' && navigator.share && window.innerWidth < 768) {
      try {
        await navigator.share({
          title,
          text: description || title,
          url: getShareUrl(),
        });
        return;
      } catch (err: unknown) {
        // User cancelled or share failed, fallback to copy and dropdown
        if ((err as Error).name === 'AbortError') return;
      }
    }

    // Default action: copy URL and open social share panel
    await copyToClipboard();
    setIsOpen((prev) => !prev);
  };

  const shareToTwitter = () => {
    const shareUrl = getShareUrl();
    const text = encodeURIComponent(`Check out "${title}" on ResumeForge AI:`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
  };

  const shareToLinkedIn = () => {
    const shareUrl = getShareUrl();
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
  };

  const shareToWhatsApp = () => {
    const shareUrl = getShareUrl();
    const text = encodeURIComponent(`*${title}*\nRead more: ${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative inline-block text-left" ref={popoverRef}>
      <button
        type="button"
        onClick={handleMainClick}
        className={`inline-flex items-center text-[11px] font-bold px-3.5 h-8 rounded-sm transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-pointer select-none border ${
          copied
            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
            : 'bg-white border-[#EBEBEB] text-[#171717] hover:bg-neutral-50 hover:border-neutral-300'
        }`}
        title="Share or copy article link"
      >
        {copied ? (
          <>
            <Check size={12} className="mr-1.5 text-emerald-600" /> Link Copied!
          </>
        ) : (
          <>
            <Share2 size={12} className="mr-1.5" /> Share Issue
          </>
        )}
      </button>

      {/* Social Share Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-56 bg-white border border-[#E2E8F0] shadow-xl rounded-none p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100 text-[10px] font-mono uppercase tracking-wider text-neutral-500">
            <span>Share Article</span>
            {copied && <span className="text-emerald-600 font-bold">Copied!</span>}
          </div>

          <div className="space-y-1 text-xs">
            <button
              type="button"
              onClick={copyToClipboard}
              className="w-full flex items-center justify-between px-2.5 py-1.5 hover:bg-neutral-50 text-neutral-800 text-left transition-colors font-sans rounded-none"
            >
              <span className="flex items-center gap-2">
                <Copy size={13} className="text-neutral-500" />
                <span>Copy Link</span>
              </span>
              {copied ? (
                <span className="text-[10px] text-emerald-600 font-mono font-bold">Done</span>
              ) : (
                <span className="text-[10px] text-neutral-400 font-mono">URL</span>
              )}
            </button>

            <button
              type="button"
              onClick={shareToTwitter}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-neutral-50 text-neutral-800 text-left transition-colors font-sans rounded-none"
            >
              <svg className="w-3.5 h-3.5 text-neutral-800" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>Share on X</span>
            </button>

            <button
              type="button"
              onClick={shareToLinkedIn}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-neutral-50 text-neutral-800 text-left transition-colors font-sans rounded-none"
            >
              <svg className="w-3.5 h-3.5 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              <span>Share on LinkedIn</span>
            </button>

            <button
              type="button"
              onClick={shareToWhatsApp}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-neutral-50 text-neutral-800 text-left transition-colors font-sans rounded-none"
            >
              <svg className="w-3.5 h-3.5 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <span>Share on WhatsApp</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
