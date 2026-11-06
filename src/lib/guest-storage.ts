/**
 * Guest-First Local Storage Persistence Layer
 * Enables 100% functionality without mandatory login, ready for seamless MongoDB sync upon first auth.
 */

export interface GuestMealItem {
  id: string;
  foodId?: string;
  nameBn: string;
  nameEn: string;
  servingLabel: string;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  isPreWorkout?: boolean;
}

export type MealSlotKey = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export interface GuestDayMeals {
  date: string; // YYYY-MM-DD (Asia/Dhaka)
  slots: {
    breakfast: GuestMealItem[];
    lunch: GuestMealItem[];
    snack: GuestMealItem[];
    dinner: GuestMealItem[];
  };
}

import {
  type ActivityLevel,
  type Goal,
  calculateStreak,
  calculateBMR,
  calculateTDEE,
  calculateCaloricTarget,
  calculateMacroSplit,
} from '@/server/services/calculations';

export interface GuestDailySummary {
  date: string; // YYYY-MM-DD
  totalIntakeKcal: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  exerciseBurnKcal: number;
  netBalanceKcal: number;
  targetKcal: number;
  targetProtein: number;
  targetBurn: number;
  logged: boolean;
  mealCount: number;
  workoutDone: boolean;
  updatedAt?: string;
}

export interface GuestProfile {
  gender: 'male' | 'female';
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  customCalorieTarget?: number;
}

export interface GuestExerciseBurn {
  id: string;
  activityId?: string;
  nameBn: string;
  nameEn: string;
  category?: string;
  met: number;
  intensity?: 'light' | 'moderate' | 'vigorous';
  durationMinutes: number;
  burnedKcal: number;
  isNet?: boolean;
  distanceKm?: number;
  speedKmh?: number;
  paceMinKm?: string;
  inclinePct?: number;
  sets?: number;
  reps?: number;
  restSeconds?: number;
}

export interface DailyPlanPreferences {
  weeklyGoalKg: number; // e.g. -0.5, 0, +0.25
  splitRatio: number; // e.g. 0.7 (70% diet / 30% exercise)
  targetWorkoutBurnKcal?: number;
}

const STORAGE_KEYS = {
  MEALS_PREFIX: 'zgym_guest_meals_',
  PROFILE: 'zgym_guest_profile',
  BURNS_PREFIX: 'zgym_guest_burns_',
  FAVORITES: 'zgym_guest_food_favorites',
  ACTIVE_PLAN: 'zgym_guest_active_plan',
  PLAN_PROGRESS_PREFIX: 'zgym_guest_plan_progress_',
  DAILY_PLAN_PREFS: 'zgym_guest_daily_plan_prefs',
  DAILY_SUMMARIES: 'zgym_guest_daily_summaries',
};

// Returns current Asia/Dhaka date YYYY-MM-DD
export function getDhakaDateString(d?: Date): string {
  if (typeof window === 'undefined' && !d) {
    return '2026-11-03';
  }
  const dateObj = d ?? new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(dateObj);
}

export const DEFAULT_PROFILE: GuestProfile = {
  gender: 'male',
  age: 26,
  heightCm: 172,
  weightKg: 70,
  activityLevel: 'moderate',
  goal: 'loss',
};

export function sanitizeGuestProfile(raw: unknown): GuestProfile {
  if (!raw || typeof raw !== 'object') return DEFAULT_PROFILE;
  const p = raw as Partial<GuestProfile>;

  const gender = p.gender === 'female' ? 'female' : 'male';
  const age =
    typeof p.age === 'number' && !isNaN(p.age) && p.age >= 10 && p.age <= 100
      ? Math.round(p.age)
      : DEFAULT_PROFILE.age;
  const heightCm =
    typeof p.heightCm === 'number' && !isNaN(p.heightCm) && p.heightCm >= 100 && p.heightCm <= 250
      ? Math.round(p.heightCm)
      : DEFAULT_PROFILE.heightCm;
  const weightKg =
    typeof p.weightKg === 'number' && !isNaN(p.weightKg) && p.weightKg >= 30 && p.weightKg <= 300
      ? Number(p.weightKg.toFixed(1))
      : DEFAULT_PROFILE.weightKg;

  const validActivityLevels: ActivityLevel[] = [
    'sedentary',
    'light',
    'moderate',
    'active',
    'very_active',
    'extra_active',
  ];
  const activityLevel =
    p.activityLevel && validActivityLevels.includes(p.activityLevel)
      ? p.activityLevel
      : DEFAULT_PROFILE.activityLevel;

  const validGoals: Goal[] = ['maintain', 'mild_loss', 'loss', 'extreme_loss', 'muscle_gain'];
  const goal = p.goal && validGoals.includes(p.goal) ? p.goal : DEFAULT_PROFILE.goal;

  const customCalorieTarget =
    typeof p.customCalorieTarget === 'number' &&
    !isNaN(p.customCalorieTarget) &&
    p.customCalorieTarget >= 800 &&
    p.customCalorieTarget <= 10000
      ? Math.round(p.customCalorieTarget)
      : undefined;

  return {
    gender,
    age,
    heightCm,
    weightKg,
    activityLevel,
    goal,
    customCalorieTarget,
  };
}

