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

// Announcement Collection
export interface IAnnouncement extends Document {
  titleBn: string;
  titleEn: string;
  bodyBn: string;
  bodyEn: string;
  type: 'info' | 'alert' | 'feature';
  authorEmail: string;
  createdAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    titleBn: { type: String, required: true },
    titleEn: { type: String, required: true },
    bodyBn: { type: String, required: true },
    bodyEn: { type: String, required: true },
    type: {
      type: String,
      enum: ['info', 'alert', 'feature'],
      default: 'info',
    },
    authorEmail: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AnnouncementModel: Model<IAnnouncement> =
  mongoose.models.Announcement ||
  mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);

// Push Token Collection
export interface IPushToken extends Document {
  userId: string;
  token: string;
  topics: string[];
  createdAt: Date;
  lastSeenAt: Date;
}

const PushTokenSchema = new Schema<IPushToken>(
  {
    userId: { type: String, required: true, index: true },
    token: { type: String, required: true, unique: true },
    topics: [{ type: String }],
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const PushTokenModel: Model<IPushToken> =
  mongoose.models.PushToken ||
  mongoose.model<IPushToken>('PushToken', PushTokenSchema);
