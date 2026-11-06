'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/lib/language-context';
import {
  guestStorage,
  DEFAULT_PROFILE,
  type GuestProfile,
  type GuestDayMeals,
  type GuestExerciseBurn,
  type MealSlotKey,
} from '@/lib/guest-storage';
import {
  calculateTodayTargets,
  computeTodayProgress,
  getPlainLanguageStatus,
  getFoodSuggestions,
} from '@/lib/today-math';
import { BANGLADESHI_FOODS_DATA, type SeedFood } from '@/server/seeds/foods.data';
import { WORKOUT_PLANS_DATA } from '@/server/seeds/plans.data';
import { toBengaliDigits } from '@/lib/bengali-digits';
import { FoodPickerModal } from '@/components/calculator/food-picker-modal';
import { QuickExerciseModal } from '@/components/today/quick-exercise-modal';
import { FirstRunOnboarding } from '@/components/onboarding/first-run-onboarding';
import { JargonDetailsDrawer } from '@/components/ui/jargon-details-drawer';
import { CompactPeriodSummary } from '@/components/today/compact-period-summary';
import {
  Flame,
  Plus,
  Dumbbell,
  CheckCircle2,
  Circle,
  Info,
  Calendar,
  Sparkles,
  ChevronRight,
  Coffee,
  Sun,
  Cookie,
  Moon,
  Check,
} from 'lucide-react';

const INITIAL_DAY_MEALS: GuestDayMeals = {
  date: '',
  slots: {
    breakfast: [],
    lunch: [],
    snack: [],
    dinner: [],
  },
};

