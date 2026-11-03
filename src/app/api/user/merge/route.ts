import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { userService, GuestDataMergePayload } from '@/server/services/user.service';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload: GuestDataMergePayload = await request.json();

    const result = await userService.mergeGuestData(session.user.id, payload);

    return NextResponse.json({
      success: true,
      message: 'Guest data merged successfully without duplicates',
      result,
    });
  } catch (error) {
    console.error('POST /api/user/merge error:', error);
    return NextResponse.json({ success: false, error: 'Failed to merge guest data' }, { status: 500 });
  }
}
