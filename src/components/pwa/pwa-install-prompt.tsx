'use client';

import { useState, useEffect } from 'react';
import { Download, X, Share2, Smartphone } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaInstallPrompt() {
  const { locale } = useLanguage();
  const isBn = locale === 'bn';

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos] = useState(() => {
    if (typeof window === 'undefined') return false;
    return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  });
  const [showIosInstructions, setShowIosInstructions] = useState(false);

  useEffect(() => {
    // Check if already running as standalone PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      return;
    }

    // Check if user dismissed recently (within 7 days)
    const dismissedAt = localStorage.getItem('zgym_pwa_dismissed');
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      if (elapsed < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // If on iOS and not dismissed, show prompt after a short delay
    let timeoutId: NodeJS.Timeout;
    if (isIos) {
      timeoutId = setTimeout(() => {
        setShowPrompt(true);
      }, 4000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isIos]);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosInstructions(true);
      return;
    }

    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('zgym_pwa_dismissed', Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div
      role="region"
      aria-label="PWA install banner"
      className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-ink-surface/95 backdrop-blur-md border border-lime-brand/30 shadow-2xl rounded-2xl p-4 text-white flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime-brand flex items-center justify-center text-ink-base shrink-0 font-bold">
              ⚡
            </div>
            <div>
              <h4 className="font-display text-lg font-bold tracking-wide text-white">
                {isBn ? 'Z-Gym অ্যাপ ইনস্টল করুন' : 'Install Z-Gym App'}
              </h4>
              <p className="text-xs text-silver-300">
                {isBn
                  ? 'দ্রুত অ্যাক্সেস, অফলাইন সাপোর্ট ও ফিটনেস রিমাইন্ডার পান'
                  : 'Fast access, offline shell & timely fitness reminders'}
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            aria-label="Close"
            className="text-silver-500 hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {showIosInstructions ? (
          <div className="bg-ink-base/80 p-3 rounded-xl border border-white/10 text-xs text-silver-300 flex flex-col gap-1.5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-lime-brand font-semibold">
              <Smartphone className="w-4 h-4" />
              <span>{isBn ? 'iOS এ যেভাবে ইনস্টল করবেন:' : 'How to install on iOS:'}</span>
            </div>
            <p>
              {isBn
                ? '১. সাফারি (Safari) ব্রাউজারের নিচের শেয়ার বাটনে (Share icon) চাপুন।'
                : '1. Tap the Share button in Safari.'}
            </p>
            <div className="flex items-center gap-1.5">
              <span>
                {isBn
                  ? '২. মেনু স্ক্রোল করে "Add to Home Screen" বেছে নিন।'
                  : '2. Scroll and select "Add to Home Screen".'}
              </span>
              <Share2 className="w-3.5 h-3.5 text-lime-brand inline shrink-0" />
            </div>
          </div>
        ) : null}

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-lime-brand hover:bg-lime-hover text-ink-base font-bold text-sm py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>
              {isIos
                ? isBn
                  ? 'নির্দেশনা দেখুন'
                  : 'Installation Steps'
                : isBn
                  ? 'ইনস্টল করুন'
                  : 'Install Now'}
            </span>
          </button>
          <button
            onClick={handleDismiss}
            className="text-xs text-silver-400 hover:text-white py-2 px-3 transition-colors"
          >
            {isBn ? 'পরে' : 'Later'}
          </button>
        </div>
      </div>
    </div>
  );
}
