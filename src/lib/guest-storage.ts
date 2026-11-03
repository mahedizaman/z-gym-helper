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

import { type ActivityLevel, type Goal } from '@/server/services/calculations';

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
  nameBn: string;
  nameEn: string;
  met: number;
  durationMinutes: number;
  burnedKcal: number;
}

const STORAGE_KEYS = {
  MEALS_PREFIX: 'zgym_guest_meals_',
  PROFILE: 'zgym_guest_profile',
  BURNS_PREFIX: 'zgym_guest_burns_',
  FAVORITES: 'zgym_guest_food_favorites',
  ACTIVE_PLAN: 'zgym_guest_active_plan',
  PLAN_PROGRESS_PREFIX: 'zgym_guest_plan_progress_',
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

const DEFAULT_PROFILE: GuestProfile = {
  gender: 'male',
  age: 26,
  heightCm: 172,
  weightKg: 70,
  activityLevel: 'moderate',
  goal: 'loss',
};

export const guestStorage = {
  getDhakaDateString,
  getProfile(): GuestProfile {
    if (typeof window === 'undefined') return DEFAULT_PROFILE;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : DEFAULT_PROFILE;
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
    } catch {
      // ignore
    }
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
};
