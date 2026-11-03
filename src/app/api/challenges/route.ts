import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { challengeService } from '@/server/services/challenge.service';
import { ChallengeCreateInputSchema } from '@/server/validators';
import { enforceRateLimit } from '@/server/utils/rate-limiter';
import { UserModel } from '@/server/models/user.model';
import { connectToDatabase } from '@/server/db';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const challenges = await challengeService.getUserChallenges(session.user.id);
    return NextResponse.json({ success: true, data: challenges });
  } catch (error) {
    console.error('GET /api/challenges error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch challenges' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: max 10 challenge creations per hour
  const rateLimitError = enforceRateLimit(request, 'create-challenge', {
    limit: 10,
    windowMs: 60 * 60 * 1000,
    identifier: session.user.id,
  });
  if (rateLimitError) return rateLimitError;

  try {
    const body = await request.json();
    const parsed = ChallengeCreateInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid challenge details', details: parsed.error.format() },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const user = await UserModel.findById(session.user.id);
    const nickname = user?.nickname || 'Athlete';

    const challenge = await challengeService.createChallenge({
      creatorId: session.user.id,
      creatorNickname: nickname,
      title: parsed.data.title,
      durationDays: parsed.data.durationDays,
      metric: parsed.data.metric,
    });

    if (!challenge) {
      return NextResponse.json({ success: false, error: 'Failed to create challenge' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        code: challenge.code,
        title: challenge.title,
        durationDays: challenge.durationDays,
        metric: challenge.metric,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
      },
    });
  } catch (error) {
    console.error('POST /api/challenges error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
