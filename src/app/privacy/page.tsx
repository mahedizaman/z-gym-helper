'use client';

import React from 'react';
import { useLanguage } from '@/lib/language-context';
import { ShieldCheck, Lock, Eye, Server } from 'lucide-react';

export default function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto max-w-4xl px-4 sm:px-6 py-16 md:py-24">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-lime-soft border border-lime-brand/30 text-ink-base text-xs font-bold uppercase tracking-wider mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t('ডেটা ও নিরাপত্তা', 'Data Protection')}</span>
        </div>
        <h1 className="font-display font-black text-fluid-section uppercase tracking-tight text-foreground">
          {t('গোপনীয়তা নীতি', 'PRIVACY POLICY')}
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          {t(
            'জেড-জিম হেল্পারে আপনার ব্যক্তিগত তথ্যের সুরক্ষা এবং গোপনীয়তা আমাদের প্রথম অগ্রাধিকার।',
            'How Z-Gym Helper protects your personal fitness and nutritional data.'
          )}
        </p>
      </div>

      <div className="flex flex-col gap-8 text-foreground text-sm sm:text-base leading-relaxed">
        <div className="p-8 rounded-3xl bg-card border border-border shadow-sm">
          <h2 className="font-display text-xl font-bold uppercase mb-3 flex items-center gap-2 text-lime-hover">
            <Lock className="w-5 h-5" />
            <span>{t('১. গেস্ট-ফার্স্ট ও লোকাল স্টোরেজ', '1. Guest-First & Local Storage')}</span>
          </h2>
          <p className="text-muted-foreground">
            {t(
              'আপনি যখন কোনো একাউন্ট ছাড়া আমাদের ক্যালকুলেটর বা ফুড সার্চ ব্যবহার করেন, আপনার সমস্ত ডেটা কেবল আপনার ডিভাইসের ব্রাউজারে সংরক্ষিত থাকে। আমাদের সার্ভারে কোনো অপ্রয়োজনীয় ব্যক্তিগত তথ্য পাঠানো বা ট্র্যাকিং করা হয় না।',
              'When using the app as a guest, your logs and calculator data remain exclusively on your local device (localStorage). We do not send your private data to external servers without your action.'
            )}
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-card border border-border shadow-sm">
          <h2 className="font-display text-xl font-bold uppercase mb-3 flex items-center gap-2 text-pink-brand">
            <Eye className="w-5 h-5" />
            <span>{t('২. সংরক্ষিত তথ্য ও লিডারবোর্ড গোপনীয়তা', '2. Stored Data & Leaderboard Privacy')}</span>
          </h2>
          <p className="text-muted-foreground">
            {t(
              'আপনি একাউন্ট খুললে কেবল আপনার স্ট্রিক ও ব্যাকআপ হিস্ট্রি সুরক্ষিতভাবে সংরক্ষিত হয়। ফ্রেন্ডস চ্যালেঞ্জ বা লিডারবোর্ডে কেবল আপনার ডাকনাম ও স্ট্রিক/শতাংশ দৃশ্যমান হয়; আপনার প্রকৃত ওজন কখনই জনসমক্ষে প্রকাশ করা হয় না।',
              'When logging in to save progress, your data is securely stored in MongoDB Atlas. Public leaderboards and friend challenges display nicknames and streaks only; raw kilograms are never exposed.'
            )}
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-card border border-border shadow-sm">
          <h2 className="font-display text-xl font-bold uppercase mb-3 flex items-center gap-2 text-tomato-brand">
            <Server className="w-5 h-5" />
            <span>{t('৩. পুশ নোটিফিকেশন ও ট্র্যাকিং নীতি', '3. Push Notifications & Analytics')}</span>
          </h2>
          <p className="text-muted-foreground">
            {t(
              'ওয়েব পুশ নোটিফিকেশন ঐচ্ছিক। আপনি চাইলে যেকোনো সময় নোটিফিকেশন বন্ধ করতে পারেন। আমরা কোনো ব্যক্তিগত তথ্য তৃতীয় পক্ষের কাছে বিক্রি করি না।',
              'Web push notifications are opt-in. You may revoke push permission at any time in browser settings. We never sell personal data to advertisers.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
