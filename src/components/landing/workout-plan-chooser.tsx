'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { PillButton } from '@/components/motion/pill-button';
import { Check, Dumbbell, Sparkles } from 'lucide-react';

interface PlanOption {
  days: number;
  slug: string;
  nameBn: string;
  nameEn: string;
  levelBn: string;
  levelEn: string;
  descBn: string;
  descEn: string;
  recommended?: boolean;
  scheduleBn: string[];
  scheduleEn: string[];
  highlightsBn: string[];
  highlightsEn: string[];
}

const PLANS: PlanOption[] = [
  {
    days: 3,
    slug: 'full-body-3',
    nameBn: '৩-দিনের ফুল বডি স্প্লিট',
    nameEn: '3-Day Full Body Split',
    levelBn: 'বিগিনার থেকে ইন্টারমিডিয়েট',
    levelEn: 'Beginner to Intermediate',
    descBn: 'ব্যস্ত শিডিউল ও বিগিনারদের জন্য সেরা। প্রতি সেশনে প্রধান পেশির নিখুঁত ওয়ার্কআউট।',
    descEn: 'Perfect for busy routines and beginners. High stimulus with ample rest between days.',
    scheduleBn: ['রবি: ফুল বডি A', 'মঙ্গল: ফুল বডি B', 'বৃহস্পতি: ফুল বডি C'],
    scheduleEn: ['Sun: Full Body A', 'Tue: Full Body B', 'Thu: Full Body C'],
    highlightsBn: ['সপ্তাহে ৪ দিন রিকভারি', 'মৌলিক কম্পাউন্ড লিফট', 'সহজ সময় বণ্টন'],
    highlightsEn: ['4 Full Rest Days', 'Compound Lift Focus', 'Easy Time Management'],
  },
  {
    days: 4,
    slug: 'upper-lower-4',
    nameBn: '৪-দিনের আপার / লোয়ার',
    nameEn: '4-Day Upper / Lower',
    levelBn: 'সবচেয়ে জনপ্রিয় ও ব্যালেন্সড',
    levelEn: 'Most Popular & Balanced',
    descBn: 'মাসল বিল্ডিং ও স্ট্রেন্থ বৃদ্ধির সবচেয়ে কার্যকর বৈজ্ঞানিক পদ্ধতি।',
    descEn: 'The gold standard for muscle hypertrophy and joint recovery. Balanced volume.',
    recommended: true,
    scheduleBn: ['সোম: আপার বডি A', 'মঙ্গল: লোয়ার বডি A', 'বৃহস্পতি: আপার B', 'শুক্র: লোয়ার B'],
    scheduleEn: ['Mon: Upper A', 'Tue: Lower A', 'Thu: Upper B', 'Fri: Lower B'],
    highlightsBn: ['প্রতি পেশিতে সপ্তাহে ২ বার কাজ', 'পর্যাপ্ত রিকভারি ও গ্রোথ', 'স্ট্যান্ডার্ড জিম রুটিন'],
    highlightsEn: ['2x Frequency per Muscle', 'Optimal Hypertrophy', 'Flexible Scheduling'],
  },
  {
    days: 5,
    slug: 'ppl-upper-lower-5',
    nameBn: '৫-দিনের হাইব্রিড স্প্লিট',
    nameEn: '5-Day Hybrid Split',
    levelBn: 'ইন্টারমিডিয়েট',
    levelEn: 'Intermediate Athlete',
    descBn: 'পুশ-পুল-লেগস এবং আপার-লোয়ারের সংমিশ্রণে বিশেষায়িত অ্যাথলেটিক প্ল্যান।',
    descEn: 'Push-Pull-Legs combined with Upper-Lower targeting for serious fitness gains.',
    scheduleBn: ['সোম: পুশ', 'মঙ্গল: পুল', 'বুধ: লেগস', 'শুক্র: আপার', 'শনি: লোয়ার'],
    scheduleEn: ['Mon: Push', 'Tue: Pull', 'Wed: Legs', 'Fri: Upper', 'Sat: Lower'],
    highlightsBn: ['উচ্চ ভলিউম ট্রেনিং', 'নির্দিষ্ট দুর্বল পেশিতে ফোকাস', 'অ্যাথলেটিক কন্ডিশনিং'],
    highlightsEn: ['Higher Weekly Volume', 'Target Weak Points', 'Athletic Conditioning'],
  },
  {
    days: 6,
    slug: 'ppl-6',
    nameBn: '৬-দিনের পুশ-পুল-লেগস',
    nameEn: '6-Day Push Pull Legs (PPL)',
    levelBn: 'অ্যাডভান্সড ভলিউম',
    levelEn: 'Advanced Volume',
    descBn: 'সর্বোচ্চ হাইপারট্রফি ও পেশি বৃদ্ধির জন্য ক্লাসিক PPL রুটিন।',
    descEn: 'Maximum hypertrophy split for dedicated lifters with optimal nutrition and sleep.',
    scheduleBn: ['সোম/বৃহ: পুশ', 'মঙ্গল/শুক্র: পুল', 'বুধ/শনি: লেগস & কোর', 'রবি: সম্পূর্ণ রেস্ট'],
    scheduleEn: ['Mon/Thu: Push', 'Tue: Fri: Pull', 'Wed/Sat: Legs & Core', 'Sun: Full Rest'],
    highlightsBn: ['সর্বোচ্চ মাসল গ্রোথ রেসপন্স', 'প্রতি পেশিতে দ্বিগুণ ফোকাস', 'শুধুমাত্র অভিজ্ঞদের জন্য'],
    highlightsEn: ['Maximum Growth Stimulus', 'Intense Training Split', 'Requires Strict Recovery'],
  },
];

