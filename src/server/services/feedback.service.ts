import { connectToDatabase } from '@/server/db';
import { FeedbackModel, IFeedback } from '@/server/models/feedback.model';

export interface CreateFeedbackInput {
  message: string;
  contact?: string;
  userId?: string;
}

export const feedbackService = {
  async createFeedback(input: CreateFeedbackInput): Promise<IFeedback | null> {
    const db = await connectToDatabase();
    if (!db) return null;

    const feedback = await FeedbackModel.create({
      message: input.message.trim(),
      contact: input.contact?.trim() || '',
      userId: input.userId || undefined,
      createdAt: new Date(),
    });

    return feedback;
  },

  async listFeedbacks(limit = 100): Promise<IFeedback[]> {
    const db = await connectToDatabase();
    if (!db) return [];

    const feedbacks = await FeedbackModel.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'email nickname role')
      .lean();

    return feedbacks as unknown as IFeedback[];
  },
};
