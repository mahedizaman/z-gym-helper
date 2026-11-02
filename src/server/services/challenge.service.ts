import { connectToDatabase } from '@/server/db';
import { ChallengeModel, IChallenge } from '@/server/models/social.model';
import { getDhakaDateString } from './calculations';

function generateChallengeCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const challengeService = {
  /**
   * Create a new friend challenge
   */
  async createChallenge(params: {
    creatorId: string;
    creatorNickname: string;
    title: string;
    durationDays: number;
    metric: 'streak' | 'workouts' | 'weight_loss_pct';
  }): Promise<IChallenge | null> {
    const db = await connectToDatabase();
    if (!db) return null;

    const startDate = getDhakaDateString();
    const end = new Date(Date.now() + params.durationDays * 24 * 60 * 60 * 1000);
    const endDate = getDhakaDateString(end);
    const code = generateChallengeCode();

    return await ChallengeModel.create({
      code,
      creatorId: params.creatorId,
      title: params.title,
      durationDays: params.durationDays,
      metric: params.metric,
      startDate,
      endDate,
      participants: [
        {
          userId: params.creatorId,
          nickname: params.creatorNickname,
          score: 0,
          joinedAt: new Date(),
        },
      ],
      isActive: true,
    });
  },

  /**
   * Get challenge by invite code
   */
  async getChallengeByCode(code: string): Promise<IChallenge | null> {
    const db = await connectToDatabase();
    if (!db) return null;

    return await ChallengeModel.findOne({
      code: code.toUpperCase(),
      isActive: true,
    }).lean();
  },

  /**
   * Join an existing challenge (Max 10 participants)
   */
  async joinChallenge(code: string, userId: string, nickname: string) {
    const db = await connectToDatabase();
    if (!db) return { success: false, error: 'Database unavailable' };

    const challenge = await ChallengeModel.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!challenge) {
      return { success: false, error: 'Challenge not found or inactive' };
    }

    if (challenge.participants.some((p) => p.userId === userId)) {
      return { success: true, challenge, alreadyJoined: true };
    }

    if (challenge.participants.length >= 10) {
      return { success: false, error: 'Challenge has reached maximum 10 participants' };
    }

    challenge.participants.push({
      userId,
      nickname,
      score: 0,
      joinedAt: new Date(),
    });

    await challenge.save();
    return { success: true, challenge };
  },
};
