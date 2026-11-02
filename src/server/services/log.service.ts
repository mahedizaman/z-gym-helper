import { connectToDatabase } from '@/server/db';
import {
  MealLogModel,
  WorkoutLogModel,
  DailySummaryModel,
  WeightLogModel,
  IMealLog,
  IWorkoutLog,
  IDailySummary,
  IWeightLog,
} from '@/server/models/log.model';
import { streakService } from './streak.service';

export const logService = {
  /**
   * Log a meal item and update daily summary & streak
   */
  async logMeal(data: {
    userId: string;
    date: string;
    slot: 'breakfast' | 'lunch' | 'snack' | 'dinner';
    foodId: string;
    foodNameBn: string;
    foodNameEn: string;
    grams: number;
    servingLabel: string;
    macros: { kcal: number; protein: number; carbs: number; fat: number };
  }): Promise<IMealLog | null> {
    const db = await connectToDatabase();
    if (!db) return null;

    const mealLog = await MealLogModel.create(data);

    // Update Daily Summary atomically
    await DailySummaryModel.findOneAndUpdate(
      { userId: data.userId, date: data.date },
      {
        $inc: {
          totalIntakeKcal: data.macros.kcal,
          totalProtein: data.macros.protein,
          totalCarbs: data.macros.carbs,
          totalFat: data.macros.fat,
          mealCount: 1,
        },
      },
      { upsert: true, new: true }
    );

    // Record streak activity in Asia/Dhaka
    await streakService.recordActivity(data.userId, data.date);

    return mealLog;
  },

  /**
   * Log a completed workout day and update daily summary & streak
   */
  async logWorkout(data: {
    userId: string;
    date: string;
    planSlug: string;
    dayIndex: number;
    dayName: string;
    completedExercises: Array<{
      exerciseSlug: string;
      completedSets: number;
      weightKg?: number;
    }>;
    durationMinutes: number;
    estimatedBurnKcal: number;
  }): Promise<IWorkoutLog | null> {
    const db = await connectToDatabase();
    if (!db) return null;

    const workoutLog = await WorkoutLogModel.create(data);

    // Update Daily Summary
    await DailySummaryModel.findOneAndUpdate(
      { userId: data.userId, date: data.date },
      {
        $set: { workoutDone: true },
        $inc: { exerciseBurnKcal: data.estimatedBurnKcal },
      },
      { upsert: true, new: true }
    );

    // Record streak activity in Asia/Dhaka
    await streakService.recordActivity(data.userId, data.date);

    return workoutLog;
  },

  /**
   * Log weight (permanent record)
   */
  async logWeight(userId: string, weightKg: number, date: string, note?: string): Promise<IWeightLog | null> {
    const db = await connectToDatabase();
    if (!db) return null;

    return await WeightLogModel.create({
      userId,
      weightKg,
      date,
      note,
    });
  },

  /**
   * Get Daily Summary for user
   */
  async getDailySummary(userId: string, date: string): Promise<IDailySummary | null> {
    const db = await connectToDatabase();
    if (!db) return null;

    return await DailySummaryModel.findOne({ userId, date }).lean();
  },

  /**
   * Get weight history
   */
  async getWeightHistory(userId: string, limit: number = 30): Promise<IWeightLog[]> {
    const db = await connectToDatabase();
    if (!db) return [];

    return await WeightLogModel.find({ userId })
      .sort({ date: 1 })
      .limit(limit)
      .lean();
  },
};
