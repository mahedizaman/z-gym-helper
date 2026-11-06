/**
 * Period Summary Math Domain Module
 * Computes totals, averages over logged days, target sums, net balances,
 * estimated vs real weight changes, and honest plain-language insights.
 */

export interface DailySummaryItem {
  date: string; // YYYY-MM-DD
  totalIntakeKcal: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  exerciseBurnKcal: number;
  targetKcal: number;
  targetProtein?: number;
  targetBurn?: number;
  logged: boolean;
  mealCount?: number;
  workoutDone?: boolean;
}

export interface PeriodWeightLog {
  date: string;
  weightKg: number;
}

export interface PeriodSummaryResult {
  periodDays: number;
  loggedDaysCount: number;
  isLowLogging: boolean;

  // Period Totals
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalBurn: number;
  totalPeriodTargetKcal: number; // Target for all days in the period
  loggedTargetKcal: number; // Target for logged days only

  // Daily Averages (strictly over logged days only)
  dailyAverage: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    burn: number;
    targetKcal: number;
  };

  // Target Comparisons
  diffKcal: number; // avgCalories - avgTargetKcal
  percentOfTarget: number; // (totalCalories / loggedTargetKcal) * 100

  // Energy & Weight Dynamics
  netBalanceKcal: number;
  estimatedWeightChangeKg: number; // netBalanceKcal / 7700
  realWeightChangeKg: number | null; // from weight logs if available

  // Visuals & Insights
  chartData: Array<{
    date: string;
    labelBn: string;
    labelEn: string;
    eatenKcal: number;
    targetKcal: number;
    isLogged: boolean;
  }>;
  insights: {
    bn: [string, string];
    en: [string, string];
  };
}

const MONTH_NAMES_BN = [
  'জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'
];

const MONTH_NAMES_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Formats YYYY-MM-DD to a short display label
 */
export function formatDayLabel(dateStr: string, locale: 'bn' | 'en'): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  if (locale === 'bn') {
    const monthBn = MONTH_NAMES_BN[monthIdx] || parts[1];
    return `${day} ${monthBn}`;
  }
  const monthEn = MONTH_NAMES_EN[monthIdx] || parts[1];
  return `${monthEn} ${day}`;
}

/**
 * Pure calculation function for period summaries.
 * Always computes daily averages strictly over LOGGED days.
 * Never counts unlogged days as 0 calories.
 */
