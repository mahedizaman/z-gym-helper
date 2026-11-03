'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import {
  guestStorage,
  type GuestDayMeals,
  type GuestMealItem,
  type MealSlotKey,
  type GuestProfile,
  type GuestExerciseBurn,
} from '@/lib/guest-storage';
import {
  calculateBMR,
  calculateTDEE,
  calculateCaloricTarget,
  calculateMacroSplit,
  estimateWeightChange,
  calculateDailyBalance,
} from '@/server/services/calculations';
import { type SeedFood } from '@/server/seeds/generate-foods';
import { FoodPickerModal } from '@/components/calculator/food-picker-modal';
import { ProfileTargetModal } from '@/components/calculator/profile-target-modal';
import { ExerciseBurnSection } from '@/components/calculator/exercise-burn-section';
import {
  Calculator,
  Sliders,
  Plus,
  Trash2,
  Zap,
  Dumbbell,
  Clock,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';

export default function CalculatorPage() {
  const { t, locale } = useLanguage();
  const [profile, setProfile] = useState<GuestProfile>(() => guestStorage.getProfile());
  const [dayMeals, setDayMeals] = useState<GuestDayMeals>(() => guestStorage.getMeals());
  const [exerciseBurns, setExerciseBurns] = useState<GuestExerciseBurn[]>(() =>
    guestStorage.getExerciseBurns()
  );

  const [activeSlotModal, setActiveSlotModal] = useState<MealSlotKey | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Compute Targets
  const bmr = calculateBMR(
    profile.weightKg,
    profile.heightCm,
    profile.age,
    profile.gender
  );
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const targetKcal = calculateCaloricTarget(tdee, profile.goal, profile.gender);
  const targetMacros = calculateMacroSplit(
    targetKcal,
    profile.weightKg,
    profile.goal
  );

  // Compute Consumed Totals across all slots
  const allMealItems: GuestMealItem[] = [
    ...dayMeals.slots.breakfast,
    ...dayMeals.slots.lunch,
    ...dayMeals.slots.snack,
    ...dayMeals.slots.dinner,
  ];

  const totalConsumedKcal = allMealItems.reduce((acc, i) => acc + i.kcal, 0);
  const totalConsumedProtein = Number(
    allMealItems.reduce((acc, i) => acc + i.protein, 0).toFixed(1)
  );
  const totalConsumedCarbs = Number(
    allMealItems.reduce((acc, i) => acc + i.carbs, 0).toFixed(1)
  );
  const totalConsumedFat = Number(
    allMealItems.reduce((acc, i) => acc + i.fat, 0).toFixed(1)
  );

  // Pre-workout intake totals
  const preWorkoutItems = allMealItems.filter((i) => i.isPreWorkout);
  const preWorkoutKcal = preWorkoutItems.reduce((acc, i) => acc + i.kcal, 0);
  const preWorkoutCarbs = preWorkoutItems.reduce((acc, i) => acc + i.carbs, 0);

  // Post-workout suggested nutrient range (0.3-0.4g/kg protein, 0.5-0.8g/kg carbs)
  const postWorkoutProteinMin = Math.round(profile.weightKg * 0.3);
  const postWorkoutProteinMax = Math.round(profile.weightKg * 0.4);
  const postWorkoutCarbsMin = Math.round(profile.weightKg * 0.5);
  const postWorkoutCarbsMax = Math.round(profile.weightKg * 0.8);

  // Exercise Burns Total
  const totalBurnedKcal = exerciseBurns.reduce((acc, b) => acc + b.burnedKcal, 0);

  // Daily Energy Balance: Intake - (TDEE + Exercise Burn)
  const netEnergyBalance = calculateDailyBalance(
    totalConsumedKcal,
    tdee,
    totalBurnedKcal
  );
  const projectedWeeklyChangeKg = estimateWeightChange(netEnergyBalance, 7);

  // Handlers
  const handleAddFoodToSlot = (
    slot: MealSlotKey,
    food: SeedFood,
    grams: number,
    servingLabel: string,
    isPreWorkout: boolean
  ) => {
    const date = dayMeals.date;
    const multiplier = grams / 100;
    const updated = guestStorage.addMealItem(date, slot, {
      foodId: food.nameEn,
      nameBn: food.nameBn,
      nameEn: food.nameEn,
      servingLabel,
      grams,
      kcal: Math.round(food.per100g.kcal * multiplier),
      protein: Number((food.per100g.protein * multiplier).toFixed(1)),
      carbs: Number((food.per100g.carbs * multiplier).toFixed(1)),
      fat: Number((food.per100g.fat * multiplier).toFixed(1)),
      fiber: Number(((food.per100g.fiber || 0) * multiplier).toFixed(1)),
      isPreWorkout,
    });
    setDayMeals(updated);
  };

  const handleRemoveFoodFromSlot = (slot: MealSlotKey, itemId: string) => {
    const updated = guestStorage.removeMealItem(dayMeals.date, slot, itemId);
    setDayMeals(updated);
  };

  const handleResetDay = () => {
    if (
      window.confirm(
        locale === 'bn'
          ? 'আপনি কি আজকের সকল খাবার তালিকা রিসেট করতে চান?'
          : 'Are you sure you want to reset all meal entries for today?'
      )
    ) {
      const resetDay: GuestDayMeals = {
        date: dayMeals.date,
        slots: { breakfast: [], lunch: [], snack: [], dinner: [] },
      };
      guestStorage.saveMeals(resetDay);
      guestStorage.saveExerciseBurns(dayMeals.date, []);
      setDayMeals(resetDay);
      setExerciseBurns([]);
    }
  };

  const slotMetadata: Array<{
    key: MealSlotKey;
    titleBn: string;
    titleEn: string;
    timeHint: string;
  }> = [
    { key: 'breakfast', titleBn: 'সকালের নাস্তা', titleEn: 'Breakfast', timeHint: '07:00 - 09:30 AM' },
    { key: 'lunch', titleBn: 'দুপুরের খাবার', titleEn: 'Lunch', timeHint: '01:00 - 02:30 PM' },
    { key: 'snack', titleBn: 'বিকেলের নাস্তা / স্ন্যাক্স', titleEn: 'Afternoon Snack', timeHint: '04:30 - 06:00 PM' },
    { key: 'dinner', titleBn: 'রাতের খাবার', titleEn: 'Dinner', timeHint: '08:00 - 10:00 PM' },
  ];

  return (
    <div className="min-h-screen py-10 md:py-16 px-4 sm:px-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-border">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lime-soft border border-lime-brand/30 text-ink-base text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
              <Calculator className="w-3.5 h-3.5" />
              <span>{t('গেস্ট মোড • লোকালস্টোরেজ সেভ', 'Guest-First • Zero Login Needed')}</span>
            </div>

            <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-foreground">
              {t('মিল ও ক্যালোরি প্ল্যানার', 'MEAL & CALORIE CALCULATOR')}
            </h1>

            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
              {t(
                '৪টি মিল স্লটে দেশি খাবার যোগ করুন, Mifflin-St Jeor সূত্রের ভিত্তিতে দৈনিক ক্যালোরি ঘাটতি পর্যবেক্ষণ করুন এবং ব্যায়ামের ক্যালোরি বার্ন হিসাব করুন।',
                'Log foods across 4 meal slots, compare against your Mifflin-St Jeor daily targets, and track MET exercise burn with precision.'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-secondary hover:bg-secondary/80 text-foreground border border-border text-xs font-extrabold uppercase font-display tracking-wider transition-all duration-200 active:scale-95 shadow-sm"
            >
              <Sliders className="w-4 h-4 text-lime-brand" />
              <span>{t('টার্গেট ও প্রোফাইল পরিবর্তন', 'Edit Target & BMR')}</span>
            </button>

            <button
              type="button"
              onClick={handleResetDay}
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-tomato-brand text-xs font-bold transition-colors"
              title={t('আজকের হিসাব রিসেট', 'Reset Today')}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top Target Summary Dashboard Card */}
        <div className="mt-8 rounded-3xl bg-card border-2 border-lime-brand/40 p-6 sm:p-8 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Calories Dial / Big Stat */}
            <div className="lg:col-span-5 flex flex-col items-center sm:items-start text-center sm:text-left border-b lg:border-b-0 lg:border-r border-border pb-6 lg:pb-0 lg:pr-8">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t('আজকের মোট গ্রহণ / দৈনিক লক্ষ্য', 'Caloric Intake vs Target')}
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-display font-black text-5xl sm:text-6xl text-foreground">
                  {totalConsumedKcal}
                </span>
                <span className="font-display text-xl sm:text-2xl font-bold text-muted-foreground">
                  / {targetKcal} kcal
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full mt-4 h-3 rounded-full bg-secondary overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    totalConsumedKcal > targetKcal ? 'bg-tomato-brand' : 'bg-lime-brand'
                  }`}
                  style={{
                    width: `${Math.min(100, (totalConsumedKcal / Math.max(1, targetKcal)) * 100)}%`,
                  }}
                />
              </div>

              <div className="w-full flex items-center justify-between text-xs font-bold mt-2">
                <span className="text-muted-foreground">
                  {t('অবশিষ্ট বাজেট:', 'Remaining:')}{' '}
                  <strong className={targetKcal - totalConsumedKcal >= 0 ? 'text-lime-brand' : 'text-tomato-brand'}>
                    {targetKcal - totalConsumedKcal} kcal
                  </strong>
                </span>
                <span className="text-muted-foreground">
                  {Math.round((totalConsumedKcal / Math.max(1, targetKcal)) * 100)}% {t('পূর্ণ', 'hit')}
                </span>
              </div>
            </div>

            {/* Macro Breakdown Columns */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Protein */}
              <div className="p-4 rounded-2xl bg-secondary/50 border border-border/80">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  {t('প্রোটিন (Protein)', 'Protein')}
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="font-display font-black text-2xl text-lime-brand">
                    {totalConsumedProtein}g
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold">
                    / {targetMacros.protein}g
                  </span>
                </div>
                <div className="w-full mt-2 h-1.5 rounded-full bg-background overflow-hidden">
                  <div
                    className="h-full bg-lime-brand rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (totalConsumedProtein / Math.max(1, targetMacros.protein)) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Carbs */}
              <div className="p-4 rounded-2xl bg-secondary/50 border border-border/80">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  {t('কার্বস (Carbs)', 'Carbohydrates')}
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="font-display font-black text-2xl text-foreground">
                    {totalConsumedCarbs}g
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold">
                    / {targetMacros.carbs}g
                  </span>
                </div>
                <div className="w-full mt-2 h-1.5 rounded-full bg-background overflow-hidden">
                  <div
                    className="h-full bg-foreground rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (totalConsumedCarbs / Math.max(1, targetMacros.carbs)) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Fat */}
              <div className="p-4 rounded-2xl bg-secondary/50 border border-border/80">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  {t('ফ্যাট (Fat)', 'Fat')}
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="font-display font-black text-2xl text-pink-brand">
                    {totalConsumedFat}g
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold">
                    / {targetMacros.fat}g
                  </span>
                </div>
                <div className="w-full mt-2 h-1.5 rounded-full bg-background overflow-hidden">
                  <div
                    className="h-full bg-pink-brand rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (totalConsumedFat / Math.max(1, targetMacros.fat)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Daily Energy Balance Strip */}
          <div className="mt-6 pt-5 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-lime-brand shrink-0" />
              <span>
                {t('দৈনিক মোট এনার্জি ব্যালেন্স:', 'Net Daily Energy Balance:')}{' '}
                <strong
                  className={netEnergyBalance <= 0 ? 'text-lime-brand' : 'text-tomato-brand'}
                >
                  {netEnergyBalance > 0 ? `+${netEnergyBalance}` : netEnergyBalance} kcal
                </strong>{' '}
                <span className="text-muted-foreground">
                  (Intake: {totalConsumedKcal} - TDEE: {tdee} - Exercise Burn: {totalBurnedKcal})
                </span>
              </span>
            </div>

            <div className="text-muted-foreground font-medium">
              {netEnergyBalance < 0 ? (
                <span>
                  {t('সাপ্তাহিক সম্ভাব্য চর্বি হ্রাস:', 'Estimated weekly fat loss:')}{' '}
                  <strong className="text-lime-brand">~{Math.abs(projectedWeeklyChangeKg)} kg/week</strong>
                </span>
              ) : netEnergyBalance > 0 ? (
                <span>
                  {t('সাপ্তাহিক সম্ভাব্য বৃদ্ধি:', 'Estimated weekly weight gain:')}{' '}
                  <strong className="text-tomato-brand">~{projectedWeeklyChangeKg} kg/week</strong>
                </span>
              ) : (
                <span>{t('বর্তমান ওজন স্থিতিশীল (Maintenance)', 'Exact Maintenance Balance')}</span>
              )}
            </div>
          </div>
        </div>

        {/* 4 Meal Slots */}
        <div className="mt-10 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-black text-2xl uppercase tracking-tight text-foreground">
              {t('দৈনিক ৪টি মিল স্লট', 'Daily Meal Slots')}
            </h2>
            <Link
              href="/foods"
              className="text-xs font-bold text-lime-brand hover:underline flex items-center gap-1"
            >
              <span>{t('খাদ্য তালিকা ব্রাউজ করুন →', 'Browse Food Database →')}</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {slotMetadata.map(({ key, titleBn, titleEn, timeHint }) => {
              const items = dayMeals.slots[key];
              const slotKcal = items.reduce((acc, i) => acc + i.kcal, 0);
              const slotProtein = Number(items.reduce((acc, i) => acc + i.protein, 0).toFixed(1));
              const slotCarbs = Number(items.reduce((acc, i) => acc + i.carbs, 0).toFixed(1));
              const slotFat = Number(items.reduce((acc, i) => acc + i.fat, 0).toFixed(1));

              return (
                <div
                  key={key}
                  className="rounded-3xl bg-card border border-border p-5 sm:p-6 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    {/* Slot Header */}
                    <div className="flex items-start justify-between pb-3 border-b border-border/60">
                      <div>
                        <h3 className="font-display font-black text-lg uppercase text-foreground">
                          {t(titleBn, titleEn)}
                        </h3>
                        <span className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          {timeHint}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="font-display font-black text-lg text-tomato-brand block">
                          {slotKcal} kcal
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          {slotProtein}g P • {slotCarbs}g C • {slotFat}g F
                        </span>
                      </div>
                    </div>

                    {/* Food Items in this slot */}
                    <div className="mt-3 space-y-2 min-h-[90px]">
                      {items.length > 0 ? (
                        items.map((item) => (
                          <div
                            key={item.id}
                            className="p-2.5 rounded-2xl bg-secondary/40 border border-border/40 flex items-center justify-between text-xs"
                          >
                            <div className="pr-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-foreground">
                                  {locale === 'bn' ? item.nameBn : item.nameEn}
                                </span>
                                {item.isPreWorkout && (
                                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-pink-brand/10 text-pink-brand border border-pink-brand/20">
                                    Pre-Workout
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-muted-foreground">
                                {item.servingLabel} ({item.grams}g)
                              </span>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <div className="text-right font-display text-xs">
                                <strong className="text-tomato-brand block">{item.kcal} kcal</strong>
                                <span className="text-[10px] text-muted-foreground">
                                  {item.protein}g P
                                </span>
                              </div>
                              <button
                                onClick={() => handleRemoveFoodFromSlot(key, item.id)}
                                className="p-1 rounded-md text-muted-foreground hover:text-tomato-brand hover:bg-secondary transition-colors cursor-pointer"
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="h-full flex items-center justify-center py-6 text-center text-xs text-muted-foreground">
                          {t('এখনো কোনো খাবার যোগ করা হয়নি', 'No foods added to this slot yet')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Add Food Button */}
                  <button
                    type="button"
                    onClick={() => setActiveSlotModal(key)}
                    className="mt-4 w-full py-2.5 rounded-2xl bg-secondary hover:bg-secondary/80 border border-dashed border-border/80 text-foreground font-display font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-lime-brand stroke-[3]" />
                    <span>{t('খাবার যোগ করুন', 'Add Food')}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pre-workout & Post-workout Nutrition Module */}
        <div className="mt-10 rounded-3xl bg-secondary/30 border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="w-9 h-9 rounded-xl bg-pink-soft text-pink-brand flex items-center justify-center">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-xl uppercase tracking-tight text-foreground">
                {t('প্রি ও পোস্ট ওয়ার্কআউট পুষ্টি বিশ্লেষণ', 'Pre & Post Workout Fuel')}
              </h3>
              <span className="text-xs text-muted-foreground">
                {t('জিম অনুশীলনের আগে ও পরের বৈজ্ঞানিক পুষ্টি গাইডলাইন', 'Sports nutrition guidelines before and after training sessions')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Pre-workout intake */}
            <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                {t('প্রি-ওয়ার্কআউট গ্রহণ (Pre-Workout Eaten)', 'Pre-Workout Intake')}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-black text-3xl text-pink-brand">
                  {preWorkoutKcal} kcal
                </span>
                <span className="text-xs text-muted-foreground">
                  ({preWorkoutCarbs}g {t('কার্বস', 'carbs')})
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                {t(
                  'অনুশীলনের ১-২ ঘণ্টা আগে জটিল কার্বোহাইড্রেট ও পরিমিত প্রোটিন যুক্ত খাবার শক্তি বাড়াতে সহায়ক (যেমন: কলা, ওটস, বা ডিম)।',
                  'Consume moderate carbs and light protein 1-2 hours prior to lifting to sustain glycogen levels.'
                )}
              </p>
            </div>

            {/* Post-workout suggestion */}
            <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                {t('পোস্ট-ওয়ার্কআউট প্রস্তাবিত পরিমাপ (Target)', 'Suggested Post-Workout Range')}
              </span>
              <div className="flex flex-col gap-1 font-display">
                <div className="text-sm font-black text-lime-brand">
                  {t('প্রোটিন:', 'Protein:')} {postWorkoutProteinMin}g – {postWorkoutProteinMax}g
                </div>
                <div className="text-sm font-black text-foreground">
                  {t('কার্বোহাইড্রেট:', 'Carbs:')} {postWorkoutCarbsMin}g – {postWorkoutCarbsMax}g
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                {t(
                  'অনুশীলনের পর পেশি পুনরুদ্ধারের জন্য আপনার শরীরের ওজন অনুযায়ী ০.৩-০.৪ গ্রাম/কেজি প্রোটিন প্রস্তাবিত।',
                  'Target 0.3-0.4g/kg protein and 0.5-0.8g/kg carbs post-exercise to stimulate muscle protein synthesis.'
                )}
              </p>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground mt-4 italic">
            * {t('এই তথ্যসমূহ সাধারণ স্পোর্টস নিউট্রিশন গবেষণার ভিত্তিতে প্রণীত। কোনো ব্যক্তিগত প্রেসক্রিপশন বা পথ্য নয়।', 'General athletic guidelines only; adjust according to your digestive tolerance.')}
          </p>
        </div>

        {/* MET Exercise Burn Logger */}
        <div className="mt-10">
          <ExerciseBurnSection
            userWeightKg={profile.weightKg}
            burns={exerciseBurns}
            onBurnsUpdated={(updated) => setExerciseBurns(updated)}
          />
        </div>
      </div>

      {/* Food Picker Modal */}
      {activeSlotModal && (
        <FoodPickerModal
          isOpen={Boolean(activeSlotModal)}
          onClose={() => setActiveSlotModal(null)}
          targetSlot={activeSlotModal}
          onSelectFood={handleAddFoodToSlot}
        />
      )}

      {/* Profile & Target Modal */}
      <ProfileTargetModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSaveProfile={(updated) => setProfile(updated)}
      />
    </div>
  );
}
