'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { guestStorage, type GuestProfile } from '@/lib/guest-storage';
import {
  calculateBMR,
  calculateTDEE,
  calculateCaloricTarget,
  calculateMacroSplit,
  type ActivityLevel,
  type Goal,
} from '@/server/services/calculations';
import { NumberField } from '@/components/ui/number-field';
import { X, Sliders, AlertTriangle } from 'lucide-react';
import { Z_INDEX } from '@/config/z-index';

interface ProfileTargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: GuestProfile;
  onSaveProfile: (profile: GuestProfile) => void;
}

export function ProfileTargetModal({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}: ProfileTargetModalProps) {
  const { t } = useLanguage();
  const [gender, setGender] = useState<'male' | 'female'>(profile.gender || 'male');

  // Keep numeric inputs as raw string states while typing to allow clearing / backspace
  const [ageStr, setAgeStr] = useState<string>(profile.age ? String(profile.age) : '26');
  const [heightStr, setHeightStr] = useState<string>(profile.heightCm ? String(profile.heightCm) : '172');
  const [weightStr, setWeightStr] = useState<string>(profile.weightKg ? String(profile.weightKg) : '70');

  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    profile.activityLevel || 'moderate'
  );
  const [goal, setGoal] = useState<Goal>(profile.goal || 'loss');

  if (!isOpen) return null;

  // Strict boundary validation: age 10-100, height 100-250 cm, weight 30-300 kg
  const parsedAge = ageStr.trim() === '' ? undefined : parseFloat(ageStr);
  const parsedHeight = heightStr.trim() === '' ? undefined : parseFloat(heightStr);
  const parsedWeight = weightStr.trim() === '' ? undefined : parseFloat(weightStr);

  const isAgeValid =
    parsedAge !== undefined && !isNaN(parsedAge) && parsedAge >= 10 && parsedAge <= 100;
  const isHeightValid =
    parsedHeight !== undefined && !isNaN(parsedHeight) && parsedHeight >= 100 && parsedHeight <= 250;
  const isWeightValid =
    parsedWeight !== undefined && !isNaN(parsedWeight) && parsedWeight >= 30 && parsedWeight <= 300;

  const isValid = isAgeValid && isHeightValid && isWeightValid;

  // Inline error messages
  const ageError = !isAgeValid
    ? ageStr.trim() === ''
      ? t('বয়স প্রদান করুন', 'Age is required')
      : t('বয়স ১০ থেকে ১০০ এর মধ্যে হতে হবে', 'Age must be 10-100')
    : undefined;

  const heightError = !isHeightValid
    ? heightStr.trim() === ''
      ? t('উচ্চতা প্রদান করুন', 'Height is required')
      : t('উচ্চতা ১০০ থেকে ২৫০ সেমি হতে হবে', 'Height must be 100-250 cm')
    : undefined;

  const weightError = !isWeightValid
    ? weightStr.trim() === ''
      ? t('ওজন প্রদান করুন', 'Weight is required')
      : t('ওজন ৩০ থেকে ৩০০ কেজি হতে হবে', 'Weight must be 30-300 kg')
    : undefined;

  // Real-time domain calculations guarded: NEVER compute with NaN/undefined
  let bmr: number | null = null;
  let tdee: number | null = null;
  let targetKcal: number | null = null;
  let macros = { protein: 0, carbs: 0, fat: 0 };
  let isSafeFloorTriggered = false;

  if (isValid && parsedWeight !== undefined && parsedHeight !== undefined && parsedAge !== undefined) {
    try {
      bmr = calculateBMR(parsedWeight, parsedHeight, parsedAge, gender);
      tdee = calculateTDEE(bmr, activityLevel);
      targetKcal = calculateCaloricTarget(tdee, goal, gender);
      macros = calculateMacroSplit(targetKcal, parsedWeight, goal);

      isSafeFloorTriggered =
        (gender === 'female' && targetKcal <= 1200) ||
        (gender === 'male' && targetKcal <= 1500);
    } catch {
      // Guarantees zero crash during reactive calculation
      bmr = null;
      tdee = null;
      targetKcal = null;
    }
  }

  const handleSave = () => {
    if (!isValid || parsedAge === undefined || parsedHeight === undefined || parsedWeight === undefined) {
      return;
    }
    const updated: GuestProfile = {
      gender,
      age: Math.round(parsedAge),
      heightCm: Math.round(parsedHeight),
      weightKg: Number(parsedWeight.toFixed(1)),
      activityLevel,
      goal,
    };
    guestStorage.saveProfile(updated);
    onSaveProfile(updated);
    onClose();
  };

  return (
    <div
      style={{ zIndex: Z_INDEX.modal }}
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-xl max-h-[90vh] bg-card text-card-foreground border-2 border-border rounded-3xl p-6 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-soft text-ink-base dark:bg-[#2A111E] dark:text-pink-soft flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl uppercase tracking-tight text-foreground">
                {t('দৈনিক ক্যালোরি ও পুষ্টি লক্ষ্য', 'Daily Calorie & Macro Target')}
              </h2>
              <span className="text-xs text-muted-foreground">
                {t('Mifflin-St Jeor সমীকরণের বৈজ্ঞানিক হিসাব', 'Scientific Mifflin-St Jeor calculations')}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Gender */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              {t('লিঙ্গ', 'Gender')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`py-2.5 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  gender === 'male'
                    ? 'bg-lime-brand text-ink-base shadow-sm'
                    : 'bg-secondary text-foreground border border-border'
                }`}
              >
                {t('পুরুষ', 'Male')}
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`py-2.5 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  gender === 'female'
                    ? 'bg-lime-brand text-ink-base shadow-sm'
                    : 'bg-secondary text-foreground border border-border'
                }`}
              >
                {t('নারী', 'Female')}
              </button>
            </div>
          </div>

          {/* Age, Height, Weight with NumberField */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <NumberField
              id="profile-age"
              label={<span className="text-xs font-bold text-muted-foreground">{t('বয়স', 'Age')}</span>}
              unit="yrs"
              value={ageStr}
              onChange={(val) => setAgeStr(val)}
              min={10}
              max={100}
              placeholder="26"
              error={!isAgeValid}
              errorMessage={ageError}
              aria-label="Age in years"
            />

            <NumberField
              id="profile-height"
              label={<span className="text-xs font-bold text-muted-foreground">{t('উচ্চতা (সেমি)', 'Height (cm)')}</span>}
              unit="cm"
              value={heightStr}
              onChange={(val) => setHeightStr(val)}
              min={100}
              max={250}
              placeholder="172"
              error={!isHeightValid}
              errorMessage={heightError}
              aria-label="Height in centimeters"
            />

            <NumberField
              id="profile-weight"
              label={<span className="text-xs font-bold text-muted-foreground">{t('ওজন (কেজি)', 'Weight (kg)')}</span>}
              unit="kg"
              allowDecimals
              step="0.1"
              value={weightStr}
              onChange={(val) => setWeightStr(val)}
              min={30}
              max={300}
              placeholder="70.0"
              error={!isWeightValid}
              errorMessage={weightError}
              aria-label="Weight in kilograms"
            />
          </div>

          {/* Daily Routine Multiplier (Excluding Workouts) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                {t('দৈনিক সাধারণ কাজের ধরন (ব্যায়াম ছাড়া)', 'Daily Routine (Excluding Workouts)')}
              </label>
              <span className="text-[10px] font-bold text-lime-brand uppercase">
                {t('দ্বিগুণ গণনা রোধ', 'No Double Count')}
              </span>
            </div>
            <select
              value={
                activityLevel === 'sedentary'
                  ? 'sedentary'
                  : activityLevel === 'light'
                  ? 'light'
                  : 'moderate'
              }
              onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/80 border border-border text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-lime-brand cursor-pointer"
            >
              <option value="sedentary">
                {t('অলস / ডেস্কে বসে কাজ, হাঁটাচলা কম (Sedentary 1.2x)', 'Sedentary — Desk job, minimal walking (1.2x)')}
              </option>
              <option value="light">
                {t('হালকা সক্রিয় — ডেস্কে কাজ + কিছু হাঁটাচলা (Lightly Active 1.375x)', 'Lightly Active — Desk job + errands / walking (1.375x)')}
              </option>
              <option value="moderate">
                {t('সক্রিয় — বেশিরভাগ সময় দাঁড়িয়ে বা হেঁটে কাজ (On feet most of day 1.55x)', 'On feet most of the day — Standing, retail, teaching (1.55x)')}
              </option>
            </select>
            <p className="mt-1.5 text-[11px] text-muted-foreground leading-normal">
              {t(
                'এখানে জিম বা স্পোর্টস অন্তর্ভুক্ত করবেন না; সেগুলো নিচে আলাদাভাবে লগ করবেন যাতে ক্যালোরি দুইবার গণনা না হয়।',
                'Do not include gym or sports here; log them below so you do not count them twice.'
              )}
            </p>
          </div>

          {/* Fitness Goal */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
              {t('আপনার ফিটনেস লক্ষ্য', 'Primary Fitness Goal')}
            </label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as Goal)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/80 border border-border text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-lime-brand cursor-pointer"
            >
              <option value="maintain">{t('বর্তমান ওজন বজায় রাখা (Maintain Weight)', 'Maintain Current Weight')}</option>
              <option value="mild_loss">{t('ধীরগতিতে চর্বি কমানো (-২৫০ ক্যালোরি/দিন)', 'Mild Fat Loss (-250 kcal/day)')}</option>
              <option value="loss">{t('স্ট্যান্ডার্ড ওজন কমানো (-৫০০ ক্যালোরি/দিন)', 'Standard Fat Loss (-500 kcal/day)')}</option>
              <option value="extreme_loss">{t('জরুরি ওজন কমানো (-৭৫০ ক্যালোরি/দিন - কঠোর)', 'Extreme Weight Loss (-750 kcal/day - Aggressive)')}</option>
              <option value="muscle_gain">{t('লিন মাসল গেইন / চর্বিমুক্ত পেশি বৃদ্ধি (+৩০০ ক্যালোরি/দিন)', 'Lean Muscle Gain / Bulk (+300 kcal/day)')}</option>
            </select>
          </div>

          {/* Live Output Card */}
          <div className="p-4 rounded-2xl bg-secondary/60 border border-border space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-semibold">
                BMR: <strong className="text-foreground">{bmr !== null ? `${bmr} kcal` : '--'}</strong> • TDEE:{' '}
                <strong className="text-foreground">{tdee !== null ? `${tdee} kcal` : '--'}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-lime-soft text-ink-base text-[11px] font-black font-display">
                {t('টার্গেট ক্যালোরি', 'Target')}: {targetKcal !== null ? `${targetKcal} kcal` : '--'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-border/40 text-xs">
              <div className="p-2 rounded-xl bg-card border border-border/60">
                <span className="text-[10px] text-muted-foreground font-bold block">{t('প্রোটিন লক্ষ্য', 'Protein')}</span>
                <span className="font-display font-black text-sm text-lime-brand">
                  {isValid && macros.protein > 0 ? `${macros.protein}g` : '--'}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-card border border-border/60">
                <span className="text-[10px] text-muted-foreground font-bold block">{t('কার্বস লক্ষ্য', 'Carbs')}</span>
                <span className="font-display font-black text-sm text-foreground">
                  {isValid && macros.carbs > 0 ? `${macros.carbs}g` : '--'}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-card border border-border/60">
                <span className="text-[10px] text-muted-foreground font-bold block">{t('ফ্যাট লক্ষ্য', 'Fat')}</span>
                <span className="font-display font-black text-sm text-pink-brand">
                  {isValid && macros.fat > 0 ? `${macros.fat}g` : '--'}
                </span>
              </div>
            </div>
          </div>

          {/* Health & Safety Floor Warning Banner */}
          {isSafeFloorTriggered && (
            <div className="p-3.5 rounded-2xl bg-tomato-brand/10 border border-tomato-brand/30 text-xs text-tomato-brand flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">
                  {t('ন্যূনতম নিরাপদ ক্যালোরি সতর্কতা:', 'Safe Calorie Floor Notice:')}
                </strong>
                <span>
                  {t(
                    `স্বাস্থ্য বিশেষজ্ঞদের মতে একজন ${gender === 'female' ? 'নারীর' : 'পুরুষের'} জন্য দিনে ${gender === 'female' ? '১২০০' : '১৫০০'} ক্যালোরির নিচে খাওয়া শরীরের জন্য ক্ষতিকর হতে পারে। সর্বদা পুষ্টিবিদের পরামর্শ নিন।`,
                    `According to clinical guidelines, intake below ${gender === 'female' ? '1200' : '1500'} kcal/day can trigger metabolic slowdown and micronutrient deficiencies. Always consult a physician or dietitian.`
                  )}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
          >
            {t('বাতিল', 'Cancel')}
          </button>
          <button
            type="button"
            disabled={!isValid}
            onClick={handleSave}
            className={`px-6 py-2.5 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all ${
              !isValid
                ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
                : 'bg-lime-brand hover:bg-lime-brand/90 text-ink-base cursor-pointer shadow-sm active:scale-95'
            }`}
          >
            {t('সেভ ও আপডেট করুন', 'Save Target')}
          </button>
        </div>
      </div>
    </div>
  );
}
