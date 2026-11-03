'use client';

import React from 'react';
import { useLanguage } from '@/lib/language-context';
import { Flame, Trophy, Share2, CheckCircle2 } from 'lucide-react';
import { PillButton } from '@/components/motion/pill-button';

export function StreakChallengeTeaser() {
  const { t } = useLanguage();

  return (
    <section className="py-20 md:py-28 px-4 sm:px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Visual Mock of 1080x1350 Social Share Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-[4/5] rounded-3xl p-7 bg-ink-base text-white border-2 border-lime-brand/60 shadow-2xl flex flex-col justify-between overflow-hidden">
              {/* Background ambient accents */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-lime-brand/15 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-brand/15 rounded-full blur-2xl pointer-events-none" />

              {/* Card Header */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-lime-brand animate-ping" />
                  <span className="font-display font-extrabold text-xs uppercase tracking-widest text-lime-brand">
                    {t('নমুনা কার্ড প্রিভিউ', 'SAMPLE CARD TEMPLATE')}
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-silver-500">
                  ASIA/DHAKA (UTC+6)
                </span>
              </div>

              {/* Middle Metric Badge */}
              <div className="relative z-10 flex flex-col items-center text-center my-auto">
                <div className="w-16 h-16 rounded-2xl bg-pink-soft/10 border border-pink-brand/40 flex items-center justify-center text-pink-brand mb-3 shadow-lg">
                  <Flame className="w-9 h-9 fill-pink-brand animate-pulse" />
                </div>
                <span className="font-display font-black text-6xl tracking-tight text-white">
                  --
                </span>
                <span className="font-display text-sm font-extrabold uppercase tracking-widest text-lime-brand mt-1">
                  {t('আপনার ব্যক্তিগত স্ট্রিক', 'YOUR PERSONAL STREAK')}
                </span>
                <p className="text-xs text-silver-300 mt-2 max-w-[220px]">
                  {t('লগইন ও মিল লগের পর স্বয়ংক্রিয় আপডেট হবে', 'Dynamically generated from your real workout and meal logs')}
                </p>
              </div>

              {/* Bottom Card Footer */}
              <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-silver-300">
                <span className="font-bold text-white">@your_username</span>
                <span className="flex items-center gap-1 text-lime-brand font-black">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{t('ইনস্টাগ্রাম শেয়ার কার্ড', '1080×1350 Card')}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Explanatory copy & Friend Challenge */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-soft border border-pink-brand/30 text-pink-brand text-xs font-bold uppercase tracking-wider mb-4">
              <Trophy className="w-3.5 h-3.5" />
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
                    'ঢাকা টাইমজোনে (UTC+6) নিখুঁত স্ট্রিক হিসাব — রাত ১২টায় অটো রিসেট',
                    'Accurate Asia/Dhaka (UTC+6) day calculation with zero time-shift bugs'
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
