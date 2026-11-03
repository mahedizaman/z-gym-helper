/**
 * Core Domain Math & Calculations for Z-Gym Helper
 * Decoupled pure functions suitable for Next.js Route Handlers, Express, or Flutter.
 */

export interface BMRParams {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: 'male' | 'female';
}

export type ActivityLevel =
  | 'sedentary' // 1.2
  | 'light' // 1.375
  | 'moderate' // 1.55
  | 'active' // 1.725
  | 'very_active' // 1.725 or 1.9
  | 'extra_active'; // 1.9

export const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
  extra_active: 1.9,
};

export type Goal = 'maintain' | 'mild_loss' | 'loss' | 'extreme_loss' | 'muscle_gain';

export const MET_VALUES: Record<string, number> = {
  weightlifting: 5.0,
  running_8kmh: 8.3,
  cycling_moderate: 6.0,
  jump_rope: 10.0,
  walking_brisk: 3.8,
  swimming: 7.0,
  calisthenics: 8.0,
};

/**
 * Mifflin-St Jeor Equation for Basal Metabolic Rate (BMR)
 * Male: BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) + 5
 * Female: BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) - 161
 */
export function calculateBMR(
  paramsOrWeight: BMRParams | number,
  heightCm?: number,
  age?: number,
  gender?: 'male' | 'female'
): number {
  if (typeof paramsOrWeight === 'object') {
    const { weightKg, heightCm: h, age: a, gender: g } = paramsOrWeight;
    if (weightKg <= 0 || h <= 0 || a <= 0) {
      throw new Error('Weight, height, and age must be positive values');
    }
    const base = 10 * weightKg + 6.25 * h - 5 * a;
    return Math.round(g === 'male' ? base + 5 : base - 161);
  } else {
    const weightKg = paramsOrWeight;
    const h = heightCm || 0;
    const a = age || 0;
    const g = gender || 'male';
    if (weightKg <= 0 || h <= 0 || a <= 0) {
      throw new Error('Weight, height, and age must be positive values');
    }
    const base = 10 * weightKg + 6.25 * h - 5 * a;
    return Math.round(g === 'male' ? base + 5 : base - 161);
  }
}

/**
 * Total Daily Energy Expenditure (TDEE)
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel | string): number {
  if (bmr <= 0) throw new Error('BMR must be positive');
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
}

/**
 * Caloric Target based on goal with clinical safety floor enforcement.
 * Safety floor: 1200 kcal for women, 1500 kcal for men.
 */
export function calculateCaloricTarget(
  tdee: number,
  goal: Goal = 'maintain',
  gender: 'male' | 'female' = 'male'
): number {
  let target = tdee;
  switch (goal) {
    case 'mild_loss':
      target = tdee - 250;
      break;
    case 'loss':
      target = tdee - 500;
      break;
    case 'extreme_loss':
      target = tdee - 750;
      break;
    case 'muscle_gain':
      target = tdee + 300;
      break;
    case 'maintain':
    default:
      target = tdee;
      break;
  }

  const safeFloor = gender === 'female' ? 1200 : 1500;
  return Math.max(safeFloor, Math.round(target));
}

