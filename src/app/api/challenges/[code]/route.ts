import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { challengeService } from '@/server/services/challenge.service';

export async function GET(
  request: Request,
  props: { params: Promise<{ code: string }> }
) {
  const { code } = await props.params;
  if (!code) {
    return NextResponse.json({ success: false, error: 'Challenge code required' }, { status: 400 });
  }

  const session = await auth();
  const currentUserId = session?.user?.id;

  try {
    const challenge = await challengeService.getChallengeByCode(code, currentUserId);
    if (!challenge) {
      return NextResponse.json({ success: false, error: 'Challenge not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: challenge });
  } catch (error) {
    console.error('GET /api/challenges/[code] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch challenge' }, { status: 500 });
  }
}
