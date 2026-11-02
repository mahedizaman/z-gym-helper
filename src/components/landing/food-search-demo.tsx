'use client';

import React, { useState, useMemo } from 'react';
import { Search, Flame, Sparkles, Scale, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import Link from 'next/link';

interface DemoFood {
  id: string;
  nameBn: string;
  nameEn: string;
  categoryBn: string;
  categoryEn: string;
  per100g: {
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  servings: Array<{
    labelBn: string;
    labelEn: string;
    grams: number;
  }>;
}

const DEMO_FOODS: DemoFood[] = [
  {
    id: 'bhat',
    nameBn: 'সিদ্ধ সাদা ভাত',
    nameEn: 'Cooked White Rice (Bhat)',
    categoryBn: 'শস্যদানা',
    categoryEn: 'Grains',
    per100g: { kcal: 130, protein: 2.7, carbs: 28.2, fat: 0.3 },
    servings: [
      { labelBn: '১০০ গ্রাম', labelEn: '100g', grams: 100 },
      { labelBn: '১ মাঝারি বাটি (১৫০ গ্রাম)', labelEn: '1 Medium Bowl (150g)', grams: 150 },
      { labelBn: '১ বড় প্লেট (২৫০ গ্রাম)', labelEn: '1 Large Plate (250g)', grams: 250 },
    ],
  },
  {
    id: 'dal',
    nameBn: 'পাতলা মসুর ডাল',
    nameEn: 'Masoor Dal (Cooked)',
    categoryBn: 'ডাল ও শিম',
    categoryEn: 'Lentils',
    per100g: { kcal: 116, protein: 9.0, carbs: 19.5, fat: 0.4 },
    servings: [
      { labelBn: '১০০ গ্রাম', labelEn: '100g', grams: 100 },
      { labelBn: '১ মাঝারি বাটি (২০০ গ্রাম)', labelEn: '1 Medium Bowl (200g)', grams: 200 },
    ],
  },
  {
    id: 'murgi',
    nameBn: 'মুরগির বুকের মাংস (রান্না)',
    nameEn: 'Chicken Breast Curry',
    categoryBn: 'মাংস ও প্রোটিন',
    categoryEn: 'Poultry & Meat',
    per100g: { kcal: 165, protein: 31.0, carbs: 0.0, fat: 3.6 },
    servings: [
      { labelBn: '১০০ গ্রাম', labelEn: '100g', grams: 100 },
      { labelBn: '১ পিস (৭০ গ্রাম)', labelEn: '1 Piece (70g)', grams: 70 },
      { labelBn: '১ বাটি কারি (১৫০ গ্রাম)', labelEn: '1 Bowl (150g)', grams: 150 },
    ],
  },
  {
    id: 'ilish',
    nameBn: 'পদ্মার ইলিশ মাছ (রান্না)',
    nameEn: 'Hilsa Fish (Ilish Curry)',
    categoryBn: 'মাছ',
    categoryEn: 'Fish',
    per100g: { kcal: 235, protein: 21.8, carbs: 0.0, fat: 16.5 },
    servings: [
      { labelBn: '১০০ গ্রাম', labelEn: '100g', grams: 100 },
      { labelBn: '১ টুকরা (৮০ গ্রাম)', labelEn: '1 Slice (80g)', grams: 80 },
    ],
  },
  {
    id: 'egg',
    nameBn: 'সিদ্ধ মুরগির ডিম',
    nameEn: 'Boiled Chicken Egg',
    categoryBn: 'ডিম ও দুগ্ধজাত',
    categoryEn: 'Eggs & Dairy',
    per100g: { kcal: 155, protein: 12.6, carbs: 1.1, fat: 10.6 },
    servings: [
      { labelBn: '১টি মাঝারি ডিম (৫০ গ্রাম)', labelEn: '1 Medium Egg (50g)', grams: 50 },
      { labelBn: '২টি ডিম (১০০ গ্রাম)', labelEn: '2 Eggs (100g)', grams: 100 },
    ],
  },
  {
    id: 'roti',
    nameBn: 'হাতে বানানো লাল আটার রুটি',
    nameEn: 'Atta Roti (Flatbread)',
    categoryBn: 'শস্যদানা',
    categoryEn: 'Grains',
    per100g: { kcal: 260, protein: 9.5, carbs: 54.0, fat: 2.2 },
    servings: [
      { labelBn: '১টি পাতলা রুটি (৪০ গ্রাম)', labelEn: '1 Thin Roti (40g)', grams: 40 },
      { labelBn: '২টি রুটি (৮০ গ্রাম)', labelEn: '2 Rotis (80g)', grams: 80 },
    ],
  },
  {
    id: 'bhorta',
    nameBn: 'সরিষার তেলে আলু ভর্তা',
    nameEn: 'Aloo Bhorta (Mashed Potato)',
    categoryBn: 'ভর্তা ও শাকসবজি',
    categoryEn: 'Traditional Mash',
    per100g: { kcal: 125, protein: 2.1, carbs: 21.0, fat: 4.1 },
    servings: [
      { labelBn: '১০০ গ্রাম', labelEn: '100g', grams: 100 },
      { labelBn: '২ টেবিল চামচ (৫০ গ্রাম)', labelEn: '2 Tablespoons (50g)', grams: 50 },
    ],
  },
];

export function FoodSearchDemo() {
  const { t, locale } = useLanguage();
  const [query, setQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<DemoFood>(DEMO_FOODS[0]);
  const [selectedServingIdx, setSelectedServingIdx] = useState(0);

  const filteredFoods = useMemo(() => {
    if (!query.trim()) return DEMO_FOODS;
    const q = query.toLowerCase();
    return DEMO_FOODS.filter(
      (f) =>
        f.nameBn.toLowerCase().includes(q) ||
        f.nameEn.toLowerCase().includes(q) ||
        f.categoryBn.toLowerCase().includes(q) ||
        f.categoryEn.toLowerCase().includes(q)
    );
  }, [query]);

  // Current calculation based on active serving grams
  const currentServing = selectedFood.servings[selectedServingIdx] || selectedFood.servings[0];
  const factor = currentServing.grams / 100;

  const currentMacros = {
    kcal: Math.round(selectedFood.per100g.kcal * factor),
    protein: Math.round(selectedFood.per100g.protein * factor * 10) / 10,
    carbs: Math.round(selectedFood.per100g.carbs * factor * 10) / 10,
    fat: Math.round(selectedFood.per100g.fat * factor * 10) / 10,
  };

  return (
    <section className="py-20 md:py-28 px-4 sm:px-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-lime-soft border border-lime-brand/30 text-ink-base text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('লাইভ ফুড সার্চ ডেমো', 'Interactive Food Search Demo')}</span>
          </div>
          <h2 className="font-display font-black text-fluid-section uppercase tracking-tight text-foreground">
            {t('দেশি খাবারের পুষ্টিমান দেখুন লাইভ', 'EXPLORE BANGLADESHI FOOD MACROS')}
          </h2>
          <p className="mt-3 text-base text-muted-foreground max-w-xl mx-auto">
            {t(
              'ভাত, ডাল বা মুরগির মাংস লিখে খুঁজুন। বিভিন্ন বাটি বা পিস সাইজে পুষ্টির পরিবর্তন তাৎক্ষণিক পর্যবেক্ষণ করুন।',
              'Search staple dishes and toggle serving sizes to see calories, protein, carbs, and fat recalculate in real time.'
            )}
          </p>
        </div>

        {/* Demo Interactive Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">
          {/* Left Column: Search & List */}
          <div className="lg:col-span-6 flex flex-col gap-4 p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-lg">
            {/* Search Input Box */}
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('খাবারের নাম খুঁজুন (যেমন: ভাত, ডাল, মুরগি)...', 'Search food (e.g. Rice, Dal, Chicken)...')}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-secondary/60 border border-border focus:border-lime-brand focus:ring-2 focus:ring-lime-brand/30 text-foreground placeholder:text-muted-foreground text-sm font-semibold outline-none transition-all"
              />
            </div>

            {/* Quick Filter Food List */}
            <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
              {filteredFoods.map((food) => {
                const isSelected = selectedFood.id === food.id;
                return (
                  <button
                    key={food.id}
                    onClick={() => {
                      setSelectedFood(food);
                      setSelectedServingIdx(0);
                    }}
                    type="button"
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-lime-brand text-ink-base shadow-md font-bold'
                        : 'bg-secondary/40 hover:bg-secondary text-foreground'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-display text-base uppercase tracking-tight">
                        {locale === 'bn' ? food.nameBn : food.nameEn}
                      </span>
                      <span
                        className={`text-xs ${
                          isSelected ? 'text-ink-base/80' : 'text-muted-foreground'
                        }`}
                      >
                        {locale === 'bn' ? food.categoryBn : food.categoryEn}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-ink-base text-lime-brand'
                            : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        {food.per100g.kcal} kcal
                      </span>
                    </div>
                  </button>
                );
              })}

              {filteredFoods.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  {t('কোনো খাবার পাওয়া যায়নি', 'No matching foods found')}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Nutritional Breakdown Card */}
          <div className="lg:col-span-6 flex flex-col p-6 sm:p-8 rounded-3xl bg-ink-base text-white border border-white/10 shadow-2xl relative overflow-hidden">
            {/* Background energy aura */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-lime-brand/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-lime-brand">
                  {locale === 'bn' ? selectedFood.categoryBn : selectedFood.categoryEn}
                </span>
                <h3 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-white mt-1">
                  {locale === 'bn' ? selectedFood.nameBn : selectedFood.nameEn}
                </h3>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold border border-white/15 shrink-0">
                <Scale className="w-3.5 h-3.5 text-lime-brand" />
                <span>{currentServing.grams}g</span>
              </div>
            </div>

            {/* Serving Size Selector */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-silver-300 mb-2">
                {t('পরিমাণ / পরিবেশন নির্বাচন:', 'Select Serving Portion:')}
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedFood.servings.map((serving, idx) => (
                  <button
                    key={`serving-${idx}`}
                    type="button"
                    onClick={() => setSelectedServingIdx(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedServingIdx === idx
                        ? 'bg-lime-brand text-ink-base shadow-sm font-black'
                        : 'bg-white/10 hover:bg-white/20 text-silver-100 border border-white/10'
                    }`}
                  >
                    {locale === 'bn' ? serving.labelBn : serving.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Calorie Highlight */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-tomato-brand/20 border border-tomato-brand/40 flex items-center justify-center text-tomato-brand">
                  <Flame className="w-6 h-6 fill-tomato-brand" />
                </div>
                <div>
                  <span className="text-xs font-bold text-silver-300 uppercase tracking-wide block">
                    {t('মোট ক্যালোরি', 'Total Energy')}
                  </span>
                  <span className="font-display font-black text-3xl sm:text-4xl text-white">
                    {currentMacros.kcal} <span className="text-sm font-bold text-tomato-brand">kcal</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Macronutrients Grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {/* Protein */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col">
                <span className="text-xs font-bold text-lime-brand uppercase tracking-wider">
                  {t('প্রোটিন', 'Protein')}
                </span>
                <span className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  {currentMacros.protein}g
                </span>
                <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-lime-brand h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, currentMacros.protein * 2.5)}%` }}
                  />
                </div>
              </div>

              {/* Carbs */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col">
                <span className="text-xs font-bold text-pink-brand uppercase tracking-wider">
                  {t('কার্বস', 'Carbs')}
                </span>
                <span className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  {currentMacros.carbs}g
                </span>
                <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-pink-brand h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, currentMacros.carbs * 1.5)}%` }}
                  />
                </div>
              </div>

              {/* Fat */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col">
                <span className="text-xs font-bold text-tomato-brand uppercase tracking-wider">
                  {t('ফ্যাট', 'Fat')}
                </span>
                <span className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  {currentMacros.fat}g
                </span>
                <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-tomato-brand h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, currentMacros.fat * 4)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* CTA to complete database */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-silver-300">
                {t('৩০০+ খাবার যাচাইকৃত পুষ্টিমান সহ', '300+ foods with verified macros')}
              </span>
              <Link
                href="/foods"
                className="inline-flex items-center gap-1.5 text-xs font-black text-lime-brand hover:underline uppercase tracking-wider"
              >
                <span>{t('সম্পূর্ণ ডেটাবেজ দেখুন', 'View Full Database')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
