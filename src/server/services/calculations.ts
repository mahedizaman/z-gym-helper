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
  | 'very_active' // 1.725
  | 'extra_active'; // 1.9

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

/**
 * Mifflin-St Jeor Equation for Basal Metabolic Rate (BMR)
 * Male: BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) + 5
 * Female: BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) - 161
 */
export function calculateBMR({ weightKg, heightCm, age, gender }: BMRParams): number {
  if (weightKg <= 0 || heightCm <= 0 || age <= 0) {
    throw new Error('Weight, height, and age must be positive values');
  }

  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr = gender === 'male' ? base + 5 : base - 161;

  return Math.round(bmr);
}

/**
 * Total Daily Energy Expenditure (TDEE)
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  if (bmr <= 0) throw new Error('BMR must be positive');
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
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
