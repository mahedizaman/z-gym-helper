'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language-context';
import {
  Flame,
  Trophy,
  Share2,
  CheckCircle2,
  Download,
  MessageCircle,
  User,
  AlertCircle,
} from 'lucide-react';
import { PillButton } from '@/components/motion/pill-button';
import { guestStorage } from '@/lib/guest-storage';

export function StreakChallengeTeaser() {
  const { t, locale } = useLanguage();
  const isBn = locale === 'bn';

  const [cardName, setCardName] = useState(isBn ? 'অ্যাথলিট' : 'Athlete');
  const [streakCount] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      return guestStorage.getGuestStreak().currentStreak || 0;
    } catch {
      return 0;
    }
  });
  const [sharing, setSharing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [canShareFile, setCanShareFile] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Check Web Share API capabilities on mount
  useEffect(() => {
    const checkShare = () => {
      if (typeof navigator !== 'undefined' && typeof navigator.canShare === 'function') {
        try {
          const dummyFile = new File([''], 'test.png', { type: 'image/png' });
          setCanShareFile(navigator.canShare({ files: [dummyFile] }));
        } catch {
          setCanShareFile(false);
        }
      }
    };
    checkShare();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const cleanName = cardName.trim();
  const isNameValid = cleanName.length >= 3 && cleanName.length <= 20;
  const displayName = isNameValid ? cleanName : isBn ? 'অ্যাথলিট' : 'Athlete';

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const ogImageUrl = `/api/og/progress?nickname=${encodeURIComponent(
    displayName
  )}&streak=${streakCount}&workouts=0&monthChange=0%25&showWeight=false&weight=&format=story&lang=${locale}`;

  const shareText = `🔥 আমার Z-Gym Helper ফিটনেস প্রগ্রেস: ${streakCount} দিনের স্ট্রিক! আপনিও যোগ দিন: ${origin}`;

  const handleWebShare = async () => {
    if (!isNameValid) {
      showToast(t('অনুগ্রহ করে ৩-২০ অক্ষরের একটি বৈধ নাম দিন', 'Please enter a valid name (3-20 characters)'), 'error');
      return;
    }

    try {
      setSharing(true);
      const res = await fetch(ogImageUrl);
      if (!res.ok) throw new Error('Card generation failed');
      const blob = await res.blob();
      const file = new File([blob], `zgym-streak-${displayName}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${displayName} - Z-Gym Streak`,
          text: shareText,
        });
        showToast(t('কার্ড সফলভাবে শেয়ার হয়েছে!', 'Card shared successfully!'), 'success');
      } else if (navigator.share) {
        await navigator.share({
          title: `${displayName} - Z-Gym Streak`,
          text: shareText,
          url: origin,
        });
        showToast(t('লিঙ্ক সফলভাবে শেয়ার হয়েছে!', 'Link shared successfully!'), 'success');
      } else {
        throw new Error('Unsupported');
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        showToast(
          t('শেয়ার করতে সমস্যা হয়েছে। ডাউনলোড বা হোয়াটসঅ্যাপ চেষ্টা করুন।', 'Share failed. Please try Download or WhatsApp.'),
          'error'
        );
      }
    } finally {
      setSharing(false);
    }
  };

  const handleDownload = async () => {
    if (!isNameValid) {
      showToast(t('অনুগ্রহ করে ৩-২০ অক্ষরের একটি বৈধ নাম দিন', 'Please enter a valid name (3-20 characters)'), 'error');
      return;
    }

    try {
      setDownloading(true);
      const res = await fetch(ogImageUrl);
      if (!res.ok) throw new Error('Card generation failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zgym-streak-${displayName}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(t('কার্ড সফলভাবে ডাউনলোড হয়েছে!', 'Card downloaded successfully!'), 'success');
    } catch {
      showToast(t('ডাউনলোড ব্যর্থ হয়েছে। আবার চেষ্টা করুন।', 'Download failed. Please try again.'), 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleWhatsApp = () => {
    if (!isNameValid) {
      showToast(t('অনুগ্রহ করে ৩-২০ অক্ষরের একটি বৈধ নাম দিন', 'Please enter a valid name (3-20 characters)'), 'error');
      return;
    }

    const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    showToast(t('হোয়াটসঅ্যাপ খোলা হচ্ছে...', 'Opening WhatsApp...'), 'success');
  };

  return (
    <section className="py-20 md:py-28 px-4 sm:px-6 relative">
      {/* Toast Feedback */}
      {toast && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold transition-all z-[95] animate-in fade-in slide-in-from-top-4 ${
            toast.type === 'success'
              ? 'bg-lime-brand text-ink-base border border-lime-hover'
              : 'bg-tomato-brand text-white border border-tomato-deep'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Interactive 1080x1350 Social Share Card for Guests & Users */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-[4/5] rounded-3xl p-7 bg-[#0F1412] text-white border-2 border-lime-brand/60 shadow-2xl flex flex-col justify-between overflow-hidden">
              {/* Background ambient accents */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-lime-brand/15 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-brand/15 rounded-full blur-2xl pointer-events-none" />

              {/* Card Header */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-lime-brand animate-ping" />
                  <span className="font-display font-extrabold text-xs uppercase tracking-widest text-lime-brand">
                    {t('লাইভ কার্ড প্রিভিউ', 'LIVE CARD PREVIEW')}
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-silver-500">
                  ASIA/DHAKA (UTC+6)
                </span>
              </div>

              {/* Middle Metric Badge with Real Guest/User Streak */}
              <div className="relative z-10 flex flex-col items-center text-center my-auto">
                <div className="w-16 h-16 rounded-2xl bg-[#2A111E] border border-pink-brand/50 flex items-center justify-center text-pink-soft mb-3 shadow-lg">
                  <Flame className="w-9 h-9 text-pink-brand fill-pink-brand animate-pulse" />
                </div>
                <span className="font-display font-black text-6xl sm:text-7xl tracking-tight text-white">
                  {streakCount}
                </span>
                <span className="font-display text-sm font-extrabold uppercase tracking-widest text-lime-brand mt-1">
                  {t('দিনের অ্যাক্টিভ স্ট্রিক', 'DAY ACTIVE STREAK')}
                </span>
                <p className="text-xs text-silver-300 mt-2 max-w-[240px]">
                  {streakCount > 0
                    ? t('আপনার বর্তমান স্ট্রিক ডেটা থেকে তৈরি', 'Calculated live from your workout & meal logs')
                    : t('একটি মিল বা ব্যায়াম লগ করলেই স্ট্রিক যোগ হবে', 'Log your first meal or workout to begin your streak')}
                </p>
              </div>

              {/* Bottom Card Footer with Editable Name */}
              <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-silver-300">
                <span className="font-bold text-white tracking-wide">@{displayName}</span>
                <span className="flex items-center gap-1 text-lime-brand font-black">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{t('১০৮০x১৩৫০ কার্ড', '1080×1350 Card')}</span>
                </span>
              </div>
            </div>

            {/* Interactive Name Editing & Action Controls */}
            <div className="w-full max-w-[340px] sm:max-w-[380px] mt-4 space-y-3">
              <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-card border border-border">
                <label className="text-[11px] font-bold text-muted-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1 text-foreground">
                    <User className="w-3.5 h-3.5 text-lime-brand" />
                    <span>{t('কার্ডে আপনার নাম লিখুন:', 'Name on card (3-20 chars):')}</span>
                  </span>
                  <span className={isNameValid ? 'text-muted-foreground' : 'text-tomato-brand font-bold'}>
                    {cardName.length}/20
                  </span>
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  maxLength={20}
                  placeholder={t('নাম লিখুন...', 'Enter your name...')}
                  className={`px-3 py-1.5 rounded-xl bg-secondary border text-xs font-bold text-foreground focus:outline-none focus:ring-2 ${
                    isNameValid
                      ? 'border-border focus:ring-lime-brand'
                      : 'border-tomato-brand focus:ring-tomato-brand text-tomato-brand'
                  }`}
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handleWebShare}
                  disabled={sharing || !isNameValid || !canShareFile}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-lime-brand text-ink-base font-bold text-xs hover:bg-lime-hover transition-colors shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  title={
                    !canShareFile
                      ? t('ডিভাইসে ফাইল শেয়ার সমর্থিত নয়', 'File share not supported')
                      : ''
                  }
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{sharing ? '...' : t('শেয়ার', 'Share')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading || !isNameValid}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-secondary text-foreground border border-border font-bold text-xs hover:bg-muted transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{downloading ? '...' : t('ডাউনলোড', 'Download')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsApp}
                  disabled={!isNameValid}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-[#25D366] text-white font-bold text-xs hover:opacity-90 transition-opacity shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Explanatory copy & Friend Challenge */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-soft text-ink-base dark:bg-[#2A111E] dark:text-pink-soft border border-thunder-base/40 text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
              <Trophy className="w-3.5 h-3.5 text-thunder-base dark:text-pink-soft" />
              <span>{t('শৃঙ্খলা ও কমিউনিটি লিডারবোর্ড', 'Discipline & Friend Challenges')}</span>
            </div>

            <h2 className="font-display font-black text-fluid-section uppercase tracking-tight text-foreground">
              {t('ধারাবাহিকতা ধরে রাখুন, বন্ধুদের চ্যালেঞ্জ করুন', 'BUILD STREAKS & CHALLENGE FRIENDS')}
            </h2>

            <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-xl">
              {t(
                'প্রতিদিনের একটি মিল বা ওয়ার্কআউট লগ করলেই বাড়বে আপনার স্ট্রিক। ২ থেকে ১০ জন বন্ধুর সাথে ব্যক্তিগত চ্যালেঞ্জ গ্রুপ তৈরি করুন অথবা পাবলিক লিডারবোর্ডে অংশ নিন।',
                'Log one meal or workout each day to maintain your streak in Asia/Dhaka time. Create private challenges with 2-10 gym buddies or compete on the public leaderboard.'
              )}
            </p>

            {/* Feature Bullets */}
            <div className="mt-6 flex flex-col gap-3 text-sm text-foreground">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-lime-brand shrink-0" />
                <span>
                  {t(
                    'ঢাকা টাইমজোনে (UTC+6) স্ট্রিক হিসাব — রাত ১২টায় অটো রিসেট',
                    'Asia/Dhaka (UTC+6) day calculation with zero time-shift bugs'
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-lime-brand shrink-0" />
                <span>
                  {t(
                    'ইনস্টাগ্রাম ও হোয়াটসঅ্যাপে শেয়ারযোগ্য ১০৮০x১৩৫০ প্রগ্রেস কার্ড',
                    'Server-generated 1080x1350 & 1080x1080 progress cards with next/og'
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-lime-brand shrink-0" />
                <span>
                  {t(
                    'বন্ধুদের আমন্ত্রণ লিঙ্ক /c/[code] — গোপনীয়তা ও ডাকনাম নির্ভর র্যাকিং',
                    'Privacy-first friend invites with nicknames only; raw weight is never leaked'
                  )}
                </span>
              </div>
            </div>

            {/* Call to Actions */}
            <div className="mt-8 flex flex-wrap gap-4">
              <PillButton
                href="/leaderboard"
                variant="primary"
                size="md"
                icon="arrow"
              >
                {t('লিডারবোর্ড দেখুন', 'Explore Leaderboard')}
              </PillButton>
              <PillButton
                href="/challenges"
                variant="outline"
                size="md"
                icon="external"
              >
                {t('চ্যালেঞ্জ গ্রুপ খুলুন', 'Start a Challenge')}
              </PillButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
