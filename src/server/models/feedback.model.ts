import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFeedback extends Document {
  message: string;
  contact?: string;
  userId?: mongoose.Types.ObjectId | string;
  createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    message: {
      type: String,
      required: true,
      maxlength: 500,
      trim: true,
    },
    contact: {
      type: String,
      maxlength: 100,
      trim: true,
      default: '',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

export const FeedbackModel: Model<IFeedback> =
  mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema);