export function calculatePeriodSummary(params: {
  periodDays: number;
  summaries: DailySummaryItem[];
  weightLogs?: PeriodWeightLog[];
  fallbackTargetKcal?: number;
  fallbackTargetProtein?: number;
  fallbackTargetBurn?: number;
}): PeriodSummaryResult {
  const {
    periodDays,
    summaries,
    weightLogs = [],
    fallbackTargetKcal = 2000,
    fallbackTargetProtein = 100,
  } = params;

  // Filter or align summaries to the period length
  const relevantDays = summaries.slice(-periodDays);

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;
  let totalBurn = 0;
  let totalPeriodTargetKcal = 0;
  let loggedTargetKcal = 0;
  let loggedDaysCount = 0;

  const chartData: PeriodSummaryResult['chartData'] = [];

  for (const day of relevantDays) {
    const dayTarget = day.targetKcal > 0 ? day.targetKcal : fallbackTargetKcal;
    totalPeriodTargetKcal += dayTarget;

    const isLogged =
      Boolean(day.logged) ||
      day.totalIntakeKcal > 0 ||
      (day.mealCount ?? 0) > 0 ||
      day.exerciseBurnKcal > 0;

    if (isLogged) {
      loggedDaysCount += 1;
      totalCalories += day.totalIntakeKcal || 0;
      totalProtein += day.totalProtein || 0;
      totalCarbs += day.totalCarbs || 0;
      totalFat += day.totalFat || 0;
      totalFiber += day.totalFiber || 0;
      totalBurn += day.exerciseBurnKcal || 0;
      loggedTargetKcal += dayTarget;
    }

    chartData.push({
      date: day.date,
      labelBn: formatDayLabel(day.date, 'bn'),
      labelEn: formatDayLabel(day.date, 'en'),
      eatenKcal: Math.round(day.totalIntakeKcal || 0),
      targetKcal: Math.round(dayTarget),
      isLogged,
    });
  }

  // Averages strictly over logged days only
  const dailyAverage = {
    calories: loggedDaysCount > 0 ? Math.round(totalCalories / loggedDaysCount) : 0,
    protein: loggedDaysCount > 0 ? Number((totalProtein / loggedDaysCount).toFixed(1)) : 0,
    carbs: loggedDaysCount > 0 ? Number((totalCarbs / loggedDaysCount).toFixed(1)) : 0,
    fat: loggedDaysCount > 0 ? Number((totalFat / loggedDaysCount).toFixed(1)) : 0,
    fiber: loggedDaysCount > 0 ? Number((totalFiber / loggedDaysCount).toFixed(1)) : 0,
    burn: loggedDaysCount > 0 ? Math.round(totalBurn / loggedDaysCount) : 0,
    targetKcal:
      loggedDaysCount > 0
        ? Math.round(loggedTargetKcal / loggedDaysCount)
        : Math.round(totalPeriodTargetKcal / (relevantDays.length || 1)),
  };

  const diffKcal = dailyAverage.calories - dailyAverage.targetKcal;
  const percentOfTarget =
    loggedTargetKcal > 0 ? Math.round((totalCalories / loggedTargetKcal) * 100) : 0;

  // Net Balance: Eaten calories minus (Logged targets + Extra burn)
  // Positive = surplus, Negative = deficit
  const netBalanceKcal =
    loggedDaysCount > 0 ? Math.round(totalCalories - (loggedTargetKcal + totalBurn)) : 0;

  // 7,700 kcal per kg of weight change
  const estimatedWeightChangeKg = Number((netBalanceKcal / 7700).toFixed(2));

  // Real weight change from logs if multiple entries in this period
  let realWeightChangeKg: number | null = null;
  if (weightLogs.length >= 2) {
    const startDate = relevantDays[0]?.date;
    const endDate = relevantDays[relevantDays.length - 1]?.date;
    const logsInPeriod = weightLogs.filter((w) => w.date >= startDate && w.date <= endDate);
    if (logsInPeriod.length >= 2) {
      const sorted = [...logsInPeriod].sort((a, b) => a.date.localeCompare(b.date));
      const delta = sorted[sorted.length - 1].weightKg - sorted[0].weightKg;
      realWeightChangeKg = Number(delta.toFixed(1));
    }
  }

  const isLowLogging =
    loggedDaysCount > 0 && loggedDaysCount < Math.ceil(periodDays / 2);

  // Generate 2 honest plain-language insights
  let insight1Bn = '';
  let insight1En = '';
  let insight2Bn = '';
  let insight2En = '';

  if (loggedDaysCount === 0) {
    insight1Bn = 'এই সময়ের জন্য এখনও কোনো খাবার বা ব্যায়াম লগ করা হয়নি।';
    insight1En = 'No meals or workouts logged yet for this period.';
    insight2Bn = 'প্রতিদিন খাবার লগ করলে পুষ্টির সঠিক গড় ও অগ্রগতি দেখতে পাবেন।';
    insight2En = 'Log daily to see accurate averages and progress trends.';
  } else {
    // Insight 1: Calorie intake vs target
    const absDiff = Math.abs(diffKcal);
    if (absDiff <= 50) {
      insight1Bn = `ক্যালরি গ্রহণ লক্ষ্যের খুব কাছাকাছি রয়েছে (গড়ে মাত্র ${absDiff} kcal ব্যবধান)।`;
      insight1En = `Calorie intake is right on target (avg ${absDiff} kcal difference).`;
    } else if (diffKcal < 0) {
      insight1Bn = `ক্যালরি গ্রহণ লক্ষ্যের চেয়ে গড়ে ${absDiff} kcal কম রয়েছে।`;
      insight1En = `Calorie intake is an average of ${absDiff} kcal below target.`;
    } else {
      insight1Bn = `ক্যালরি গ্রহণ লক্ষ্যের চেয়ে গড়ে ${absDiff} kcal বেশি রয়েছে।`;
      insight1En = `Calorie intake is an average of ${absDiff} kcal above target.`;
    }

    // Insight 2: Protein target or Extra Burn
    if (dailyAverage.protein > 0 && fallbackTargetProtein > 0) {
      const proteinPct = Math.round((dailyAverage.protein / fallbackTargetProtein) * 100);
      insight2Bn = `প্রোটিন লক্ষ্যের গড়ে ${proteinPct}% পূরণ হয়েছে (${dailyAverage.protein}g / ${fallbackTargetProtein}g)।`;
      insight2En = `Reached an average of ${proteinPct}% of protein target (${dailyAverage.protein}g / ${fallbackTargetProtein}g).`;
    } else if (totalBurn > 0) {
      insight2Bn = `এই সময়ে মোট ${Math.round(totalBurn)} kcal অতিরিক্ত ক্যালরি বার্ন করা হয়েছে।`;
      insight2En = `Burned an extra ${Math.round(totalBurn)} kcal during this period.`;
    } else {
      insight2Bn = `${periodDays} দিনের মধ্যে ${loggedDaysCount} দিন নিয়ম মেনে লগ করা হয়েছে।`;
      insight2En = `Successfully logged ${loggedDaysCount} of ${periodDays} days.`;
    }
  }

  return {
    periodDays,
    loggedDaysCount,
    isLowLogging,
    totalCalories: Math.round(totalCalories),
    totalProtein: Number(totalProtein.toFixed(1)),
    totalCarbs: Number(totalCarbs.toFixed(1)),
    totalFat: Number(totalFat.toFixed(1)),
    totalFiber: Number(totalFiber.toFixed(1)),
    totalBurn: Math.round(totalBurn),
    totalPeriodTargetKcal: Math.round(totalPeriodTargetKcal),
    loggedTargetKcal: Math.round(loggedTargetKcal),
    dailyAverage,
    diffKcal,
    percentOfTarget,
    netBalanceKcal,
    estimatedWeightChangeKg,
    realWeightChangeKg,
    chartData,
    insights: {
      bn: [insight1Bn, insight2Bn],
      en: [insight1En, insight2En],
    },
  };
}
