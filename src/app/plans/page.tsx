'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { WORKOUT_PLANS_DATA } from '@/server/seeds/plans.data';
import { PlanCard } from '@/components/plans/plan-card';
import { guestStorage } from '@/lib/guest-storage';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function PlansPage() {
  const { t } = useLanguage();
  const [activePlanSlug, setActivePlanSlug] = useState<string | null>(() =>
    guestStorage.getActivePlanSlug()
  );
  const [selectedDays, setSelectedDays] = useState<number | 'all'>('all');

  const handleSelectActive = (slug: string) => {
    const next = activePlanSlug === slug ? null : slug;
    setActivePlanSlug(next);
    guestStorage.setActivePlanSlug(next);
  };

  const dayFilters: { id: number | 'all'; bn: string; en: string }[] = [
    { id: 'all', bn: 'সব প্ল্যান (৩-৬ দিন)', en: 'All Plans (3-6 Days)' },
    { id: 3, bn: '৩ দিন (ফুল বডি)', en: '3 Days (Full Body)' },
    { id: 4, bn: '৪ দিন (আপার/লোয়ার)', en: '4 Days (Upper/Lower)' },
    { id: 5, bn: '৫ দিন (হাইব্রিড)', en: '5 Days (Hybrid)' },
    { id: 6, bn: '৬ দিন (PPL)', en: '6 Days (PPL Split)' },
  ];

  const filteredPlans = WORKOUT_PLANS_DATA.filter((plan) => {
    if (selectedDays !== 'all' && plan.daysPerWeek !== selectedDays) {
      return false;
    }
    return true;
  });

  const activePlan = WORKOUT_PLANS_DATA.find((p) => p.slug === activePlanSlug);

  return (
    <div className="min-h-screen bg-background py-10 sm:py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lime-soft text-ink-base border border-lime-brand/40 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-ink-base" />
            <span>{t('সায়েন্টিফিক ট্রেনিং স্প্লিট', 'Scientific Training Splits')}</span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-foreground mb-4">
            {t('ওয়ার্কআউট প্ল্যান ও স্প্লিট রুটিন', 'Workout Plans & Split Routines')}
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            {t(
              'সপ্তাহে ৩, ৪, ৫ এবং ৬ দিনের প্রমাণিত হাইপারট্রফি ও স্ট্রেংথ রুটিন। ব্যায়ামের তালিকা, সেটস, রেপস ও রেস্ট টাইমারসহ সম্পূর্ণ সাজানো।',
              'Evidence-based 3, 4, 5, and 6-day hypertrophy and strength splits with set-rep targets and interactive rest timers.'
            )}
          </p>
        </div>

        {/* Active Plan Callout Banner if selected */}
        {activePlan && (
          <div className="mb-10 p-5 sm:p-6 rounded-3xl bg-lime-soft/40 dark:bg-lime-brand/10 border-2 border-lime-brand flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-lime-brand text-ink-base flex items-center justify-center font-bold shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-ink-base dark:text-lime-brand">
                  {t('আপনার বর্তমান সক্রিয় প্ল্যান', 'Your Active Training Routine')}
                </span>
                <h3 className="font-display font-black text-xl text-foreground">
                  {activePlan.nameBn}
                </h3>
              </div>
            </div>
            <Link
              href={`/plans/${activePlan.slug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ink-base text-white text-xs font-bold hover:bg-ink-surface transition-colors whitespace-nowrap"
            >
              <span>{t('আজকের ওয়ার্কআউট দেখুন', "Open Today's Workout")}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Days Filter Pills */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-10">
          {dayFilters.map((df) => {
            const isActive = selectedDays === df.id;
            return (
              <button
                key={df.id}
                onClick={() => setSelectedDays(df.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-lime-brand text-ink-base font-bold shadow-md'
                    : 'bg-muted/80 text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {t(df.bn, df.en)}
              </button>
            );
          })}
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {filteredPlans.map((plan) => (
            <PlanCard
              key={plan.slug}
              plan={plan}
              isActive={activePlanSlug === plan.slug}
              onSelectActive={handleSelectActive}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
