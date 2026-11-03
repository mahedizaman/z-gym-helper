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
import { X, Sliders, AlertTriangle } from 'lucide-react';

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
  const [gender, setGender] = useState<'male' | 'female'>(profile.gender);
  const [age, setAge] = useState<number>(profile.age);
  const [heightCm, setHeightCm] = useState<number>(profile.heightCm);
  const [weightKg, setWeightKg] = useState<number>(profile.weightKg);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    profile.activityLevel
  );
  const [goal, setGoal] = useState<Goal>(profile.goal);

  if (!isOpen) return null;

  // Real-time domain calculations
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const targetKcal = calculateCaloricTarget(tdee, goal, gender);
  const macros = calculateMacroSplit(targetKcal, weightKg, goal);

  const isSafeFloorTriggered =
    (gender === 'female' && targetKcal <= 1200) ||
    (gender === 'male' && targetKcal <= 1500);

  const handleSave = () => {
    const updated: GuestProfile = {
      gender,
      age,
      heightCm,
      weightKg,
      activityLevel,
      goal,
    };
    guestStorage.saveProfile(updated);
    onSaveProfile(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-card border border-border rounded-3xl p-6 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-soft text-pink-brand flex items-center justify-center">
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
            className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground"
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

          {/* Age, Height, Weight */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1.5">
                {t('বয়স', 'Age')}
              </label>
              <input
                type="number"
                min="12"
                max="100"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-secondary/80 border border-border text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-lime-brand"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1.5">
                {t('উচ্চতা (সেমি)', 'Height (cm)')}
              </label>
              <input
                type="number"
                min="120"
                max="230"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-secondary/80 border border-border text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-lime-brand"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1.5">
                {t('ওজন (কেজি)', 'Weight (kg)')}
              </label>
              <input
                type="number"
                min="35"
                max="220"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-secondary/80 border border-border text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-lime-brand"
              />
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
              {t('দৈনিক শারীরিক পরিশ্রম', 'Daily Activity Level')}
            </label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/80 border border-border text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-lime-brand"
            >
              <option value="sedentary">{t('অলস / ডেস্কে বসে কাজ (Sedentary, 1.2x)', 'Sedentary (Little or no exercise, desk work, 1.2x)')}</option>
              <option value="light">{t('হালকা এক্টিভ (Light 1-3 দিন/সপ্তাহ, 1.375x)', 'Light (1-3 days exercise/week, 1.375x)')}</option>
              <option value="moderate">{t('মাঝারি এক্টিভ (Moderate 3-5 দিন/সপ্তাহ, 1.55x)', 'Moderate (3-5 days workout/week, 1.55x)')}</option>
              <option value="active">{t('উচ্চ এক্টিভ (Active 6-7 দিন তীব্র জিম, 1.725x)', 'Active (6-7 days intense gym, 1.725x)')}</option>
              <option value="very_active">{t('পেশাদার অ্যাথলেট (Very Active দ্বিগুণ সেশন, 1.9x)', 'Very Active (Twice per day training / athlete, 1.9x)')}</option>
            </select>
          </div>

          {/* Fitness Goal */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
              {t('আপনার ফিটনেস লক্ষ্য', 'Primary Fitness Goal')}
            </label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as Goal)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/80 border border-border text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-lime-brand"
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
                BMR: <strong className="text-foreground">{bmr} kcal</strong> • TDEE: <strong className="text-foreground">{tdee} kcal</strong>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-lime-soft text-ink-base text-[11px] font-black font-display">
                {t('টার্গেট ক্যালোরি', 'Target')}: {targetKcal} kcal
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-border/40 text-xs">
              <div className="p-2 rounded-xl bg-card border border-border/60">
                <span className="text-[10px] text-muted-foreground font-bold block">{t('প্রোটিন লক্ষ্য', 'Protein')}</span>
                <span className="font-display font-black text-sm text-lime-brand">{macros.protein}g</span>
              </div>
              <div className="p-2 rounded-xl bg-card border border-border/60">
                <span className="text-[10px] text-muted-foreground font-bold block">{t('কার্বস লক্ষ্য', 'Carbs')}</span>
                <span className="font-display font-black text-sm text-foreground">{macros.carbs}g</span>
              </div>
              <div className="p-2 rounded-xl bg-card border border-border/60">
                <span className="text-[10px] text-muted-foreground font-bold block">{t('ফ্যাট লক্ষ্য', 'Fat')}</span>
                <span className="font-display font-black text-sm text-pink-brand">{macros.fat}g</span>
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
            className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            {t('বাতিল', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-lime-brand hover:bg-lime-brand/90 text-ink-base font-display font-black text-xs uppercase tracking-wider transition-transform active:scale-95 cursor-pointer"
          >
            {t('সেভ ও আপডেট করুন', 'Save Target')}
          </button>
        </div>
      </div>
    </div>
  );
}
