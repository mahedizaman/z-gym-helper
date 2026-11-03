'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, Check, Zap } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { SeedPlan } from '@/server/seeds/plans.data';

interface PlanCardProps {
  plan: SeedPlan;
  isActive: boolean;
  onSelectActive: (slug: string) => void;
}

export function PlanCard({ plan, isActive, onSelectActive }: PlanCardProps) {
  const { t } = useLanguage();

  const levelBadges: Record<string, { bn: string; en: string; color: string }> = {
    beginner: {
      bn: 'নতুনদের উপযোগী',
      en: 'Beginner Friendly',
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    },
    intermediate: {
      bn: 'মধ্যবর্তী পর্যায়',
      en: 'Intermediate',
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    },
    advanced: {
      bn: 'উন্নত অ্যাথলিট',
      en: 'Advanced',
      color: 'bg-tomato-base/10 text-tomato-base border-tomato-base/20',
    },
  };

  const splitLabels: Record<string, { bn: string; en: string }> = {
    full_body: { bn: 'ফুল বডি স্প্লিট', en: 'Full Body Split' },
    upper_lower: { bn: 'আপার / লোয়ার স্প্লিট', en: 'Upper / Lower' },
    ppl: { bn: 'পুশ-পুল-লেগস (PPL)', en: 'Push-Pull-Legs' },
    hybrid: { bn: 'হাইব্রিড স্প্লিট', en: 'Hybrid Split' },
  };

  return (
    <div
      className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 border-2 ${
        isActive
          ? 'bg-card border-lime-brand shadow-xl ring-2 ring-lime-brand/20'
          : 'bg-card border-border hover:border-lime-brand/40 hover:shadow-lg'
      }`}
    >
      {/* Active Routine Indicator Tag */}
      {isActive && (
        <div className="absolute -top-3.5 right-6 bg-lime-brand text-ink-base font-black text-xs px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 stroke-3" />
          <span>{t('আপনার সক্রিয় রুটিন', 'Active Routine')}</span>
        </div>
      )}

      <div>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ink-base text-white text-xs font-black uppercase tracking-wider dark:bg-white dark:text-ink-base">
            <Calendar className="w-3.5 h-3.5" />
            <span>{t(`সপ্তাহে ${plan.daysPerWeek} দিন`, `${plan.daysPerWeek} Days/Week`)}</span>
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
            {t(splitLabels[plan.splitType]?.bn || plan.splitType, splitLabels[plan.splitType]?.en || plan.splitType)}
          </span>

          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              levelBadges[plan.level]?.color || 'bg-muted text-foreground'
            }`}
          >
            {t(levelBadges[plan.level]?.bn || plan.level, levelBadges[plan.level]?.en || plan.level)}
          </span>
        </div>

        {/* Plan Title */}
        <h3 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-foreground mb-1">
          {plan.nameBn}
        </h3>
        <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-4">
          {plan.nameEn}
        </p>

        {/* Description */}
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
          {t(plan.descriptionBn, plan.descriptionEn)}
        </p>

        {/* Weekly Day Schedule Outline */}
        <div className="space-y-2 mb-6 p-4 rounded-2xl bg-muted/40 border border-border/50">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-lime-brand" />
            <span>{t('সাপ্তাহিক রুটিন সূচি', 'Weekly Schedule Outline')}</span>
          </div>
          {plan.schedule.map((day) => (
            <div key={day.dayIndex} className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">
                {t(day.dayNameBn, day.dayNameEn)}
              </span>
              <span className="text-muted-foreground truncate max-w-[140px] text-right">
                {t(day.focusBn, day.focusEn)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button
          onClick={() => onSelectActive(plan.slug)}
          className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            isActive
              ? 'bg-muted text-foreground border border-border hover:bg-muted/80'
              : 'bg-white/10 hover:bg-white/20 text-foreground border border-border'
          }`}
        >
          {isActive ? (
            <>
              <Check className="w-3.5 h-3.5 text-lime-brand" />
              <span>{t('সক্রিয় রয়েছে', 'Selected')}</span>
            </>
          ) : (
            <span>{t('রুটিন হিসেবে নিন', 'Set as Active')}</span>
          )}
        </button>

        <Link
          href={`/plans/${plan.slug}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider bg-lime-brand hover:bg-lime-hover text-ink-base transition-colors shadow-sm"
        >
          <span>{t('সম্পূর্ণ প্ল্যান দেখুন', 'View Full Routine')}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
