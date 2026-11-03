import { connectToDatabase } from '@/server/db';
import { UserModel } from '@/server/models/user.model';
import { StreakModel } from '@/server/models/social.model';
import { WeightLogModel } from '@/server/models/log.model';

export interface LeaderboardEntry {
  rank: number;
  nickname: string;
  score: number;
  formattedScore: string;
  isCurrentUser?: boolean;
}

export const leaderboardService = {
  /**
   * Get public opt-in leaderboard entries.
   * STRICT PRIVACY: Returns nickname and relative scores ONLY.
   * Never returns Google names, emails, avatars, user IDs, or raw weights (kg).
   */
  async getLeaderboard(params: {
    metric: 'streak' | 'weight_loss_pct';
    currentUserId?: string;
    limit?: number;
  }): Promise<{
    metric: 'streak' | 'weight_loss_pct';
    totalOptedIn: number;
    entries: LeaderboardEntry[];
    userRank?: LeaderboardEntry | null;
  }> {
    const db = await connectToDatabase();
    if (!db) {
      return { metric: params.metric, totalOptedIn: 0, entries: [], userRank: null };
    }

    const limit = Math.min(params.limit || 50, 100);

    // Only users who explicitly opted in
    const optedInUsers = await UserModel.find(
      { optInLeaderboard: true, disabled: { $ne: true } },
      { _id: 1, nickname: 1 }
    ).lean();

    if (optedInUsers.length === 0) {
      return { metric: params.metric, totalOptedIn: 0, entries: [], userRank: null };
    }

    const userMap = new Map<string, string>();
    for (const u of optedInUsers) {
      userMap.set(String(u._id), u.nickname || 'Athlete');
    }
    const userIds = Array.from(userMap.keys());

    let scoredList: { userId: string; nickname: string; score: number; formattedScore: string }[] = [];

    if (params.metric === 'streak') {
      const streaks = await StreakModel.find({ userId: { $in: userIds } }).lean();
      const streakMap = new Map<string, number>();
      for (const s of streaks) {
        streakMap.set(s.userId, s.currentStreak || 0);
      }

      scoredList = userIds.map((uid) => {
        const score = streakMap.get(uid) || 0;
        return {
          userId: uid,
          nickname: userMap.get(uid) || 'Athlete',
          score,
          formattedScore: `${score} দিন`,
        };
      });

      // Sort by streak desc
      scoredList.sort((a, b) => b.score - a.score);
    } else {
      // Weight loss percentage
      // For each user, get all weight logs to compute percent change
      const weightLogs = await WeightLogModel.find({ userId: { $in: userIds } })
        .sort({ date: 1 })
        .lean();

      const userWeights = new Map<string, { start: number; current: number }>();
      for (const log of weightLogs) {
        const existing = userWeights.get(log.userId);
        if (!existing) {
          userWeights.set(log.userId, { start: log.weightKg, current: log.weightKg });
        } else {
          existing.current = log.weightKg;
        }
      }

      scoredList = userIds.map((uid) => {
        const w = userWeights.get(uid);
        let pct = 0;
        if (w && w.start > 0) {
          // Weight loss percent = ((start - current) / start) * 100
          pct = Math.max(0, ((w.start - w.current) / w.start) * 100);
          pct = Math.round(pct * 10) / 10;
        }

        return {
          userId: uid,
          nickname: userMap.get(uid) || 'Athlete',
          score: pct,
          formattedScore: `${pct}%`,
        };
      });

      // Sort by percent desc
      scoredList.sort((a, b) => b.score - a.score);
    }

    // Assign ranks
    const rankedEntries: LeaderboardEntry[] = scoredList.slice(0, limit).map((item, idx) => ({
      rank: idx + 1,
      nickname: item.nickname,
      score: item.score,
      formattedScore: item.formattedScore,
      isCurrentUser: params.currentUserId ? item.userId === params.currentUserId : false,
    }));

    let userRank: LeaderboardEntry | null = null;
    if (params.currentUserId) {
      const userIndex = scoredList.findIndex((item) => item.userId === params.currentUserId);
      if (userIndex !== -1) {
        userRank = {
          rank: userIndex + 1,
          nickname: scoredList[userIndex].nickname,
          score: scoredList[userIndex].score,
          formattedScore: scoredList[userIndex].formattedScore,
          isCurrentUser: true,
        };
      }
    }

    return {
      metric: params.metric,
      totalOptedIn: optedInUsers.length,
      entries: rankedEntries,
      userRank,
    };
  },

  /**
   * Toggle leaderboard opt-in for a user.
   */
  async setOptIn(userId: string, optIn: boolean): Promise<boolean> {
    const db = await connectToDatabase();
    if (!db) return false;

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { optInLeaderboard: optIn },
      { new: true }
    );
    return !!user;
  },
};
