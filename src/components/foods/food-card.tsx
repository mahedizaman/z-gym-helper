'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { type SeedFood } from '@/server/seeds/generate-foods';
import { guestStorage, type MealSlotKey } from '@/lib/guest-storage';
import { NumberField } from '@/components/ui/number-field';
import {
  Info,
  Plus,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface FoodCardProps {
  food: SeedFood;
  onAddToMeal?: (slot: MealSlotKey, food: SeedFood, grams: number, servingLabel: string) => void;
}

export function FoodCard({ food, onAddToMeal }: FoodCardProps) {
  const { t, locale } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedServingIdx, setSelectedServingIdx] = useState<number>(0);
  const [customGrams, setCustomGrams] = useState<string>(
    String(food.servings?.[0]?.grams || 100)
  );
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [targetSlot, setTargetSlot] = useState<MealSlotKey>('lunch');
  const [addedToast, setAddedToast] = useState<boolean>(false);

  // Current calculated portion grams
  const parsedCustomGrams = customGrams.trim() === '' ? 0 : parseFloat(customGrams);
  const currentGrams = isCustomMode
    ? (!isNaN(parsedCustomGrams) && parsedCustomGrams > 0 ? parsedCustomGrams : 0)
    : food.servings?.[selectedServingIdx]?.grams || 100;

  const currentLabel = isCustomMode
    ? `${currentGrams} ${t('গ্রাম', 'g')}`
    : locale === 'bn'
    ? food.servings?.[selectedServingIdx]?.labelBn || `${currentGrams} গ্রাম`
    : food.servings?.[selectedServingIdx]?.labelEn || `${currentGrams}g`;

  // Macro recalculations for current portion
  const multiplier = currentGrams / 100;
  const currentKcal = Math.round(food.per100g.kcal * multiplier);
  const currentProtein = Number((food.per100g.protein * multiplier).toFixed(1));
  const currentCarbs = Number((food.per100g.carbs * multiplier).toFixed(1));
  const currentFat = Number((food.per100g.fat * multiplier).toFixed(1));
  const currentFiber = Number(((food.per100g.fiber || 0) * multiplier).toFixed(1));

  const handleAdd = () => {
    if (onAddToMeal) {
      onAddToMeal(targetSlot, food, currentGrams, currentLabel);
    } else {
      guestStorage.addMealItem(guestStorage.getDhakaDateString(), targetSlot, {
        foodId: food.nameEn,
        nameBn: food.nameBn,
        nameEn: food.nameEn,
        servingLabel: currentLabel,
        grams: currentGrams,
        kcal: currentKcal,
        protein: currentProtein,
        carbs: currentCarbs,
        fat: currentFat,
        fiber: currentFiber,
      });
    }

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2200);
  };

  const categoryLabels: Record<string, { bn: string; en: string }> = {
    grains: { bn: 'শস্য ও চাল', en: 'Grains & Rice' },
    lentils: { bn: 'ডাল ও বীজ', en: 'Lentils & Dal' },
    fish: { bn: 'মাছ ও জলজ', en: 'Fish & Seafood' },
    poultry_meat: { bn: 'মাংস ও ডিম', en: 'Meat & Poultry' },
    eggs_dairy: { bn: 'দুধ ও মিষ্টি', en: 'Dairy & Sweets' },
    vegetables_bhorta: { bn: 'শাকসবজি ও ভর্তা', en: 'Vegetables & Bhorta' },
    fruits: { bn: 'ফলমূল', en: 'Fresh Fruits' },
    snacks_beverages: { bn: 'নাস্তা ও মসলা', en: 'Snacks & Nuts' },
  };

  return (
    <div className="relative flex flex-col justify-between rounded-3xl bg-card border border-border/80 hover:border-lime-brand/50 p-5 sm:p-6 transition-all duration-300 shadow-sm hover:shadow-md group">
      <div>
        {/* Top Header: Category Tag & Verification Flag */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-secondary text-muted-foreground border border-border/60">
            {t(
              categoryLabels[food.category]?.bn || food.category,
              categoryLabels[food.category]?.en || food.category
            )}
          </span>

          <span
            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20"
            title={t('কমিউনিটি ও রন্ধন রেসিপি অনুমান (যাচাই প্রক্রিয়াধীন)', 'Culinary estimate pending certified lab verification')}
          >
            <Info className="w-3 h-3" />
            <span>{t('প্রাথমিক অনুমান', 'Unverified')}</span>
          </span>
        </div>

        {/* Optional Image with Neutral Placeholder Fallback */}
        {food.image && (
          <div className="relative w-full h-32 rounded-2xl overflow-hidden bg-secondary/80 mt-3 border border-border/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={food.image}
              alt={locale === 'bn' ? food.nameBn : food.nameEn}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (!target.src.endsWith('/foods/placeholder.svg')) {
                  target.src = '/foods/placeholder.svg';
                }
              }}
            />
          </div>
        )}

        {/* Title */}
        <h3 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-foreground group-hover:text-lime-brand transition-colors line-clamp-1">
          {locale === 'bn' ? food.nameBn : food.nameEn}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 font-medium">
          {locale === 'bn' ? food.nameEn : food.nameBn}
        </p>

        {/* 100g Macro Grid */}
        <div className="grid grid-cols-4 gap-2 mt-4 text-center">
          <div className="rounded-2xl bg-secondary/70 p-2 border border-border/40">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              {t('ক্যালোরি', 'Kcal')}
            </span>
            <span className="font-display text-base sm:text-lg font-black text-tomato-brand">
              {food.per100g.kcal}
            </span>
          </div>

          <div className="rounded-2xl bg-secondary/70 p-2 border border-border/40">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              {t('প্রোটিন', 'Protein')}
            </span>
            <span className="font-display text-base sm:text-lg font-black text-lime-brand">
              {food.per100g.protein}g
            </span>
          </div>

          <div className="rounded-2xl bg-secondary/70 p-2 border border-border/40">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              {t('কার্বস', 'Carbs')}
            </span>
            <span className="font-display text-base sm:text-lg font-black text-foreground">
              {food.per100g.carbs}g
            </span>
          </div>

          <div className="rounded-2xl bg-secondary/70 p-2 border border-border/40">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              {t('ফ্যাট', 'Fat')}
            </span>
            <span className="font-display text-base sm:text-lg font-black text-pink-brand">
              {food.per100g.fat}g
            </span>
          </div>
        </div>

        {/* Micronutrients Pill Row */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 text-[11px] text-muted-foreground">
          {food.per100g.fiber !== undefined && (
            <span className="px-2 py-0.5 rounded-md bg-secondary/50 border border-border/40">
              {t('আঁশ', 'Fiber')}: {food.per100g.fiber}g
            </span>
          )}
          {food.per100g.iron !== undefined && food.per100g.iron > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-secondary/50 border border-border/40">
              {t('আয়রন', 'Iron')}: {food.per100g.iron}mg
            </span>
          )}
          {food.per100g.calcium !== undefined && food.per100g.calcium > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-secondary/50 border border-border/40">
              {t('ক্যালসিয়াম', 'Calcium')}: {food.per100g.calcium}mg
            </span>
          )}
          {food.per100g.potassium !== undefined && food.per100g.potassium > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-secondary/50 border border-border/40">
              {t('পটাশিয়াম', 'Potassium')}: {food.per100g.potassium}mg
            </span>
          )}
        </div>
      </div>

      {/* Serving Converter Accordion / Expansion */}
      <div className="mt-4 pt-4 border-t border-border/60">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          type="button"
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground py-1 focus:outline-none"
        >
          <span>{t('পরিমাপ পরিবর্তন ও মিলে যোগ', 'Portion Converter & Log')}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isExpanded && (
          <div className="mt-3 flex flex-col gap-3 pt-2">
            {/* Serving Preset Chips */}
            <div className="flex flex-wrap gap-1.5">
              {food.servings?.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedServingIdx(idx);
                    setIsCustomMode(false);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    !isCustomMode && selectedServingIdx === idx
                      ? 'bg-lime-brand text-ink-base shadow-sm'
                      : 'bg-secondary hover:bg-secondary/80 text-foreground border border-border/60'
                  }`}
                >
                  {locale === 'bn' ? s.labelBn : s.labelEn}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setIsCustomMode(true)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isCustomMode
                    ? 'bg-lime-brand text-ink-base shadow-sm'
                    : 'bg-secondary hover:bg-secondary/80 text-foreground border border-border/60'
                }`}
              >
                {t('কাস্টম গ্রাম', 'Custom grams')}
              </button>
            </div>

            {/* Custom grams input if customMode is active */}
            {isCustomMode && (
              <div>
                <NumberField
                  unit={t('গ্রাম', 'g')}
                  min={1}
                  max={2000}
                  clampOnBlur
                  value={customGrams}
                  onChange={(val) => setCustomGrams(val)}
                  placeholder="100"
                  containerClassName="w-32"
                  aria-label="Custom grams"
                />
              </div>
            )}

            {/* Calculated Macros for Chosen Portion */}
            <div className="p-3 rounded-2xl bg-secondary/40 border border-border/40 text-xs flex items-center justify-between">
              <span className="font-semibold text-muted-foreground">
                {currentLabel}:
              </span>
              <div className="flex items-center gap-2 font-black font-display text-sm">
                <span className="text-tomato-brand">{currentKcal} kcal</span>
                <span className="text-muted-foreground/40">•</span>
                <span className="text-lime-brand">{currentProtein}g P</span>
                <span className="text-muted-foreground/40">•</span>
                <span className="text-foreground">{currentCarbs}g C</span>
                <span className="text-muted-foreground/40">•</span>
                <span className="text-pink-brand">{currentFat}g F</span>
              </div>
            </div>

            {/* Slot Picker & Add Button */}
            <div className="flex items-center gap-2 mt-1">
              <select
                value={targetSlot}
                onChange={(e) => setTargetSlot(e.target.value as MealSlotKey)}
                className="flex-1 px-3 py-2 rounded-xl bg-background border border-border text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-lime-brand"
                aria-label="Select meal slot"
              >
                <option value="breakfast">{t('সকালের নাস্তা', 'Breakfast')}</option>
                <option value="lunch">{t('দুপুরের খাবার', 'Lunch')}</option>
                <option value="snack">{t('বিকেলের নাস্তা', 'Snack')}</option>
                <option value="dinner">{t('রাতের খাবার', 'Dinner')}</option>
              </select>

              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-lime-brand hover:bg-lime-brand/90 text-ink-base text-xs font-black uppercase font-display tracking-wider transition-transform active:scale-95 cursor-pointer shrink-0"
              >
                {addedToast ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{t('যুক্ত হয়েছে!', 'Added!')}</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{t('যোগ করুন', 'Add')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
