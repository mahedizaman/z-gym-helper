'use client';

import React from 'react';
import { useLanguage } from '@/lib/language-context';
import { FileText, AlertCircle, CheckCircle } from 'lucide-react';

export default function TermsPage() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto max-w-4xl px-4 sm:px-6 py-16 md:py-24">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-lime-soft border border-lime-brand/30 text-ink-base text-xs font-bold uppercase tracking-wider mb-4">
          <FileText className="w-3.5 h-3.5" />
          <span>{t('ব্যবহারের শর্তাবলী', 'Terms of Service')}</span>
        </div>
        <h1 className="font-display font-black text-fluid-section uppercase tracking-tight text-foreground">
          {t('শর্তাবলী ও ডিসক্লেইমার', 'TERMS OF SERVICE')}
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          {t(
            'জেড-জিম হেল্পার ব্যবহারের সাধারণ নীতিমালা ও স্বাস্থ্য সম্পর্কিত সতর্কবার্তা।',
            'Usage guidelines and health advisory for Z-Gym Helper users.'
          )}
        </p>
      </div>

      <div className="flex flex-col gap-8 text-foreground text-sm sm:text-base leading-relaxed">
        <div className="p-8 rounded-3xl bg-card border border-border shadow-sm">
          <h2 className="font-display text-xl font-bold uppercase mb-3 flex items-center gap-2 text-tomato-brand">
            <AlertCircle className="w-5 h-5" />
            <span>{t('১. স্বাস্থ্য ও চিকিৎসা সংক্রান্ত সতর্কবার্তা', '1. Medical & Health Disclaimer')}</span>
          </h2>
          <p className="text-muted-foreground mb-3">
            {t(
              'জেড-জিম হেল্পার-এ প্রদর্শিত BMR, TDEE, ক্যালোরি বাজেট এবং ব্যায়াম নির্দেশিকা শুধুমাত্র সাধারণ ফিটনেস সচেতনতার জন্য বৈজ্ঞানিক অনুমানের ভিত্তিতে তৈরি। এটি কোনো চিকিৎসকের প্রেসক্রিপশন বা পেশাদার চিকিৎসা পরামর্শের বিকল্প নয়।',
              'The BMR, TDEE, calorie targets, and workout splits provided by Z-Gym Helper are scientific estimations for educational and fitness purposes only. They do not constitute formal medical diagnosis or prescription.'
            )}
          </p>
          <p className="text-muted-foreground">
            {t(
              'যেকোনো চরম ক্যালোরি ঘাটতি ডায়েট শুরু করার পূর্বে অথবা পূর্ববর্তী জটিল শারীরিক অসুস্থতা থাকলে অবশ্যই একজন রেজিস্টার্ড চিকিৎসক বা ডায়েটিশিয়ানের পরামর্শ গ্রহণ করুন।',
              'Consult a registered physician or licensed dietitian before undertaking extreme calorie deficits or intense heavy resistance routines, especially if pre-existing health conditions exist.'
            )}
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-card border border-border shadow-sm">
          <h2 className="font-display text-xl font-bold uppercase mb-3 flex items-center gap-2 text-lime-hover">
            <CheckCircle className="w-5 h-5" />
            <span>{t('২. গ্রহণযোগ্য ব্যবহার নীতি', '2. Acceptable Use Policy')}</span>
          </h2>
          <p className="text-muted-foreground">
            {t(
              'আপনি প্ল্যাটফর্মের উন্মুক্ত খাদ্য ডেটাবেজ ও ক্যালকুলেটর কোনো ধরনের বিদ্বেষমূলক কর্মকাণ্ড, বট ট্রাফিকিং বা সার্ভার ক্ষতিসাধন ব্যতিরেকে স্বাধীনভাবে ব্যক্তিগত প্রয়োজনে ব্যবহার করতে পারেন।',
              'You agree to use our open food tools and calculators for legitimate personal fitness tracking without automated scraping abuse or denial-of-service attempts.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
