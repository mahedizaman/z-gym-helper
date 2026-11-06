'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/lib/language-context';
import { toBengaliDigits } from '@/lib/bengali-digits';
import { guestStorage } from '@/lib/guest-storage';
import {
  calculatePeriodSummary,
  type DailySummaryItem,
  type PeriodWeightLog,
} from '@/lib/period-summary-math';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  Sparkles,
  Calendar,
  Flame,
  Info,
  Activity,
  Scale,
} from 'lucide-react';

interface PeriodSummaryCardProps {
  initialPeriod?: 1 | 3 | 7 | 30;
  className?: string;
}

export function PeriodSummaryCard({
  initialPeriod = 7,
  className = '',
}: PeriodSummaryCardProps) {
  const { t, locale } = useLanguage();
  const isBn = locale === 'bn';
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  const [periodDays, setPeriodDays] = useState<1 | 3 | 7 | 30>(initialPeriod);
  const [summaries, setSummaries] = useState<DailySummaryItem[]>([]);
  const [weightLogs, setWeightLogs] = useState<PeriodWeightLog[]>([]);
  const [fallbackTargets, setFallbackTargets] = useState({
    calorieTarget: 2000,
    proteinTarget: 100,
    burnTarget: 300,
  });

  // Load guest data locally
  const loadGuestData = useCallback(() => {
    const guestSummaries = guestStorage.getPeriodDailySummaries(periodDays);
    const profile = guestStorage.getProfile();
    // Calculate fallback targets from guest profile
    const bmr = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + (profile.gender === 'male' ? 5 : -161);
    const tdee = Math.round(bmr * 1.55);
    const calorieTarget = profile.customCalorieTarget || Math.max(1500, tdee - 500);
    const proteinTarget = Math.round(profile.weightKg * 1.6);

    setSummaries(guestSummaries);
    setFallbackTargets({
      calorieTarget,
      proteinTarget,
      burnTarget: 300,
    });
  }, [periodDays]);

  // Fetch summaries for logged-in users or fall back to guest storage
  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated) {
      fetch(`/api/user/summaries?days=${periodDays}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (!isMounted) return;
          if (json?.success && json.data) {
            setSummaries(json.data.summaries || []);
            setWeightLogs(json.data.weightLogs || []);
            if (json.data.fallbackTargets) {
              setFallbackTargets(json.data.fallbackTargets);
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

  // Compute domain math
  const summaryResult = useMemo(() => {
    return calculatePeriodSummary({
      periodDays,
      summaries,
      weightLogs,
      fallbackTargetKcal: fallbackTargets.calorieTarget,
      fallbackTargetProtein: fallbackTargets.proteinTarget,
      fallbackTargetBurn: fallbackTargets.burnTarget,
    });
  }, [periodDays, summaries, weightLogs, fallbackTargets]);

  const {
    loggedDaysCount,
    isLowLogging,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    totalFiber,
    totalBurn,
    loggedTargetKcal,
    dailyAverage,
    diffKcal,
    percentOfTarget,
    netBalanceKcal,
    estimatedWeightChangeKg,
    realWeightChangeKg,
    chartData,
    insights,
  } = summaryResult;

  // Formatting helpers
  const num = (val: number) => (isBn ? toBengaliDigits(val) : val);

  return (
    <div
      className={`p-6 sm:p-8 rounded-3xl bg-card border-2 border-border shadow-xl space-y-6 relative overflow-hidden ${className}`}
      data-testid="period-summary-card"
    >
      {/* Glow accent */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-lime-brand/5 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Header & Period Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-lime-brand">
            <Activity className="w-3.5 h-3.5" />
            <span>{t('সারাংশ ও অগ্রগতি বিশ্লেষণ', 'Summary & Analytics')}</span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-foreground mt-0.5">
            {t('সময়ভিত্তিক সারাংশ', 'Period Summary')}
          </h2>
        </div>

        {/* Period Switcher Pills: আজ · ৩ দিন · ৭ দিন · ৩০ দিন */}
        <div
          role="tablist"
          aria-label={t('সময় নির্বাচন', 'Select Period')}
          className="inline-flex items-center gap-1 p-1 bg-secondary rounded-full border border-border self-start sm:self-auto"
        >
          {(
            [
              { days: 1, labelBn: 'আজ', labelEn: 'Today' },
              { days: 3, labelBn: '৩ দিন', labelEn: '3 Days' },
              { days: 7, labelBn: '৭ দিন', labelEn: '7 Days' },
              { days: 30, labelBn: '৩০ দিন', labelEn: '30 Days' },
            ] as const
          ).map((item) => (
            <button
              key={item.days}
              type="button"
              role="tab"
              aria-selected={periodDays === item.days}
              onClick={() => setPeriodDays(item.days)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                periodDays === item.days
                  ? 'bg-lime-brand text-ink-base shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isBn ? item.labelBn : item.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Logging Indicator Pill & Rule Disclaimer */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-secondary/40 p-3 rounded-2xl border border-border/80">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-lime-brand shrink-0" />
          <span className="font-bold text-foreground">
            {isBn
              ? `${toBengaliDigits(periodDays)} দিনের মধ্যে ${toBengaliDigits(loggedDaysCount)} দিন লগ করা হয়েছে`
              : `${loggedDaysCount} of ${periodDays} days logged`}
          </span>
        </div>
        <div className="text-[11px] text-muted-foreground">
          {t(
            'গড় শুধুমাত্র যে দিনগুলোতে খাবার লগ করা হয়েছে তার ওপর ভিত্তি করে',
            'Averages are calculated over logged days only'
          )}
        </div>
      </div>

      {/* Gentle hint if fewer than half the days are logged (No shaming!) */}
      {isLowLogging && (
        <div
          data-testid="low-logging-notice"
          className="p-3.5 rounded-2xl bg-secondary/80 border border-lime-brand/30 flex items-center gap-2.5 text-xs text-foreground"
        >
          <Info className="w-4 h-4 text-lime-brand shrink-0" />
          <span>
            {t(
              'পর্যাপ্ত তথ্যের জন্য আরও কয়েক দিন লগ করুন (কম তথ্যের ওপর ভিত্তি করে হিসাব করা হয়েছে)।',
              'Average is based on limited data. Keep logging for more complete insights.'
            )}
          </span>
        </div>
      )}

      {/* Key Metrics Grid: Totals alongside Daily Averages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Calories (Intake vs Target) */}
        <div className="rounded-3xl border border-border bg-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t('ক্যালরি গ্রহণ', 'Calorie Intake')}
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-secondary text-foreground">
              {t('লক্ষ্যের', '')} {num(percentOfTarget)}%
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-black text-2xl sm:text-3xl text-foreground">
              {num(dailyAverage.calories)}
            </span>
            <span className="text-xs font-semibold text-muted-foreground">
              {t('kcal / দিন (গড়)', 'kcal / day (avg)')}
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground border-t border-border/60 pt-2 space-y-0.5">
            <div className="flex justify-between">
              <span>{t('মোট গৃহীত:', 'Total eaten:')}</span>
              <span className="font-semibold text-foreground">{num(totalCalories)} kcal</span>
            </div>
            <div className="flex justify-between">
              <span>{t('পিরিয়ড লক্ষ্য:', 'Period target:')}</span>
              <span className="font-semibold text-foreground">{num(loggedTargetKcal)} kcal</span>
            </div>
            <div className="flex justify-between">
              <span>{t('দৈনিক লক্ষ্য:', 'Daily target:')}</span>
              <span className="font-semibold text-foreground">{num(dailyAverage.targetKcal)} kcal</span>
            </div>
            <div className="flex justify-between">
              <span>{t('পার্থক্য:', 'Difference:')}</span>
              <span className="font-semibold text-foreground">
                {diffKcal > 0 ? `+${num(diffKcal)}` : num(diffKcal)} kcal
              </span>
            </div>
          </div>
        </div>

        {/* 2. Protein & Fiber */}
        <div className="rounded-3xl border border-border bg-card p-5 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('প্রোটিন ও আঁশ (ফাইবার)', 'Protein & Fiber')}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-black text-2xl sm:text-3xl text-lime-brand">
              {num(dailyAverage.protein)}g
            </span>
            <span className="text-xs font-semibold text-muted-foreground">
              {t('/ দিন প্রোটিন', '/ day protein')}
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground border-t border-border/60 pt-2 space-y-0.5">
            <div className="flex justify-between">
              <span>{t('মোট প্রোটিন:', 'Total protein:')}</span>
              <span className="font-semibold text-foreground">{num(totalProtein)}g</span>
            </div>
            <div className="flex justify-between">
              <span>{t('দৈনিক আঁশ (গড়):', 'Daily fiber (avg):')}</span>
              <span className="font-semibold text-foreground">{num(dailyAverage.fiber)}g</span>
            </div>
            <div className="flex justify-between">
              <span>{t('মোট আঁশ:', 'Total fiber:')}</span>
              <span className="font-semibold text-foreground">{num(totalFiber)}g</span>
            </div>
          </div>
        </div>

        {/* 3. Extra Workout Burn & Carbs/Fat */}
        <div className="rounded-3xl border border-border bg-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t('ব্যায়াম বার্ন', 'Exercise Burn')}
            </span>
            <Flame className="w-4 h-4 text-tomato-base" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-black text-2xl sm:text-3xl text-tomato-base">
              {num(totalBurn)}
            </span>
            <span className="text-xs font-semibold text-muted-foreground">
              {t('kcal মোট বার্ন', 'kcal total burn')}
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground border-t border-border/60 pt-2 space-y-0.5">
            <div className="flex justify-between">
              <span>{t('দৈনিক বার্ন (গড়):', 'Daily burn (avg):')}</span>
              <span className="font-semibold text-foreground">{num(dailyAverage.burn)} kcal</span>
            </div>
            <div className="flex justify-between">
              <span>{t('শর্করা মোট (গড়):', 'Carbs total (avg):')}</span>
              <span className="font-semibold text-foreground">{num(totalCarbs)}g ({num(dailyAverage.carbs)}g)</span>
            </div>
            <div className="flex justify-between">
              <span>{t('চর্বি মোট (গড়):', 'Fat total (avg):')}</span>
              <span className="font-semibold text-foreground">{num(totalFat)}g ({num(dailyAverage.fat)}g)</span>
            </div>
          </div>
        </div>

        {/* 4. Net Energy Balance & Estimated Weight Change */}
        <div className="rounded-3xl border border-border bg-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t('নেট ব্যালেন্স ও ওজন', 'Net Balance & Weight')}
            </span>
            <Scale className="w-4 h-4 text-lime-brand" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`font-display font-black text-2xl sm:text-3xl ${
                netBalanceKcal < 0 ? 'text-lime-brand' : 'text-foreground'
              }`}
            >
              {netBalanceKcal > 0 ? `+${num(netBalanceKcal)}` : num(netBalanceKcal)}
            </span>
            <span className="text-xs font-semibold text-muted-foreground">
              {t('kcal ব্যালেন্স', 'kcal net')}
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground border-t border-border/60 pt-2 space-y-0.5">
            <div className="flex justify-between items-center">
              <span>{t('আনুমানিক ওজন বদল:', 'Est. weight delta:')}</span>
              <span className="font-bold text-foreground">
                {estimatedWeightChangeKg > 0 ? `+${num(estimatedWeightChangeKg)}` : num(estimatedWeightChangeKg)} kg
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>{t('লগ করা আসল ওজন বদল:', 'Real weight delta:')}</span>
              <span className="font-bold text-lime-brand">
                {realWeightChangeKg !== null
                  ? `${realWeightChangeKg > 0 ? `+${num(realWeightChangeKg)}` : num(realWeightChangeKg)} kg`
                  : t('রেকর্ড নেই', 'No log')}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground/80 pt-0.5">
              {t('* ৭,৭০০ kcal = ১ কেজি (আনুমানিক হিসাব)', '* 7,700 kcal = 1 kg estimate')}
            </p>
          </div>
        </div>
      </div>

      {/* Recharts Bar Chart: Daily Calorie Intake vs Target Line */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              {t('প্রতিদিনের ক্যালরি গ্রহণ বনাম লক্ষ্য', 'Daily Calories vs Target')}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {t(
                'প্রতিদিনের খাওয়া ক্যালরি এবং নির্দিষ্ট দৈনিক টার্গেটের তুলনা',
                'Comparison of daily intake against target line'
              )}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-lime-brand inline-block" />
              <span>{t('খাদ্য ক্যালরি', 'Calories Eaten')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 border-t-2 border-dashed border-muted-foreground inline-block" />
              <span>{t('লক্ষ্য মাত্রা', 'Target Line')}</span>
            </div>
          </div>
        </div>

        <div className="h-60 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 12, right: 10, left: -22, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#8E959D" opacity={0.15} />
              <XAxis
                dataKey={isBn ? 'labelBn' : 'labelEn'}
                stroke="#8E959D"
                fontSize={11}
                tickLine={false}
              />
              <YAxis stroke="#8E959D" fontSize={11} tickLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 rounded-2xl bg-ink-base border border-lime-brand text-white text-xs shadow-xl space-y-1">
                        <p className="font-bold text-lime-brand">
                          {isBn ? data.labelBn : data.labelEn} ({data.date})
                        </p>
                        <p>
                          {t('খাওয়া হয়েছে:', 'Eaten:')}{' '}
                          <span className="font-bold">{num(data.eatenKcal)} kcal</span>
                        </p>
                        <p>
                          {t('টার্গেট:', 'Target:')}{' '}
                          <span className="font-bold">{num(data.targetKcal)} kcal</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {data.isLogged
                            ? t('লগ করা হয়েছে ✓', 'Logged ✓')
                            : t('লগ করা হয়নি', 'Not logged')}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={dailyAverage.targetKcal || fallbackTargets.calorieTarget}
                stroke="#8E959D"
                strokeDasharray="4 4"
                label={{
                  value: t('টার্গেট', 'Target'),
                  position: 'insideTopRight',
                  fill: '#8E959D',
                  fontSize: 10,
                }}
              />
              <Bar
                dataKey="eatenKcal"
                fill="#A9F26B"
                radius={[6, 6, 0, 0]}
                name={t('খাদ্য ক্যালরি', 'Calories Eaten')}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2 Plain-Language Insights Computed from Real Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-lime-brand shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-foreground">
              {isBn ? insights.bn[0] : insights.en[0]}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-tomato-base shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-foreground">
              {isBn ? insights.bn[1] : insights.en[1]}
            </span>
          </div>
        </div>
      </div>

      {/* Honest "Estimates Only" Disclaimer */}
      <div className="text-[11px] text-muted-foreground text-center border-t border-border/70 pt-3">
        {t(
          'সকল সংখ্যা ও হিসাব আনুমানিক গাইডলাইন হিসেবে তৈরি, ক্লিনিক্যাল পরিমাপ নয়।',
          'All numbers and calculations are unverified estimates for general wellness, not clinical measurements.'
        )}
      </div>
    </div>
  );
}
