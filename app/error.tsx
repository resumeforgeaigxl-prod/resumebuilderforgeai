'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight } from '@/components/icons';

function localeFromPath(pathname: string) {
  const segment = pathname.split('/').filter(Boolean)[0];
  return segment && segment.includes('-') ? segment : 'en-in';
}

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname() || '/en-in';
  const locale = localeFromPath(pathname);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[App Error Boundary]', error);
    }
  }, [error]);

  return (
    <div className="rf-error min-h-screen bg-[#0c0d10] text-[#f4f5f7]">
      <style>{`
        .rf-error h1 {
          font-size: clamp(40px, 5vw, 64px) !important;
          line-height: 1.02 !important;
        }
      `}</style>

      <header className="border-b border-[#2a2c33]">
        <div className="mx-auto flex h-14 max-w-[1120px] items-center px-6 sm:px-8">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2.5 text-[#f4f5f7]">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#3a3d46] text-[11px] font-semibold tracking-tight">
              RF
            </span>
            <span className="text-sm font-medium tracking-tight">ResumeForge AI</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1120px] flex-col px-6 py-16 sm:px-8 sm:py-24">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-[#8b909a]">
          Error
        </p>
        <h1 className="mt-4 max-w-[14ch] font-normal tracking-[-0.035em] text-[#f4f5f7]">
          Something went wrong.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[#b4b8c2]">
          This page didn’t finish loading. Try it once more, or go back home and continue from there.
        </p>

        <div className="mt-8 max-w-xl rounded-[4px] border border-[#2a2c33] bg-[#16171b] px-4 py-3.5">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[#8b909a]">
            Detail
          </p>
          <p className="mt-2 whitespace-pre-wrap font-mono text-[13px] leading-6 text-[#f4f5f7]">
            {error.message || 'Unknown error'}
          </p>
          {error.digest ? (
            <p className="mt-2 font-mono text-[12px] text-[#8b909a]">Reference {error.digest}</p>
          ) : null}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-full bg-[#f4f5f7] px-5 py-2.5 text-sm font-medium text-[#0c0d10]"
          >
            Try again
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center rounded-full border border-[#3a3d46] px-5 py-2.5 text-sm font-medium text-[#f4f5f7]"
          >
            Back home
          </Link>
          <Link
            href={`/${locale}/dashboard`}
            className="inline-flex items-center px-2 py-2.5 text-sm text-[#8b909a] hover:text-[#f4f5f7]"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
