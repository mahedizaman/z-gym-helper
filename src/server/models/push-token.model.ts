import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPushToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PushTokenSchema = new Schema<IPushToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    token: { type: String, required: true, unique: true, trim: true },
    userAgent: { type: String, trim: true },
  },
  { timestamps: true }
);

export const PushTokenModel: Model<IPushToken> =
  mongoose.models.PushToken || mongoose.model<IPushToken>('PushToken', PushTokenSchema);
