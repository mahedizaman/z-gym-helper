'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/lib/language-context';
import { guestStorage, MealSlotKey } from '@/lib/guest-storage';
import { FoodPickerModal } from '@/components/calculator/food-picker-modal';
import { SeedFood } from '@/server/seeds/foods.data';
import {
  Calendar,
  Plus,
  Trash2,
  Sparkles,
  Coffee,
  Sun,
  Cookie,
  Moon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface MealItem {
  id: string;
  nameBn: string;
  nameEn: string;
  servingLabel: string;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function LogClient() {
  const { t } = useLanguage();
  const { status } = useSession();

  const [date, setDate] = useState<string>(() => guestStorage.getDhakaDateString());
  const [meals, setMeals] = useState<{
    breakfast: MealItem[];
    lunch: MealItem[];
    snack: MealItem[];
    dinner: MealItem[];
  }>(() => guestStorage.getMeals(guestStorage.getDhakaDateString()).slots);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<MealSlotKey>('breakfast');

  const isAuthenticated = status === 'authenticated';

  const loadMeals = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const res = await fetch(`/api/user/logs?date=${date}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            const raw = json.data.meals || [];
            const grouped = {
              breakfast: [] as MealItem[],
              lunch: [] as MealItem[],
              snack: [] as MealItem[],
              dinner: [] as MealItem[],
            };

            for (const m of raw) {
              const slot = (m.slot as MealSlotKey) || 'breakfast';
              if (grouped[slot]) {
                grouped[slot].push({
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
            return;
          }
        }
      } catch (err) {
        console.error('Error fetching logs:', err);
      }
    } else {
      const guestDay = guestStorage.getMeals(date);
      setMeals(guestDay.slots);
    }
  }, [date, isAuthenticated]);

  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated) {
      fetch(`/api/user/logs?date=${date}`)
        .then((res) => res.json())
        .then((json) => {
          if (isMounted && json.success) {
            const raw = json.data.meals || [];
            const grouped = {
              breakfast: [] as MealItem[],
              lunch: [] as MealItem[],
              snack: [] as MealItem[],
              dinner: [] as MealItem[],
            };

            for (const m of raw) {
              const slot = (m.slot as MealSlotKey) || 'breakfast';
              if (grouped[slot]) {
                grouped[slot].push({
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
        .catch((err) => console.error('Error loading meals:', err));
    }
    return () => {
      isMounted = false;
    };
  }, [date, isAuthenticated]);

  const handleSelectFood = async (
    slot: MealSlotKey,
    food: SeedFood,
    grams: number,
    servingLabel: string
  ) => {
    const ratio = grams / 100;
    const kcal = Math.round(food.per100g.kcal * ratio);
    const protein = Number((food.per100g.protein * ratio).toFixed(1));
    const carbs = Number((food.per100g.carbs * ratio).toFixed(1));
    const fat = Number((food.per100g.fat * ratio).toFixed(1));

    const foodId = food.nameEn.toLowerCase().replace(/\s+/g, '-');

    if (isAuthenticated) {
      try {
        const res = await fetch('/api/user/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date,
            slot,
            foodId,
            foodNameBn: food.nameBn,
            foodNameEn: food.nameEn,
            grams,
            servingLabel,
            macros: { kcal, protein, carbs, fat },
          }),
        });
        if (res.ok) {
          loadMeals();
          return;
        }
      } catch (err) {
        console.error('Error adding meal:', err);
      }
    }

    // Guest mode
    guestStorage.addMealItem(date, slot, {
      foodId,
      nameBn: food.nameBn,
      nameEn: food.nameEn,
      grams,
      servingLabel,
      kcal,
      protein,
      carbs,
      fat,
    });
    loadMeals();
  };

  const handleDeleteItem = async (slot: MealSlotKey, id: string) => {
    if (isAuthenticated) {
      try {
        const res = await fetch(`/api/user/logs?id=${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          loadMeals();
          return;
        }
      } catch (err) {
        console.error('Error deleting item:', err);
      }
    }

    // Guest mode
    guestStorage.removeMealItem(date, slot, id);
    loadMeals();
  };

  const totals = useMemo(() => {
    let totalKcal = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    Object.values(meals).forEach((slotItems) => {
      slotItems.forEach((item) => {
        totalKcal += item.kcal;
        totalProtein += item.protein;
        totalCarbs += item.carbs;
        totalFat += item.fat;
      });
    });

    return {
      kcal: Math.round(totalKcal),
      protein: Number(totalProtein.toFixed(1)),
      carbs: Number(totalCarbs.toFixed(1)),
      fat: Number(totalFat.toFixed(1)),
    };
  }, [meals]);

  const changeDate = (days: number) => {
    const current = new Date(date);
    current.setDate(current.getDate() + days);
    setDate(current.toISOString().split('T')[0]);
  };

  const slotConfigs: Array<{
    id: MealSlotKey;
    bn: string;
    en: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'breakfast', bn: 'সকালের নাস্তা', en: 'Breakfast', icon: Coffee },
    { id: 'lunch', bn: 'দুপুরের খাবার', en: 'Lunch', icon: Sun },
    { id: 'snack', bn: 'বিকেলের স্ন্যাক্স', en: 'Snacks', icon: Cookie },
    { id: 'dinner', bn: 'রাতের খাবার', en: 'Dinner', icon: Moon },
  ];

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:py-12 space-y-8">
      {/* Title & Date Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lime-soft text-ink-base border border-lime-brand/40 text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-ink-base" />
            <span>{isAuthenticated ? t('ক্লাউড সিঙ্কড লগ', 'Cloud Synced Log') : t('গেস্ট লগ (লোকাল)', 'Guest Local Log')}</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-foreground">
            {t('খাবার ও অ্যাক্টিভিটি লগ', 'Meal & Activity Log')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {t('প্রতিটি মিলের দেশি খাবার ও পুষ্টির হিসাব সহজে রেকর্ড করুন।', 'Record Bangladeshi foods across meal slots with live macro calculations.')}
          </p>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center gap-2 bg-card p-1.5 rounded-2xl border border-border shadow-xs">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title={t('আগের দিন', 'Previous Day')}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-2 text-xs font-bold font-mono">
            <Calendar className="w-3.5 h-3.5 text-lime-brand" />
            <span>{date}</span>
          </div>
          <button
            onClick={() => changeDate(1)}
            className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title={t('পরের দিন', 'Next Day')}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Daily Totals Summary Bar */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('দিনের মোট পুষ্টিমান', 'Daily Nutrient Intake')}
          </span>
          <span className="text-xs font-semibold text-lime-brand">
            {totals.kcal} kcal {t('মোট', 'Total')}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-2xl bg-muted/40">
            <div className="text-xs text-muted-foreground font-semibold">{t('ক্যালোরি', 'Calories')}</div>
            <div className="font-display font-black text-2xl text-foreground mt-1">{totals.kcal}</div>
          </div>
          <div className="p-3 rounded-2xl bg-muted/40">
            <div className="text-xs text-muted-foreground font-semibold">{t('প্রোটিন', 'Protein')}</div>
            <div className="font-display font-black text-2xl text-lime-brand mt-1">{totals.protein}g</div>
          </div>
          <div className="p-3 rounded-2xl bg-muted/40">
            <div className="text-xs text-muted-foreground font-semibold">{t('কার্বস', 'Carbs')}</div>
            <div className="font-display font-black text-2xl text-foreground mt-1">{totals.carbs}g</div>
          </div>
          <div className="p-3 rounded-2xl bg-muted/40">
            <div className="text-xs text-muted-foreground font-semibold">{t('ফ্যাট', 'Fat')}</div>
            <div className="font-display font-black text-2xl text-foreground mt-1">{totals.fat}g</div>
          </div>
        </div>
      </div>

      {/* 4 Meal Slots List */}
      <div className="space-y-6">
        {slotConfigs.map((slot) => {
          const items = meals[slot.id] || [];
          const slotKcal = items.reduce((acc, curr) => acc + curr.kcal, 0);
          const Icon = slot.icon;

          return (
            <div
              key={slot.id}
              className="rounded-3xl border border-border bg-card p-5 sm:p-7 space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-lime-soft text-ink-base flex items-center justify-center font-bold">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-xl text-foreground">
                      {t(slot.bn, slot.en)}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {slotKcal} kcal • {items.length} {t('টি পদ', 'items')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveSlot(slot.id);
                    setPickerOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-lime-brand hover:bg-lime-hover text-ink-base font-bold text-xs transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('খাবার যোগ করুন', 'Add Food')}</span>
                </button>
              </div>

              {/* Items in this slot */}
              {items.length > 0 ? (
                <div className="space-y-2.5 pt-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-muted/30 border border-border/50 flex items-center justify-between gap-3 text-xs sm:text-sm"
                    >
                      <div>
                        <div className="font-bold text-foreground">{item.nameBn}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.nameEn} • {item.servingLabel} ({item.grams}g)
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-bold text-foreground font-mono">{item.kcal} kcal</span>
                          <div className="text-[11px] text-muted-foreground">
                            P: {item.protein}g • C: {item.carbs}g • F: {item.fat}g
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteItem(slot.id, item.id)}
                          className="p-1.5 rounded-full hover:bg-tomato-base/10 text-muted-foreground hover:text-tomato-base transition-colors cursor-pointer"
                          title={t('মুছে ফেলুন', 'Delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-2xl">
                  {t('এই মিলে কোনো খাবার যোগ করা হয়নি।', 'No foods added to this meal yet.')}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Food Picker Modal */}
      <FoodPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        targetSlot={activeSlot}
        onSelectFood={handleSelectFood}
      />
    </div>
  );
}
