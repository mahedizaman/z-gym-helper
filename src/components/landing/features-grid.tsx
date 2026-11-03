'use client';

import React from 'react';
import { Stagger, StaggerItem } from '@/components/motion/stagger';
import { useLanguage } from '@/lib/language-context';
import {
  Utensils,
  Calculator,
  Dumbbell,
  Flame,
  BookOpen,
  Smartphone,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export function FeaturesGrid() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Utensils,
      titleBn: '৩০০+ দেশি খাবারের পুষ্টিমান',
      titleEn: '300+ Bangladeshi Food Macros',
      descBn:
        'ভাত, ডাল, ইলিশ, আলু ভর্তা, খিচুড়ি ও মুরগির মাংসের নির্ভরযোগ্য ক্যালোরি, প্রোটিন, ফ্যাট ও কার্বোহাইড্রেট পরিমাপ।',
      descEn:
        'Nutrient profiles for Bangladeshi staples: Bhat, Dal, Ilish, Bhorta, Roti, and Chicken with exact grams.',
      badgeBn: 'ওপেন ডেটা',
      badgeEn: 'Open Data',
      accent: 'lime',
      href: '/foods',
    },
    {
      icon: Calculator,
      titleBn: 'বিজ্ঞানের ভিত্তিতে ক্যালোরি হিসাব',
      titleEn: 'Precision BMR & TDEE Math',
      descBn:
        'Mifflin-St Jeor সমীকরণ ও MET এক্সারসাইজ ফর্মুলার মাধ্যমে আপনার দৈনিক ক্যালোরি ও পুষ্টি চাহিদার নিখুঁত হিসাব।',
      descEn:
        'Accurate daily caloric targets using Mifflin-St Jeor BMR and MET exercise burn equations, safe and realistic.',
      badgeBn: 'বিজ্ঞানসম্মত',
      badgeEn: 'Scientific',
      accent: 'pink',
      href: '/calculator',
    },
    {
      icon: Dumbbell,
      titleBn: '৩ থেকে ৬ দিনের জিম স্প্লিট',
      titleEn: 'Structured Gym Workout Splits',
      descBn:
        'ফুল বডি, আপার-লোয়ার এবং পুশ-পুল-লেগস স্প্লিট। সেটস, রেপস ও রেস্ট টাইমিং সহ সাজানো রুটিন।',
      descEn:
        'Full Body, Upper/Lower, and Push-Pull-Legs routines with sets, reps, and rest guidance for beginner to advanced.',
      badgeBn: 'পেশাদার স্প্লিট',
      badgeEn: 'Pro Splits',
      accent: 'tomato',
      href: '/plans',
    },
    {
      icon: Flame,
      titleBn: 'এশিয়া/ঢাকা টাইমজোনে স্ট্রিক',
      titleEn: 'Asia/Dhaka Streak Tracking',
      descBn:
        'প্রতিদিনের ওয়ার্কআউট ও খাবার লগে স্ট্রিক গড়ুন। শেয়ারযোগ্য গ্রাফিক্যাল প্রগ্রেস কার্ড দিয়ে বন্ধুদের অনুপ্রাণিত করুন।',
      descEn:
        'Maintain daily discipline tied to Dhaka time. Share customized 1080x1350 graphical progress badges with friends.',
      badgeBn: 'ধারাবাহিকতা',
      badgeEn: 'Consistency',
      accent: 'pink',
      href: '/leaderboard',
    },
    {
      icon: BookOpen,
      titleBn: 'ব্যায়ামের সঠিক ফর্ম লাইব্রেরি',
      titleEn: 'Exercise Guide & Form Library',
      descBn:
        '৩০+ কোর ব্যায়ামের ছবি, কমন ভুল, টার্গেট পেশি এবং নিরাপদ ইউটিউব ক্লিক-টু-লোড ভিডিও ফ্যাসাড।',
      descEn:
        '30+ core exercises with muscle maps, common mistakes, form cues, and instant YouTube click-to-load facades.',
      badgeBn: 'সঠিক ফর্ম',
      badgeEn: 'Safe Form',
      accent: 'lime',
      href: '/exercises',
    },
    {
      icon: Smartphone,
      titleBn: 'গেস্ট-ফার্স্ট ও অফলাইন PWA',
      titleEn: 'Guest-First Offline PWA',
      descBn:
        'লগইন ছাড়াই ক্যালকুলেটর ও ফুড সার্চ ব্যবহার করুন। আপনার ব্রাউজারে বা অ্যাপ হিসেবে ইনস্টল করে অফলাইনেও চালান।',
      descEn:
        'No mandatory account wall. Browse tools instantly with localStorage, and install as an offline PWA on phone.',
      badgeBn: '১০০% ফ্রি',
      badgeEn: 'Installable PWA',
      accent: 'tomato',
      href: '/calculator',
    },
  ];

  return (
    <section className="py-20 md:py-28 px-4 sm:px-6">
      <div className="container mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-secondary/80 border border-border text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-4">
            {t('সব ফিচার এক ছাদের নিচে', 'Everything You Need')}
          </div>
          <h2 className="font-display font-black text-fluid-section uppercase tracking-tight text-foreground">
            {t('কেন জেড-জিম আপনার জন্য সেরা?', "WHY WE'RE THE RIGHT FIT FOR YOU")}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {t(
              'বাংলাদেশী অ্যাথলেট ও ফিটনেস প্রেমীদের বাস্তব চাহিদা মাথায় রেখে তৈরি সম্পূর্ণ ফ্রি ও কার্যকর টুলস।',
              'Tailored specifically for Bangladeshi fitness enthusiasts with local food macros and zero fluff.'
            )}
          </p>
        </div>

        {/* Features Stagger Grid */}
        <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            const isLime = feature.accent === 'lime';
            const isPink = feature.accent === 'pink';

            return (
              <StaggerItem key={`feature-${idx}`}>
                <Link
                  href={feature.href}
                  className="group relative flex flex-col justify-between h-full p-8 rounded-3xl bg-card border border-border hover:border-lime-brand/60 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1"
                >
                  <div>
                    {/* Top row with icon & badge */}
                    <div className="flex items-center justify-between mb-6">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                          isLime
                            ? 'bg-lime-soft border border-lime-brand/40 text-ink-base'
                            : isPink
                            ? 'bg-pink-soft border border-pink-brand/40 text-pink-brand'
                            : 'bg-tomato-brand/10 border border-tomato-brand/40 text-tomato-brand'
                        }`}
                      >
                        <Icon className="w-7 h-7" />
                      </div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-secondary/80 border border-border text-muted-foreground">
                        {t(feature.badgeBn, feature.badgeEn)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-display font-extrabold text-2xl text-foreground uppercase tracking-tight group-hover:text-lime-hover transition-colors">
                      {t(feature.titleBn, feature.titleEn)}
                    </h3>

                    {/* Description */}
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                      {t(feature.descBn, feature.descEn)}
                    </p>
                  </div>

                  {/* Bottom Action Link */}
                  <div className="mt-8 pt-4 border-t border-border flex items-center justify-between text-xs font-extrabold uppercase font-display tracking-wider text-muted-foreground group-hover:text-foreground">
                    <span>{t('বিস্তারিত দেখুন', 'Explore Feature')}</span>
                    <span className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center transition-transform group-hover:translate-x-1 group-hover:bg-lime-brand group-hover:text-ink-base">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
