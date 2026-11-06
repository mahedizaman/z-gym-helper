'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { guestStorage, type GuestProfile } from '@/lib/guest-storage';
import { type Goal, type ActivityLevel } from '@/server/services/calculations';
import { Z_INDEX } from '@/config/z-index';
import { NumberField } from '@/components/ui/number-field';
import {
  TrendingDown,
  Activity,
  TrendingUp,
  User,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Check,
  Zap,
} from 'lucide-react';

interface FirstRunOnboardingProps {
  isOpen: boolean;
  onComplete: (profile: GuestProfile) => void;
}

export function FirstRunOnboarding({ isOpen, onComplete }: FirstRunOnboardingProps) {
  const { t } = useLanguage();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [goal, setGoal] = useState<Goal>('loss');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [ageStr, setAgeStr] = useState<string>('26');
  const [heightStr, setHeightStr] = useState<string>('172');
  const [weightStr, setWeightStr] = useState<string>('70');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('sedentary');
  const [step2Error, setStep2Error] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSkip = () => {
    const defaultProfile: GuestProfile = {
      gender: 'male',
      age: 26,
      heightCm: 172,
      weightKg: 70,
      activityLevel: 'sedentary',
      goal: 'loss',
    };
    guestStorage.saveProfile(defaultProfile);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zgym_onboarding_completed', 'true');
    }
    onComplete(defaultProfile);
  };

  const handleNextFromStep2 = () => {
    const age = parseInt(ageStr, 10);
    const height = parseInt(heightStr, 10);
    const weight = parseFloat(weightStr);

    if (isNaN(age) || age < 10 || age > 100) {
      setStep2Error(t('বয়স ১০ থেকে ১০০ এর মধ্যে হতে হবে।', 'Age must be between 10 and 100.'));
      return;
    }
    if (isNaN(height) || height < 100 || height > 250) {
      setStep2Error(t('উচ্চতা ১০০ থেকে ২৫০ সেমি এর মধ্যে হতে হবে।', 'Height must be between 100 and 250 cm.'));
      return;
    }
    if (isNaN(weight) || weight < 30 || weight > 300) {
      setStep2Error(t('ওজন ৩০ থেকে ৩০০ কেজির মধ্যে হতে হবে।', 'Weight must be between 30 and 300 kg.'));
      return;
    }

    setStep2Error(null);
    setStep(3);
  };

  const handleFinish = () => {
    const age = parseInt(ageStr, 10) || 26;
    const height = parseInt(heightStr, 10) || 172;
    const weight = parseFloat(weightStr) || 70;

    const profile: GuestProfile = {
      gender,
      age,
      heightCm: height,
      weightKg: weight,
      activityLevel,
      goal,
    };

    guestStorage.saveProfile(profile);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zgym_onboarding_completed', 'true');
    }
    onComplete(profile);
  };

  return (
    <div
      style={{ zIndex: Z_INDEX.modal }}
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-background text-foreground border border-border rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
        {/* Header with step indicator & Skip button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-8 bg-lime-brand'
                    : s < step
                    ? 'w-3 bg-lime-brand/50'
                    : 'w-3 bg-secondary'
                }`}
              />
            ))}
            <span className="text-xs font-bold text-muted-foreground ml-2">
              {step}/3
            </span>
          </div>

          <button
            type="button"
            onClick={handleSkip}
            className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-secondary"
          >
            {t('স্কিপ করুন', 'Skip')}
          </button>
        </div>

        {/* STEP 1: GOAL */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground">
                {t('আপনার মূল লক্ষ্য কোনটি?', 'What is your primary goal?')}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {t('আপনার লক্ষ্য অনুযায়ী সঠিক ক্যালোরি ও প্রোটিন ঠিক হবে।', 'Your daily calorie and protein targets adjust to your goal.')}
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: 'loss' as Goal,
                  icon: TrendingDown,
                  titleBn: 'ওজন কমানো ও চর্বি ঝরানো',
                  titleEn: 'Lose Weight & Burn Fat',
                  descBn: 'দৈনিক নিরাপদ ক্যালোরি ঘাটতি তৈরি করে মেদ কমান',
                  descEn: 'Safely reduce body fat with controlled deficit',
                  color: 'text-tomato-base border-tomato-base/40 bg-tomato-base/10',
                },
                {
                  id: 'maintain' as Goal,
                  icon: Activity,
                  titleBn: 'ফিট থাকা ও ওজন নিয়ন্ত্রণ',
                  titleEn: 'Maintain Weight & Stay Fit',
                  descBn: 'বর্তমান ওজন ধরে রেখে স্ট্যামিনা বৃদ্ধি করুন',
                  descEn: 'Keep current weight and boost daily stamina',
                  color: 'text-lime-brand border-lime-brand/40 bg-lime-brand/10',
                },
                {
                  id: 'muscle_gain' as Goal,
                  icon: TrendingUp,
                  titleBn: 'পেশি গঠন ও ওজন বৃদ্ধি',
                  titleEn: 'Build Muscle & Gain Weight',
                  descBn: 'উচ্চ প্রোটিন ও নিয়ন্ত্রিত সারপ্লাস দিয়ে পেশি বাড়ান',
                  descEn: 'Build muscle with high protein and clean surplus',
                  color: 'text-thunder-base border-thunder-base/40 bg-thunder-base/10',
                },
              ].map((g) => {
                const Icon = g.icon;
                const isSelected = goal === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGoal(g.id)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-lime-brand bg-secondary/80 ring-2 ring-lime-brand shadow-sm'
                        : 'border-border bg-secondary/30 hover:bg-secondary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${g.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-foreground">
                          {t(g.titleBn, g.titleEn)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {t(g.descBn, g.descEn)}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-lime-brand text-ink-base flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black uppercase bg-lime-brand text-ink-base hover:bg-lime-hover transition-all cursor-pointer shadow-md"
              >
                <span>{t('পরবর্তী ধাপ', 'Next Step')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: BODY & AGE */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground">
                {t('আপনার শারীরিক তথ্য', 'Your Body Details')}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {t('সঠিক শক্তি খরচ ও পুষ্টি চাহিদার জন্য এই তথ্যগুলো প্রয়োজন।', 'Used to estimate your resting burn rate accurately.')}
              </p>
            </div>

            {step2Error && (
              <div className="p-3 rounded-2xl bg-tomato-base/15 border border-tomato-base/30 text-tomato-base text-xs font-medium">
                {step2Error}
              </div>
            )}

            {/* Gender Toggle */}
            <div>
              <label className="text-xs font-bold text-foreground block mb-2">
                {t('লিঙ্গ', 'Gender')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    gender === 'male'
                      ? 'border-lime-brand bg-secondary/80 ring-2 ring-lime-brand text-foreground'
                      : 'border-border bg-secondary/30 text-muted-foreground'
                  }`}
                >
                  <User className="w-4 h-4 text-lime-brand" />
                  <span>{t('পুরুষ', 'Male')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    gender === 'female'
                      ? 'border-lime-brand bg-secondary/80 ring-2 ring-lime-brand text-foreground'
                      : 'border-border bg-secondary/30 text-muted-foreground'
                  }`}
                >
                  <User className="w-4 h-4 text-thunder-base" />
                  <span>{t('নারী', 'Female')}</span>
                </button>
              </div>
            </div>

            {/* Age, Height, Weight Fields */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1.5">
                  {t('বয়স', 'Age')}
                </label>
                <NumberField
                  value={ageStr}
                  onChange={setAgeStr}
                  placeholder="26"
                  unit={t('বছর', 'yrs')}
                  inputMode="numeric"
                  allowDecimals={false}
                  min={10}
                  max={100}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1.5">
                  {t('উচ্চতা', 'Height')}
                </label>
                <NumberField
                  value={heightStr}
                  onChange={setHeightStr}
                  placeholder="172"
                  unit={t('সেমি', 'cm')}
                  inputMode="numeric"
                  allowDecimals={false}
                  min={100}
                  max={250}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1.5">
                  {t('ওজন', 'Weight')}
                </label>
                <NumberField
                  value={weightStr}
                  onChange={setWeightStr}
                  placeholder="70"
                  unit={t('কেজি', 'kg')}
                  inputMode="decimal"
                  allowDecimals={true}
                  min={30}
                  max={300}
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('আগের ধাপ', 'Back')}</span>
              </button>

              <button
                type="button"
                onClick={handleNextFromStep2}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black uppercase bg-lime-brand text-ink-base hover:bg-lime-hover transition-all cursor-pointer shadow-md"
              >
                <span>{t('পরবর্তী ধাপ', 'Next Step')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: ROUTINE EXCLUDING WORKOUTS */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground">
                {t('দৈনন্দিন রুটিন (ওয়ার্কআউট বাদে)', 'Daily Routine (Excluding Workouts)')}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {t('স্বাভাবিক দিনে আপনি কতটা হাঁটাচলা করেন? ব্যায়ামের ক্যালোরি আলাদা হিসাব হবে।', 'How active is your work routine? Workouts will be tracked separately.')}
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: 'sedentary' as ActivityLevel,
                  icon: Briefcase,
                  titleBn: 'বসে কাজ / অফিস ডেস্কে কাজ',
                  titleEn: 'Desk Job / Mostly Sitting',
                  descBn: 'অধিকাংশ সময় চেয়ারে বসে থাকা, হালকা হাঁটাচলা',
                  descEn: 'Mostly seated work, minimal physical movement',
                },
                {
                  id: 'moderate' as ActivityLevel,
                  icon: Activity,
                  titleBn: 'মাঝারি চলাফেরা / দাঁড়িয়ে কাজ',
                  titleEn: 'Moderate Movement / Standing',
                  descBn: 'শিক্ষক, সেলস, সার্ভিস বা সারাদিন মাঝারি চলাচল',
                  descEn: 'Teacher, retail, regular walking through the day',
                },
                {
                  id: 'active' as ActivityLevel,
                  icon: Zap,
                  titleBn: 'কায়িক পরিশ্রম / সক্রিয় কাজ',
                  titleEn: 'Active / Physical Labor',
                  descBn: 'নির্মাণকাজ, ফিল্ড ওয়ার্ক বা সবসময় ভারী চলাচল',
                  descEn: 'Construction, physical delivery, heavy labor',
                },
              ].map((lvl) => {
                const Icon = lvl.icon;
                const isSelected = activityLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setActivityLevel(lvl.id)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-lime-brand bg-secondary/80 ring-2 ring-lime-brand shadow-sm'
                        : 'border-border bg-secondary/30 hover:bg-secondary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-lime-brand/15 text-lime-brand flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-foreground">
                          {t(lvl.titleBn, lvl.titleEn)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {t(lvl.descBn, lvl.descEn)}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-lime-brand text-ink-base flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('আগের ধাপ', 'Back')}</span>
              </button>

              <button
                type="button"
                onClick={handleFinish}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-xs font-black uppercase bg-lime-brand text-ink-base hover:bg-lime-hover transition-all cursor-pointer shadow-lg hover:scale-105"
              >
                <span>{t('আজ শুরু করুন', 'Start Today')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