export const guestStorage = {
  getDhakaDateString,
  getProfile(): GuestProfile {
    if (typeof window === 'undefined') return DEFAULT_PROFILE;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (!data) return DEFAULT_PROFILE;
      return sanitizeGuestProfile(JSON.parse(data));
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveProfile(profile: GuestProfile): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch {
      // ignore quota errors
    }
  },

  getMeals(date: string = getDhakaDateString()): GuestDayMeals {
    const defaultMeals: GuestDayMeals = {
      date,
      slots: {
        breakfast: [],
        lunch: [],
        snack: [],
        dinner: [],
      },
    };
    if (typeof window === 'undefined') return defaultMeals;
    try {
      const data = localStorage.getItem(`${STORAGE_KEYS.MEALS_PREFIX}${date}`);
      return data ? JSON.parse(data) : defaultMeals;
    } catch {
      return defaultMeals;
    }
  },

  saveMeals(meals: GuestDayMeals): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        `${STORAGE_KEYS.MEALS_PREFIX}${meals.date}`,
        JSON.stringify(meals)
      );
      this.recalculateDailySummaryForDate(meals.date);
    } catch {
      // ignore
    }
  },

  addMealItem(
    date: string,
    slot: MealSlotKey,
    item: Omit<GuestMealItem, 'id'>
  ): GuestDayMeals {
    const day = this.getMeals(date);
    const newItem: GuestMealItem = {
      ...item,
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
    day.slots[slot].push(newItem);
    this.saveMeals(day);
    return day;
  },

  removeMealItem(date: string, slot: MealSlotKey, itemId: string): GuestDayMeals {
    const day = this.getMeals(date);
    day.slots[slot] = day.slots[slot].filter((item) => item.id !== itemId);
    this.saveMeals(day);
    return day;
  },

  getExerciseBurns(date: string = getDhakaDateString()): GuestExerciseBurn[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(`${STORAGE_KEYS.BURNS_PREFIX}${date}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveExerciseBurns(date: string, burns: GuestExerciseBurn[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        `${STORAGE_KEYS.BURNS_PREFIX}${date}`,
        JSON.stringify(burns)
      );
      this.recalculateDailySummaryForDate(date);
    } catch {
      // ignore
    }
  },

  getDailySummariesMap(): Record<string, GuestDailySummary> {
    if (typeof window === 'undefined') return {};
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DAILY_SUMMARIES);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveDailySummariesMap(map: Record<string, GuestDailySummary>): void {
    if (typeof window === 'undefined') return;
    try {
      // Auto-prune entries older than 90 days
      const now = Date.now();
      const maxAgeMs = 90 * 24 * 60 * 60 * 1000;
      const pruned: Record<string, GuestDailySummary> = {};
      for (const [dateKey, item] of Object.entries(map)) {
        const itemDate = new Date(`${dateKey}T12:00:00Z`).getTime();
        if (isNaN(itemDate) || now - itemDate <= maxAgeMs) {
          pruned[dateKey] = item;
        }
      }
      localStorage.setItem(STORAGE_KEYS.DAILY_SUMMARIES, JSON.stringify(pruned));
    } catch {
      // ignore
    }
  },

  recalculateDailySummaryForDate(date: string): GuestDailySummary {
    const meals = this.getMeals(date);
    const burns = this.getExerciseBurns(date);
    const profile = this.getProfile();

    const allMealItems: GuestMealItem[] = Object.values(meals.slots || {}).flat();
    const totalIntakeKcal = Math.round(allMealItems.reduce((acc, i) => acc + (i.kcal || 0), 0));
    const totalProtein = Number(allMealItems.reduce((acc, i) => acc + (i.protein || 0), 0).toFixed(1));
    const totalCarbs = Number(allMealItems.reduce((acc, i) => acc + (i.carbs || 0), 0).toFixed(1));
    const totalFat = Number(allMealItems.reduce((acc, i) => acc + (i.fat || 0), 0).toFixed(1));
    const totalFiber = Number(allMealItems.reduce((acc, i) => acc + (i.fiber || 0), 0).toFixed(1));
    const mealCount = allMealItems.length;

    const exerciseBurnKcal = Math.round(burns.reduce((acc, b) => acc + (b.burnedKcal || 0), 0));
    const workoutDone = burns.length > 0;
    const logged = mealCount > 0 || exerciseBurnKcal > 0;

    // Calculate daily target based on profile
    const bmr = calculateBMR(profile.weightKg, profile.heightCm, profile.age, profile.gender);
    const tdee = calculateTDEE(bmr, profile.activityLevel);
    const targetKcal =
      profile.customCalorieTarget && profile.customCalorieTarget >= 800
        ? profile.customCalorieTarget
        : calculateCaloricTarget(tdee, profile.goal, profile.gender);

    const macroSplit = calculateMacroSplit(targetKcal, profile.weightKg, profile.goal);
    const targetProtein = macroSplit.protein;
    const targetBurn = 300;

    const netBalanceKcal = logged ? totalIntakeKcal - (targetKcal + exerciseBurnKcal) : 0;

    const summary: GuestDailySummary = {
      date,
      totalIntakeKcal,
      totalProtein,
      totalCarbs,
      totalFat,
      totalFiber,
      exerciseBurnKcal,
      netBalanceKcal,
      targetKcal,
      targetProtein,
      targetBurn,
      logged,
      mealCount,
      workoutDone,
      updatedAt: new Date().toISOString(),
    };

    const map = this.getDailySummariesMap();
    map[date] = summary;
    this.saveDailySummariesMap(map);
    return summary;
  },

  getDailySummary(date: string): GuestDailySummary {
    const map = this.getDailySummariesMap();
    if (map[date]) {
      return map[date];
    }
    return this.recalculateDailySummaryForDate(date);
  },

  saveDailySummary(summary: GuestDailySummary): void {
    const map = this.getDailySummariesMap();
    map[summary.date] = summary;
    this.saveDailySummariesMap(map);
  },

  getPeriodDailySummaries(daysCount: number, endDateStr?: string): GuestDailySummary[] {
    const endStr = endDateStr || getDhakaDateString();
    const result: GuestDailySummary[] = [];

    const [y, m, d] = endStr.split('-').map(Number);
    const cursor = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));

    const dateStrings: string[] = [];
    for (let i = daysCount - 1; i >= 0; i--) {
      const dayDate = new Date(cursor.getTime() - i * 24 * 60 * 60 * 1000);
      const iso = dayDate.toISOString().split('T')[0];
      dateStrings.push(iso);
    }

    const map = this.getDailySummariesMap();
    for (const date of dateStrings) {
      if (map[date]) {
        result.push(map[date]);
      } else {
        result.push(this.recalculateDailySummaryForDate(date));
      }
    }

    return result;
  },

  addExerciseBurn(
    date: string,
    burn: Omit<GuestExerciseBurn, 'id'>
  ): GuestExerciseBurn[] {
    const list = this.getExerciseBurns(date);
    const newBurn: GuestExerciseBurn = {
      ...burn,
      id: `burn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
    const updated = [...list, newBurn];
    this.saveExerciseBurns(date, updated);
    return updated;
  },

  removeExerciseBurn(date: string, burnId: string): GuestExerciseBurn[] {
    const list = this.getExerciseBurns(date);
    const updated = list.filter((b) => b.id !== burnId);
    this.saveExerciseBurns(date, updated);
    return updated;
  },

  updateExerciseBurn(
    date: string,
    burnId: string,
    updates: Partial<Omit<GuestExerciseBurn, 'id'>>
  ): GuestExerciseBurn[] {
    const list = this.getExerciseBurns(date);
    const updated = list.map((b) => (b.id === burnId ? { ...b, ...updates } : b));
    this.saveExerciseBurns(date, updated);
    return updated;
  },

  getYesterdayDhakaDateString(): string {
    if (typeof window === 'undefined') return '2026-11-02';
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return getDhakaDateString(d);
  },

  getYesterdayExerciseBurns(): GuestExerciseBurn[] {
    if (typeof window === 'undefined') return [];
    const yesterdayDate = this.getYesterdayDhakaDateString();
    return this.getExerciseBurns(yesterdayDate);
  },

  repeatYesterdayWorkout(todayDate: string = getDhakaDateString()): GuestExerciseBurn[] {
    const yesterdayBurns = this.getYesterdayExerciseBurns();
    if (yesterdayBurns.length === 0) return this.getExerciseBurns(todayDate);

    const todayBurns = this.getExerciseBurns(todayDate);
    const copied: GuestExerciseBurn[] = yesterdayBurns.map((b) => ({
      ...b,
      id: `burn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    }));

    const combined = [...todayBurns, ...copied];
    this.saveExerciseBurns(todayDate, combined);
    return combined;
  },

  getPast7DaysBurnSummary(todayDate: string = getDhakaDateString()): Array<{
    date: string;
    dayLabel: string;
    dayLabelBn: string;
    burnedKcal: number;
    isToday: boolean;
  }> {
    if (typeof window === 'undefined') return [];
    const result: Array<{
      date: string;
      dayLabel: string;
      dayLabelBn: string;
      burnedKcal: number;
      isToday: boolean;
    }> = [];

    const dayLabelsEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayLabelsBn = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getDhakaDateString(d);
      const burns = this.getExerciseBurns(dateStr);
      const burnedKcal = burns.reduce((acc, b) => acc + (b.burnedKcal || 0), 0);
      const dayOfWeek = d.getDay();

      result.push({
        date: dateStr,
        dayLabel: dayLabelsEn[dayOfWeek],
        dayLabelBn: dayLabelsBn[dayOfWeek],
        burnedKcal,
        isToday: dateStr === todayDate,
      });
    }

    return result;
  },

  getDailyPlanPreferences(): DailyPlanPreferences {
    if (typeof window === 'undefined') return { weeklyGoalKg: -0.5, splitRatio: 0.7 };
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DAILY_PLAN_PREFS);
      if (!raw) return { weeklyGoalKg: -0.5, splitRatio: 0.7 };
      const parsed = JSON.parse(raw);
      return {
        weeklyGoalKg: typeof parsed.weeklyGoalKg === 'number' ? parsed.weeklyGoalKg : -0.5,
        splitRatio: typeof parsed.splitRatio === 'number' ? parsed.splitRatio : 0.7,
        targetWorkoutBurnKcal: parsed.targetWorkoutBurnKcal,
      };
    } catch {
      return { weeklyGoalKg: -0.5, splitRatio: 0.7 };
    }
  },

  saveDailyPlanPreferences(prefs: DailyPlanPreferences): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.DAILY_PLAN_PREFS, JSON.stringify(prefs));
    } catch {
      // ignore
    }
  },

  getFavorites(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  toggleFavorite(foodId: string): string[] {
    const list = this.getFavorites();
    const idx = list.indexOf(foodId);
    const updated = idx === -1 ? [...list, foodId] : list.filter((id) => id !== foodId);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
    return updated;
  },

  getActivePlanSlug(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_PLAN);
    } catch {
      return null;
    }
  },

  setActivePlanSlug(slug: string | null): void {
    if (typeof window === 'undefined') return;
    try {
      if (slug) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_PLAN, slug);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_PLAN);
      }
    } catch {
      // ignore
    }
  },

  getPlanProgress(planSlug: string, date: string = getDhakaDateString()): Record<string, boolean> {
    if (typeof window === 'undefined') return {};
    try {
      const data = localStorage.getItem(`${STORAGE_KEYS.PLAN_PROGRESS_PREFIX}${planSlug}_${date}`);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  togglePlanExerciseProgress(
    planSlug: string,
    key: string,
    date: string = getDhakaDateString()
  ): Record<string, boolean> {
    const progress = this.getPlanProgress(planSlug, date);
    progress[key] = !progress[key];
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          `${STORAGE_KEYS.PLAN_PROGRESS_PREFIX}${planSlug}_${date}`,
          JSON.stringify(progress)
        );
      } catch {
        // ignore
      }
    }
    return progress;
  },

  getAllActiveDates(): string[] {
    if (typeof window === 'undefined') return [];
    const activeDates = new Set<string>();
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        if (key.startsWith(STORAGE_KEYS.MEALS_PREFIX)) {
          const date = key.replace(STORAGE_KEYS.MEALS_PREFIX, '');
          const data = localStorage.getItem(key);
          if (data) {
            try {
              const parsed = JSON.parse(data);
              const totalItems = Object.values(parsed.slots || {}).flat().length;
              if (totalItems > 0) activeDates.add(date);
            } catch {
              // ignore
            }
          }
        } else if (key.startsWith(STORAGE_KEYS.BURNS_PREFIX)) {
          const date = key.replace(STORAGE_KEYS.BURNS_PREFIX, '');
          const data = localStorage.getItem(key);
          if (data && data !== '[]') activeDates.add(date);
        } else if (key.startsWith(STORAGE_KEYS.PLAN_PROGRESS_PREFIX)) {
          const parts = key.replace(STORAGE_KEYS.PLAN_PROGRESS_PREFIX, '').split('_');
          const date = parts[parts.length - 1];
          if (date && date.length === 10) activeDates.add(date);
        }
      }

      const summariesMap = this.getDailySummariesMap();
      for (const [sDate, s] of Object.entries(summariesMap)) {
        if (s && s.logged) activeDates.add(sDate);
      }
    } catch {
      // ignore
    }
    return Array.from(activeDates);
  },

  getGuestStreak(): { currentStreak: number; longestStreak: number; isActiveToday: boolean } {
    const dates = this.getAllActiveDates();
    return calculateStreak(dates);
  },
};
