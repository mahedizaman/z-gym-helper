import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { notificationService } from '@/server/services/notification.service';
import { enforceRateLimit } from '@/server/utils/rate-limiter';
import { z } from 'zod';

const PreferencesSchema = z.object({
  workoutReminderTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):00$/, 'Time must be in HH:00 format')
    .optional(),
  mealReminderTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):00$/, 'Time must be in HH:00 format')
    .optional(),
  notificationsOptOut: z.boolean().optional(),
});

export async function PATCH(request: NextRequest) {
  const rateLimitError = enforceRateLimit(request, 'notification-preferences-patch', {
    limit: 15,
    windowMs: 60 * 1000,
  });
  if (rateLimitError) return rateLimitError;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = PreferencesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid preferences payload', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const updated = await notificationService.updatePreferences(session.user.id, parsed.data);
    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to update notification preferences' },
      { status: 500 }
    );
  }
}
