import mongoose, { Schema, Document, Model } from 'mongoose';

export type AnnouncementType = 'info' | 'update' | 'warning' | 'celebration' | 'alert' | 'feature';

export interface IAnnouncement extends Document {
  title: string;
  titleEn: string;
  titleBn: string;
  content: string;
  contentEn: string;
  bodyEn: string;
  contentBn: string;
  bodyBn: string;
  type: AnnouncementType;
  authorEmail: string;
  authorId?: mongoose.Types.ObjectId | string;
  isActive: boolean;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true, trim: true },
    titleEn: { type: String, trim: true },
    titleBn: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    contentEn: { type: String, trim: true },
    bodyEn: { type: String, trim: true },
    contentBn: { type: String, required: true, trim: true },
    bodyBn: { type: String, trim: true },
    type: {
      type: String,
      enum: ['info', 'update', 'warning', 'celebration', 'alert', 'feature'],
      default: 'info',
    },
    authorEmail: { type: String, required: true, trim: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true, index: true },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

// Pre-validate hook to ensure all multilingual and legacy field aliases are guaranteed populated
AnnouncementSchema.pre('validate', function () {
  const effectiveTitle = this.title || this.titleEn || this.titleBn || '';
  if (!this.title) this.title = effectiveTitle;
  if (!this.titleEn) this.titleEn = effectiveTitle;
  if (!this.titleBn) this.titleBn = effectiveTitle;

  const effectiveContent = this.content || this.contentEn || this.bodyEn || this.contentBn || this.bodyBn || '';
  if (!this.content) this.content = effectiveContent;
  if (!this.contentEn) this.contentEn = effectiveContent;
  if (!this.bodyEn) this.bodyEn = effectiveContent;
  if (!this.contentBn) this.contentBn = effectiveContent;
  if (!this.bodyBn) this.bodyBn = effectiveContent;
});

export const AnnouncementModel: Model<IAnnouncement> =
  mongoose.models.Announcement ||
  mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
