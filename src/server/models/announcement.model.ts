import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  titleBn: string;
  content: string;
  contentBn: string;
  type: 'info' | 'update' | 'warning' | 'celebration';
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true, trim: true },
    titleBn: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    contentBn: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['info', 'update', 'warning', 'celebration'],
      default: 'info',
    },
    isActive: { type: Boolean, default: true, index: true },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

export const AnnouncementModel: Model<IAnnouncement> =
  mongoose.models.Announcement ||
  mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
