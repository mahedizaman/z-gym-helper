import {
  calculateBMR,
  calculateTDEE,
  calculateCaloricTarget,
  calculateMacroSplit,
} from '@/server/services/calculations';
import { type GuestProfile, type GuestDayMeals, type GuestExerciseBurn } from '@/lib/guest-storage';
import { type SeedFood } from '@/server/seeds/foods.data';
import { toBengaliDigits } from '@/lib/bengali-digits';

export interface TodayTargets {
  bmr: number;
  tdee: number;
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  fiberTarget: number;
  burnTarget: number;
}

export interface TodayProgress {
  consumedCalories: number;
  consumedProtein: number;
  consumedCarbs: number;
  consumedFat: number;
  consumedFiber: number;
  burnedCalories: number;

  remainingCalories: number;
  remainingProtein: number;
  remainingCarbs: number;
  remainingFat: number;
  remainingFiber: number;
  remainingBurn: number;

  caloriePct: number;
  proteinPct: number;
  carbsPct: number;
  fatPct: number;
  fiberPct: number;
  burnPct: number;
}

/**
 * Calculates daily targets from profile.
 * Clinical safety floor and 14g fiber / 1000 kcal respected.
 */
export function calculateTodayTargets(
  profile: GuestProfile,
  customBurnTarget: number = 300
): TodayTargets {
  const bmr = calculateBMR(
    profile.weightKg,
    profile.heightCm,
    profile.age,
    profile.gender
  );

  const tdee = calculateTDEE(bmr, profile.activityLevel);

  const calorieTarget =
    profile.customCalorieTarget && profile.customCalorieTarget >= 800
      ? profile.customCalorieTarget
      : calculateCaloricTarget(tdee, profile.goal, profile.gender);

  const macros = calculateMacroSplit(calorieTarget, profile.weightKg, profile.goal);

  // Fiber target: ~14g per 1000 kcal (minimum 14g)
  const fiberTarget = Math.max(14, Math.round((calorieTarget / 1000) * 14));

  return {
    bmr,
    tdee,
    calorieTarget,
    proteinTarget: macros.protein,
    carbsTarget: macros.carbs,
    fatTarget: macros.fat,
    fiberTarget,
    burnTarget: customBurnTarget > 0 ? customBurnTarget : 300,
  };
}

/**
 * Aggregates consumed nutrients from meal slots and exercise burns.
 */
export function computeTodayProgress(
  targets: TodayTargets,
  meals: GuestDayMeals | null,
  burns: GuestExerciseBurn[] = []
): TodayProgress {
  let consumedCalories = 0;
  let consumedProtein = 0;
  let consumedCarbs = 0;
  let consumedFat = 0;
  let consumedFiber = 0;

  if (meals && meals.slots) {
    const slots = ['breakfast', 'lunch', 'snack', 'dinner'] as const;
    for (const s of slots) {
      const items = meals.slots[s] || [];
      for (const it of items) {
        consumedCalories += it.kcal || 0;
        consumedProtein += it.protein || 0;
        consumedCarbs += it.carbs || 0;
        consumedFat += it.fat || 0;
        consumedFiber += it.fiber || 0;
      }
    }
  }

  const burnedCalories = burns.reduce((acc, b) => acc + (b.burnedKcal || 0), 0);

  const remainingCalories = Math.max(0, targets.calorieTarget - consumedCalories);
  const remainingProtein = Math.max(0, Number((targets.proteinTarget - consumedProtein).toFixed(1)));
  const remainingCarbs = Math.max(0, Number((targets.carbsTarget - consumedCarbs).toFixed(1)));
  const remainingFat = Math.max(0, Number((targets.fatTarget - consumedFat).toFixed(1)));
  const remainingFiber = Math.max(0, Number((targets.fiberTarget - consumedFiber).toFixed(1)));
  const remainingBurn = Math.max(0, targets.burnTarget - burnedCalories);

  const caloriePct = Math.min(100, Math.round((consumedCalories / Math.max(1, targets.calorieTarget)) * 100));
  const proteinPct = Math.min(100, Math.round((consumedProtein / Math.max(1, targets.proteinTarget)) * 100));
  const carbsPct = Math.min(100, Math.round((consumedCarbs / Math.max(1, targets.carbsTarget)) * 100));
  const fatPct = Math.min(100, Math.round((consumedFat / Math.max(1, targets.fatTarget)) * 100));
  const fiberPct = Math.min(100, Math.round((consumedFiber / Math.max(1, targets.fiberTarget)) * 100));
  const burnPct = Math.min(100, Math.round((burnedCalories / Math.max(1, targets.burnTarget)) * 100));

  return {
    consumedCalories,
    consumedProtein: Number(consumedProtein.toFixed(1)),
    consumedCarbs: Number(consumedCarbs.toFixed(1)),
    consumedFat: Number(consumedFat.toFixed(1)),
    consumedFiber: Number(consumedFiber.toFixed(1)),
    burnedCalories,

    remainingCalories,
    remainingProtein,
    remainingCarbs,
    remainingFat,
    remainingFiber,
    remainingBurn,

    caloriePct,
    proteinPct,
    carbsPct,
    fatPct,
    fiberPct,
    burnPct,
  };
}