export interface MacroSplit {
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * Macro Distribution Split based on target calories, bodyweight, and goal.
 */
export function calculateMacroSplit(
  targetKcal: number,
  weightKg: number,
  goal: Goal = 'maintain'
): MacroSplit {
  const proteinPerKg =
    goal === 'muscle_gain' ? 2.0 : goal === 'loss' || goal === 'extreme_loss' ? 1.8 : 1.6;
  const proteinGrams = Math.round(weightKg * proteinPerKg);
  const proteinKcal = proteinGrams * 4;

  const fatKcal = targetKcal * 0.25;
  const fatGrams = Math.round(fatKcal / 9);

  const remainingKcal = Math.max(0, targetKcal - proteinKcal - fatGrams * 9);
  const carbsGrams = Math.round(remainingKcal / 4);

  return {
    protein: proteinGrams,
    carbs: carbsGrams,
    fat: fatGrams,
  };
}

/**
 * Net daily energy balance: Intake minus (TDEE + Exercise Burn)
 */
export function calculateDailyBalance(
  intakeKcal: number,
  tdee: number,
  exerciseBurnKcal: number = 0
): number {
  return Math.round(intakeKcal - (tdee + exerciseBurnKcal));
}

/**
 * Weekly weight delta estimation using 7700 kcal / kg body fat rule.
 */
export function estimateWeightChange(dailyBalance: number, days: number = 7): number {
  const totalCalorieDiff = dailyBalance * days;
  return Number((totalCalorieDiff / 7700).toFixed(2));
}

export function getBMICategory(bmi: number): {
  category: 'underweight' | 'healthy' | 'overweight' | 'obese';
  labelBn: string;
  labelEn: string;
} {
  if (bmi < 18.5) {
    return { category: 'underweight', labelBn: 'কম ওজন (আন্ডারওয়েট)', labelEn: 'Underweight' };
  } else if (bmi >= 18.5 && bmi < 25) {
    return { category: 'healthy', labelBn: 'স্বাভাবিক ওজন (হেলদি)', labelEn: 'Healthy Weight' };
  } else if (bmi >= 25 && bmi < 30) {
    return { category: 'overweight', labelBn: 'অতিরিক্ত ওজন (ওভারওয়েট)', labelEn: 'Overweight' };
  } else {
    return { category: 'obese', labelBn: 'স্থূলতা (ওবিজ)', labelEn: 'Obese' };
  }
}

export function getHealthyWeightRange(heightCm: number): { minKg: number; maxKg: number } {
  const heightM = heightCm / 100;
  return {
    minKg: Math.round(18.5 * heightM * heightM * 10) / 10,
    maxKg: Math.round(24.9 * heightM * heightM * 10) / 10,
  };
}

/**
 * BMI Calculation & Categorization
 * Formula: weight(kg) / (height(m))^2
 */
export interface BMIResult {
  bmi: number;
  category: 'underweight' | 'normal' | 'overweight' | 'obese';
  categoryBn: string;
  categoryEn: string;
  healthyWeightRangeKg: { min: number; max: number };
}

export function calculateBMI(weightKg: number, heightCm: number): BMIResult {
  if (weightKg <= 0 || heightCm <= 0) {
    throw new Error('Weight and height must be positive values');
  }

  const heightM = heightCm / 100;
  const rawBmi = weightKg / (heightM * heightM);
  const bmi = Math.round(rawBmi * 10) / 10;

  let category: BMIResult['category'] = 'normal';
  let categoryBn = 'স্বাভাবিক ওজন';
  let categoryEn = 'Normal weight';

  if (bmi < 18.5) {
    category = 'underweight';
    categoryBn = 'কম ওজন (আন্ডারওয়েট)';
    categoryEn = 'Underweight';
  } else if (bmi >= 25 && bmi < 30) {
    category = 'overweight';
    categoryBn = 'অতিরিক্ত ওজন (ওভারওয়েট)';
    categoryEn = 'Overweight';
  } else if (bmi >= 30) {
    category = 'obese';
    categoryBn = 'স্থূলতা (ওবিজ)';
    categoryEn = 'Obese';
  }

  // Normal BMI range: 18.5 - 24.9
  const minHealthy = Math.round(18.5 * heightM * heightM * 10) / 10;
  const maxHealthy = Math.round(24.9 * heightM * heightM * 10) / 10;

  return {
    bmi,
    category,
    categoryBn,
    categoryEn,
    healthyWeightRangeKg: { min: minHealthy, max: maxHealthy },
  };
}

/**
 * Exercise Calorie Burn Estimate using MET (Metabolic Equivalent of Task)
 * Formula: Burn = MET * weight(kg) * duration(hours)
 */
export function calculateExerciseBurn(met: number, weightKg: number, durationMinutes: number): number {
  if (met <= 0 || weightKg <= 0 || durationMinutes <= 0) {
    return 0;
  }
  const hours = durationMinutes / 60;
  return Math.round(met * weightKg * hours);
}

/**
 * Weight Change Calculation & Percentage Delta
 */
export interface WeightDeltaResult {
  initialWeightKg: number;
  currentWeightKg: number;
  deltaKg: number;
  percentageChange: number;
  isLoss: boolean;
}

export function calculateWeightDelta(initialKg: number, currentKg: number): WeightDeltaResult {
  if (initialKg <= 0 || currentKg <= 0) {
    throw new Error('Weights must be positive');
  }

  const deltaKg = Math.round((currentKg - initialKg) * 10) / 10;
  const percentageChange = Math.round(((currentKg - initialKg) / initialKg) * 100 * 10) / 10;

  return {
    initialWeightKg: initialKg,
    currentWeightKg: currentKg,
    deltaKg,
    percentageChange,
    isLoss: deltaKg < 0,
  };
}

/**
 * Asia/Dhaka Timezone Day Formatter (YYYY-MM-DD)
 */
export function getDhakaDateString(date: Date = new Date()): string {
  // Format as YYYY-MM-DD in Asia/Dhaka (UTC+6)
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
}

/**
 * Streak Calculation in Asia/Dhaka Timezone
 * Evaluates active streak given a list of active YYYY-MM-DD dates.
 */
export function calculateStreak(activeDates: string[], referenceDate: Date = new Date()): {
  currentStreak: number;
  longestStreak: number;
  isActiveToday: boolean;
} {
  if (!activeDates || activeDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, isActiveToday: false };
  }

  const uniqueSortedDates = Array.from(new Set(activeDates)).sort().reverse();
  const todayStr = getDhakaDateString(referenceDate);

  // Compute yesterday in Asia/Dhaka
  const yesterday = new Date(referenceDate.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStr = getDhakaDateString(yesterday);

  const isActiveToday = uniqueSortedDates.includes(todayStr);
  const isActiveYesterday = uniqueSortedDates.includes(yesterdayStr);

  // If inactive both today and yesterday, streak is broken
  if (!isActiveToday && !isActiveYesterday) {
    return { currentStreak: 0, longestStreak: computeLongest(uniqueSortedDates), isActiveToday: false };
  }

  let streak = 0;
  let checkDate = isActiveToday ? new Date(referenceDate) : yesterday;

  while (true) {
    const checkStr = getDhakaDateString(checkDate);
    if (uniqueSortedDates.includes(checkStr)) {
      streak++;
      checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
    } else {
      break;
    }
  }

  const longestStreak = Math.max(streak, computeLongest(uniqueSortedDates));

  return {
    currentStreak: streak,
    longestStreak,
    isActiveToday,
  };
}

function computeLongest(sortedDescDates: string[]): number {
  if (sortedDescDates.length === 0) return 0;
  let max = 1;
  let current = 1;

  for (let i = 0; i < sortedDescDates.length - 1; i++) {
    const d1 = new Date(sortedDescDates[i]).getTime();
    const d2 = new Date(sortedDescDates[i + 1]).getTime();
    const diffDays = Math.round((d1 - d2) / (24 * 60 * 60 * 1000));

    if (diffDays === 1) {
      current++;
      if (current > max) max = current;
    } else if (diffDays > 1) {
      current = 1;
    }
  }

  return max;
}
