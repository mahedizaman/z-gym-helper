'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/language-context';
import { guestStorage, type DailyPlanPreferences } from '@/lib/guest-storage';
import { calculateDailyPlanSplit } from '@/server/services/exercise-burn-math';
import {
  Flame,
  Utensils,
  Target,
  AlertTriangle,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

interface DailyPlanCardProps {
  userWeightKg: number;
  userGender: 'male' | 'female';
  tdee: number;
  consumedKcal: number;
  burnedKcal: number;
  onTargetsAdjusted?: (dietTargetKcal: number, burnTargetKcal: number) => void;
}

export function DailyPlanCard({
  userWeightKg,
  userGender,
  tdee,
  consumedKcal,
  burnedKcal,
  onTargetsAdjusted,
}: DailyPlanCardProps) {
  const { t, locale } = useLanguage();
  const [prefs, setPrefs] = useState<DailyPlanPreferences>(() =>
    guestStorage.getDailyPlanPreferences()
  );
  const [showConfig, setShowConfig] = useState(false);

  // Compute 7-day summary reactively when burnedKcal changes
  const sevenDayData = useMemo(() => {
    if (burnedKcal < 0) return [];
    return guestStorage.getPast7DaysBurnSummary();
  }, [burnedKcal]);

  // Compute daily plan split
  const planMath = calculateDailyPlanSplit(
    tdee,
    prefs.weeklyGoalKg,
    prefs.splitRatio,
    userGender
  );

  const targetIntake = planMath.dietTargetKcal;
  const targetBurn = prefs.targetWorkoutBurnKcal || planMath.targetWorkoutBurnKcal;

  // Sync targets with parent if changed
  useEffect(() => {
    if (onTargetsAdjusted) {
      onTargetsAdjusted(targetIntake, targetBurn);
    }
  }, [targetIntake, targetBurn, onTargetsAdjusted]);

  const remainingToEat = targetIntake - consumedKcal;
  const remainingToBurn = Math.max(0, targetBurn - burnedKcal);
  const netCalories = consumedKcal - burnedKcal;

  const eatProgressPct = Math.min(100, Math.round((consumedKcal / Math.max(1, targetIntake)) * 100));
  const burnProgressPct = Math.min(100, Math.round((burnedKcal / Math.max(1, targetBurn)) * 100));

  const isBurnTargetAchieved = burnedKcal >= targetBurn && targetBurn > 0;

  const handleGoalChange = (weeklyGoalKg: number) => {
    const updated: DailyPlanPreferences = { ...prefs, weeklyGoalKg };
    setPrefs(updated);
    guestStorage.saveDailyPlanPreferences(updated);
  };

  const handleSplitChange = (splitRatio: number) => {
    const updated: DailyPlanPreferences = { ...prefs, splitRatio };
    setPrefs(updated);
    guestStorage.saveDailyPlanPreferences(updated);
  };

  // Projected 7-day weight change based on actual 7-day deficit/surplus
  const totalBurnedPast7Days = sevenDayData.reduce((acc, d) => acc + d.burnedKcal, 0);
  const avgBurnPerDay = Math.round(totalBurnedPast7Days / 7);

  // Projected weekly change from target deficit + avg burn
  const projectedWeeklyLossKg = Number(
    (((tdee - targetIntake + avgBurnPerDay) * 7) / 7700).toFixed(2)
  );

  return (
    <div className="rounded-3xl bg-card border-2 border-border p-6 sm:p-8 shadow-xl relative overflow-hidden">
      {/* Background celebration glow when burn target reached */}
      {isBurnTargetAchieved && (
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-lime-brand/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      )}

      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-soft border border-lime-brand/30 text-ink-base text-[11px] font-black uppercase tracking-wider mb-2">
            <Target className="w-3.5 h-3.5 text-ink-base" />
            <span>{t('আজকের হিসাব ও ব্যালেন্স', 'DAILY PLAN & BALANCE')}</span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-foreground">
            {t('দৈনিক ক্যালোরি লক্ষ্য ও অগ্রগতি', 'Daily Calorie & Workout Target')}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {t(
              `আপনার বর্তমান ওজন: ${userWeightKg} কেজি • ৭৭০০ ক্যালোরি ঘাটতি = ১ কেজি চর্বি হ্রাস। খাবার ও ব্যায়ামের সুষম বণ্টন।`,
              `Your current weight: ${userWeightKg} kg • 7,700 kcal deficit ≈ 1 kg fat loss. Balanced diet and workout plan.`
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowConfig(!showConfig)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground border border-border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer self-start sm:self-auto shadow-sm"
        >
          <Sliders className="w-3.5 h-3.5 text-lime-brand" />
          <span>{showConfig ? t('সেটিংস লুকান', 'Hide Settings') : t('প্ল্যান কাস্টমাইজ', 'Customize Plan')}</span>
        </button>
      </div>

      {/* Plan Customizer Drawer (Collapsible) */}
      <AnimatePresence>
        {showConfig && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-b border-border/80 pb-6 mb-6 pt-5"
          >
            <div className="bg-secondary/40 rounded-2xl p-4 sm:p-5 border border-border/80 space-y-5">
              {/* Weekly Goal Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                  {t('সাপ্তাহিক লক্ষ্য বেছে নিন', 'Choose Weekly Goal')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  {[
                    { labelBn: 'ওজন বজায়', labelEn: 'Maintain', val: 0 },
                    { labelBn: '০.২৫ কেজি হ্রাস', labelEn: '-0.25 kg/wk', val: -0.25 },
                    { labelBn: '০.৫ কেজি হ্রাস', labelEn: '-0.50 kg/wk', val: -0.5 },
                    { labelBn: '০.৭৫ কেজি হ্রাস', labelEn: '-0.75 kg/wk', val: -0.75 },
                    { labelBn: '০.২৫ কেজি বৃদ্ধি', labelEn: '+0.25 kg/wk', val: 0.25 },
                    { labelBn: '০.৫০ কেজি বৃদ্ধি', labelEn: '+0.50 kg/wk', val: 0.5 },
                  ].map((g) => {
                    const active = prefs.weeklyGoalKg === g.val;
                    return (
                      <button
                        key={g.val}
                        type="button"
                        onClick={() => handleGoalChange(g.val)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          active
                            ? 'bg-lime-brand text-ink-base border-lime-brand shadow-sm font-extrabold'
                            : 'bg-card text-foreground border-border hover:bg-secondary'
                        }`}
                      >
                        {locale === 'bn' ? g.labelBn : g.labelEn}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Eat Less vs Burn More Split */}
              {prefs.weeklyGoalKg < 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                      {t('ঘাটতি বণ্টন: খাবার কমানো বনাম ব্যায়াম', 'Deficit Split: Eat Less vs Burn More')}
                    </label>
                    <span className="text-xs font-bold text-lime-brand">
                      {Math.round(prefs.splitRatio * 100)}% {t('খাবার', 'Diet')} / {Math.round((1 - prefs.splitRatio) * 100)}% {t('ব্যায়াম', 'Workout')}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: '70% / 30% (Best)', val: 0.7 },
                      { label: '50% / 50%', val: 0.5 },
                      { label: '80% / 20%', val: 0.8 },
                      { label: '100% / 0%', val: 1.0 },
                    ].map((s) => (
                      <button
                        key={s.val}
                        type="button"
                        onClick={() => handleSplitChange(s.val)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          Math.abs(prefs.splitRatio - s.val) < 0.05
                            ? 'bg-foreground text-background border-foreground font-black'
                            : 'bg-card text-muted-foreground border-border hover:text-foreground'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Clinical safe floor alert */}
              {planMath.isFloorEnforced && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-tomato-brand/10 text-tomato-brand border border-tomato-brand/20 text-xs font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    {t(
                      `ক্লিনিক্যাল সুরক্ষা সীমা সক্রিয়: ${userGender === 'female' ? '১২০০' : '১৫০০'} ক্যালোরির নিচে খাদ্য বাজেট দেওয়া হয় না।`,
                      `Clinical floor enforced: daily food intake is clamped at ${planMath.safeFloor} kcal for metabolic health.`
                    )}
                  </span>
                </div>
              )}

              {planMath.isUnsafePace && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-tomato-brand/10 text-tomato-brand border border-tomato-brand/20 text-xs font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    {t(
                      'সপ্তাহে ১ কেজির বেশি ওজন কমানোর গতি অস্বাস্থ্যকর ও পেশিক্ষয়ের ঝুঁকিপূর্ণ।',
                      'Projected loss greater than 1 kg/week is aggressive and carries muscle catabolism risk.'
                    )}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Dual Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Box 1: Calories to EAT today */}
        <div className="p-6 rounded-2xl bg-secondary/30 border border-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-lime-soft text-ink-base flex items-center justify-center font-bold">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-foreground block">
                    {t('খাদ্য ক্যালোরি বাজেট', 'CALORIES TO EAT')}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {t('লক্ষ্য অনুযায়ী মোট অনুমোদিত', 'Target daily intake')}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-display font-black text-2xl text-foreground block">
                  {consumedKcal}
                </span>
                <span className="text-[11px] text-muted-foreground font-semibold">
                  / {targetIntake} kcal
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full mt-4 h-3.5 rounded-full bg-secondary overflow-hidden p-0.5 border border-border/60">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${eatProgressPct}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  consumedKcal > targetIntake ? 'bg-tomato-brand' : 'bg-lime-brand'
                }`}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-bold mt-3">
              <span className="text-muted-foreground">
                {t('বাকি বাজেট:', 'Remaining:')}{' '}
                <strong
                  className={remainingToEat >= 0 ? 'text-lime-brand' : 'text-tomato-brand'}
                >
                  {remainingToEat >= 0 ? `${remainingToEat} kcal` : `${Math.abs(remainingToEat)} kcal বেশি`}
                </strong>
              </span>
              <span className="text-muted-foreground font-semibold">
                {eatProgressPct}% {t('পূর্ণ', 'hit')}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/50 text-[11px] text-muted-foreground">
            {remainingToEat > 200 ? (
              <span>{t('পর্যাপ্ত খাদ্য বাজেট অবশিষ্ট আছে। পুষ্টিকর খাবার গ্রহণ করুন।', 'Plenty of budget remaining for nutritious meals.')}</span>
            ) : remainingToEat >= 0 ? (
              <span className="text-lime-brand font-bold">{t('লক্ষ্যের একদম কাছাকাছি আছেন!', 'Right on track near your target!')}</span>
            ) : (
              <span className="text-tomato-brand font-bold">{t('আজকের বাজেট অতিক্রম করেছে। ব্যায়াম করে ব্যালেন্স করতে পারেন।', 'Over budget. You can offset this with extra activity.')}</span>
            )}
          </div>
        </div>

        {/* Box 2: Calories to BURN today */}
        <div className="p-6 rounded-2xl bg-secondary/30 border border-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-tomato-brand/10 text-tomato-brand flex items-center justify-center font-bold">
                  <Flame className="w-4 h-4 fill-tomato-brand" />
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-foreground block">
                    {t('ব্যায়ামে বার্ন লক্ষ্য', 'CALORIES TO BURN')}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {t('নেট অতিরিক্ত ক্যালোরি ব্যয়', 'Net workout calorie burn')}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-display font-black text-2xl text-tomato-brand block">
                  {burnedKcal}
                </span>
                <span className="text-[11px] text-muted-foreground font-semibold">
                  / {targetBurn} kcal
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full mt-4 h-3.5 rounded-full bg-secondary overflow-hidden p-0.5 border border-border/60">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${burnProgressPct}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  isBurnTargetAchieved ? 'bg-lime-brand' : 'bg-tomato-brand'
                }`}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-bold mt-3">
              <span className="text-muted-foreground">
                {t('বাকি বার্ন:', 'Remaining:')}{' '}
                <strong
                  className={remainingToBurn === 0 ? 'text-lime-brand' : 'text-foreground'}
                >
                  {remainingToBurn} kcal
                </strong>
              </span>
              <span className="text-muted-foreground font-semibold">
                {burnProgressPct}% {t('সম্পন্ন', 'done')}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/50 text-[11px]">
            {isBurnTargetAchieved ? (
              <div className="flex items-center gap-1.5 text-lime-brand font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{t('চমৎকার! আজকের ব্যায়াম লক্ষ্য সফলভাবে সম্পন্ন হয়েছে!', 'Goal unlocked! Daily workout target achieved!')}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">
                {t(
                  `আর ${remainingToBurn} kcal বার্ন করতে ৩০ মিনিট দ্রুত হাঁটা বা ২০ মিনিট জগিং করুন।`,
                  `Need ${remainingToBurn} kcal more to complete today's workout goal.`
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Net Calories Strip & 7-Day Mini Chart */}
      <div className="mt-6 pt-6 border-t border-border grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Net Calories Today */}
        <div className="lg:col-span-5 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            {t('আজকের নেট ক্যালোরি (গ্রহণ - ব্যয়)', 'Net Energy Today (Eaten - Burned)')}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-black text-3xl sm:text-4xl text-foreground">
              {netCalories}
            </span>
            <span className="text-xs text-muted-foreground font-bold">
              kcal ({consumedKcal} in - {burnedKcal} out)
            </span>
          </div>
          <div className="flex items-center gap-2 pt-1 text-xs">
            {prefs.weeklyGoalKg < 0 ? (
              <div className="space-y-0.5">
                <span className="text-lime-brand font-bold flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" />
                  {t('চর্বি কমানোর অনুকূলে ঘাটতি বজায় আছে', 'Deficit on track for fat loss')}
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  {t(
                    `বিগত ৭ দিনের গড় অনুযায়ী প্রক্ষেপিত পরিবর্তন: ~${projectedWeeklyLossKg} কেজি/সপ্তাহ`,
                    `Projected change: ~${projectedWeeklyLossKg} kg/week based on 7-day average`
                  )}
                </span>
              </div>
            ) : prefs.weeklyGoalKg > 0 ? (
              <span className="text-tomato-brand font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                {t('পেশি বৃদ্ধির জন্য ক্যালোরি উদ্বৃত্ত', 'Surplus active for muscle gain')}
              </span>
            ) : (
              <span className="text-muted-foreground font-bold">
                {t('ওজন স্থিতিশীল রাখার বাজেট', 'Maintenance equilibrium')}
              </span>
            )}
          </div>
        </div>

        {/* 7-Day Mini Chart */}
        <div className="lg:col-span-7 bg-secondary/30 rounded-2xl p-4 border border-border/80">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold uppercase tracking-wider text-muted-foreground">
              {t('বিগত ৭ দিনের ব্যায়াম বার্ন (kcal)', 'Past 7 Days Workout Burn (kcal)')}
            </span>
            <span className="text-[11px] font-bold text-lime-brand">
              {t('দৈনিক গড়:', 'Daily Avg:')} {avgBurnPerDay} kcal
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 items-end h-20 pt-2">
            {sevenDayData.map((d) => {
              const heightPct = Math.min(100, Math.max(12, Math.round((d.burnedKcal / Math.max(1, targetBurn * 1.2)) * 100)));
              return (
                <div key={d.date} className="flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {d.burnedKcal > 0 ? d.burnedKcal : '-'}
                  </span>
                  <div className="w-full bg-secondary rounded-t-lg overflow-hidden h-10 flex items-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${d.burnedKcal > 0 ? heightPct : 0}%` }}
                      transition={{ duration: 0.4 }}
                      className={`w-full rounded-t-md ${
                        d.isToday ? 'bg-lime-brand' : d.burnedKcal >= targetBurn ? 'bg-tomato-brand' : 'bg-muted-foreground/40'
                      }`}
                    />
                  </div>
                  <span className={`text-[10px] font-black uppercase ${d.isToday ? 'text-lime-brand font-black' : 'text-muted-foreground'}`}>
                    {locale === 'bn' ? d.dayLabelBn : d.dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Post-workout Nutrition Advice Badge if workout logged today */}
      {burnedKcal > 0 && (
        <div className="mt-6 p-4 rounded-2xl bg-lime-soft border border-lime-brand/30 text-ink-base flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-ink-base shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-black uppercase tracking-wider block">
              {t('পোস্ট-ওয়ার্কআউট প্রস্তাবনা (Post-Workout Recovery)', 'Post-Workout Fuel Tip')}
            </span>
            <p className="mt-0.5 leading-relaxed font-medium">
              {t(
                `আজকে ${burnedKcal} kcal বার্ন সম্পন্ন হয়েছে! পেশি পুনরুদ্ধার ও গ্লাইকোজেন রিফিলে ২০-৩০ গ্রাম প্রোটিন (যেমন: ৩-৪টি ডিম বা মুরগির মাংস) এবং ৩০-৪০ গ্রাম জটিল কার্ব গ্রহণ করুন।`,
                `You burned ${burnedKcal} kcal today! Aim for 20-30g protein and 30-40g carbs within 1-2 hours to optimize muscle recovery.`
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
