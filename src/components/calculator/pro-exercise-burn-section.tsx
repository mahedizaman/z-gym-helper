'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/language-context';
import {
  guestStorage,
  type GuestExerciseBurn,
} from '@/lib/guest-storage';
import {
  ACTIVITY_CATALOG,
  type ActivityCatalogItem,
  type ActivityCategory,
} from '@/server/seeds/activities.data';
import {
  calculateNetBurn,
  calculateGrossBurn,
  calculateSpeedKmh,
  calculatePace,
  interpolateSpeedToMet,
  calculateTreadmillAcsm,
  calculateStrengthActiveMinutes,
} from '@/server/services/exercise-burn-math';
import { NumberField } from '@/components/ui/number-field';
import {
  Flame,
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  Search,
  Star,
  Info,
  Clock,
  Gauge,
  HelpCircle,
  AlertTriangle,
  Check,
} from 'lucide-react';

interface ProExerciseBurnSectionProps {
  userWeightKg: number;
  burns: GuestExerciseBurn[];
  onBurnsUpdated: (burns: GuestExerciseBurn[]) => void;
  targetBurnKcal?: number;
}

export function ProExerciseBurnSection({
  userWeightKg,
  burns,
  onBurnsUpdated,
  targetBurnKcal = 300,
}: ProExerciseBurnSectionProps) {
  const { t, locale } = useLanguage();
  const safeWeight = userWeightKg && userWeightKg >= 30 ? userWeightKg : 70;

  // Search & Filter State
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem('zgym_exercise_favorites');
      return data ? JSON.parse(data) : ['walking_brisk', 'weight_training_moderate', 'jogging_8kmh'];
    } catch {
      return ['walking_brisk', 'weight_training_moderate'];
    }
  });

  // Selected Activity
  const [selectedActivityId, setSelectedActivityId] = useState<string>('walking_brisk');
  const [intensity, setIntensity] = useState<'light' | 'moderate' | 'vigorous'>('moderate');

  // Input Modes & Values
  const [durationMinStr, setDurationMinStr] = useState<string>('30');
  const [isCardioMode, setIsCardioMode] = useState<boolean>(false);
  const [distanceKmStr, setDistanceKmStr] = useState<string>('3.0');
  const [inclinePctStr, setInclinePctStr] = useState<string>('0');
  const [isStrengthSetMode, setIsStrengthSetMode] = useState<boolean>(false);
  const [setsStr, setSetsStr] = useState<string>('4');
  const [repsStr, setRepsStr] = useState<string>('10');
  const [restSecStr, setRestSecStr] = useState<string>('90');

  // UI Drawers & States
  const [showFormulaDrawer, setShowFormulaDrawer] = useState<boolean>(false);
  const [editingBurnId, setEditingBurnId] = useState<string | null>(null);

  // Check if yesterday has workouts for quick repeat
  const yesterdayBurns = useMemo(() => {
    return guestStorage.getYesterdayExerciseBurns();
  }, []);

  // Selected Activity Object
  const currentActivity: ActivityCatalogItem = useMemo(() => {
    return (
      ACTIVITY_CATALOG.find((a) => a.id === selectedActivityId) ||
      ACTIVITY_CATALOG[0]
    );
  }, [selectedActivityId]);

  // Filtered activity catalog list
  const filteredActivities = useMemo(() => {
    return ACTIVITY_CATALOG.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        item.nameBn.toLowerCase().includes(q) ||
        item.nameEn.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Handle Favorites toggle
  const toggleFavorite = (id: string) => {
    const next = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    setFavorites(next);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('zgym_exercise_favorites', JSON.stringify(next));
      } catch {
        // ignore
      }
    }
  };

  // Parse Numeric Inputs
  const parsedDuration = parseFloat(durationMinStr) || 0;
  const parsedDistance = parseFloat(distanceKmStr) || 0;
  const parsedIncline = parseFloat(inclinePctStr) || 0;
  const parsedSets = parseInt(setsStr, 10) || 0;
  const parsedReps = parseInt(repsStr, 10) || 0;
  const parsedRest = parseInt(restSecStr, 10) || 0;

  // Speed and Pace
  const speedKmh =
    isCardioMode && parsedDistance > 0 && parsedDuration > 0
      ? calculateSpeedKmh(parsedDistance, parsedDuration)
      : 0;

  const paceObj =
    isCardioMode && parsedDistance > 0 && parsedDuration > 0
      ? calculatePace(parsedDistance, parsedDuration)
      : { minPerKm: 0, formatted: '0:00' };

  // Determine Effective MET
  let effectiveMet = currentActivity.metByIntensity[intensity];

  // If Cardio mode with distance and time, interpolate from Compendium speed table
  if (isCardioMode && speedKmh > 0) {
    if (
      currentActivity.id.includes('walk') ||
      currentActivity.category === 'cardio' && currentActivity.nameEn.toLowerCase().includes('walk')
    ) {
      if (parsedIncline > 0) {
        const acsm = calculateTreadmillAcsm('walking', speedKmh, parsedIncline, safeWeight, parsedDuration);
        effectiveMet = acsm.met;
      } else {
        effectiveMet = interpolateSpeedToMet('walking', speedKmh);
      }
    } else if (
      currentActivity.id.includes('run') ||
      currentActivity.id.includes('jog')
    ) {
      if (parsedIncline > 0) {
        const acsm = calculateTreadmillAcsm('running', speedKmh, parsedIncline, safeWeight, parsedDuration);
        effectiveMet = acsm.met;
      } else {
        effectiveMet = interpolateSpeedToMet('running', speedKmh);
      }
    } else if (currentActivity.id.includes('cycling')) {
      effectiveMet = interpolateSpeedToMet('cycling', speedKmh);
    }
  }

  // Active time calculation if strength sets mode
  const effectiveDurationMinutes = isStrengthSetMode
    ? calculateStrengthActiveMinutes(parsedSets, parsedReps, parsedRest)
    : parsedDuration;

  // Calorie Burn Calculation: Net vs Gross
  const estimatedNetBurn = calculateNetBurn(
    effectiveMet,
    safeWeight,
    effectiveDurationMinutes
  );
  const estimatedGrossBurn = calculateGrossBurn(
    effectiveMet,
    safeWeight,
    effectiveDurationMinutes
  );

  // Sanity warnings for speed
  const isSpeedSanityWarning =
    isCardioMode &&
    ((currentActivity.id.includes('walk') && speedKmh > 8.0) ||
      (currentActivity.id.includes('run') && speedKmh > 25.0));

  // Add or Update Handler
  const handleSaveBurn = () => {
    if (effectiveDurationMinutes <= 0) return;
    const date = guestStorage.getDhakaDateString();

    const burnPayload: Omit<GuestExerciseBurn, 'id'> = {
      activityId: currentActivity.id,
      nameBn: currentActivity.nameBn,
      nameEn: currentActivity.nameEn,
      category: currentActivity.category,
      met: effectiveMet,
      intensity,
      durationMinutes: effectiveDurationMinutes,
      burnedKcal: estimatedNetBurn,
      isNet: true,
      distanceKm: isCardioMode ? parsedDistance : undefined,
      speedKmh: isCardioMode && speedKmh > 0 ? speedKmh : undefined,
      paceMinKm: isCardioMode && paceObj.formatted !== '0:00' ? paceObj.formatted : undefined,
      inclinePct: isCardioMode && parsedIncline > 0 ? parsedIncline : undefined,
      sets: isStrengthSetMode ? parsedSets : undefined,
      reps: isStrengthSetMode ? parsedReps : undefined,
      restSeconds: isStrengthSetMode ? parsedRest : undefined,
    };

    if (editingBurnId) {
      const updated = guestStorage.updateExerciseBurn(date, editingBurnId, burnPayload);
      onBurnsUpdated(updated);
      setEditingBurnId(null);
    } else {
      const updated = guestStorage.addExerciseBurn(date, burnPayload);
      onBurnsUpdated(updated);
    }
  };

  const handleEditClick = (b: GuestExerciseBurn) => {
    setEditingBurnId(b.id);
    if (b.activityId) setSelectedActivityId(b.activityId);
    if (b.intensity) setIntensity(b.intensity);
    setDurationMinStr(String(b.durationMinutes));
    if (b.distanceKm) {
      setIsCardioMode(true);
      setDistanceKmStr(String(b.distanceKm));
    }
    if (b.inclinePct) setInclinePctStr(String(b.inclinePct));
    if (b.sets) {
      setIsStrengthSetMode(true);
      setSetsStr(String(b.sets));
      if (b.reps) setRepsStr(String(b.reps));
      if (b.restSeconds) setRestSecStr(String(b.restSeconds));
    }
    window.scrollTo({ top: 700, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingBurnId(null);
  };

  const handleRemoveBurn = (burnId: string) => {
    const date = guestStorage.getDhakaDateString();
    const updated = guestStorage.removeExerciseBurn(date, burnId);
    onBurnsUpdated(updated);
  };

  const handleRepeatYesterday = () => {
    const updated = guestStorage.repeatYesterdayWorkout();
    onBurnsUpdated(updated);
  };

  const totalBurned = burns.reduce((acc, b) => acc + b.burnedKcal, 0);

  return (
    <div className="rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-sm">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-tomato-brand/10 text-tomato-brand flex items-center justify-center border border-tomato-brand/20">
            <Flame className="w-6 h-6 fill-tomato-brand" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-foreground">
                {t('ব্যায়াম ও ক্যালোরি বার্ন লগ (Compendium)', 'Exercise & Calorie Burn (MET)')}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-lime-soft border border-lime-brand/30 text-ink-base text-[10px] font-bold uppercase">
                40+ Activities
              </span>
            </div>
            <span className="text-xs text-muted-foreground mt-0.5 block">
              {t(
                'Ainsworth Compendium বৈজ্ঞানিক কোড ও নেট এনার্জি ব্যালেন্স সমীকরণ',
                'Based on the Ainsworth Compendium of Physical Activities & Net Caloric Expenditure'
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {yesterdayBurns.length > 0 && (
            <button
              type="button"
              onClick={handleRepeatYesterday}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-secondary hover:bg-secondary/80 text-foreground border border-border text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
              title={t('গতকালের ব্যায়াম কপি করুন', "Repeat yesterday's workout")}
            >
              <RotateCcw className="w-3.5 h-3.5 text-lime-brand" />
              <span>{t('গতকালের ব্যায়াম পুনরাবৃত্তি', 'Repeat Yesterday')}</span>
            </button>
          )}

          <div className="text-right pl-3 border-l border-border">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              {t('আজকের ব্যায়ামে বার্ন', 'Burned Today')}
            </span>
            <span className="font-display font-black text-2xl sm:text-3xl text-tomato-brand">
              {totalBurned}
              <span className="text-xs font-bold text-muted-foreground"> / {targetBurnKcal} kcal</span>
            </span>
          </div>
        </div>
      </div>

      {/* Formula & Double-Count Explanation Drawer Toggle */}
      <div className="mt-4 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => setShowFormulaDrawer(!showFormulaDrawer)}
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-bold cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-lime-brand" />
          <span>
            {showFormulaDrawer
              ? t('সূত্র বিবরণ বন্ধ করুন', 'Hide Calculation Formula')
              : t('সূত্র ও দ্বিগুণ গণনা রোধের ব্যাখ্যা', 'How extra calories are counted (No double-counting)')}
          </span>
        </button>

        <span className="text-muted-foreground text-[11px]">
          {t('শরীরের ওজন:', 'Weight:')} <strong className="text-foreground">{safeWeight} kg</strong>
        </span>
      </div>

      {/* Formula Drawer Body */}
      <AnimatePresence>
        {showFormulaDrawer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-3"
          >
            <div className="p-4 rounded-2xl bg-secondary/50 border border-border/80 text-xs space-y-2 text-muted-foreground leading-relaxed">
              <div className="font-bold text-foreground flex items-center gap-2">
                <Info className="w-4 h-4 text-lime-brand" />
                <span>{t('কেন আমরা নেট বার্ন (Net Burn) গণনা করি?', 'Why we use Net Calorie Burn')}</span>
              </div>
              <p>
                {t(
                  'আপনার বেসাল মেটাবলিক রেট (BMR) ইতোমধ্যেই বিশ্রামাবস্থার স্বাভাবিক ক্যালোরি (1.0 MET) গণনা করে থাকে। ব্যায়ামের সময় যদি মোট (Gross) ক্যালোরি যোগ করা হয়, তবে বিশ্রামাবস্থার ক্যালোরি দুইবার গণনা হয়ে যাবে। তাই আমরা শুধুমাত্র ব্যায়ামের অতিরিক্ত ক্যালোরি গণনা করি:',
                  'Your BMR already accounts for baseline resting energy (1.0 MET). If gross burn were added to daily targets, baseline energy would be double-counted. Therefore, we calculate strictly the EXTRA net calories burned:'
                )}
              </p>
              <div className="p-2.5 rounded-xl bg-card border border-border font-mono text-[11px] text-foreground font-bold">
                Net Burn (kcal) = (MET - 1) × ওজন (কেজি) × সময় (ঘণ্টা)
              </div>
              <div className="flex items-center gap-4 text-[11px] pt-1">
                <span>{t('বর্তমান নির্বাচন অনুযায়ী গ্রস বার্ন:', 'Current Gross Burn:')} <strong>{estimatedGrossBurn} kcal</strong></span>
                <span>•</span>
                <span className="text-lime-brand font-bold">{t('প্রকৃত অতিরিক্ত নেট বার্ন:', 'Net Extra Burn Added:')} <strong>{estimatedNetBurn} kcal</strong></span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Category Filter Strip */}
      <div className="mt-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('৪০+ ব্যায়াম খুঁজুন (যেমন: দৌড়ানো, স্কোয়াট, ফুটবল)...', 'Search 40+ exercises (e.g. running, squat, cricket)...')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/60 border border-border text-xs font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-lime-brand"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'cardio', 'strength', 'core', 'hiit', 'sports'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-colors cursor-pointer border ${
                  selectedCategory === cat
                    ? 'bg-foreground text-background border-foreground font-black'
                    : 'bg-secondary/40 text-muted-foreground border-border hover:text-foreground'
                }`}
              >
                {cat === 'all'
                  ? t('সবগুলো', 'All')
                  : cat === 'cardio'
                  ? t('কার্ডিও', 'Cardio')
                  : cat === 'strength'
                  ? t('স্ট্রেন্থ/জিম', 'Strength')
                  : cat === 'core'
                  ? t('কোর/যোগ', 'Core & Yoga')
                  : cat === 'hiit'
                  ? t('এইচআইআইটি', 'HIIT')
                  : t('খেলাধুলা', 'Sports')}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Selector Grid / Picker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1 rounded-2xl bg-secondary/20 border border-border/60">
          {filteredActivities.map((act) => {
            const isSelected = act.id === selectedActivityId;
            const isFav = favorites.includes(act.id);
            return (
              <div
                key={act.id}
                onClick={() => {
                  setSelectedActivityId(act.id);
                  if (act.supportsDistancePace) {
                    setIsCardioMode(true);
                  } else {
                    setIsCardioMode(false);
                  }
                  if (act.supportsStrengthMode) {
                    setIsStrengthSetMode(false);
                  }
                }}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-lime-soft/40 border-lime-brand shadow-sm font-bold text-foreground'
                    : 'bg-card border-border hover:bg-secondary/50 text-foreground'
                }`}
              >
                <div className="flex-1 pr-2 truncate">
                  <div className="font-bold truncate">
                    {locale === 'bn' ? act.nameBn : act.nameEn}
                  </div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono">Code #{act.compendiumCode}</span>
                    <span>•</span>
                    <span className="font-black text-tomato-brand">MET {act.baseMet}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(act.id);
                  }}
                  className="p-1 text-muted-foreground hover:text-yellow-500 transition-colors"
                  title="Favorite"
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      isFav ? 'fill-yellow-500 text-yellow-500' : ''
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Activity Configuration Form */}
      <div className="mt-6 p-5 rounded-2xl bg-secondary/40 border border-border space-y-4">
        {/* Intensity Selection Strip */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              {t('তীব্রতা স্তর (Intensity)', 'Workout Intensity')}
            </label>
            <span className="text-xs font-black text-tomato-brand">
              MET {effectiveMet}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              {
                key: 'light',
                labelBn: 'হালকা (Light)',
                labelEn: 'Light',
                met: currentActivity.metByIntensity.light,
                hintBn: 'স্বচ্ছন্দে পূর্ণ বাক্যে কথা বলা যায়',
                hintEn: 'Can speak full sentences easily',
              },
              {
                key: 'moderate',
                labelBn: 'মাঝারি (Moderate)',
                labelEn: 'Moderate',
                met: currentActivity.metByIntensity.moderate,
                hintBn: 'ছোট বাক্যে কথা বলা যায়, শ্বাস দ্রুত',
                hintEn: 'Can speak short phrases, breathing elevated',
              },
              {
                key: 'vigorous',
                labelBn: 'তীব্র (Hard / Vigorous)',
                labelEn: 'Hard / Vigorous',
                met: currentActivity.metByIntensity.vigorous,
                hintBn: 'শুধু দু-একটি শব্দ বলা সম্ভব',
                hintEn: 'Can only speak 1-2 words at a time',
              },
            ].map((i) => {
              const active = intensity === i.key;
              return (
                <button
                  key={i.key}
                  type="button"
                  onClick={() => setIntensity(i.key as 'light' | 'moderate' | 'vigorous')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    active
                      ? 'bg-card border-lime-brand shadow-sm ring-1 ring-lime-brand'
                      : 'bg-card/50 border-border hover:bg-card text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-foreground">
                      {locale === 'bn' ? i.labelBn : i.labelEn}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-tomato-brand">
                      {i.met} MET
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground block mt-1 line-clamp-1">
                    {locale === 'bn' ? i.hintBn : i.hintEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Specialized Modes Toggles (Cardio Distance/Pace/Incline & Strength Sets/Reps) */}
        {(currentActivity.supportsDistancePace || currentActivity.supportsStrengthMode) && (
          <div className="flex items-center gap-3 pt-1 text-xs">
            {currentActivity.supportsDistancePace && (
              <button
                type="button"
                onClick={() => setIsCardioMode(!isCardioMode)}
                className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  isCardioMode
                    ? 'bg-lime-brand text-ink-base border-lime-brand font-black'
                    : 'bg-card text-muted-foreground border-border hover:text-foreground'
                }`}
              >
                <Gauge className="w-3.5 h-3.5" />
                <span>{t('দূরত্ব ও গতি হিসাব (Speed & Pace)', 'Distance & Pace Mode')}</span>
              </button>
            )}

            {currentActivity.supportsStrengthMode && (
              <button
                type="button"
                onClick={() => setIsStrengthSetMode(!isStrengthSetMode)}
                className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  isStrengthSetMode
                    ? 'bg-lime-brand text-ink-base border-lime-brand font-black'
                    : 'bg-card text-muted-foreground border-border hover:text-foreground'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{t('সেটস ও রেপস মোড (Sets & Reps)', 'Sets & Reps Mode')}</span>
              </button>
            )}
          </div>
        )}

        {/* Cardio Fields (Distance, Speed, Pace, Incline) */}
        {isCardioMode && currentActivity.supportsDistancePace && (
          <div className="p-4 rounded-xl bg-card border border-border space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <NumberField
                id="exercise-distance"
                label={<span className="text-xs font-bold text-muted-foreground">{t('দূরত্ব (কিমি)', 'Distance (km)')}</span>}
                unit="km"
                allowDecimals
                step="0.1"
                value={distanceKmStr}
                onChange={(val) => setDistanceKmStr(val)}
                min={0.1}
                max={100}
                placeholder="3.0"
              />

              <NumberField
                id="exercise-time-cardio"
                label={<span className="text-xs font-bold text-muted-foreground">{t('সময় (মিনিট)', 'Duration (min)')}</span>}
                unit="min"
                value={durationMinStr}
                onChange={(val) => setDurationMinStr(val)}
                min={1}
                max={360}
                placeholder="30"
              />

              {currentActivity.supportsIncline && (
                <NumberField
                  id="exercise-incline"
                  label={<span className="text-xs font-bold text-muted-foreground">{t('ট্রেডমিল ইনক্লাইন (%)', 'Incline (%)')}</span>}
                  unit="%"
                  allowDecimals
                  step="0.5"
                  value={inclinePctStr}
                  onChange={(val) => setInclinePctStr(val)}
                  min={0}
                  max={25}
                  placeholder="0"
                />
              )}
            </div>

            {/* Live Speed & Pace feedback */}
            <div className="flex flex-wrap items-center justify-between text-xs font-bold pt-2 border-t border-border/60">
              <div className="flex items-center gap-4">
                <span>
                  {t('গতি:', 'Speed:')}{' '}
                  <strong className="text-foreground">{speedKmh} km/h</strong>
                </span>
                <span>•</span>
                <span>
                  {t('পেস:', 'Pace:')}{' '}
                  <strong className="text-lime-brand">{paceObj.formatted} min/km</strong>
                </span>
              </div>

              {parsedIncline > 0 && (
                <span className="text-xs text-tomato-brand">
                  ACSM Incline ({parsedIncline}%)
                </span>
              )}
            </div>

            {isSpeedSanityWarning && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-tomato-brand/10 text-tomato-brand text-xs font-medium border border-tomato-brand/20">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  {t(
                    'গতি অস্বাভাবিকভাবে বেশি মনে হচ্ছে। সময় ও দূরত্বের তথ্য পুনরায় যাচাই করুন।',
                    'Calculated speed seems unusually high. Please verify time and distance.'
                  )}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Strength Sets/Reps Fields */}
        {isStrengthSetMode && currentActivity.supportsStrengthMode && (
          <div className="p-4 rounded-xl bg-card border border-border space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <NumberField
                id="strength-sets"
                label={<span className="text-xs font-bold text-muted-foreground">{t('সেট সংখ্যা', 'Sets')}</span>}
                value={setsStr}
                onChange={(val) => setSetsStr(val)}
                min={1}
                max={20}
                placeholder="4"
              />
              <NumberField
                id="strength-reps"
                label={<span className="text-xs font-bold text-muted-foreground">{t('প্রতি সেটে রেপস', 'Reps/Set')}</span>}
                value={repsStr}
                onChange={(val) => setRepsStr(val)}
                min={1}
                max={50}
                placeholder="10"
              />
              <NumberField
                id="strength-rest"
                label={<span className="text-xs font-bold text-muted-foreground">{t('বিশ্রাম (সেকেন্ড)', 'Rest (sec)')}</span>}
                unit="sec"
                value={restSecStr}
                onChange={(val) => setRestSecStr(val)}
                min={15}
                max={300}
                placeholder="90"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {t('আনুমানিক সক্রিয় ব্যায়াম সময়কাল:', 'Estimated workout time:')}{' '}
              <strong className="text-foreground">{effectiveDurationMinutes} {t('মিনিট', 'mins')}</strong>
            </div>
          </div>
        )}

        {/* Duration Quick Chips & Duration Input if not sets mode and not cardio mode */}
        {!isStrengthSetMode && !isCardioMode && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t('সময়কাল বেছে নিন (মিনিট)', 'Select Duration')}
              </span>
              <div className="flex items-center gap-1.5">
                {[10, 20, 30, 45, 60].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => setDurationMinStr(String(quick))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      durationMinStr === String(quick)
                        ? 'bg-foreground text-background border-foreground font-black'
                        : 'bg-card text-muted-foreground border-border hover:text-foreground'
                    }`}
                  >
                    {quick}m
                  </button>
                ))}
              </div>
            </div>

            <NumberField
              id="exercise-duration-custom"
              unit="min"
              value={durationMinStr}
              onChange={(val) => setDurationMinStr(val)}
              min={1}
              max={300}
              placeholder="30"
              aria-label="Custom duration in minutes"
            />
          </div>
        )}

        {/* Action Button & Live Preview Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="text-xs">
            <span className="text-muted-foreground block">
              {t('প্রাক্কলিত অতিরিক্ত নেট বার্ন:', 'Estimated Net Burn Added:')}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-display font-black text-2xl text-tomato-brand">
                {estimatedNetBurn} kcal
              </span>
              <span className="text-[11px] text-muted-foreground">
                ({effectiveDurationMinutes} {t('মিনিট', 'mins')})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {editingBurnId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-3 rounded-xl bg-secondary text-foreground text-xs font-bold border border-border hover:bg-secondary/80 cursor-pointer"
              >
                {t('বাতিল', 'Cancel')}
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveBurn}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-tomato-brand hover:bg-tomato-brand/90 text-white font-display font-black text-xs uppercase tracking-wider transition-transform active:scale-95 cursor-pointer shadow-md"
            >
              {editingBurnId ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{t('আপডেট সম্পন্ন করুন', 'Update Exercise')}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>{t(`বার্ন যোগ (${estimatedNetBurn} kcal)`, `Add Burn (${estimatedNetBurn} kcal)`)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Logged Exercise List */}
      {burns.length > 0 && (
        <div className="mt-6 space-y-2 pt-5 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              {t('আজকের সম্পন্ন ব্যায়ামসমূহ', 'Logged Activities Today')}
            </span>
            <span className="text-xs font-black text-tomato-brand">
              {burns.length} {t('টি সেশন', 'sessions')} • {totalBurned} kcal
            </span>
          </div>

          <div className="divide-y divide-border/40 rounded-2xl bg-secondary/30 border border-border/60">
            {burns.map((b) => (
              <div
                key={b.id}
                className="p-3.5 flex items-center justify-between text-xs gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-tomato-brand/10 text-tomato-brand flex items-center justify-center shrink-0">
                    <Flame className="w-4 h-4 fill-tomato-brand" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-foreground truncate">
                      {locale === 'bn' ? b.nameBn : b.nameEn}
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span>{b.durationMinutes} {t('মিনিট', 'mins')}</span>
                      {b.distanceKm && <span>• {b.distanceKm} km</span>}
                      {b.paceMinKm && <span>• {b.paceMinKm} min/km</span>}
                      {b.inclinePct && <span>• {b.inclinePct}% inc</span>}
                      {b.intensity && <span className="capitalize">• {b.intensity}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-display font-black text-sm text-tomato-brand">
                    {b.burnedKcal} kcal
                  </span>
                  <button
                    type="button"
                    onClick={() => handleEditClick(b)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                    title={t('সম্পাদনা', 'Edit')}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveBurn(b.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-tomato-brand hover:bg-secondary transition-colors cursor-pointer"
                    title={t('মুছুন', 'Delete')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
