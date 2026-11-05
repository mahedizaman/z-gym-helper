import mongoose, { Schema, Document, Model } from 'mongoose';

// Streak Collection
export interface IStreak extends Document {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveDhakaDate: string; // YYYY-MM-DD
  activeDates: string[]; // List of YYYY-MM-DD
  updatedAt: Date;
}

const StreakSchema = new Schema<IStreak>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDhakaDate: { type: String, default: '' },
    activeDates: [{ type: String }],
  },
  { timestamps: true }
);

export const StreakModel: Model<IStreak> =
  mongoose.models.Streak || mongoose.model<IStreak>('Streak', StreakSchema);

// Challenge Collection
export interface IChallengeParticipant {
  userId: string;
  nickname: string;
  score: number;
  joinedAt: Date;
}

export interface IChallenge extends Document {
  code: string;
  creatorId: string;
  title: string;
  durationDays: number;
  metric: 'streak' | 'workouts' | 'weight_loss_pct';
  startDate: string;
  endDate: string;
  participants: IChallengeParticipant[];
  isActive: boolean;
  createdAt: Date;
}

const ChallengeParticipantSchema = new Schema<IChallengeParticipant>(
  {
    userId: { type: String, required: true },
    nickname: { type: String, required: true },
    score: { type: Number, default: 0 },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ChallengeSchema = new Schema<IChallenge>(
  {
    code: { type: String, required: true, unique: true, index: true },
    creatorId: { type: String, required: true },
    title: { type: String, required: true },
    durationDays: { type: Number, enum: [7, 14, 30], default: 14 },
    metric: {
      type: String,
      enum: ['streak', 'workouts', 'weight_loss_pct'],
      default: 'streak',
    },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    participants: [ChallengeParticipantSchema],
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const ChallengeModel: Model<IChallenge> =
  mongoose.models.Challenge ||
  mongoose.model<IChallenge>('Challenge', ChallengeSchema);

// Re-export Announcement & PushToken models from their canonical files
export { AnnouncementModel, type IAnnouncement } from './announcement.model';
export { PushTokenModel, type IPushToken } from './push-token.model';
