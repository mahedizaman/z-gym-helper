import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPlanExerciseItem {
  exerciseSlug: string;
  nameBn: string;
  nameEn: string;
  sets: number;
  reps: string;
  restSeconds: number;
}

export interface IPlanDaySchedule {
  dayIndex: number;
  dayNameBn: string;
  dayNameEn: string;
  focusBn: string;
  focusEn: string;
  exercises: IPlanExerciseItem[];
}

export interface IPlan extends Document {
  slug: string;
  nameBn: string;
  nameEn: string;
  daysPerWeek: number;
  splitType: 'full_body' | 'upper_lower' | 'ppl' | 'hybrid';
  level: 'beginner' | 'intermediate' | 'advanced';
  descriptionBn: string;
  descriptionEn: string;
  schedule: IPlanDaySchedule[];
  createdAt: Date;
  updatedAt: Date;
}

const PlanExerciseItemSchema = new Schema<IPlanExerciseItem>(
  {
    exerciseSlug: { type: String, required: true },
    nameBn: { type: String, required: true },
    nameEn: { type: String, required: true },
    sets: { type: Number, required: true },
    reps: { type: String, required: true },
    restSeconds: { type: Number, default: 90 },
  },
  { _id: false }
);

const PlanDayScheduleSchema = new Schema<IPlanDaySchedule>(
  {
    dayIndex: { type: Number, required: true },
    dayNameBn: { type: String, required: true },
    dayNameEn: { type: String, required: true },
    focusBn: { type: String, required: true },
    focusEn: { type: String, required: true },
    exercises: [PlanExerciseItemSchema],
  },
  { _id: false }
);

const PlanSchema = new Schema<IPlan>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    nameBn: { type: String, required: true },
    nameEn: { type: String, required: true },
    daysPerWeek: { type: Number, required: true, min: 3, max: 6, index: true },
    splitType: {
      type: String,
      required: true,
      enum: ['full_body', 'upper_lower', 'ppl', 'hybrid'],
    },
    level: {
      type: String,
      required: true,
      enum: ['beginner', 'intermediate', 'advanced'],
    },
    descriptionBn: { type: String, required: true },
    descriptionEn: { type: String, required: true },
    schedule: [PlanDayScheduleSchema],
  },
  { timestamps: true }
);

export const PlanModel: Model<IPlan> =
  mongoose.models.Plan || mongoose.model<IPlan>('Plan', PlanSchema);
