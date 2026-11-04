'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { calculateBMI, calculateBMR, calculateTDEE } from '@/server/services/calculations';
import { Calculator, Scale, Flame, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function CalculatorTeaser() {
  const { t, locale } = useLanguage();
  const [activeTab, setActiveTab] = useState<'bmi' | 'bmr'>('bmi');

  // Input states
  const [weightKg, setWeightKg] = useState(70);
  const [heightCm, setHeightCm] = useState(172);
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const activity = 'moderate';

  // Real-time calculation using pure domain logic
  const bmiResult = calculateBMI(weightKg, heightCm);
  const bmr = calculateBMR({ weightKg, heightCm, age, gender });
  const tdee = calculateTDEE(bmr, activity);

  return (
    <section className="py-20 md:py-28 px-4 sm:px-6 bg-secondary/30 border-y border-border">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-soft text-ink-base dark:bg-[#2A111E] dark:text-pink-soft border border-thunder-base/40 text-xs font-bold uppercase tracking-wider mb-4">
            <Calculator className="w-3.5 h-3.5 text-thunder-base dark:text-pink-soft" />
            <span>{t('বিজ্ঞানের ভিত্তিতে ফিটনেস পরিমাপ', 'Scientific Fitness Calculations')}</span>
          </div>
          <h2 className="font-display font-black text-fluid-section uppercase tracking-tight text-foreground">
            {t('আপনার শরীর ও ক্যালোরির হিসাব করুন', 'CALCULATE YOUR STATS INSTANTLY')}
          </h2>
          <p className="mt-3 text-base text-muted-foreground max-w-xl mx-auto">
            {t(
              'Mifflin-St Jeor সমীকরণের সাহায্যে আপনার BMR ও TDEE জানুন, এবং BMI দিয়ে আদর্শ ওজনের সীমা পরীক্ষা করুন।',
              'Quickly preview your Body Mass Index and Basal Metabolic Rate using scientific formulas.'
            )}
          </p>
        </div>

        {/* Calculator Teaser Card */}
        <div className="max-w-4xl mx-auto rounded-3xl bg-card border border-border p-6 sm:p-10 shadow-xl">
          {/* Tab Switcher */}
          <div className="flex items-center justify-center gap-2 p-1.5 rounded-full bg-secondary max-w-xs mx-auto mb-8 border border-border">
            <button
              type="button"
              onClick={() => setActiveTab('bmi')}
              className={`flex-1 py-2 rounded-full text-xs font-extrabold uppercase font-display tracking-wider transition-all cursor-pointer ${
                activeTab === 'bmi'
                  ? 'bg-lime-brand text-ink-base shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              BMI {t('ক্যালকুলেটর', 'Calculator')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bmr')}
              className={`flex-1 py-2 rounded-full text-xs font-extrabold uppercase font-display tracking-wider transition-all cursor-pointer ${
                activeTab === 'bmr'
                  ? 'bg-lime-brand text-ink-base shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              BMR / TDEE
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Input Controls */}
            <div className="md:col-span-7 flex flex-col gap-5">
              {/* Weight Slider */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider mb-2">
                  <span className="text-foreground">{t('ওজন (কেজি)', 'Weight (kg)')}</span>
                  <span className="font-display text-base font-black text-lime-hover">{weightKg} kg</span>
                </div>
                <input
                  type="range"
                  min="35"
                  max="160"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-lime-brand"
                />
              </div>

              {/* Height Slider */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider mb-2">
                  <span className="text-foreground">{t('উচ্চতা (সেমি)', 'Height (cm)')}</span>
                  <span className="font-display text-base font-black text-lime-hover">
                    {heightCm} cm ({Math.floor(heightCm / 30.48)}&apos;{Math.round((heightCm % 30.48) / 2.54)}&quot;)
                  </span>
                </div>
                <input
                  type="range"
                  min="130"
                  max="215"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-lime-brand"
                />
              </div>

              {activeTab === 'bmr' && (
                <>
                  {/* Age Slider */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider mb-2">
                      <span className="text-foreground">{t('বয়স (বছর)', 'Age (years)')}</span>
                      <span className="font-display text-base font-black text-pink-brand">{age} yrs</span>
                    </div>
                    <input
                      type="range"
                      min="14"
                      max="85"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-pink-brand"
                    />
                  </div>

                  {/* Gender Toggle */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {t('লিঙ্গ:', 'Gender:')}
                    </span>
                    <button
                      type="button"
                      onClick={() => setGender('male')}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer ${
                        gender === 'male'
                          ? 'bg-lime-brand text-ink-base font-black'
                          : 'bg-secondary text-foreground'
                      }`}
                    >
                      {t('পুরুষ', 'Male')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('female')}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer ${
                        gender === 'female'
                          ? 'bg-pink-brand text-white font-black'
                          : 'bg-secondary text-foreground'
                      }`}
                    >
                      {t('মহিলা', 'Female')}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Live Result Preview Column */}
            <div className="md:col-span-5 p-6 rounded-2xl bg-secondary/50 border border-border flex flex-col justify-between h-full">
              {activeTab === 'bmi' ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-muted-foreground">
                    <Scale className="w-4 h-4 text-lime-brand" />
                    <span>{t('আপনার বডি ম্যাস ইনডেক্স', 'Body Mass Index')}</span>
                  </div>

                  <div>
                    <div className="font-display font-black text-5xl sm:text-6xl text-foreground">
                      {bmiResult.bmi}
                    </div>
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-lime-soft text-ink-base border border-lime-brand/40">
                      {locale === 'bn' ? bmiResult.categoryBn : bmiResult.categoryEn}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t('আপনার উচ্চতায় স্বাস্থ্যকর ওজনের সীমা:', 'Healthy weight range for your height:')}{' '}
                    <span className="font-bold text-foreground">
                      {bmiResult.healthyWeightRangeKg.min} - {bmiResult.healthyWeightRangeKg.max} kg
                    </span>
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-muted-foreground">
                    <Flame className="w-4 h-4 text-tomato-brand" />
                    <span>{t('দৈনিক ক্যালোরি চাহিদা', 'Daily Calorie Expenditure')}</span>
                  </div>

                  <div>
                    <div className="font-display font-black text-5xl sm:text-6xl text-foreground">
                      {tdee} <span className="text-lg font-bold text-tomato-brand">kcal</span>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mt-1">
                      BMR (বেস মেটাবলিজম): {bmr} kcal
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t(
                      'বর্তমান ওজন ধরে রাখতে আপনার দৈনিক আনুমানিক এই পরিমাণ ক্যালোরি প্রয়োজন।',
                      'Estimated daily calories needed to maintain current weight at moderate activity.'
                    )}
                  </p>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-border">
                <Link
                  href={activeTab === 'bmi' ? '/bmi' : '/calculator'}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-lime-brand text-ink-base text-xs font-black uppercase tracking-wider hover:bg-lime-hover shadow-sm transition-all"
                >
                  <span>{t('সম্পূর্ণ ক্যালকুলেটরে যান', 'Open Full Calculator')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