export function TodayClient() {
  const { t } = useLanguage();
  const isBn = useLanguage().locale === 'bn';
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  const [date, setDate] = useState<string>(() => guestStorage.getDhakaDateString());
  const [profile, setProfile] = useState<GuestProfile>(DEFAULT_PROFILE);
  const [meals, setMeals] = useState<GuestDayMeals>(INITIAL_DAY_MEALS);
  const [burns, setBurns] = useState<GuestExerciseBurn[]>([]);
  const [foodsList, setFoodsList] = useState<SeedFood[]>(BANGLADESHI_FOODS_DATA);
  const [activePlanSlug, setActivePlanSlug] = useState<string>('full-body-3');

  // Modals
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [foodPickerOpen, setFoodPickerOpen] = useState(false);
  const [foodPickerSlot, setFoodPickerSlot] = useState<MealSlotKey>('lunch');
  const [foodPickerInitialFood, setFoodPickerInitialFood] = useState<SeedFood | null>(null);
  const [exerciseModalOpen, setExerciseModalOpen] = useState(false);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);

  // Load guest data locally after hydration
  const loadGuestData = useCallback(() => {
    const todayDate = guestStorage.getDhakaDateString();
    setDate(todayDate);
    setProfile(guestStorage.getProfile());
    setMeals(guestStorage.getMeals(todayDate));
    setBurns(guestStorage.getExerciseBurns(todayDate));
    const savedPlan = guestStorage.getActivePlanSlug();
    if (savedPlan) {
      setActivePlanSlug(savedPlan);
    }
  }, []);

  // Check onboarding once mounted on client
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        const completed = localStorage.getItem('zgym_onboarding_completed');
        if (!completed) {
          setOnboardingOpen(true);
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Fetch all foods for live suggestions
  useEffect(() => {
    let isMounted = true;
    fetch('/api/foods?all=true')
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json?.success && Array.isArray(json.data) && json.data.length > 0) {
          setFoodsList(json.data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync with authenticated user data if logged in, or load guest local data
  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated) {
      fetch(`/api/user/logs?date=${date}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (isMounted && json?.success && json.data) {
            const rawMeals = json.data.meals || [];
            const grouped: GuestDayMeals = {
              date,
              slots: { breakfast: [], lunch: [], snack: [], dinner: [] },
            };
            for (const m of rawMeals) {
              const slot = (m.slot as MealSlotKey) || 'breakfast';
              if (grouped.slots[slot]) {
                grouped.slots[slot].push({
                  id: m._id,
                  nameBn: m.foodNameBn,
                  nameEn: m.foodNameEn,
                  servingLabel: m.servingLabel,
                  grams: m.grams,
                  kcal: m.macros.kcal,
                  protein: m.macros.protein,
                  carbs: m.macros.carbs,
                  fat: m.macros.fat,
                });
              }
            }
            setMeals(grouped);
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
  }, [date, isAuthenticated, loadGuestData]);

  // Derived Targets & Progress
  const targets = useMemo(() => calculateTodayTargets(profile), [profile]);
  const progress = useMemo(() => computeTodayProgress(targets, meals, burns), [targets, meals, burns]);

  // Plain-Language Status
  const statusLine = useMemo(
    () => getPlainLanguageStatus(progress.remainingCalories, progress.remainingProtein, isBn),
    [progress.remainingCalories, progress.remainingProtein, isBn]
  );

  // 3 Food Suggestions when calories or protein short
  const suggestions = useMemo(() => {
    if (progress.remainingCalories > 60 || progress.remainingProtein > 8) {
      return getFoodSuggestions(progress.remainingCalories, progress.remainingProtein, foodsList, 3);
    }
    return [];
  }, [progress.remainingCalories, progress.remainingProtein, foodsList]);

  // Active Plan & Today's Workout
  const [todayDow, setTodayDow] = useState<number>(0);
  const [stripDays, setStripDays] = useState<
    Array<{
      date: string;
      dayLabelBn: string;
      dayLabelEn: string;
      hasActivity: boolean;
      isToday: boolean;
    }>
  >([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const d = new Date();
      setTodayDow(d.getDay());

      const strip: typeof stripDays = [];
      const labelsBn = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
      const labelsEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      for (let i = 6; i >= 0; i--) {
        const day = new Date();
        day.setDate(day.getDate() - i);
        const dateStr = guestStorage.getDhakaDateString(day);
        const dayMeals = guestStorage.getMeals(dateStr);
        const dayBurns = guestStorage.getExerciseBurns(dateStr);
        const mealCount = Object.values(dayMeals.slots || {}).flat().length;
        const hasActivity = mealCount > 0 || dayBurns.length > 0;
        const dow = day.getDay();

        strip.push({
          date: dateStr,
          dayLabelBn: labelsBn[dow],
          dayLabelEn: labelsEn[dow],
          hasActivity,
          isToday: dateStr === date,
        });
      }
      setStripDays(strip);
    }, 0);
    return () => clearTimeout(timer);
  }, [date]);

  const activePlan = useMemo(() => {
    return WORKOUT_PLANS_DATA.find((p) => p.slug === activePlanSlug) || WORKOUT_PLANS_DATA[0];
  }, [activePlanSlug]);

  const todayWorkoutSchedule = useMemo(() => {
    if (!activePlan || !activePlan.schedule || activePlan.schedule.length === 0) return null;
    const match = activePlan.schedule.find((s) => s.dayIndex === (todayDow === 0 ? 1 : todayDow + 1));
    return match || activePlan.schedule[0];
  }, [activePlan, todayDow]);

  const sevenDayStrip = stripDays;

  // Handlers
  const handleOnboardingComplete = (newProfile: GuestProfile) => {
    setProfile(newProfile);
    setOnboardingOpen(false);
  };

  const handleOpenFoodPicker = (slot?: MealSlotKey, initialFood?: SeedFood) => {
    setFoodPickerSlot(slot || 'lunch');
    setFoodPickerInitialFood(initialFood || null);
    setFoodPickerOpen(true);
  };

  const handleSelectFood = (
    slot: MealSlotKey,
    food: SeedFood,
    grams: number,
    servingLabel: string,
    isPreWorkout: boolean
  ) => {
    const multiplier = grams / 100;
    const item = {
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
    };

    const targetDate = date || guestStorage.getDhakaDateString();
    const updated = guestStorage.addMealItem(targetDate, slot, item);
    setMeals(updated);

    if (isAuthenticated) {
      fetch('/api/user/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          slot,
          foodNameBn: food.nameBn,
          foodNameEn: food.nameEn,
          servingLabel,
          grams,
          macros: {
            kcal: item.kcal,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
          },
        }),
      }).catch(() => {});
    }
  };

  const handleExerciseAdded = (newBurn: GuestExerciseBurn) => {
    setBurns((prev) => [...prev, newBurn]);
  };

  // Meal slots data
  const mealSlotsConfig: Array<{ key: MealSlotKey; labelBn: string; labelEn: string; icon: typeof Sun }> = [
    { key: 'breakfast', labelBn: 'সকালের নাস্তা', labelEn: 'Breakfast', icon: Coffee },
    { key: 'lunch', labelBn: 'দুপুরের খাবার', labelEn: 'Lunch', icon: Sun },
    { key: 'snack', labelBn: 'বিকেলের নাস্তা', labelEn: 'Snack', icon: Cookie },
    { key: 'dinner', labelBn: 'রাতের খাবার', labelEn: 'Dinner', icon: Moon },
  ];

  // SVG Ring calculation: Radius 62, Circumference = 2 * PI * 62 ≈ 389.5
  const strokeRadius = 62;
  const strokeCircumference = 2 * Math.PI * strokeRadius;
  const ringOffset = strokeCircumference - (Math.min(100, progress.caloriePct) / 100) * strokeCircumference;

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-4xl py-6 pb-24 sm:pb-12 space-y-6">
      {/* Top Greeting & Jargon Details Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-lime-brand">
            <Calendar className="w-3.5 h-3.5" />
            <span>{isBn ? 'আজকের সারসংক্ষেপ' : 'Today\'s Summary'}</span>
            <span className="text-muted-foreground">• Asia/Dhaka</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground mt-0.5">
            {t('আজকের লক্ষ্য ও পুষ্টি', 'Today\'s Targets')}
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setDetailsDrawerOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-secondary/80 hover:bg-secondary text-foreground text-xs font-bold border border-border/70 transition-colors cursor-pointer shadow-xs"
        >
          <Info className="w-3.5 h-3.5 text-lime-brand" />
          <span>{t('বিস্তারিত নির্দেশিকা', 'Plain Details')}</span>
        </button>
      </div>

      {/* 1. MAIN TODAY CARD */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border-2 border-border shadow-xl space-y-6 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-lime-brand/5 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Calorie Ring Gauge */}
          <div className="md:col-span-5 flex flex-col items-center justify-center text-center">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r={strokeRadius}
                  className="text-secondary stroke-current"
                  strokeWidth="14"
                  fill="transparent"
                />
                <circle
                  cx="80"
                  cy="80"
                  r={strokeRadius}
                  className="text-lime-brand stroke-current transition-all duration-700 ease-out"
                  strokeWidth="14"
                  strokeDasharray={strokeCircumference}
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center px-2">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {t('খাওয়া হয়েছে', 'Eaten')}
                </span>
                <span className="font-mono text-3xl font-black text-foreground tracking-tight">
                  {isBn ? toBengaliDigits(progress.consumedCalories) : progress.consumedCalories}
                </span>
                <span className="text-[11px] font-bold text-lime-brand">
                  {isBn ? toBengaliDigits(targets.calorieTarget) : targets.calorieTarget} {t('ক্যালোরি লক্ষ্য', 'kcal target')}
                </span>
              </div>
            </div>

            <div className="mt-3 text-xs font-bold text-foreground">
              {progress.remainingCalories > 0 ? (
                <span>
                  {t('আর বাকি আছে:', 'Remaining:')}{' '}
                  <span className="font-mono text-lime-brand text-sm">
                    {isBn ? toBengaliDigits(progress.remainingCalories) : progress.remainingCalories} kcal
                  </span>
                </span>
              ) : (
                <span className="text-lime-brand">✓ {t('ক্যালোরি লক্ষ্য অর্জিত', 'Calorie target met')}</span>
              )}
            </div>
          </div>

          {/* Burn Target + Macro Bars */}
          <div className="md:col-span-7 space-y-4">
            {/* Extra Burn vs Burn Target Card */}
            <div className="p-4 rounded-2xl bg-secondary/40 border border-border/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-tomato-base/15 text-tomato-base flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">
                    {t('ব্যায়ামে পোড়ানো শক্তি', 'Exercise Burn')}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {t('লক্ষ্য:', 'Target:')} {isBn ? toBengaliDigits(targets.burnTarget) : targets.burnTarget} kcal
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono text-base font-black text-tomato-base">
                  {isBn ? toBengaliDigits(progress.burnedCalories) : progress.burnedCalories}{' '}
                  <span className="text-xs font-normal text-muted-foreground">kcal</span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {progress.remainingBurn > 0
                    ? `${isBn ? toBengaliDigits(progress.remainingBurn) : progress.remainingBurn} kcal ${t('বাকি', 'left')}`
                    : `✓ ${t('অর্জিত', 'Reached')}`}
                </div>
              </div>
            </div>

            {/* Protein, Carbs, Fat, Fiber Progress Bars */}
            <div className="space-y-2.5">
              {/* Protein */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-foreground">{t('প্রোটিন', 'Protein')}</span>
                  <span className="font-mono text-muted-foreground">
                    {isBn ? toBengaliDigits(Math.round(progress.consumedProtein)) : Math.round(progress.consumedProtein)} /{' '}
                    {isBn ? toBengaliDigits(targets.proteinTarget) : targets.proteinTarget} {t('গ্রাম', 'g')}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-thunder-base rounded-full transition-all duration-500"
                    style={{ width: `${progress.proteinPct}%` }}
                  />
                </div>
              </div>

              {/* Carbs */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-foreground">{t('শর্করা (কার্বস)', 'Carbs')}</span>
                  <span className="font-mono text-muted-foreground">
                    {isBn ? toBengaliDigits(Math.round(progress.consumedCarbs)) : Math.round(progress.consumedCarbs)} /{' '}
                    {isBn ? toBengaliDigits(targets.carbsTarget) : targets.carbsTarget} {t('গ্রাম', 'g')}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-lime-brand rounded-full transition-all duration-500"
                    style={{ width: `${progress.carbsPct}%` }}
                  />
                </div>
              </div>

              {/* Fat */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-foreground">{t('চর্বি (ফ্যাট)', 'Fat')}</span>
                  <span className="font-mono text-muted-foreground">
                    {isBn ? toBengaliDigits(Math.round(progress.consumedFat)) : Math.round(progress.consumedFat)} /{' '}
                    {isBn ? toBengaliDigits(targets.fatTarget) : targets.fatTarget} {t('গ্রাম', 'g')}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-tomato-base rounded-full transition-all duration-500"
                    style={{ width: `${progress.fatPct}%` }}
                  />
                </div>
              </div>

              {/* Fiber (14g per 1000 kcal) */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-foreground">{t('আঁশ (ফাইবার)', 'Fiber')}</span>
                  <span className="font-mono text-muted-foreground">
                    {isBn ? toBengaliDigits(Math.round(progress.consumedFiber)) : Math.round(progress.consumedFiber)} /{' '}
                    {isBn ? toBengaliDigits(targets.fiberTarget) : targets.fiberTarget} {t('গ্রাম', 'g')}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress.fiberPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Plain-Language Status Line */}
        <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-lime-brand shrink-0" />
          <span className="text-xs sm:text-sm font-bold text-foreground">
            {statusLine}
          </span>
        </div>

        {/* 3 Food Suggestions if protein or calories short */}
        {suggestions.length > 0 && (
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t('প্রস্তাবিত খাবার (বাকি পুষ্টি পূরণে):', 'Suggested foods to hit remaining macros:')}
              </span>
              <span className="text-[11px] text-lime-brand font-medium">
                {t('ট্যাপ করে সরাসরি যোগ করুন', 'Tap to add')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {suggestions.map((food, idx) => (
                <button
                  key={`${food.nameEn}-${idx}`}
                  type="button"
                  onClick={() => handleOpenFoodPicker('snack', food)}
                  className="p-3 rounded-2xl bg-secondary/40 hover:bg-secondary/80 border border-border/70 hover:border-lime-brand/50 text-left transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-bold text-foreground truncate group-hover:text-lime-brand">
                      {t(food.nameBn, food.nameEn)}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {isBn ? toBengaliDigits(food.per100g.kcal) : food.per100g.kcal} kcal • {t('প্রোটিন', 'P')}: {isBn ? toBengaliDigits(food.per100g.protein) : food.per100g.protein}g
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-lime-brand shrink-0 group-hover:scale-110 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Two Big Action Buttons */}
        <div className="grid grid-cols-2 gap-3.5 pt-2">
          <button
            type="button"
            onClick={() => handleOpenFoodPicker('lunch')}
            className="p-4 rounded-2xl bg-lime-brand text-ink-base font-black text-sm uppercase tracking-wider hover:bg-lime-hover transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>{t('+ খাবার', '+ Add Food')}</span>
          </button>

          <button
            type="button"
            onClick={() => setExerciseModalOpen(true)}
            className="p-4 rounded-2xl bg-tomato-base text-white font-black text-sm uppercase tracking-wider hover:bg-tomato-base/90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>{t('+ ব্যায়াম', '+ Add Workout')}</span>
          </button>
        </div>
      </div>

      {/* Compact Period Summary under main card (আজ · ৩ দিন · ৭ দিন · ৩০ দিন) */}
      <CompactPeriodSummary />

      {/* 2. MEAL SLOTS (4 TICKS) */}
      <div className="p-6 rounded-3xl bg-card border border-border space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
            {t('দৈনিক খাবার স্লট', 'Daily Meal Slots')}
          </h2>
          <span className="text-xs text-muted-foreground">
            {t('৪টি স্লটের অগ্রগতি', '4 meal time slots')}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {mealSlotsConfig.map((slot) => {
            const Icon = slot.icon;
            const items = meals.slots[slot.key] || [];
            const isLogged = items.length > 0;
            const slotCalories = items.reduce((acc, it) => acc + it.kcal, 0);

            return (
              <button
                key={slot.key}
                type="button"
                onClick={() => handleOpenFoodPicker(slot.key)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[92px] ${
                  isLogged
                    ? 'border-lime-brand/60 bg-lime-brand/10 shadow-xs'
                    : 'border-border/80 bg-secondary/30 hover:bg-secondary/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="truncate">{t(slot.labelBn, slot.labelEn)}</span>
                  </div>
                  {isLogged ? (
                    <CheckCircle2 className="w-4 h-4 text-lime-brand shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                  )}
                </div>

                <div className="text-[11px] text-muted-foreground mt-2">
                  {isLogged ? (
                    <span className="font-mono font-bold text-foreground">
                      {isBn ? toBengaliDigits(slotCalories) : slotCalories} kcal ({isBn ? toBengaliDigits(items.length) : items.length} {t('আইটেম', 'items')})
                    </span>
                  ) : (
                    <span>{t('+ খাবার যোগ করুন', '+ Add meal')}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TODAY'S WORKOUT FROM ACTIVE PLAN */}
      {todayWorkoutSchedule && (
        <div className="p-6 rounded-3xl bg-card border border-border space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-lime-brand" />
              <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                {t('আজকের নির্ধারিত ওয়ার্কআউট', 'Today\'s Scheduled Workout')}
              </h2>
            </div>
            <Link
              href="/plans"
              className="text-xs font-bold text-lime-brand hover:underline inline-flex items-center gap-1"
            >
              <span>{t('প্ল্যান পরিবর্তন', 'Change Split')}</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/40 border border-border/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-foreground">
                  {t(todayWorkoutSchedule.dayNameBn, todayWorkoutSchedule.dayNameEn)}
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('টার্গেট পেশি:', 'Focus:')} {t(todayWorkoutSchedule.focusBn, todayWorkoutSchedule.focusEn)}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-lime-brand/15 text-lime-brand text-[11px] font-bold">
                {t(activePlan.nameBn, activePlan.nameEn)}
              </span>
            </div>

            {/* List of exercises */}
            <div className="divide-y divide-border/60">
              {todayWorkoutSchedule.exercises.slice(0, 4).map((ex) => (
                <div key={ex.exerciseSlug} className="py-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground truncate pr-2">
                    {t(ex.nameBn, ex.nameEn)}
                  </span>
                  <span className="text-muted-foreground font-mono shrink-0">
                    {isBn ? toBengaliDigits(ex.sets) : ex.sets} sets × {ex.reps}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. 7-DAY ACTIVITY STRIP */}
      <div className="p-6 rounded-3xl bg-card border border-border space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('গত ৭ দিনের ট্র্যাকিং ধারাবাহিকতা', '7-Day Activity Discipline')}
          </span>
          <Link href="/progress" className="text-xs font-bold text-lime-brand hover:underline">
            {t('অগ্রগতি দেখুন', 'View Progress')}
          </Link>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {sevenDayStrip.map((item) => (
            <div
              key={item.date}
              className={`p-2.5 rounded-2xl border text-center flex flex-col items-center justify-center transition-all ${
                item.isToday
                  ? 'border-lime-brand bg-secondary/80 ring-2 ring-lime-brand'
                  : 'border-border/60 bg-secondary/20'
              }`}
            >
              <span className="text-[11px] font-bold text-muted-foreground mb-1">
                {t(item.dayLabelBn, item.dayLabelEn)}
              </span>
              {item.hasActivity ? (
                <div className="w-6 h-6 rounded-full bg-lime-brand text-ink-base flex items-center justify-center shadow-xs">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                  <Circle className="w-2.5 h-2.5 text-muted-foreground/30" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MODALS */}
      <FirstRunOnboarding
        isOpen={onboardingOpen}
        onComplete={handleOnboardingComplete}
      />

      <FoodPickerModal
        isOpen={foodPickerOpen}
        onClose={() => setFoodPickerOpen(false)}
        targetSlot={foodPickerSlot}
        initialFood={foodPickerInitialFood}
        onSelectFood={handleSelectFood}
      />

      <QuickExerciseModal
        isOpen={exerciseModalOpen}
        onClose={() => setExerciseModalOpen(false)}
        userWeightKg={profile.weightKg}
        onExerciseAdded={handleExerciseAdded}
      />

      <JargonDetailsDrawer
        isOpen={detailsDrawerOpen}
        onClose={() => setDetailsDrawerOpen(false)}
      />
    </div>
  );
}
