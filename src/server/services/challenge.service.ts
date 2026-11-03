import crypto from 'crypto';
import { connectToDatabase } from '@/server/db';
import { ChallengeModel, IChallenge } from '@/server/models/social.model';
import { WorkoutLogModel, WeightLogModel } from '@/server/models/log.model';
import { getDhakaDateString } from './calculations';
import { streakService } from './streak.service';

/**
 * Generate an 8-character cryptographically secure, unguessable invite code
 * using 32 unambiguous uppercase alphanumeric characters (32^8 = 1.099 trillion combinations).
 */
export function generateChallengeCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const bytes = crypto.randomBytes(8);
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

export interface PublicChallengeParticipant {
  nickname: string;
  score: number;
  joinedAt: Date;
  isCurrentUser?: boolean;
}

export interface PublicChallengeView {
  code: string;
  title: string;
  durationDays: number;
  metric: 'streak' | 'workouts' | 'weight_loss_pct';
  startDate: string;
  endDate: string;
  participantCount: number;
  maxParticipants: number;
  participants: PublicChallengeParticipant[];
  isActive: boolean;
  isUserParticipant: boolean;
  isUserCreator: boolean;
}

export const challengeService = {
  /**
   * Create a new friend challenge with an unguessable 8-char code.
   * Maximum 10 participants.
   */
  async createChallenge(params: {
    creatorId: string;
    creatorNickname: string;
    title: string;
    durationDays: 7 | 14 | 30;
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
      title: params.title.trim(),
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
   * Get challenge by code, compute live scores based on metric, and return sanitized view.
   */
  async getChallengeByCode(
    code: string,
    currentUserId?: string
  ): Promise<PublicChallengeView | null> {
    const db = await connectToDatabase();
    if (!db) return null;

    const challenge = await ChallengeModel.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
    });

    if (!challenge) return null;

    // Refresh and compute scores for all participants based on metric
    const scoredParticipants: PublicChallengeParticipant[] = await Promise.all(
      challenge.participants.map(async (p) => {
        let score = 0;
        try {
          if (challenge.metric === 'streak') {
            const streakData = await streakService.getUserStreak(p.userId);
            score = streakData.currentStreak;
          } else if (challenge.metric === 'workouts') {
            score = await WorkoutLogModel.countDocuments({
              userId: p.userId,
              date: { $gte: challenge.startDate, $lte: challenge.endDate },
            });
          } else if (challenge.metric === 'weight_loss_pct') {
            // Find start and current weight logs within or near challenge window
            const logs = await WeightLogModel.find({ userId: p.userId })
              .sort({ date: 1 })
              .lean();
            if (logs.length >= 2) {
              const startWeight = logs[0].weightKg;
              const latestWeight = logs[logs.length - 1].weightKg;
              if (startWeight > 0) {
                // Positive percentage for weight loss
                const pct = ((startWeight - latestWeight) / startWeight) * 100;
                score = Math.max(0, Math.round(pct * 10) / 10);
              }
            }
          }
        } catch (e) {
          console.error(`Failed to calculate score for participant ${p.userId}:`, e);
          score = p.score || 0;
        }

        return {
          nickname: p.nickname,
          score,
          joinedAt: p.joinedAt,
          isCurrentUser: currentUserId ? p.userId === currentUserId : false,
        };
      })
    );

    // Sort participants by score descending
    scoredParticipants.sort((a, b) => b.score - a.score);

    return {
      code: challenge.code,
      title: challenge.title,
      durationDays: challenge.durationDays,
      metric: challenge.metric,
      startDate: challenge.startDate,
      endDate: challenge.endDate,
      participantCount: challenge.participants.length,
      maxParticipants: 10,
      participants: scoredParticipants,
      isActive: challenge.isActive,
      isUserParticipant: currentUserId
        ? challenge.participants.some((p) => p.userId === currentUserId)
        : false,
      isUserCreator: currentUserId ? challenge.creatorId === currentUserId : false,
    };
  },

  /**
   * Join an existing challenge (enforcing 10 participant cap).
   */
  async joinChallenge(
    code: string,
    userId: string,
    nickname: string
  ): Promise<{ success: boolean; error?: string }> {
    const db = await connectToDatabase();
    if (!db) return { success: false, error: 'Database unavailable' };

    const challenge = await ChallengeModel.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
    });

    if (!challenge) {
      return { success: false, error: 'Challenge not found or inactive' };
    }

    if (challenge.participants.some((p) => p.userId === userId)) {
      return { success: true };
    }

    if (challenge.participants.length >= 10) {
      return { success: false, error: 'Challenge is full (maximum 10 participants)' };
    }

    challenge.participants.push({
      userId,
      nickname,
      score: 0,
      joinedAt: new Date(),
    });

    await challenge.save();
    return { success: true };
  },

  /**
   * Leave a challenge.
   * If the leaving participant is the creator, passes ownership to the next participant or closes if empty.
   */
  async leaveChallenge(code: string, userId: string): Promise<{ success: boolean; error?: string }> {
    const db = await connectToDatabase();
    if (!db) return { success: false, error: 'Database unavailable' };

    const challenge = await ChallengeModel.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
    });

    if (!challenge) {
      return { success: false, error: 'Challenge not found' };
    }

    const initialCount = challenge.participants.length;
    challenge.participants = challenge.participants.filter((p) => p.userId !== userId);

    if (challenge.participants.length === initialCount) {
      return { success: false, error: 'User is not a participant in this challenge' };
    }

    if (challenge.participants.length === 0) {
      challenge.isActive = false;
    } else if (challenge.creatorId === userId) {
      // Reassign creator to first remaining participant
      challenge.creatorId = challenge.participants[0].userId;
    }

    await challenge.save();
    return { success: true };
  },

  /**
   * Get all active challenges that the given user has joined.
   */
  async getUserChallenges(userId: string): Promise<PublicChallengeView[]> {
    const db = await connectToDatabase();
    if (!db) return [];

    const challenges = await ChallengeModel.find({
      'participants.userId': userId,
      isActive: true,
    }).sort({ createdAt: -1 });

    const results: PublicChallengeView[] = [];
    for (const c of challenges) {
      const view = await this.getChallengeByCode(c.code, userId);
      if (view) results.push(view);
    }
    return results;
  },
};
