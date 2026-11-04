'use client';

import React from 'react';
import { useLanguage } from '@/lib/language-context';
import { Sparkles, ShieldCheck, Database, Award } from 'lucide-react';

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto max-w-4xl px-4 sm:px-6 py-16 md:py-24">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-lime-soft border border-lime-brand/30 text-ink-base text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('আমাদের পরিচিতি', 'About the Platform')}</span>
        </div>
        <h1 className="font-display font-black text-fluid-section uppercase tracking-tight text-foreground">
          {t('জেড-জিম হেল্পার সম্পর্কে', 'ABOUT Z-GYM HELPER')}
        </h1>
        <p className="mt-3 text-base text-muted-foreground leading-relaxed">
          {t(
            'বাংলাদেশের ফিটনেস কমিউনিটির জন্য তৈরি উন্মুক্ত, স্বচ্ছ ও বিজ্ঞানসম্মত পুষ্টি ও জিম প্ল্যাটফর্ম।',
            'An open, transparent, evidence-based fitness and nutrition platform built for gym-goers in Bangladesh.'
          )}
        </p>
      </div>

      <div className="flex flex-col gap-10 text-foreground text-sm sm:text-base leading-relaxed">
        {/* Mission Card */}
        <div className="p-8 rounded-3xl bg-card border border-border shadow-sm">
          <h2 className="font-display text-2xl font-black uppercase tracking-tight mb-4 text-lime-hover">
            {t('আমাদের মিশন ও উদ্দেশ্য', 'Our Mission & Philosophy')}
          </h2>
          <p className="text-muted-foreground mb-4">
            {t(
              'বাংলাদেশের অধিকাংশ ফিটনেস অ্যাপ বা ক্যালকুলেটর আন্তর্জাতিক খাবারকে প্রাধান্য দেয়, যার ফলে সাধারণ জিমগামীরা ভাত, ডাল, ইলিশ মাছ, আলু ভর্তা কিংবা হাতে বানানো রুটির আনুমানিক ক্যালোরি ও প্রোটিন মান পরিমাপ করতে পারেন না।',
              'Most international fitness trackers cater to Western diets, leaving Bangladeshi athletes guessing the macros in staple foods like Bhat, Dal, Ilish, Bhorta, and Handmade Roti.'
            )}
          </p>
          <p className="text-muted-foreground">
            {t(
              'জেড-জিম হেল্পারের লক্ষ্য হলো বাংলাদেশের প্রতিটি ফিটনেস অনুরাগী যেন কোনো ফি বা পেওয়াল ছাড়াই আনুমানিক পুষ্টি হিসাব ও বৈজ্ঞানিক জিম প্ল্যান সহজে ব্যবহার করতে পারেন।',
              'Z-Gym Helper provides accessible, open nutrition data and scientific workout splits without subscription barriers.'
            )}
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-secondary/40 border border-border">
            <Database className="w-8 h-8 text-lime-brand mb-4" />
            <h3 className="font-display text-lg font-bold uppercase mb-2">
              {t('উন্মুক্ত পুষ্টি ডেটাবেজ', 'Open Data Integrity')}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t(
                'উন্মুক্ত খাদ্য পুষ্টি ডেটাবেজ ও রেসিপি অনুমানের ভিত্তিতে প্রস্তুত দেশি খাবারের পুষ্টিমান।',
                'Bangladeshi food macros referenced from open food science data and culinary estimation models.'
              )}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-secondary/40 border border-border">
            <ShieldCheck className="w-8 h-8 text-pink-brand mb-4" />
            <h3 className="font-display text-lg font-bold uppercase mb-2">
              {t('গেস্ট-ফার্স্ট অভিজ্ঞতা', 'Guest-First Design')}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t(
                'টুলস ব্যবহারের জন্য কোনো একাউন্ট খোলার বাধ্যবাধকতা নেই। আপনার তথ্য লোকাল স্টোরেজে সম্পূর্ণ নিরাপদ।',
                'Use calculators and tools freely without mandatory accounts. Data persists safely in localStorage.'
              )}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-secondary/40 border border-border">
            <Award className="w-8 h-8 text-tomato-brand mb-4" />
            <h3 className="font-display text-lg font-bold uppercase mb-2">
              {t('কোনো ভুয়া রিভিউ নেই', 'Honest Fitness')}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t(
                'কোনো ভুয়া ট্রেইনারের নাম বা কাল্পনিক রেটিং তৈরি করা হয় না। উন্মুক্ত ডেটা ও বাস্তবসম্মত অনুমান।',
                'Zero fabricated metrics, fake trainer numbers, or invented reviews. Transparent code and science.'
              )}
            </p>
          </div>
        </div>

        {/* Media Attributions Section */}
        <div id="attributions" className="p-8 rounded-3xl bg-card border border-border shadow-sm">
          <h2 className="font-display text-2xl font-black uppercase tracking-tight mb-4 text-foreground">
            {t('মিডিয়া ও ওপেন সোর্স অ্যাট্রিবিউশন', 'Media & Open Source Attributions')}
          </h2>
          <ul className="flex flex-col gap-2.5 text-xs text-muted-foreground">
            <li>
              • <strong className="text-foreground">Saira Condensed, Hind Siliguri, Inter</strong>: Licensed under SIL Open Font License (OFL).
            </li>
            <li>
              • <strong className="text-foreground">Lucide Icons</strong>: Open source licensed under the ISC License.
            </li>
            <li>
              • <strong className="text-foreground">Free Exercise DB</strong>: Exercise demonstration imagery sourced from the public domain dataset.
            </li>
            <li>
              • <strong className="text-foreground">Open Food & Culinary Data</strong>: Bangladeshi food composition estimates and USDA FoodData Central open references.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
