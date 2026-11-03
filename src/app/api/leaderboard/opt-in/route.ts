import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { leaderboardService } from '@/server/services/leaderboard.service';
import { LeaderboardOptInSchema } from '@/server/validators';
import { enforceRateLimit } from '@/server/utils/rate-limiter';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: max 20 toggles per 10 minutes
  const rateLimitError = enforceRateLimit(request, 'leaderboard-optin', {
    limit: 20,
    windowMs: 10 * 60 * 1000,
    identifier: session.user.id,
  });
  if (rateLimitError) return rateLimitError;

  try {
    const body = await request.json();
    const parsed = LeaderboardOptInSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const success = await leaderboardService.setOptIn(session.user.id, parsed.data.optIn);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Failed to update opt-in setting' }, { status: 500 });
    }

    return NextResponse.json({ success: true, optIn: parsed.data.optIn });
  } catch (error) {
    console.error('POST /api/leaderboard/opt-in error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
