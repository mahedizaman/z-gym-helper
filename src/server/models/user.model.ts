import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserNotificationPreferences {
  workoutReminderTime?: string; // e.g. "18:00"
  mealReminderTime?: string; // e.g. "13:00"
  notificationsOptOut: boolean;
}

export interface IUserProfile {
  gender: 'male' | 'female';
  weightKg: number;
  heightCm: number;
  age: number;
  targetWeightKg?: number;
  calorieTarget?: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active';
}

export interface IUser extends Document {
  email: string;
  role: 'user' | 'admin';
  nickname: string;
  avatar?: string;
  lastActiveAt: Date;
  timezone: string;
  profile?: IUserProfile;
  disabled?: boolean;
  optInLeaderboard?: boolean;
  shareWeight?: boolean;
  lastSeenAnnouncementAt?: Date;
  notificationPreferences?: IUserNotificationPreferences;
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>(
  {
    gender: { type: String, enum: ['male', 'female'], default: 'male' },
    weightKg: { type: Number, default: 70 },
    heightCm: { type: Number, default: 172 },
    age: { type: Number, default: 25 },
    targetWeightKg: { type: Number },
    calorieTarget: { type: Number },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'very_active', 'extra_active'],
      default: 'moderate',
    },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    nickname: { type: String, required: true, trim: true },
    avatar: { type: String },
    lastActiveAt: { type: Date, default: Date.now },
    timezone: { type: String, default: 'Asia/Dhaka' },
    profile: { type: UserProfileSchema },
    disabled: { type: Boolean, default: false },
    optInLeaderboard: { type: Boolean, default: false },
    shareWeight: { type: Boolean, default: false },
    lastSeenAnnouncementAt: { type: Date },
    notificationPreferences: {
      workoutReminderTime: { type: String, default: '18:00' },
      mealReminderTime: { type: String, default: '13:00' },
      notificationsOptOut: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