export function WorkoutPlanChooser() {
  const { t, locale } = useLanguage();
  const [selectedSplit, setSelectedSplit] = useState('upper-lower-4');

  return (
    <section className="py-20 md:py-28 px-4 sm:px-6">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-lime-soft border border-lime-brand/30 text-ink-base text-xs font-bold uppercase tracking-wider mb-4">
            <Dumbbell className="w-3.5 h-3.5" />
            <span>{t('বৈজ্ঞানিক জিম স্প্লিট', 'Scientific Gym Splits')}</span>
          </div>
          <h2 className="font-display font-black text-fluid-section uppercase tracking-tight text-foreground">
            {t('আপনার সুবিধাজনক ওয়ার্কআউট প্ল্যান বেছে নিন', 'CHOOSE YOUR WORKOUT SPLIT')}
          </h2>
          <p className="mt-3 text-base text-muted-foreground max-w-xl mx-auto">
            {t(
              'সপ্তাহে ৩ দিন থেকে ৬ দিন — আপনার জীবনযাত্রার সাথে মানানসই রুটিন বেছে নিন এবং ব্যায়ামগুলো টিক দিন।',
              'Select from 3 to 6 days per week based on your availability and track your completed sessions.'
            )}
          </p>
        </div>

        {/* Pricing-Style Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 items-stretch">
          {PLANS.map((plan) => {
            const isSelected = selectedSplit === plan.slug;
            const isRec = plan.recommended;

            return (
              <div
                key={plan.slug}
                onClick={() => setSelectedSplit(plan.slug)}
                className={`relative flex flex-col justify-between p-7 sm:p-8 rounded-3xl transition-all duration-300 cursor-pointer ${
                  isRec
                    ? 'bg-ink-base text-white border-2 border-lime-brand shadow-2xl scale-[1.02] z-10'
                    : isSelected
                    ? 'bg-card border-2 border-lime-brand shadow-xl'
                    : 'bg-card border border-border hover:border-border/80 shadow-sm'
                }`}
              >
                {/* Recommended Top Badge */}
                {isRec && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-lime-brand text-ink-base text-[11px] font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 whitespace-nowrap">
                    <Sparkles className="w-3 h-3" />
                    <span>{t('সবচেয়ে কার্যকর', 'RECOMMENDED SPLIT')}</span>
                  </div>
                )}

                <div>
                  {/* Top Day Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full ${
                        isRec
                          ? 'bg-white/10 text-lime-brand'
                          : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      {locale === 'bn' ? plan.levelBn : plan.levelEn}
                    </span>
                    <span
                      className={`font-display text-2xl font-black ${
                        isRec ? 'text-lime-brand' : 'text-foreground'
                      }`}
                    >
                      {plan.days} {t('দিন/সপ্তাহ', 'Days/Wk')}
                    </span>
                  </div>

                  {/* Plan Name */}
                  <h3
                    className={`font-display font-black text-2xl uppercase tracking-tight mb-2 ${
                      isRec ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    {locale === 'bn' ? plan.nameBn : plan.nameEn}
                  </h3>

                  {/* Description */}
                  <p
                    className={`text-xs sm:text-sm leading-relaxed mb-6 ${
                      isRec ? 'text-silver-300' : 'text-muted-foreground'
                    }`}
                  >
                    {locale === 'bn' ? plan.descBn : plan.descEn}
                  </p>

                  {/* Schedule Days */}
                  <div className="mb-6">
                    <span
                      className={`block text-[11px] font-bold uppercase tracking-wider mb-2.5 ${
                        isRec ? 'text-lime-brand' : 'text-muted-foreground'
                      }`}
                    >
                      {t('সাপ্তাহিক শিডিউল:', 'Weekly Schedule:')}
                    </span>
                    <ul className="flex flex-col gap-1.5 text-xs">
                      {(locale === 'bn' ? plan.scheduleBn : plan.scheduleEn).map((day, dIdx) => (
                        <li
                          key={`day-${dIdx}`}
                          className={`flex items-center gap-2 font-medium ${
                            isRec ? 'text-silver-100' : 'text-foreground'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isRec ? 'bg-lime-brand' : 'bg-lime-hover'
                            }`}
                          />
                          <span>{day}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Highlights Checkmarks */}
                  <div className="mb-8 pt-4 border-t border-border/40">
                    <ul className="flex flex-col gap-2 text-xs">
                      {(locale === 'bn' ? plan.highlightsBn : plan.highlightsEn).map(
                        (h, hIdx) => (
                          <li
                            key={`h-${hIdx}`}
                            className={`flex items-center gap-2 ${
                              isRec ? 'text-silver-300' : 'text-muted-foreground'
                            }`}
                          >
                            <Check
                              className={`w-4 h-4 shrink-0 ${
                                isRec ? 'text-lime-brand' : 'text-lime-hover'
                              }`}
                            />
                            <span>{h}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>

                {/* Card CTA */}
                <div>
                  <PillButton
                    href="/plans"
                    variant={isRec ? 'primary' : 'outline'}
                    size="md"
                    fullWidth
                    icon="arrow"
                  >
                    {t('এই প্ল্যানটি শুরু করুন', 'Choose This Split')}
                  </PillButton>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
