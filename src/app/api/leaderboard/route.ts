import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { leaderboardService } from '@/server/services/leaderboard.service';
import { z } from 'zod';

const LeaderboardQuerySchema = z.object({
  metric: z.enum(['streak', 'weight_loss_pct']).default('streak'),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = LeaderboardQuerySchema.safeParse({
    metric: searchParams.get('metric') || 'streak',
    limit: searchParams.get('limit') || 50,
  });

  const validMetric = parsed.success ? parsed.data.metric : 'streak';
  const validLimit = parsed.success ? parsed.data.limit : 50;

  const session = await auth();
  const currentUserId = session?.user?.id;

  try {
    const data = await leaderboardService.getLeaderboard({
      metric: validMetric,
      currentUserId,
      limit: validLimit,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('GET /api/leaderboard error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
