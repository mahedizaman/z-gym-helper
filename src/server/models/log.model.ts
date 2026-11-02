import mongoose, { Schema, Document, Model } from 'mongoose';

// 30 Days TTL constant in seconds (30 * 24 * 60 * 60)
const TTL_30_DAYS = 2592000;

export interface IMealLog extends Document {
  userId: string;
  date: string; // YYYY-MM-DD
  slot: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  foodId: string;
  foodNameBn: string;
  foodNameEn: string;
  grams: number;
  servingLabel: string;
  macros: {
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  createdAt: Date;
}

const MealLogSchema = new Schema<IMealLog>(
  {
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    slot: {
      type: String,
      required: true,
      enum: ['breakfast', 'lunch', 'snack', 'dinner'],
    },
    foodId: { type: String, required: true },
    foodNameBn: { type: String, required: true },
    foodNameEn: { type: String, required: true },
    grams: { type: Number, required: true },
    servingLabel: { type: String, required: true },
    macros: {
      kcal: { type: Number, required: true },
      protein: { type: Number, required: true },
      carbs: { type: Number, required: true },
      fat: { type: Number, required: true },
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: TTL_30_DAYS, // MongoDB TTL Index 30 days
    },
  },
  { timestamps: false }
);

export const MealLogModel: Model<IMealLog> =
  mongoose.models.MealLog || mongoose.model<IMealLog>('MealLog', MealLogSchema);

// Workout Log (TTL 30 days)
export interface IWorkoutLog extends Document {
  userId: string;
  date: string; // YYYY-MM-DD
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
  createdAt: Date;
}

const WorkoutLogSchema = new Schema<IWorkoutLog>(
  {
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    planSlug: { type: String, required: true },
    dayIndex: { type: Number, required: true },
    dayName: { type: String, required: true },
    completedExercises: [
      {
        exerciseSlug: { type: String, required: true },
        completedSets: { type: Number, required: true },
        weightKg: { type: Number },
      },
    ],
    durationMinutes: { type: Number, default: 45 },
    estimatedBurnKcal: { type: Number, default: 250 },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: TTL_30_DAYS, // MongoDB TTL Index 30 days
    },
  },
  { timestamps: false }
);

export const WorkoutLogModel: Model<IWorkoutLog> =
  mongoose.models.WorkoutLog ||
  mongoose.model<IWorkoutLog>('WorkoutLog', WorkoutLogSchema);

// Daily Summary (Permanent)
export interface IDailySummary extends Document {
  userId: string;
  date: string; // YYYY-MM-DD
  totalIntakeKcal: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  exerciseBurnKcal: number;
  netBalanceKcal: number;
  workoutDone: boolean;
  mealCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const DailySummarySchema = new Schema<IDailySummary>(
  {
    userId: { type: String, required: true },
    date: { type: String, required: true },
    totalIntakeKcal: { type: Number, default: 0 },
    totalProtein: { type: Number, default: 0 },
    totalCarbs: { type: Number, default: 0 },
    totalFat: { type: Number, default: 0 },
    exerciseBurnKcal: { type: Number, default: 0 },
    netBalanceKcal: { type: Number, default: 0 },
    workoutDone: { type: Boolean, default: false },
    mealCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

DailySummarySchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailySummaryModel: Model<IDailySummary> =
  mongoose.models.DailySummary ||
  mongoose.model<IDailySummary>('DailySummary', DailySummarySchema);

// Weight Log (Permanent)
export interface IWeightLog extends Document {
  userId: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  note?: string;
  createdAt: Date;
}

const WeightLogSchema = new Schema<IWeightLog>(
  {
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    weightKg: { type: Number, required: true },
    note: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export const WeightLogModel: Model<IWeightLog> =
  mongoose.models.WeightLog ||
  mongoose.model<IWeightLog>('WeightLog', WeightLogSchema);
