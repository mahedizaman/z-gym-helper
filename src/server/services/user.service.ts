import { connectToDatabase } from '@/server/db';
import { UserModel, IUser, IUserProfile } from '@/server/models/user.model';
import {
  MealLogModel,
  WorkoutLogModel,
  DailySummaryModel,
  WeightLogModel,
} from '@/server/models/log.model';
import { StreakModel } from '@/server/models/social.model';
import { streakService } from './streak.service';

export interface GoogleProfileInput {
  email: string;
  name?: string;
  image?: string;
}

export interface GuestMealMergeItem {
  id?: string;
  foodId?: string;
  nameBn: string;
  nameEn: string;
  servingLabel: string;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface GuestDayMealsMerge {
  date: string;
  slots: {
    breakfast: GuestMealMergeItem[];
    lunch: GuestMealMergeItem[];
    snack: GuestMealMergeItem[];
    dinner: GuestMealMergeItem[];
  };
}

export interface GuestDataMergePayload {
  profile?: {
    gender?: 'male' | 'female';
    age?: number;
    heightCm?: number;
    weightKg?: number;
    activityLevel?: 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active';
    goal?: string;
    customCalorieTarget?: number;
  };
  meals?: GuestDayMealsMerge[];
  weights?: Array<{
    date: string;
    weightKg: number;
    note?: string;
  }>;
  activePlanSlug?: string;
}

export const userService = {
  /**
   * Determine if an email address is configured as an admin in ADMIN_EMAILS.
   * Strictly evaluated on the server.
   */
  isAdminEmail(email: string): boolean {
    if (!email) return false;
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    return adminEmails.includes(email.toLowerCase().trim());
  },

  /**
   * Find or create user from authenticated Google profile.
   * Admin role is set solely via server-side ADMIN_EMAILS check.
   */
  async findOrCreateFromGoogle(profile: GoogleProfileInput): Promise<IUser | null> {
    const db = await connectToDatabase();
    if (!db) return null;

    const email = profile.email.toLowerCase().trim();
    const isAdmin = this.isAdminEmail(email);

    let user = await UserModel.findOne({ email });

    if (user) {
      // Refresh admin role, last active timestamp, and avatar
      user.role = isAdmin ? 'admin' : user.role || 'user';
      user.lastActiveAt = new Date();
      if (profile.image) user.avatar = profile.image;
      if (!user.nickname && profile.name) user.nickname = profile.name;
      await user.save();
      return user;
    }

    // Create new user
    user = await UserModel.create({
      email,
      role: isAdmin ? 'admin' : 'user',
      nickname: profile.name || email.split('@')[0],
      avatar: profile.image,
      lastActiveAt: new Date(),
      timezone: 'Asia/Dhaka',
      profile: {
        gender: 'male',
        weightKg: 70,
        heightCm: 172,
        age: 26,
        activityLevel: 'moderate',
      },
    });

    return user;
  },

  /**
   * Get user by MongoDB document ID
   */
  async getUserById(id: string): Promise<IUser | null> {
    const db = await connectToDatabase();
    if (!db) return null;

    try {
      return await UserModel.findById(id).lean();
    } catch {
      return null;
    }
  },

  /**
   * Update user profile settings
   */
  async updateProfile(
    userId: string,
    updates: {
      nickname?: string;
      profile?: Partial<IUserProfile>;
    }
  ): Promise<IUser | null> {
    const db = await connectToDatabase();
    if (!db) return null;

    const user = await UserModel.findById(userId);
    if (!user) return null;

    if (updates.nickname && updates.nickname.trim()) {
      user.nickname = updates.nickname.trim();
    }

    if (updates.profile) {
      user.profile = {
        gender: updates.profile.gender || user.profile?.gender || 'male',
        weightKg: updates.profile.weightKg || user.profile?.weightKg || 70,
        heightCm: updates.profile.heightCm || user.profile?.heightCm || 172,
        age: updates.profile.age || user.profile?.age || 26,
        targetWeightKg: updates.profile.targetWeightKg ?? user.profile?.targetWeightKg,
        calorieTarget: updates.profile.calorieTarget ?? user.profile?.calorieTarget,
        activityLevel: updates.profile.activityLevel || user.profile?.activityLevel || 'moderate',
      };
    }

    await user.save();
    return user;
  },

  /**
   * Seamlessly merge guest localStorage data into the authenticated account without duplicate entries.
   */
  async mergeGuestData(
    userId: string,
    payload: GuestDataMergePayload
  ): Promise<{
    success: boolean;
    mealsMerged: number;
    weightsMerged: number;
    profileUpdated: boolean;
  }> {
    const db = await connectToDatabase();
    if (!db) {
      return { success: false, mealsMerged: 0, weightsMerged: 0, profileUpdated: false };
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return { success: false, mealsMerged: 0, weightsMerged: 0, profileUpdated: false };
    }

    let mealsMerged = 0;
    let weightsMerged = 0;
    let profileUpdated = false;

    // 1. Merge Profile if guest profile exists and user profile has defaults
    if (payload.profile) {
      const p = payload.profile;
      user.profile = {
        gender: p.gender || user.profile?.gender || 'male',
        weightKg: p.weightKg || user.profile?.weightKg || 70,
        heightCm: p.heightCm || user.profile?.heightCm || 172,
        age: p.age || user.profile?.age || 26,
        calorieTarget: p.customCalorieTarget || user.profile?.calorieTarget,
        activityLevel: (p.activityLevel as IUserProfile['activityLevel']) || user.profile?.activityLevel || 'moderate',
      };
      await user.save();
      profileUpdated = true;
    }

    // 2. Merge Meals without duplicating
    if (payload.meals && Array.isArray(payload.meals)) {
      for (const day of payload.meals) {
        if (!day.date || !day.slots) continue;
        const slots: Array<'breakfast' | 'lunch' | 'snack' | 'dinner'> = [
          'breakfast',
          'lunch',
          'snack',
          'dinner',
        ];

        for (const slotKey of slots) {
          const items = day.slots[slotKey] || [];
          for (const item of items) {
            // Check for exact duplicate in database
            const existing = await MealLogModel.findOne({
              userId,
              date: day.date,
              slot: slotKey,
              foodNameEn: item.nameEn,
              grams: item.grams,
            });

            if (!existing) {
              await MealLogModel.create({
                userId,
                date: day.date,
                slot: slotKey,
                foodId: item.foodId || 'guest_item',
                foodNameBn: item.nameBn,
                foodNameEn: item.nameEn,
                grams: item.grams,
                servingLabel: item.servingLabel || `${item.grams}g`,
                macros: {
                  kcal: item.kcal,
                  protein: item.protein,
                  carbs: item.carbs,
                  fat: item.fat,
                },
              });

              // Atomically update Daily Summary
              await DailySummaryModel.findOneAndUpdate(
                { userId, date: day.date },
                {
                  $inc: {
                    totalIntakeKcal: item.kcal,
                    totalProtein: item.protein,
                    totalCarbs: item.carbs,
                    totalFat: item.fat,
                    mealCount: 1,
                  },
                },
                { upsert: true, new: true }
              );

              // Record streak activity in Asia/Dhaka
              await streakService.recordActivity(userId, day.date);

              mealsMerged++;
            }
          }
        }
      }
    }

    // 3. Merge Weights without duplicating
    if (payload.weights && Array.isArray(payload.weights)) {
      for (const w of payload.weights) {
        if (!w.date || typeof w.weightKg !== 'number') continue;
        const existingWeight = await WeightLogModel.findOne({
          userId,
          date: w.date,
        });

        if (!existingWeight) {
          await WeightLogModel.create({
            userId,
            date: w.date,
            weightKg: w.weightKg,
            note: w.note || 'Guest log',
          });
          weightsMerged++;
        }
      }
    }

    return {
      success: true,
      mealsMerged,
      weightsMerged,
      profileUpdated,
    };
  },

  /**
   * Permanently delete user account and all associated user data.
   */
  async deleteUserAccount(userId: string): Promise<boolean> {
    const db = await connectToDatabase();
    if (!db) return false;

    await Promise.all([
      UserModel.findByIdAndDelete(userId),
      MealLogModel.deleteMany({ userId }),
      WorkoutLogModel.deleteMany({ userId }),
      DailySummaryModel.deleteMany({ userId }),
      WeightLogModel.deleteMany({ userId }),
      StreakModel.deleteMany({ userId }),
    ]);

    return true;
  },
};
