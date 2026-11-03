import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { notificationService } from '@/server/services/notification.service';
import { enforceRateLimit } from '@/server/utils/rate-limiter';
import { z } from 'zod';

const PushTokenSchema = z.object({
  token: z.string().min(10).max(500),
  userAgent: z.string().max(300).optional(),
});

export async function POST(request: NextRequest) {
  const rateLimitError = enforceRateLimit(request, 'user-push-token-post', {
    limit: 10,
    windowMs: 60 * 1000,
  });
  if (rateLimitError) return rateLimitError;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = PushTokenSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid push token data', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    await notificationService.registerToken(
      session.user.id,
      parsed.data.token,
      parsed.data.userAgent
    );

    return NextResponse.json({ success: true, message: 'Push token registered successfully' });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error while saving push token' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const rateLimitError = enforceRateLimit(request, 'user-push-token-delete', {
    limit: 10,
    windowMs: 60 * 1000,
  });
  if (rateLimitError) return rateLimitError;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = PushTokenSchema.pick({ token: true }).safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid token parameter' },
        { status: 400 }
      );
    }

    await notificationService.unregisterToken(parsed.data.token);
    return NextResponse.json({ success: true, message: 'Push token unregistered' });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error while removing push token' },
      { status: 500 }
    );
  }
}
