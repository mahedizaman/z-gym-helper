import mongoose, { Schema, Document, Model } from 'mongoose';

export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core';
export type EquipmentType = 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight';
export type ExerciseLevel = 'beginner' | 'intermediate' | 'advanced';

export interface IExercise extends Document {
  slug: string;
  nameBn: string;
  nameEn: string;
  muscle: MuscleGroup;
  secondaryMuscles: string[];
  equipment: EquipmentType;
  level: ExerciseLevel;
  instructionsBn: string[];
  instructionsEn: string[];
  commonMistakesBn: string[];
  tipsBn: string;
  tipsEn: string;
  youtubeId: string;
  images?: string[];
  reviewed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseSchema = new Schema<IExercise>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    nameBn: { type: String, required: true, trim: true },
    nameEn: { type: String, required: true, trim: true },
    muscle: {
      type: String,
      required: true,
      enum: ['chest', 'back', 'shoulders', 'arms', 'legs', 'core'],
      index: true,
    },
    secondaryMuscles: [{ type: String }],
    equipment: {
      type: String,
      required: true,
      enum: ['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight'],
      index: true,
    },
    level: {
      type: String,
      required: true,
      enum: ['beginner', 'intermediate', 'advanced'],
      index: true,
    },
    instructionsBn: [{ type: String }],
    instructionsEn: [{ type: String }],
    commonMistakesBn: [{ type: String }],
    tipsBn: { type: String, default: '' },
    tipsEn: { type: String, default: '' },
    youtubeId: { type: String, required: true },
    images: [{ type: String }],
    reviewed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ExerciseModel: Model<IExercise> =
  mongoose.models.Exercise || mongoose.model<IExercise>('Exercise', ExerciseSchema);
