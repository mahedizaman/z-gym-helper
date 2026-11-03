import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { userService } from '@/server/services/user.service';

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
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
