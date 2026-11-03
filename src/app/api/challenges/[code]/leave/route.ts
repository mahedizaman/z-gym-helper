import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { challengeService } from '@/server/services/challenge.service';
import { ChallengeJoinInputSchema } from '@/server/validators';
import { enforceRateLimit } from '@/server/utils/rate-limiter';

export async function POST(
  request: Request,
  props: { params: Promise<{ code: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: max 20 leave attempts per 10 minutes
  const rateLimitError = enforceRateLimit(request, 'leave-challenge', {
    limit: 20,
    windowMs: 10 * 60 * 1000,
    identifier: session.user.id,
  });
  if (rateLimitError) return rateLimitError;

  const { code } = await props.params;
  const parsed = ChallengeJoinInputSchema.safeParse({ code });
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid challenge code', details: parsed.error.format() },
      { status: 400 }
    );
  }

  try {
    const result = await challengeService.leaveChallenge(parsed.data.code, session.user.id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to leave challenge' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: 'Successfully left challenge' });
  } catch (error) {
    console.error('POST /api/challenges/[code]/leave error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
