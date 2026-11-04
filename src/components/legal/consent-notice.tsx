'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ShieldCheck, Cookie } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { Z_INDEX } from '@/config/z-index';

export function ConsentNotice() {
  const { locale } = useLanguage();
  const isBn = locale === 'bn';
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  const [visible, setVisible] = useState(false);
  const [hasOpenModal, setHasOpenModal] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('zgym_cookie_consent');
    if (!consent) {
      // Delay showing banner slightly to avoid layout interference during initial load
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  // Monitor DOM for open dialogs, sheets, or menus to immediately hide cookie banner
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const checkModals = () => {
      const openDialog = document.querySelector(
        '[role="dialog"], [data-state="open"], [data-radix-popper-content-wrapper]'
      );
      setHasOpenModal(Boolean(openDialog));
    };

    checkModals();
    const observer = new MutationObserver(checkModals);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    return () => observer.disconnect();
  }, []);

  const handleAccept = () => {
    localStorage.setItem('zgym_cookie_consent', 'accepted');
    setVisible(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem('zgym_cookie_consent', 'essential');
    setVisible(false);
  };

  // Do not render if dismissed or if any modal/sheet/drawer is active
  if (!visible || hasOpenModal) return null;

  return (
    <div
      role="region"
      aria-label="Cookie and Privacy Consent"
      style={{ zIndex: Z_INDEX.cookieBanner }}
      className={`fixed left-0 right-0 p-4 sm:p-5 bg-card text-card-foreground border-t-2 border-border shadow-2xl animate-in slide-in-from-bottom duration-300 pb-[max(env(safe-area-inset-bottom),1rem)] ${
        isAuthenticated ? 'bottom-[calc(60px+env(safe-area-inset-bottom))] lg:bottom-0' : 'bottom-0'
      }`}
    >
      <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-lime-brand/15 text-lime-brand border border-lime-brand/30 flex items-center justify-center shrink-0 mt-0.5">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-foreground text-sm">
              {isBn ? 'কুকি ও গোপনীয়তা সম্মতি' : 'Cookie & Privacy Choices'}
            </h4>
            <p className="text-muted-foreground leading-relaxed max-w-3xl">
              {isBn
                ? 'আমরা আপনার ব্রাউজিং অভিজ্ঞতা উন্নত করতে, সেশন পরিচালনা, ভাষা ও থিম সংরক্ষণ এবং বিজ্ঞাপন পরিবেশনে কুকি ব্যবহার করি। আরও জানতে আমাদের '
                : 'We use cookies and local storage to manage sessions, remember language and theme preferences, and deliver relevant fitness tools. Read our '}
              <Link
                href="/privacy"
                className="text-lime-hover hover:underline font-bold"
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
            className="px-4 py-2 rounded-xl bg-secondary hover:bg-muted text-foreground border border-border text-xs font-bold transition-colors cursor-pointer"
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
