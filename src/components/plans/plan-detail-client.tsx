'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  ExternalLink,
  Timer,
  Zap,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { SeedPlan, SeedPlanExercise } from '@/server/seeds/plans.data';
import { getExerciseImages } from '@/server/seeds/exercise-images.data';
import { guestStorage } from '@/lib/guest-storage';
import { RestTimer } from '@/components/workout/rest-timer';

interface PlanDetailClientProps {
  plan: SeedPlan;
}

export function PlanDetailClient({ plan }: PlanDetailClientProps) {
  const { t } = useLanguage();
  const [activeDayIndex, setActiveDayIndex] = useState(1);
  const [isActiveRoutine, setIsActiveRoutine] = useState<boolean>(() => {
    return guestStorage.getActivePlanSlug() === plan.slug;
  });
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>(() => {
    return guestStorage.getPlanProgress(plan.slug);
  });

  // Rest Timer state
  const [timerOpen, setTimerOpen] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(90);
  const [timerExerciseName, setTimerExerciseName] = useState('');

  const toggleActiveRoutine = () => {
    const next = !isActiveRoutine;
    setIsActiveRoutine(next);
    guestStorage.setActivePlanSlug(next ? plan.slug : null);
  };

  const toggleExerciseComplete = (exerciseKey: string) => {
    const updated = guestStorage.togglePlanExerciseProgress(plan.slug, exerciseKey);
    setCompletedExercises({ ...updated });
  };

  const handleStartRestTimer = (ex: SeedPlanExercise) => {
    setTimerSeconds(ex.restSeconds || 90);
    setTimerExerciseName(ex.nameBn);
    setTimerOpen(true);
  };

  const currentSchedule =
    plan.schedule.find((s) => s.dayIndex === activeDayIndex) || plan.schedule[0];

  const totalExercisesForDay = currentSchedule.exercises.length;
  const completedCountForDay = currentSchedule.exercises.filter((ex, idx) => {
    const key = `day_${currentSchedule.dayIndex}_ex_${idx}_${ex.exerciseSlug}`;
    return !!completedExercises[key];
  }).length;

  const isDayFinished =
    totalExercisesForDay > 0 && completedCountForDay === totalExercisesForDay;

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/plans"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>{t('সব ওয়ার্কআউট প্ল্যান', 'Back to All Workout Plans')}</span>
        </Link>

        <button
          onClick={toggleActiveRoutine}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            isActiveRoutine
              ? 'bg-lime-brand text-ink-base shadow-md'
              : 'bg-card border border-border text-foreground hover:border-lime-brand/50'
          }`}
        >
          <Check className="w-4 h-4 stroke-3" />
          <span>
            {isActiveRoutine
              ? t('সক্রিয় রুটিন হিসেবে নির্বাচিত', 'Active Routine Selected')
              : t('সক্রিয় রুটিন হিসেবে নির্বাচন করুন', 'Set as Active Routine')}
          </span>
        </button>
      </div>

      {/* Plan Header Card */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-ink-base text-white dark:bg-white dark:text-ink-base">
            {t(`সপ্তাহে ${plan.daysPerWeek} দিন`, `${plan.daysPerWeek} Days/Week`)}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground border border-border capitalize">
            {plan.splitType.replace('_', ' ')}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-lime-soft text-ink-base border border-lime-brand/30 capitalize">
            {plan.level}
          </span>
        </div>

        <div>
          <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-foreground">
            {plan.nameBn}
          </h1>
          <p className="text-base sm:text-lg font-medium text-muted-foreground mt-1">
            {plan.nameEn}
          </p>
        </div>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-4xl">
          {t(plan.descriptionBn, plan.descriptionEn)}
        </p>
      </div>

      {/* Day Selector Pill Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {plan.schedule.map((day) => {
            const isActive = day.dayIndex === activeDayIndex;
            return (
              <button
                key={day.dayIndex}
                onClick={() => setActiveDayIndex(day.dayIndex)}
                className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-2 border ${
                  isActive
                    ? 'bg-lime-brand text-ink-base border-lime-brand shadow-lg scale-[1.02]'
                    : 'bg-card border-border text-foreground hover:border-lime-brand/40'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>{t(day.dayNameBn, day.dayNameEn)}</span>
              </button>
            );
          })}
        </div>

        {/* Day Focus & Completion Summary Bar */}
        <div className="rounded-2xl border border-border bg-card/60 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-lime-soft text-ink-base flex items-center justify-center font-bold shrink-0">
              <Zap className="w-5 h-5 text-ink-base" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-semibold">
                {t('টার্গেট পেশি ও ফোকাস:', 'Target Muscles & Focus:')}
              </div>
              <div className="font-display font-bold text-base text-foreground">
                {t(currentSchedule.focusBn, currentSchedule.focusEn)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-right">
              <span className="font-bold text-foreground">
                {completedCountForDay} / {totalExercisesForDay}
              </span>{' '}
              <span className="text-muted-foreground">{t('ব্যায়াম সম্পন্ন', 'Completed')}</span>
            </div>
            {isDayFinished && (
              <span className="px-3 py-1 rounded-full bg-lime-brand text-ink-base text-xs font-bold flex items-center gap-1 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t('দিনের লক্ষ্য পূরণ!', 'Day Done!')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Exercises List for Selected Day */}
      <div className="space-y-4">
        {currentSchedule.exercises.map((ex, idx) => {
          const exerciseKey = `day_${currentSchedule.dayIndex}_ex_${idx}_${ex.exerciseSlug}`;
          const isCompleted = !!completedExercises[exerciseKey];
          const images = getExerciseImages(ex.exerciseSlug);
          const thumb = images[0];

          return (
            <div
              key={exerciseKey}
              className={`rounded-3xl border transition-all duration-200 p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                isCompleted
                  ? 'bg-muted/40 border-lime-brand/40 opacity-80'
                  : 'bg-card border-border hover:border-lime-brand/40 shadow-sm'
              }`}
            >
              {/* Left: Thumbnail & Name */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleExerciseComplete(exerciseKey)}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer border ${
                    isCompleted
                      ? 'bg-lime-brand border-lime-brand text-ink-base shadow-sm'
                      : 'border-muted-foreground/40 hover:border-lime-brand bg-card'
                  }`}
                  aria-label="Toggle exercise completion"
                >
                  {isCompleted && <Check className="w-4 h-4 stroke-3" />}
                </button>

                {thumb && (
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-muted shrink-0 border border-border">
                    <Image
                      src={thumb}
                      alt={ex.nameEn}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">
                      #{idx + 1}
                    </span>
                    <Link
                      href={`/exercises/${ex.exerciseSlug}`}
                      className="font-display font-black text-lg sm:text-xl text-foreground hover:text-lime-brand transition-colors inline-flex items-center gap-1 group"
                    >
                      <span>{ex.nameBn}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {ex.nameEn}
                  </p>
                </div>
              </div>

              {/* Right: Sets, Reps, Rest, and Guide Link */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 self-end sm:self-center">
                {/* Sets & Reps Badge */}
                <div className="px-3.5 py-1.5 rounded-full bg-muted border border-border text-xs font-bold text-foreground">
                  <span>{ex.sets} {t('সেটস', 'Sets')}</span> × <span>{ex.reps} {t('রেপস', 'Reps')}</span>
                </div>

                {/* Rest duration timer launcher */}
                <button
                  onClick={() => handleStartRestTimer(ex)}
                  className="px-3.5 py-1.5 rounded-full bg-lime-soft hover:bg-lime-brand text-ink-base text-xs font-bold transition-all flex items-center gap-1.5 border border-lime-brand/30 shadow-xs cursor-pointer"
                  title={t('রেস্ট টাইমার চালু করুন', 'Launch Rest Timer')}
                >
                  <Timer className="w-3.5 h-3.5" />
                  <span>{ex.restSeconds}s {t('রেস্ট', 'Rest')}</span>
                </button>

                {/* Direct Link to Guide */}
                <Link
                  href={`/exercises/${ex.exerciseSlug}`}
                  className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title={t('ফর্ম গাইড দেখুন', 'View Form Guide')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Rest Timer Widget */}
      <RestTimer
        initialSeconds={timerSeconds}
        isOpen={timerOpen}
        onClose={() => setTimerOpen(false)}
        exerciseName={timerExerciseName}
      />
    </div>
  );
}
