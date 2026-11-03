'use client';

import React from 'react';
import { useLanguage } from '@/lib/language-context';
import {
  FileText,
  AlertTriangle,
  Scale,
  UserCheck,
  Ban,
} from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto max-w-4xl px-4 sm:px-6 py-16 md:py-24">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-lime-soft border border-lime-brand/30 text-ink-base text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
          <FileText className="w-3.5 h-3.5" />
          <span>{t('ব্যবহারের নীতিমালা', 'Terms of Service')}</span>
        </div>
        <h1 className="font-display font-black text-fluid-section uppercase tracking-tight text-foreground">
          {t('শর্তাবলী ও নির্দেশিকা', 'TERMS OF SERVICE')}
        </h1>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
          {t(
            'জেড-জিম হেল্পার (Z-Gym Helper) ব্যবহারে আপনার সম্মতি, গ্রহণযোগ্য আচরণের নীতি এবং দায়মুক্তির শর্তাবলী।',
            'Terms of usage, acceptable community conduct, and liability disclosures for Z-Gym Helper users.'
          )}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {t('সর্বশেষ হালনাগাদ: নভেম্বর ২০২৬', 'Last Updated: November 2026')}
        </p>
      </div>

      <div className="flex flex-col gap-8 text-foreground text-sm sm:text-base leading-relaxed">
        {/* 1. Health & Medical Advisory */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm">
          <h2 className="font-display text-xl font-bold uppercase mb-3 flex items-center gap-2 text-tomato-brand">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{t('১. স্বাস্থ্য ও চিকিৎসা সংক্রান্ত সতর্কবার্তা (Not Medical Advice)', '1. Medical & Health Disclaimer')}</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            {t(
              'জেড-জিম হেল্পার-এ প্রদর্শিত Mifflin-St Jeor BMR, TDEE, ক্যালোরি লক্ষ্য, ব্যায়ামের ক্যালোরি বার্ন (MET) এবং ওয়ার্কআউট রুটিনসমূহ শুধুমাত্র তথ্যভিত্তিক শিক্ষামূলক ও সচেতনতা বৃদ্ধির জন্য সাধারণ গবেষণার ভিত্তিতে প্রস্তুত। এটি কোনো চিকিৎসক বা রেজিস্টার্ড পুষ্টিবিদের ব্যক্তিগত প্রেসক্রিপশন বা চিকিৎসার বিকল্প নয়।',
              'The BMR, TDEE, caloric targets, MET exercise burn calculations, and workout splits provided by Z-Gym Helper are scientific approximations intended strictly for educational and general fitness tracking purposes. They do not constitute certified medical diagnosis, customized dietary prescription, or medical therapy.'
            )}
          </p>
          <p className="text-muted-foreground leading-relaxed">
            {t(
              'কোনো নতুন ব্যায়াম প্রোগ্রাম, ভারী ভারোত্তোলন বা ক্যালোরি ঘাটতি শুরু করার পূর্বে আপনার শারীরিক অবস্থা অনুযায়ী রেজিস্টার্ড চিকিৎসকের পরামর্শ গ্রহণ করা বাঞ্ছনীয়।',
              'Before starting any strenuous physical exercise program, heavy weightlifting regime, or significant dietary calorie restriction, you should always consult a licensed healthcare practitioner or registered clinical nutritionist.'
            )}
          </p>
        </div>

        {/* 2. Acceptable Use Policy */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm">
          <h2 className="font-display text-xl font-bold uppercase mb-3 flex items-center gap-2 text-lime-hover">
            <UserCheck className="w-5 h-5 text-lime-brand shrink-0" />
            <span>{t('২. প্ল্যাটফর্ম ব্যবহারের গ্রহণযোগ্য নীতিমালা', '2. Acceptable Use Policy')}</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            {t(
              'আপনি ব্যক্তিগত ও অবাণিজ্যিক উদ্দেশ্যে আমাদের উন্মুক্ত ফুড ডেটাবেজ, ওয়ার্কআউট লাইব্রেরি ও ট্র্যাকার ব্যবহার করতে পারেন। তবে নিচের আচরণগুলো কঠোরভাবে নিষিদ্ধ:',
              'You are granted personal, non-commercial access to our open food catalog, workout splits, and calculators. The following activities are strictly prohibited:'
            )}
          </p>
          <ul className="text-xs text-muted-foreground space-y-2 pl-2">
            <li>• {t('স্বয়ংক্রিয় স্ক্র্যাপার, বট বা স্ক্রিপ্ট চালিয়ে সার্ভারে অতিরিক্ত চাপ সৃষ্টি করা বা ডেটাবেজ ক্লোন করা।', 'Automated scraping, denial-of-service attempts, or excessive automated requests violating rate limits.')}</li>
            <li>• {t('অনুপযুক্ত, আপত্তিকর বা অবমাননাকর ডাকনাম (Nickname) ব্যবহার করা।', 'Submitting offensive, harassing, or defamatory nicknames or challenge titles.')}</li>
            <li>• {t('প্ল্যাটফর্মের সুরক্ষা ব্যবস্থা, অ্যাডমিন এন্ডপয়েন্ট বা রেট-লিমিট বাইপাস করার অপচেষ্টা চালানো।', 'Attempting to probe, exploit, or bypass administrative route guards or system rate limiters.')}</li>
          </ul>
        </div>

        {/* 3. Account Suspension & Disabling */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm">
          <h2 className="font-display text-xl font-bold uppercase mb-3 flex items-center gap-2 text-pink-brand">
            <Ban className="w-5 h-5 shrink-0" />
            <span>{t('৩. অ্যাকাউন্ট নিষ্ক্রিয়করণ নীতি', '3. Account Suspension & Security')}</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {t(
              'সিস্টেমের সুরক্ষা রক্ষা ও অপব্যবহার প্রতিরোধে প্ল্যাটফর্মের শর্তাবলী লঙ্ঘনকারী কোনো অ্যাকাউন্ট অ্যাডমিনিস্ট্রেটর কর্তৃক তাৎক্ষণিকভাবে নিষ্ক্রিয় (Disabled) করার অধিকার সংরক্ষিত। নিষ্ক্রিয় ব্যবহারকারীরা পরবর্তীতে প্ল্যাটফর্মে কোনো সুরক্ষিত রিকোয়েস্ট বা লগইন সম্পাদন করতে পারবেন না।',
              'To protect platform security and fair usage, accounts that violate our community policies or engage in abusive traffic patterns may be immediately disabled by system administrators. Disabled accounts are blocked from accessing user sessions and authenticated endpoints.'
            )}
          </p>
        </div>

        {/* 4. Limitation of Liability */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm">
          <h2 className="font-display text-xl font-bold uppercase mb-3 flex items-center gap-2 text-lime-hover">
            <Scale className="w-5 h-5 text-lime-brand shrink-0" />
            <span>{t('৪. দায়মুক্তির শর্তাবলী (Limitation of Liability)', '4. Limitation of Liability')}</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            {t(
              'জেড-জিম হেল্পার "যেমন আছে তেমন" (AS-IS) ভিত্তিতে প্রদান করা হয়। কোনো ব্যায়াম সম্পাদনকালে ব্যক্তিগত আঘাত, ভুল ফর্মের কারণে ক্ষতি বা খাদ্যের পরিমাণের তারতম্যের কারণে কোনো প্রত্যক্ষ বা পরোক্ষ ক্ষতির জন্য প্ল্যাটফর্ম বা এর পরিচালনাকারী দল দায়ী থাকবে না।',
              'Z-Gym Helper is provided on an "AS-IS" and "AS-AVAILABLE" basis without warranties of any kind. Under no circumstances shall Z-Gym Helper, its developers, or contributors be held liable for any direct, indirect, incidental, or consequential injuries, physical damage resulting from exercise execution, or health outcomes associated with calorie tracking.'
            )}
          </p>
          <div className="pt-2">
            <Link
              href="/privacy"
              className="text-xs font-bold text-lime-hover hover:underline uppercase tracking-wider inline-flex items-center gap-1.5"
            >
              <span>{t('গোপনীয়তা নীতিমালা পড়ুন →', 'Read Privacy Policy →')}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