/**
 * Returns a human-friendly sentence summarizing what is left for the day.
 * Example: 'প্রোটিন ৭৮ গ্রাম বাকি' or 'ক্যালোরি ৩৫০ বাকি, প্রোটিন ৪৫ গ্রাম বাকি'
 */
export function getPlainLanguageStatus(
  remainingCalories: number,
  remainingProtein: number,
  isBn: boolean = true
): string {
  const roundProtein = Math.round(remainingProtein);

  if (remainingCalories <= 0 && roundProtein <= 0) {
    return isBn
      ? 'অভিনন্দন! আজকের ক্যালোরি ও প্রোটিন লক্ষ্য পূরণ হয়েছে।'
      : 'Awesome! Today\'s calorie and protein goals are reached.';
  }

  if (roundProtein > 0 && remainingCalories > 0) {
    return isBn
      ? `ক্যালোরি ${toBengaliDigits(remainingCalories)} বাকি, প্রোটিন ${toBengaliDigits(roundProtein)} গ্রাম বাকি`
      : `${remainingCalories} kcal left, ${roundProtein}g protein remaining`;
  }

  if (roundProtein > 0) {
    return isBn
      ? `প্রোটিন ${toBengaliDigits(roundProtein)} গ্রাম বাকি`
      : `${roundProtein}g protein remaining`;
  }

  return isBn
    ? `ক্যালোরি ${toBengaliDigits(remainingCalories)} বাকি`
    : `${remainingCalories} kcal left`;
}

/**
 * Returns 3 food suggestions that fit into remaining calories and help hit protein/calorie targets.
 */
export function getFoodSuggestions(
  remainingCalories: number,
  remainingProtein: number,
  foods: SeedFood[],
  limit: number = 3
): SeedFood[] {
  if (!foods || foods.length === 0) return [];

  // Available calorie budget with buffer
  const maxCal = remainingCalories > 80 ? remainingCalories + 80 : 300;

  // Filter foods where standard 100g or serving fits inside the budget
  const eligible = foods.filter((f) => {
    const servingGrams = f.servings?.[0]?.grams || 100;
    const servingKcal = (f.per100g.kcal * servingGrams) / 100;
    return servingKcal <= maxCal && f.per100g.kcal > 10;
  });

  // If protein is short, rank by protein ratio (protein / kcal)
  if (remainingProtein > 0) {
    eligible.sort((a, b) => {
      const ratioA = a.per100g.protein / Math.max(1, a.per100g.kcal);
      const ratioB = b.per100g.protein / Math.max(1, b.per100g.kcal);
      return ratioB - ratioA;
    });
  } else {
    // Rank by nutrient balance (moderate calories)
    eligible.sort((a, b) => b.per100g.fiber - a.per100g.fiber);
  }

  return eligible.slice(0, limit);
}
