'use client';

import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/lib/language-context';
import { BANGLADESHI_FOODS_DATA, type SeedFood } from '@/server/seeds/foods.data';
import { type MealSlotKey } from '@/lib/guest-storage';
import { Search, X, Plus, Utensils } from 'lucide-react';

interface FoodPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSlot: MealSlotKey;
  onSelectFood: (slot: MealSlotKey, food: SeedFood, grams: number, servingLabel: string, isPreWorkout: boolean) => void;
}

export function FoodPickerModal({
  isOpen,
  onClose,
  targetSlot,
  onSelectFood,
}: FoodPickerModalProps) {
  const { t, locale } = useLanguage();
  const [query, setQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<SeedFood | null>(null);
  const [selectedServingIdx, setSelectedServingIdx] = useState<number>(0);
  const [customGrams, setCustomGrams] = useState<number>(100);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [isPreWorkout, setIsPreWorkout] = useState<boolean>(false);

  const filteredFoods = useMemo(() => {
    if (!query.trim()) {
      return BANGLADESHI_FOODS_DATA.slice(0, 15);
    }
    const q = query.toLowerCase().trim();
    return BANGLADESHI_FOODS_DATA.filter(
      (f) =>
        f.nameBn.includes(q) ||
        f.nameEn.toLowerCase().includes(q) ||
        f.aliases.some((a) => a.toLowerCase().includes(q))
    ).slice(0, 25);
  }, [query]);

  if (!isOpen) return null;

  const currentGrams = isCustomMode
    ? Math.max(1, customGrams || 1)
    : selectedFood?.servings?.[selectedServingIdx]?.grams || 100;

  const currentServingLabel = isCustomMode
    ? `${currentGrams} ${t('গ্রাম', 'g')}`
    : locale === 'bn'
    ? selectedFood?.servings?.[selectedServingIdx]?.labelBn || `${currentGrams} গ্রাম`
    : selectedFood?.servings?.[selectedServingIdx]?.labelEn || `${currentGrams}g`;

  const multiplier = currentGrams / 100;
  const currentKcal = selectedFood ? Math.round(selectedFood.per100g.kcal * multiplier) : 0;
  const currentProtein = selectedFood ? Number((selectedFood.per100g.protein * multiplier).toFixed(1)) : 0;
  const currentCarbs = selectedFood ? Number((selectedFood.per100g.carbs * multiplier).toFixed(1)) : 0;
  const currentFat = selectedFood ? Number((selectedFood.per100g.fat * multiplier).toFixed(1)) : 0;

  const handleConfirm = () => {
    if (!selectedFood) return;
    onSelectFood(targetSlot, selectedFood, currentGrams, currentServingLabel, isPreWorkout);
    onClose();
    setSelectedFood(null);
    setQuery('');
  };

  const slotTitles: Record<MealSlotKey, { bn: string; en: string }> = {
    breakfast: { bn: 'সকালের নাস্তায় খাবার যোগ', en: 'Add to Breakfast' },
    lunch: { bn: 'দুপুরের খাবারে যোগ', en: 'Add to Lunch' },
    snack: { bn: 'বিকেলের নাস্তায় যোগ', en: 'Add to Snack' },
    dinner: { bn: 'রাতের খাবারে যোগ', en: 'Add to Dinner' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-card border border-border rounded-3xl p-6 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-lime-soft text-ink-base flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl uppercase tracking-tight text-foreground">
                {t(slotTitles[targetSlot].bn, slotTitles[targetSlot].en)}
              </h2>
              <span className="text-xs text-muted-foreground">
                {t('৩০০+ দেশি খাবার ডেটাবেজ থেকে বেছে নিন', 'Select from 300+ Bangladeshi foods')}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('খাবারের নাম লিখুন (যেমন: ভাত, ডাল, ডিম, মুরগি)...', 'Search food name...')}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-secondary/60 border border-border text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-lime-brand"
            />
          </div>

          {/* If a food is selected: Portion Customizer */}
          {selectedFood ? (
            <div className="p-4 rounded-2xl bg-secondary/50 border border-lime-brand/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display font-bold text-lg text-foreground">
                    {locale === 'bn' ? selectedFood.nameBn : selectedFood.nameEn}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {locale === 'bn' ? selectedFood.nameEn : selectedFood.nameBn}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFood(null)}
                  className="text-xs text-tomato-brand hover:underline font-bold"
                >
                  {t('অন্য খাবার বাছুন', 'Change food')}
                </button>
              </div>

              {/* Serving options */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedFood.servings?.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedServingIdx(idx);
                      setIsCustomMode(false);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
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
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isCustomMode
                      ? 'bg-lime-brand text-ink-base shadow-sm'
                      : 'bg-secondary hover:bg-secondary/80 text-foreground border border-border/60'
                  }`}
                >
                  {t('কাস্টম গ্রাম', 'Custom grams')}
                </button>
              </div>

              {isCustomMode && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="number"
                    min="1"
                    max="2000"
                    value={customGrams}
                    onChange={(e) => setCustomGrams(Number(e.target.value))}
                    className="w-28 px-3 py-1.5 rounded-xl bg-background border border-border text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-lime-brand"
                  />
                  <span className="text-xs text-muted-foreground font-semibold">
                    {t('গ্রাম (g)', 'grams (g)')}
                  </span>
                </div>
              )}

              {/* Calculated Macros Box */}
              <div className="p-3 rounded-xl bg-card border border-border flex items-center justify-between text-xs">
                <span className="font-bold text-muted-foreground">{currentServingLabel}:</span>
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

              {/* Pre-workout Checkbox */}
              <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isPreWorkout}
                  onChange={(e) => setIsPreWorkout(e.target.checked)}
                  className="rounded border-border text-lime-brand focus:ring-lime-brand w-4 h-4"
                />
                <span>{t('ওয়ার্কআউটের আগে খেয়েছি (প্রি-ওয়ার্কআউট ফুয়েল)', 'Eaten before workout (Pre-workout intake)')}</span>
              </label>
            </div>
          ) : (
            /* Foods Search List */
            <div className="divide-y divide-border/60 max-h-[350px] overflow-y-auto rounded-2xl border border-border/60">
              {filteredFoods.map((food) => (
                <button
                  key={food.nameEn}
                  type="button"
                  onClick={() => {
                    setSelectedFood(food);
                    setSelectedServingIdx(0);
                    setIsCustomMode(false);
                    setCustomGrams(food.servings?.[0]?.grams || 100);
                  }}
                  className="w-full p-3.5 flex items-center justify-between text-left hover:bg-secondary/60 transition-colors group cursor-pointer"
                >
                  <div>
                    <h4 className="font-display font-extrabold text-sm uppercase text-foreground group-hover:text-lime-brand transition-colors">
                      {locale === 'bn' ? food.nameBn : food.nameEn}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {locale === 'bn' ? food.nameEn : food.nameBn}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div className="flex flex-col text-xs font-display">
                      <span className="font-black text-tomato-brand">{food.per100g.kcal} kcal</span>
                      <span className="text-[11px] text-muted-foreground">{food.per100g.protein}g P / 100g</span>
                    </div>
                    <Plus className="w-4 h-4 text-lime-brand shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedFood && (
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
              onClick={handleConfirm}
              className="px-6 py-2.5 rounded-xl bg-lime-brand hover:bg-lime-brand/90 text-ink-base font-display font-black text-xs uppercase tracking-wider transition-transform active:scale-95"
            >
              {t('মিলে যোগ করুন', 'Add to Meal')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
