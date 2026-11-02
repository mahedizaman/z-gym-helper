import { z } from 'zod';

export const FoodSearchQuerySchema = z.object({
  q: z.string().optional().default(''),
  category: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(30),
  page: z.coerce.number().min(1).default(1),
});

export const FoodCreateSchema = z.object({
  nameBn: z.string().min(2, 'Name in Bangla must be at least 2 characters'),
  nameEn: z.string().min(2, 'Name in English must be at least 2 characters'),
  aliases: z.array(z.string()).default([]),
  category: z.enum([
    'grains',
    'lentils',
    'fish',
    'poultry_meat',
    'eggs_dairy',
    'vegetables_bhorta',
    'fruits',
    'snacks_beverages',
  ]),
  per100g: z.object({
    kcal: z.number().min(0),
    protein: z.number().min(0),
    carbs: z.number().min(0),
    fat: z.number().min(0),
    fiber: z.number().min(0).optional().default(0),
    potassium: z.number().min(0).optional().default(0),
    zinc: z.number().min(0).optional().default(0),
    iron: z.number().min(0).optional().default(0),
    calcium: z.number().min(0).optional().default(0),
    sodium: z.number().min(0).optional().default(0),
  }),
  servings: z
    .array(
      z.object({
        labelBn: z.string(),
        labelEn: z.string(),
        grams: z.number().positive(),
      })
    )
    .default([]),
  source: z.string().min(1),
  verified: z.boolean().default(false),
});

export const ExerciseCreateSchema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  nameBn: z.string().min(2),
  nameEn: z.string().min(2),
  muscle: z.enum(['chest', 'back', 'shoulders', 'arms', 'legs', 'core']),
  secondaryMuscles: z.array(z.string()).default([]),
  equipment: z.enum(['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight']),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  instructionsBn: z.array(z.string()).min(1),
  instructionsEn: z.array(z.string()).min(1),
  commonMistakesBn: z.array(z.string()).default([]),
  tipsBn: z.string().optional().default(''),
  tipsEn: z.string().optional().default(''),
  youtubeId: z.string().min(5),
  reviewed: z.boolean().default(false),
});

export const MealLogCreateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  slot: z.enum(['breakfast', 'lunch', 'snack', 'dinner']),
  foodId: z.string().min(1),
  foodNameBn: z.string().min(1),
  foodNameEn: z.string().min(1),
  grams: z.number().positive(),
  servingLabel: z.string().min(1),
  macros: z.object({
    kcal: z.number().min(0),
    protein: z.number().min(0),
    carbs: z.number().min(0),
    fat: z.number().min(0),
  }),
});

export const WorkoutLogCreateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  planSlug: z.string().min(1),
  dayIndex: z.number().min(0),
  dayName: z.string().min(1),
  completedExercises: z.array(
    z.object({
      exerciseSlug: z.string().min(1),
      completedSets: z.number().positive(),
      weightKg: z.number().positive().optional(),
    })
  ),
  durationMinutes: z.number().positive().default(45),
  estimatedBurnKcal: z.number().positive().default(250),
});

export const WeightLogCreateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weightKg: z.number().min(25).max(300),
  note: z.string().max(300).optional(),
});

export const UserProfileUpdateSchema = z.object({
  nickname: z.string().min(2).max(40).optional(),
  gender: z.enum(['male', 'female']).optional(),
  weightKg: z.number().min(30).max(300).optional(),
  heightCm: z.number().min(100).max(250).optional(),
  age: z.number().min(10).max(100).optional(),
  targetWeightKg: z.number().min(30).max(300).optional(),
  calorieTarget: z.number().min(800).max(10000).optional(),
  activityLevel: z
    .enum(['sedentary', 'light', 'moderate', 'very_active', 'extra_active'])
    .optional(),
});

export const ChallengeCreateSchema = z.object({
  title: z.string().min(3).max(80),
  durationDays: z.enum(['7', '14', '30']).transform(Number),
  metric: z.enum(['streak', 'workouts', 'weight_loss_pct']),
});
