'use client';

import React, { useState } from 'react';
import { Playfair_Display } from 'next/font/google';
import { Loader2, CheckCircle2 } from '@/components/icons';

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '600', '700'] });

interface BlogNewsletterSignupProps {
  className?: string;
}

export default function BlogNewsletterSignup({ className = '' }: BlogNewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setStatus('error');
      setMessage('Please enter your email address.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setStatus('success');
        setMessage(data.message || "You're subscribed! Check your inbox for confirmation.");
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (err) {
      console.error('Newsletter subscription error:', err);
      setStatus('error');
      setMessage('Network error. Please try again in a moment.');
    }
  };

  return (
    <div className={`p-8 md:p-12 bg-white border border-[#EBEBEB] text-center rounded-none shadow-[0_1px_2px_rgba(0,0,0,0.01)] ${className}`}>
      <h2 className={`${playfair.className} text-2xl font-bold tracking-tight text-[#171717] mb-2`}>
        Stay in the Loop
      </h2>
      <p className="text-sm text-[#4D4D4D] mb-6 max-w-sm mx-auto">
        Get the latest career tips and ResumeForgeAI updates directly in your inbox.
      </p>

      {status === 'success' ? (
        <div className="max-w-md mx-auto p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-sm text-sm flex items-center justify-center gap-2 animate-in fade-in duration-300">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span className="font-medium text-left">{message}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === 'error') setStatus('idle');
              }}
              placeholder="Enter your email"
              disabled={status === 'loading'}
              required
              className="flex-1 h-9 px-3 bg-white border border-[#EBEBEB] text-[#171717] placeholder-[#8F8F8F] rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-[#171717] text-white hover:bg-neutral-800 text-xs font-semibold px-5 h-9 rounded-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 shrink-0"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Subscribing...</span>
                </>
              ) : (
                'Subscribe'
              )}
            </button>
          </div>

          {status === 'error' && (
            <p className="mt-2 text-xs text-rose-600 text-left font-medium">
              {message}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
