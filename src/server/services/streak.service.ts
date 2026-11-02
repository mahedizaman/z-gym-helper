import { connectToDatabase } from '@/server/db';
import { StreakModel, IStreak } from '@/server/models/social.model';
import { calculateStreak, getDhakaDateString } from './calculations';

export const streakService = {
  /**
   * Get user's current streak state
   */
  async getUserStreak(userId: string): Promise<{
    currentStreak: number;
    longestStreak: number;
    isActiveToday: boolean;
  }> {
    const db = await connectToDatabase();
    if (!db) {
      return { currentStreak: 0, longestStreak: 0, isActiveToday: false };
    }

    const streakRecord = await StreakModel.findOne({ userId }).lean();
    if (!streakRecord) {
      return { currentStreak: 0, longestStreak: 0, isActiveToday: false };
    }

    return calculateStreak(streakRecord.activeDates || []);
  },

  /**
   * Record activity for today (or specified date) in Asia/Dhaka timezone
   */
  async recordActivity(userId: string, customDate?: string): Promise<IStreak | null> {
    const db = await connectToDatabase();
    if (!db) return null;

    const todayDhaka = customDate || getDhakaDateString();

    let streakRecord = await StreakModel.findOne({ userId });

    if (!streakRecord) {
      streakRecord = new StreakModel({
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDhakaDate: todayDhaka,
        activeDates: [todayDhaka],
      });
      return await streakRecord.save();
    }

    // Add date to activeDates if not already present
    if (!streakRecord.activeDates.includes(todayDhaka)) {
      streakRecord.activeDates.push(todayDhaka);
    }

    // Recalculate streak using domain math
    const result = calculateStreak(streakRecord.activeDates);
    streakRecord.currentStreak = result.currentStreak;
    streakRecord.longestStreak = result.longestStreak;
    streakRecord.lastActiveDhakaDate = todayDhaka;

    return await streakRecord.save();
  },
};
