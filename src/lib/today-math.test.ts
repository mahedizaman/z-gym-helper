import { describe, it, expect } from 'vitest';
import {
  calculateTodayTargets,
  computeTodayProgress,
  getPlainLanguageStatus,
  getFoodSuggestions,
} from './today-math';
import { type GuestProfile, type GuestDayMeals, type GuestExerciseBurn } from './guest-storage';
import { BANGLADESHI_FOODS_DATA } from '@/server/seeds/foods.data';

describe('today-math calculations', () => {
  const profile: GuestProfile = {
    gender: 'male',
    age: 26,
    heightCm: 172,
    weightKg: 70,
    activityLevel: 'sedentary',
    goal: 'loss',
  };

  it('calculates targets including 14g fiber per 1000 kcal', () => {
    const targets = calculateTodayTargets(profile, 300);
    expect(targets.bmr).toBeGreaterThan(1500);
    expect(targets.tdee).toBeGreaterThan(targets.bmr);
    expect(targets.calorieTarget).toBeGreaterThanOrEqual(1500); // Male floor
    expect(targets.proteinTarget).toBeGreaterThan(100);
    // Fiber target = round(calorieTarget / 1000 * 14)
    const expectedFiber = Math.round((targets.calorieTarget / 1000) * 14);
    expect(targets.fiberTarget).toBe(expectedFiber);
    expect(targets.burnTarget).toBe(300);
  });

  it('computes consumed nutrients and remaining amounts accurately', () => {
    const targets = calculateTodayTargets(profile, 300);
    const mockMeals: GuestDayMeals = {
      date: '2026-11-06',
      slots: {
        breakfast: [
          {
            id: 'm1',
            nameBn: 'ডিম সিদ্ধ',
            nameEn: 'Boiled Egg',
            servingLabel: '১টি',
            grams: 50,
            kcal: 78,
            protein: 6.3,
            carbs: 0.6,
            fat: 5.3,
            fiber: 0,
          },
        ],
        lunch: [
          {
            id: 'm2',
            nameBn: 'ভাত',
            nameEn: 'Rice',
            servingLabel: '১ প্লেট',
            grams: 200,
            kcal: 260,
            protein: 5.2,
            carbs: 56.4,
            fat: 0.6,
            fiber: 1.2,
          },
        ],
        snack: [],
        dinner: [],
      },
    };

    const mockBurns: GuestExerciseBurn[] = [
      {
        id: 'b1',
        nameBn: 'দ্রুত হাঁটা',
        nameEn: 'Brisk Walk',
        met: 3.8,
        durationMinutes: 30,
        burnedKcal: 133,
      },
    ];

    const progress = computeTodayProgress(targets, mockMeals, mockBurns);
    expect(progress.consumedCalories).toBe(78 + 260);
    expect(progress.consumedProtein).toBeCloseTo(6.3 + 5.2, 1);
    expect(progress.burnedCalories).toBe(133);
    expect(progress.remainingCalories).toBe(targets.calorieTarget - 338);
    expect(progress.remainingBurn).toBe(300 - 133);
  });

  it('generates friendly plain-language status line', () => {
    const statusBn1 = getPlainLanguageStatus(350, 45, true);
    expect(statusBn1).toContain('ক্যালোরি');
    expect(statusBn1).toContain('প্রোটিন');
    expect(statusBn1).toContain('বাকি');

    const statusBn2 = getPlainLanguageStatus(0, 0, true);
    expect(statusBn2).toContain('অভিনন্দন');

    const statusEn = getPlainLanguageStatus(200, 25, false);
    expect(statusEn).toContain('200 kcal left');
    expect(statusEn).toContain('25g protein remaining');
  });

  it('suggests 3 relevant foods based on remaining calorie and protein budget', () => {
    const suggestions = getFoodSuggestions(400, 30, BANGLADESHI_FOODS_DATA, 3);
    expect(suggestions).toHaveLength(3);
    // Highest protein per kcal foods prioritized
    expect(suggestions[0].per100g.protein).toBeGreaterThan(0);
  });
});
