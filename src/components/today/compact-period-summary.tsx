'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/lib/language-context';
import { toBengaliDigits } from '@/lib/bengali-digits';
import { guestStorage } from '@/lib/guest-storage';
import {
  calculatePeriodSummary,
  type DailySummaryItem,
} from '@/lib/period-summary-math';
import { ArrowRight, BarChart2 } from 'lucide-react';

export function CompactPeriodSummary() {
  const { t, locale } = useLanguage();
  const isBn = locale === 'bn';
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  const [periodDays, setPeriodDays] = useState<1 | 3 | 7 | 30>(7);
  const [summaries, setSummaries] = useState<DailySummaryItem[]>([]);
  const [fallbackTargetKcal, setFallbackTargetKcal] = useState(2000);

  const loadGuestData = useCallback(() => {
    const guestSummaries = guestStorage.getPeriodDailySummaries(periodDays);
    const profile = guestStorage.getProfile();
    const bmr = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + (profile.gender === 'male' ? 5 : -161);
    const tdee = Math.round(bmr * 1.55);
    const calorieTarget = profile.customCalorieTarget || Math.max(1500, tdee - 500);

    setSummaries(guestSummaries);
    setFallbackTargetKcal(calorieTarget);
  }, [periodDays]);

  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated) {
      fetch(`/api/user/summaries?days=${periodDays}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (!isMounted) return;
          if (json?.success && json.data) {
            setSummaries(json.data.summaries || []);
            if (json.data.fallbackTargets?.calorieTarget) {
              setFallbackTargetKcal(json.data.fallbackTargets.calorieTarget);
            }
          }
        })
        .catch(() => {});
    } else {
      const timer = setTimeout(() => {
        if (isMounted) loadGuestData();
      }, 0);
      return () => clearTimeout(timer);
    }

    return () => {
      isMounted = false;
    };
  }, [periodDays, isAuthenticated, loadGuestData]);

  const summary = useMemo(() => {
    return calculatePeriodSummary({
      periodDays,
      summaries,
      fallbackTargetKcal,
    });
  }, [periodDays, summaries, fallbackTargetKcal]);

  const { loggedDaysCount, dailyAverage, percentOfTarget } = summary;

  // Formatting helpers
  const num = (val: number) => (isBn ? toBengaliDigits(val) : val);

  return (
    <div
      data-testid="compact-period-summary"
      className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
    >
      {/* Left: Switcher & Inline Summary */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Switcher Pills */}
        <div
          role="tablist"
          aria-label={t('সময়কাল নির্বাচন', 'Select period')}
          className="inline-flex items-center gap-0.5 p-0.5 bg-secondary rounded-full border border-border"
        >
          {(
            [
              { days: 1, labelBn: 'আজ', labelEn: 'Today' },
              { days: 3, labelBn: '৩ দিন', labelEn: '3d' },
              { days: 7, labelBn: '৭ দিন', labelEn: '7d' },
              { days: 30, labelBn: '৩০ দিন', labelEn: '30d' },
            ] as const
          ).map((item) => (
            <button
              key={item.days}
              type="button"
              role="tab"
              aria-selected={periodDays === item.days}
              onClick={() => setPeriodDays(item.days)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                periodDays === item.days
                  ? 'bg-lime-brand text-ink-base shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isBn ? item.labelBn : item.labelEn}
            </button>
          ))}
        </div>

        {/* Compact Summary Line */}
        <div className="font-semibold text-foreground flex items-center gap-1.5 flex-wrap">
          <BarChart2 className="w-3.5 h-3.5 text-lime-brand shrink-0" />
          <span>
            {loggedDaysCount === 0 ? (
              <span className="text-muted-foreground">
                {t('এই সময়ের কোনো লগ নেই', 'No logs recorded for this period')}
              </span>
            ) : (
              <>
                <span>
                  {periodDays === 1
                    ? t('আজকের মোট:', 'Today total:')
                    : isBn
                    ? `${num(periodDays)} দিনের গড়:`
                    : `${periodDays}d avg:`}{' '}
                  <strong className="text-foreground">{num(dailyAverage.calories)} kcal</strong>
                </span>
                <span className="text-muted-foreground">
                  ({t('লক্ষ্যের', '')} {num(percentOfTarget)}%)
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  {isBn
                    ? `${num(loggedDaysCount)} দিন লগ করা`
                    : `${loggedDaysCount}d logged`}
                </span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Right: Link to full summary on Progress tab */}
      <Link
        href="/progress"
        className="inline-flex items-center gap-1 text-[11px] font-bold text-lime-brand hover:underline self-end sm:self-center shrink-0 cursor-pointer"
      >
        <span>{t('বিস্তারিত সারাংশ', 'Full Summary')}</span>
        <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
