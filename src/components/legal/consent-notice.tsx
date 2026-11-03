'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Cookie } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export function ConsentNotice() {
  const { locale } = useLanguage();
  const isBn = locale === 'bn';

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('zgym_cookie_consent');
    if (!consent) {
      // Delay showing banner slightly to avoid layout interference during initial load
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('zgym_cookie_consent', 'accepted');
    setVisible(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem('zgym_cookie_consent', 'essential');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie and Privacy Consent"
      className="fixed bottom-0 left-0 right-0 z-40 p-4 md:p-6 bg-ink-surface/95 backdrop-blur-md border-t border-border shadow-2xl animate-in slide-in-from-bottom duration-300"
    >
      <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-lime-brand/10 border border-lime-brand/30 flex items-center justify-center text-lime-brand shrink-0 mt-0.5">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-white text-sm">
              {isBn ? 'কুকি ও গোপনীয়তা সম্মতি' : 'Cookie & Privacy Choices'}
            </h4>
            <p className="text-silver-300 leading-relaxed max-w-3xl">
              {isBn
                ? 'আমরা আপনার ব্রাউজিং অভিজ্ঞতা উন্নত করতে, সেশন পরিচালনা, ভাষা ও থিম সংরক্ষণ এবং বিজ্ঞাপন পরিবেশনে কুকি ব্যবহার করি। আরও জানতে আমাদের '
                : 'We use cookies and local storage to manage sessions, remember language and theme preferences, and deliver relevant fitness tools. Read our '}
              <Link
                href="/privacy"
                className="text-lime-brand hover:underline font-semibold"
              >
                {isBn ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}
              </Link>
              {isBn ? ' দেখুন।' : '.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
          <button
            onClick={handleEssentialOnly}
            className="px-4 py-2 rounded-xl bg-ink-base border border-white/10 hover:border-white/30 text-silver-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            {isBn ? 'প্রয়োজনীয় মাত্র' : 'Essential Only'}
          </button>
          <button
            onClick={handleAccept}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-lime-brand hover:bg-lime-hover text-ink-base text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isBn ? 'সম্মতি দিচ্ছি' : 'Accept All'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
