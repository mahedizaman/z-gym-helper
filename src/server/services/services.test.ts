import { describe, it, expect } from 'vitest';
import { foodService } from './food.service';
import { exerciseService } from './exercise.service';
import { planService } from './plan.service';
import { BANGLADESHI_FOODS_DATA } from '../seeds/foods.data';
import { CORE_EXERCISES_DATA } from '../seeds/exercises.data';
import { WORKOUT_PLANS_DATA } from '../seeds/plans.data';
import { MealLogCreateSchema, FoodSearchQuerySchema } from '../validators';

describe('Data Layer & Decoupled Service Suite', () => {
  describe('Bangladeshi Food Database & Fuzzy Search', () => {
    it('has 300+ authentic Bangladeshi food items seeded', () => {
      expect(BANGLADESHI_FOODS_DATA.length).toBeGreaterThanOrEqual(300);
    });

    it('marks all seeded food items as verified:false pending clinical human review', () => {
      const verifiedCount = BANGLADESHI_FOODS_DATA.filter((f) => f.verified).length;
      expect(verifiedCount).toBe(0);
    });

    it('returns paginated food items with default limits', async () => {
      const result = await foodService.searchFoods({ page: 1, limit: 10 });
      expect(result.foods.length).toBe(10);
      expect(result.total).toBeGreaterThanOrEqual(300);
      expect(result.totalPages).toBeGreaterThanOrEqual(30);
    });

    it('accurately searches foods in Bangla (ভাত)', async () => {
      const result = await foodService.searchFoods({ q: 'ভাত', limit: 5 });
      expect(result.foods.length).toBeGreaterThan(0);
      const hasRice = result.foods.some((f) => f.nameBn.includes('ভাত'));
      expect(hasRice).toBe(true);
    });

    it('accurately searches foods in English (Chicken)', async () => {
      const result = await foodService.searchFoods({ q: 'chicken', limit: 5 });
      expect(result.foods.length).toBeGreaterThan(0);
      const hasChicken = result.foods.some((f) =>
        f.nameEn.toLowerCase().includes('chicken')
      );
      expect(hasChicken).toBe(true);
    });

    it('filters foods by category (fish)', async () => {
      const result = await foodService.searchFoods({ category: 'fish', limit: 10 });
      expect(result.foods.length).toBeGreaterThan(0);
      const allFish = result.foods.every((f) => f.category === 'fish');
      expect(allFish).toBe(true);
    });
  });

  describe('Core Exercises Library Service', () => {
    it('has 30+ core gym exercises seeded across muscle groups', () => {
      expect(CORE_EXERCISES_DATA.length).toBeGreaterThanOrEqual(30);
    });

    it('filters exercises by muscle group (back)', async () => {
      const backExercises = await exerciseService.getExercises({ muscle: 'back' });
      expect(backExercises.length).toBeGreaterThanOrEqual(5);
      const allBack = backExercises.every((e) => e.muscle === 'back');
      expect(allBack).toBe(true);
    });

    it('retrieves single exercise by slug with complete guide and youtubeId', async () => {
      const bench = await exerciseService.getExerciseBySlug('barbell-bench-press');
      expect(bench).toBeDefined();
      expect(bench?.nameBn).toContain('বেঞ্চ প্রেস');
      expect(bench?.youtubeId).toBeDefined();
      expect(bench?.instructionsBn.length).toBeGreaterThan(0);
    });
  });

  describe('Workout Plans Service', () => {
    it('provides 4 distinct seeded gym splits (3, 4, 5, 6 days)', () => {
      expect(WORKOUT_PLANS_DATA.length).toBe(4);
      const days = WORKOUT_PLANS_DATA.map((p) => p.daysPerWeek).sort();
      expect(days).toEqual([3, 4, 5, 6]);
    });

    it('retrieves plan by slug with exercise sets, reps, and rest', async () => {
      const plan = await planService.getPlanBySlug('upper-lower-4');
      expect(plan).toBeDefined();
      expect(plan?.daysPerWeek).toBe(4);
      expect(plan?.schedule.length).toBe(4);
      expect(plan?.schedule[0].exercises[0].sets).toBeGreaterThan(0);
      expect(plan?.schedule[0].exercises[0].reps).toBeDefined();
      expect(plan?.schedule[0].exercises[0].restSeconds).toBeGreaterThan(0);
    });
  });

  describe('Zod Validation Schemas', () => {
    it('validates correct food search query parameters', () => {
      const valid = FoodSearchQuerySchema.safeParse({
        q: 'dal',
        category: 'lentils',
        limit: '15',
        page: '2',
      });
      expect(valid.success).toBe(true);
      if (valid.success) {
        expect(valid.data.limit).toBe(15);
        expect(valid.data.page).toBe(2);
      }
    });

    it('validates correct meal log input schema', () => {
      const valid = MealLogCreateSchema.safeParse({
        date: '2026-11-03',
        slot: 'lunch',
        foodId: 'bhat-123',
        foodNameBn: 'সিদ্ধ সাদা ভাত',
        foodNameEn: 'Boiled White Rice',
        grams: 150,
        servingLabel: '১ মাঝারি বাটি',
        macros: { kcal: 195, protein: 4.1, carbs: 42.3, fat: 0.5 },
      });
      expect(valid.success).toBe(true);
    });

    it('rejects invalid meal log with malformed date format', () => {
      const invalid = MealLogCreateSchema.safeParse({
        date: '03-11-2026', // invalid format (needs YYYY-MM-DD)
        slot: 'lunch',
        foodId: 'bhat-123',
        foodNameBn: 'ভাত',
        foodNameEn: 'Rice',
        grams: 100,
        servingLabel: 'বাটি',
        macros: { kcal: 130, protein: 2.7, carbs: 28.2, fat: 0.3 },
      });
      expect(invalid.success).toBe(false);
    });
  });
});
