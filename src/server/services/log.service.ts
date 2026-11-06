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
        $set: { logged: true },
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
   * Get Daily Summaries across a date range [startDate, endDate]
   */
  async getPeriodSummaries(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<IDailySummary[]> {
    const db = await connectToDatabase();
    if (!db) return [];

    return await DailySummaryModel.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    })
      .sort({ date: 1 })
      .lean();
  },

  /**
   * Backfill DailySummary documents from existing MealLog and WorkoutLog entries
   */
  async backfillDailySummariesFromLogs(userId?: string): Promise<number> {
    const db = await connectToDatabase();
    if (!db) return 0;

    const query = userId ? { userId } : {};
    const meals = await MealLogModel.find(query).lean();
    const workouts = await WorkoutLogModel.find(query).lean();

    const dateMap = new Map<
      string,
      {
        userId: string;
        date: string;
        kcal: number;
        protein: number;
        carbs: number;
        fat: number;
        mealCount: number;
        burnKcal: number;
        workoutDone: boolean;
      }
    >();

    for (const m of meals) {
      const key = `${m.userId}_${m.date}`;
      if (!dateMap.has(key)) {
        dateMap.set(key, {
          userId: m.userId,
          date: m.date,
          kcal: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          mealCount: 0,
          burnKcal: 0,
          workoutDone: false,
        });
      }
      const entry = dateMap.get(key)!;
      entry.kcal += m.macros?.kcal || 0;
      entry.protein += m.macros?.protein || 0;
      entry.carbs += m.macros?.carbs || 0;
      entry.fat += m.macros?.fat || 0;
      entry.mealCount += 1;
    }

    for (const w of workouts) {
      const key = `${w.userId}_${w.date}`;
      if (!dateMap.has(key)) {
        dateMap.set(key, {
          userId: w.userId,
          date: w.date,
          kcal: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          mealCount: 0,
          burnKcal: 0,
          workoutDone: false,
        });
      }
      const entry = dateMap.get(key)!;
      entry.burnKcal += w.estimatedBurnKcal || 0;
      entry.workoutDone = true;
    }

    let backfilledCount = 0;
    for (const entry of dateMap.values()) {
      await DailySummaryModel.findOneAndUpdate(
        { userId: entry.userId, date: entry.date },
        {
          $set: {
            totalIntakeKcal: entry.kcal,
            totalProtein: Number(entry.protein.toFixed(1)),
            totalCarbs: Number(entry.carbs.toFixed(1)),
            totalFat: Number(entry.fat.toFixed(1)),
            mealCount: entry.mealCount,
            exerciseBurnKcal: entry.burnKcal,
            workoutDone: entry.workoutDone,
            logged: true,
          },
        },
        { upsert: true }
      );
      backfilledCount++;
    }

    return backfilledCount;
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
