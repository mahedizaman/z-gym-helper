import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { userService } from '@/server/services/user.service';
import { enforceRateLimit } from '@/server/utils/rate-limiter';
import { DeleteAccountSchema } from '@/server/validators';

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: max 5 deletion attempts per 10 minutes
  const rateLimitError = enforceRateLimit(request, 'user-delete-account', {
    limit: 5,
    windowMs: 10 * 60 * 1000,
    identifier: session.user.id,
  });
  if (rateLimitError) return rateLimitError;

  try {
    let confirmText = 'DELETE';
    try {
      const body = await request.json();
      const parsed = DeleteAccountSchema.safeParse(body);
      if (parsed.success) {
        confirmText = parsed.data.confirmText;
      }
    } catch {
      // Body may be empty in some HTTP clients; require explicit confirmation
    }

    if (confirmText !== 'DELETE') {
      return NextResponse.json({ success: false, error: 'Invalid confirmation text' }, { status: 400 });
    }

    const success = await userService.deleteUserAccount(session.user.id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Failed to delete account' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Account and all associated fitness records permanently removed',
    });
  } catch (error) {
    console.error('DELETE /api/user/delete-account error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
