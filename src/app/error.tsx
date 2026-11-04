'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[75dvh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl bg-card border border-border p-8 shadow-2xl text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-3xl bg-tomato-brand/15 text-tomato-brand flex items-center justify-center mb-5">
          <AlertTriangle className="w-8 h-8 stroke-[2.5]" />
        </div>

        <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-foreground">
          সাময়িক সমস্যা দেখা দিয়েছে
        </h1>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mt-1">
          Something went wrong
        </h2>

        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-md">
          পেজটি লোড করার সময় একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। দয়া করে পেজটি রিলোড করে পুনরায় চেষ্টা করুন।
          <br />
          <span className="text-xs opacity-80">
            An unexpected error occurred while loading this page. Please reload to recover.
          </span>
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              } else {
                reset();
              }
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-lime-brand hover:bg-lime-brand/90 text-ink-base font-display font-black text-xs uppercase tracking-wider transition-transform active:scale-95 shadow-md cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>পেজ রিলোড করুন / Reload</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-border bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>হোমে ফিরুন / Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
