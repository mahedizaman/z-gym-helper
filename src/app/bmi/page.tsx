'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { calculateBMI, getBMICategory, getHealthyWeightRange } from '@/server/services/calculations';
import { Scale, Info, Calculator, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { MedicalDisclaimer } from '@/components/legal/medical-disclaimer';
import { AdSlot } from '@/components/ads/ad-slot';
import { NumberField } from '@/components/ui/number-field';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export default function BMIPage() {
  const { t } = useLanguage();
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');

  // Metric inputs as raw string states
  const [heightCmStr, setHeightCmStr] = useState<string>('172');
  const [weightKgStr, setWeightKgStr] = useState<string>('68');

  // Imperial inputs as raw string states
  const [heightFeetStr, setHeightFeetStr] = useState<string>('5');
  const [heightInchesStr, setHeightInchesStr] = useState<string>('8');
  const [weightLbsStr, setWeightLbsStr] = useState<string>('150');

  // Age & Gender
  const [ageStr, setAgeStr] = useState<string>('26');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  // Effective values for calculation guarded against NaN/undefined
  const numHeightCm = heightCmStr.trim() === '' ? 172 : parseFloat(heightCmStr);
  const numWeightKg = weightKgStr.trim() === '' ? 68 : parseFloat(weightKgStr);
  const numHeightFeet = heightFeetStr.trim() === '' ? 5 : parseFloat(heightFeetStr);
  const numHeightInches = heightInchesStr.trim() === '' ? 8 : parseFloat(heightInchesStr);
  const numWeightLbs = weightLbsStr.trim() === '' ? 150 : parseFloat(weightLbsStr);

  const effectiveHeightCm =
    unitSystem === 'metric'
      ? (!isNaN(numHeightCm) && numHeightCm > 0 ? numHeightCm : 172)
      : Math.round(
          (!isNaN(numHeightFeet) && numHeightFeet > 0 ? numHeightFeet : 5) * 30.48 +
            (!isNaN(numHeightInches) && numHeightInches >= 0 ? numHeightInches : 0) * 2.54
        );

  const effectiveWeightKg =
    unitSystem === 'metric'
      ? (!isNaN(numWeightKg) && numWeightKg > 0 ? numWeightKg : 68)
      : Math.round((!isNaN(numWeightLbs) && numWeightLbs > 0 ? numWeightLbs : 150) * 0.453592 * 10) / 10;

  let bmiResult: {
    bmi: number;
    category: 'underweight' | 'normal' | 'overweight' | 'obese';
    categoryBn: string;
    categoryEn: string;
    healthyWeightRangeKg: { min: number; max: number };
  } = {
    bmi: 22.9,
    category: 'normal',
    categoryBn: 'স্বাভাবিক ওজন',
    categoryEn: 'Normal weight',
    healthyWeightRangeKg: { min: 54.7, max: 73.7 },
  };

  try {
    bmiResult = calculateBMI(effectiveWeightKg, effectiveHeightCm);
  } catch {
    // Graceful fallback
  }

  const bmi = bmiResult.bmi;
  const categoryInfo = getBMICategory(bmi);
  const healthyRange = getHealthyWeightRange(effectiveHeightCm);

  // South Asian specific category determination
  // (WHO Asian BMI cut-offs: <18.5 Underweight, 18.5-22.9 Normal, 23-27.4 Overweight, >=27.5 Obese)
  let asianCategoryBn = 'স্বাভাবিক ওজন';
  let asianCategoryEn = 'Healthy / Normal';
  if (bmi < 18.5) {
    asianCategoryBn = 'কম ওজন';
    asianCategoryEn = 'Underweight';
  } else if (bmi >= 27.5) {
    asianCategoryBn = 'স্থূলতা (উচ্চ ঝুঁকি)';
    asianCategoryEn = 'Obese (High Cardiometabolic Risk)';
  } else if (bmi >= 23.0) {
    asianCategoryBn = 'অতিরিক্ত ওজন (ঝুঁকিযুক্ত)';
    asianCategoryEn = 'Overweight (Increased Asian Risk)';
  }

  // Gauge percentage calculation (clamps 12 to 38 into 0-100%)
  const gaugePercent = Math.min(100, Math.max(0, ((bmi - 12) / (38 - 12)) * 100));

  return (
    <ErrorBoundary sectionName={t('BMI ক্যালকুলেটর', 'BMI Calculator')}>
      <div className="min-h-screen py-10 md:py-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto pb-10">
          <div className="w-14 h-14 rounded-3xl bg-lime-soft text-ink-base mx-auto mb-4 flex items-center justify-center border border-lime-brand/30 shadow-sm">
            <Scale className="w-7 h-7" />
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-foreground">
            {t('বডি ম্যাস ইনডেক্স (BMI) ক্যালকুলেটর', 'BODY MASS INDEX (BMI) CALCULATOR')}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            {t(
              'আপনার উচ্চতা ও ওজনের স্বাস্থ্যকর অনুপাত, বিশ্ব স্বাস্থ্য সংস্থা (WHO) এবং দক্ষিণ এশীয় সূচকের ভিত্তিতে আনুমানিক ক্যাটাগরি বিশ্লেষণ।',
              'Calculate your estimated BMI category, healthy weight range, and South Asian metabolic risk thresholds.'
            )}
          </p>

          {/* Unit Toggle */}
          <div className="mt-6 inline-flex p-1 rounded-full bg-secondary border border-border">
            <button
              type="button"
              onClick={() => setUnitSystem('metric')}
              className={`px-5 py-2 rounded-full text-xs font-black uppercase font-display tracking-wider transition-all cursor-pointer ${
                unitSystem === 'metric'
                  ? 'bg-lime-brand text-ink-base shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('মেট্রিক (কেজি / সেমি)', 'Metric (kg / cm)')}
            </button>
            <button
              type="button"
              onClick={() => setUnitSystem('imperial')}
              className={`px-5 py-2 rounded-full text-xs font-black uppercase font-display tracking-wider transition-all cursor-pointer ${
                unitSystem === 'imperial'
                  ? 'bg-lime-brand text-ink-base shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('ইম্পেরিয়াল (পাউন্ড / ফুট-ইঞ্চি)', 'Imperial (lbs / ft-in)')}
            </button>
          </div>
        </div>

        {/* Main Interactive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Inputs Card */}
          <div className="md:col-span-6 rounded-3xl bg-card border border-border p-6 sm:p-7 shadow-sm space-y-5">
            <h2 className="font-display font-extrabold text-lg uppercase text-foreground">
              {t('আপনার পরিমাপ দিন', 'Enter Your Metrics')}
            </h2>

            {/* Gender Selection */}
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

            {/* Height input */}
            {unitSystem === 'metric' ? (
              <NumberField
                id="bmi-height-cm"
                label={<span className="text-xs font-bold text-muted-foreground">{t('উচ্চতা (সেন্টিমিটার)', 'Height (cm)')}</span>}
                unit="cm"
                value={heightCmStr}
                onChange={(val) => setHeightCmStr(val)}
                min={100}
                max={250}
                placeholder="172"
              />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <NumberField
                  id="bmi-height-ft"
                  label={<span className="text-xs font-bold text-muted-foreground">{t('উচ্চতা (ফুট)', 'Height (ft)')}</span>}
                  unit="ft"
                  value={heightFeetStr}
                  onChange={(val) => setHeightFeetStr(val)}
                  min={3}
                  max={8}
                  placeholder="5"
                />
                <NumberField
                  id="bmi-height-in"
                  label={<span className="text-xs font-bold text-muted-foreground">{t('ইঞ্চি', 'Inches (in)')}</span>}
                  unit="in"
                  value={heightInchesStr}
                  onChange={(val) => setHeightInchesStr(val)}
                  min={0}
                  max={11}
                  placeholder="8"
                />
              </div>
            )}

            {/* Weight input */}
            {unitSystem === 'metric' ? (
              <NumberField
                id="bmi-weight-kg"
                label={<span className="text-xs font-bold text-muted-foreground">{t('ওজন (কেজি)', 'Weight (kg)')}</span>}
                unit="kg"
                allowDecimals
                step="0.1"
                value={weightKgStr}
                onChange={(val) => setWeightKgStr(val)}
                min={30}
                max={300}
                placeholder="68.0"
              />
            ) : (
              <NumberField
                id="bmi-weight-lbs"
                label={<span className="text-xs font-bold text-muted-foreground">{t('ওজন (পাউন্ড / lbs)', 'Weight (lbs)')}</span>}
                unit="lbs"
                allowDecimals
                step="0.5"
                value={weightLbsStr}
                onChange={(val) => setWeightLbsStr(val)}
                min={60}
                max={650}
                placeholder="150"
              />
            )}

            {/* Age input */}
            <NumberField
              id="bmi-age"
              label={<span className="text-xs font-bold text-muted-foreground">{t('বয়স (বছর)', 'Age (years)')}</span>}
              unit="yrs"
              value={ageStr}
              onChange={(val) => setAgeStr(val)}
              min={10}
              max={100}
              placeholder="26"
            />
          </div>

          {/* Results Output Card */}
          <div className="md:col-span-6 rounded-3xl bg-card border-2 border-lime-brand/50 p-6 sm:p-7 shadow-xl space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                {t('আপনার গণনা করা BMI', 'Your Computed BMI')}
              </span>
              <div className="flex items-baseline gap-3 mt-2">
                <span className="font-display font-black text-6xl text-foreground">
                  {bmi}
                </span>
                <span
                  className={`font-display text-lg font-black uppercase px-3 py-1 rounded-full ${
                    categoryInfo.category === 'healthy'
                      ? 'bg-lime-soft text-ink-base'
                      : categoryInfo.category === 'underweight'
                      ? 'bg-blue-500/10 text-blue-500'
                      : categoryInfo.category === 'overweight'
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'bg-tomato-brand/10 text-tomato-brand'
                  }`}
                >
                  {t(categoryInfo.labelBn, categoryInfo.labelEn)}
                </span>
              </div>
            </div>

            {/* Visual Gauge Bar */}
            <div className="space-y-2">
              <div className="relative w-full h-4 rounded-full bg-gradient-to-r from-blue-400 via-lime-brand via-amber-400 to-tomato-brand overflow-visible">
                {/* Pointer marker */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-7 rounded-full bg-ink-base border-2 border-white shadow-xl flex items-center justify-center transition-all duration-300"
                  style={{ left: `${gaugePercent}%` }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-lime-brand" />
                </div>
              </div>

              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground pt-1">
                <span>{t('কম ওজন', 'Under')} (&lt;18.5)</span>
                <span>{t('স্বাভাবিক', 'Normal')} (18.5-24.9)</span>
                <span>{t('অতিরিক্ত', 'Over')} (25-29.9)</span>
                <span>{t('স্থূল', 'Obese')} (30+)</span>
              </div>
            </div>

            {/* Healthy Weight Range */}
            <div className="p-4 rounded-2xl bg-secondary/60 border border-border space-y-1">
              <span className="text-xs font-bold text-muted-foreground block">
                {t(
                  `আপনার উচ্চতার (${effectiveHeightCm} সেমি) জন্য আদর্শ স্বাস্থ্যকর ওজন:`,
                  `Healthy weight target for your height (${effectiveHeightCm} cm):`
                )}
              </span>
              <span className="font-display font-black text-xl text-foreground block">
                {healthyRange.minKg} kg – {healthyRange.maxKg} kg
              </span>
            </div>

            {/* South Asian Consultation Note */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 flex items-start gap-2.5">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">
                  {t('দক্ষিণ এশীয়দের জন্য বিশেষ স্বাস্থ্য সূচক:', 'South Asian Health Risk Classification:')}
                </strong>
                <span>
                  {t(
                    `WHO এশীয় গবেষণামতে, দক্ষিণ এশীয়দের মেটাবলিক ঝুঁকির সূচনা হয় ২৩.০ BMI থেকেই। আপনার দক্ষিণ এশীয় সূচক ক্যাটাগরি: "${asianCategoryBn}".`,
                    `WHO Asian criteria classifies BMI >= 23.0 as increased risk for diabetes and cardiovascular illness. Your Asian category: "${asianCategoryEn}".`
                  )}
                </span>
              </div>
            </div>

            {/* Direct CTA to Meal Calculator */}
            <div className="pt-2">
              <Link
                href="/calculator"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-lime-brand hover:bg-lime-brand/90 text-ink-base font-display font-black text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-sm"
              >
                <Calculator className="w-4 h-4 stroke-[2.5]" />
                <span>{t('এই ওজনের জন্য ক্যালোরি ঘাটতি হিসাব করুন →', 'Calculate Caloric Deficit for this Weight →')}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Scientific Limitations Card */}
        <div className="mt-12 rounded-3xl bg-secondary/30 border border-border p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-tomato-brand/10 text-tomato-brand flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-display font-black text-xl uppercase tracking-tight text-foreground">
              {t('BMI সূচকের বৈজ্ঞানিক সীমাবদ্ধতা', 'Scientific Limitations of BMI')}
            </h3>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              {t(
                '১. পেশির ঘনত্ব বনাম চর্বি: বডি ম্যাস ইনডেক্স শরীরের চর্বির পরিমাণ (Body Fat %) এবং চর্বিমুক্ত পেশির (Muscle Mass) মধ্যকার পার্থক্য আলাদা করতে পারে না। ফলে অনেক বডিবিল্ডার ও ভারোত্তোলক কম চর্বি থাকা সত্ত্বেও BMI অনুযায়ী "অতিরিক্ত ওজন" শ্রেণীতে পড়তে পারেন।',
                '1. Muscle vs Fat Density: BMI measures total weight relative to height and cannot differentiate between lean muscle mass and adipose fat. Athletic bodybuilders with low body fat may be incorrectly categorized as "Overweight".'
              )}
            </p>
            <p>
              {t(
                '২. চর্বির অবস্থান: পেটের অভ্যন্তরীণ চর্বি (Visceral Fat) স্বাভাবিক ওজনে থাকা সত্ত্বেও ডায়াবেটিস ও হৃদরোগের ঝুঁকি তৈরি করতে পারে। তাই কোমর ও নিতম্বের অনুপাত (Waist-to-Hip Ratio) বিবেচনা করাও সমান জরুরি।',
                '2. Fat Distribution: Visceral abdominal fat carries significant cardiovascular risk even when total BMI is within the normal range.'
              )}
            </p>
          </div>
        </div>

        {/* Medical Disclaimer Banner */}
        <div className="mt-8">
          <MedicalDisclaimer />
        </div>

        {/* AdSense Slot */}
        <div className="mt-8">
          <AdSlot slot="banner" />
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
}
