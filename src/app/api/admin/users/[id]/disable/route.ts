import { NextRequest, NextResponse } from 'next/server';
import { requireServerAdmin } from '@/server/utils/admin-guard';
import { adminService } from '@/server/services/admin.service';
import { enforceRateLimit, getClientIp } from '@/server/utils/rate-limiter';
import { z } from 'zod';

const DisableSchema = z.object({
  disabled: z.boolean(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitError = enforceRateLimit(request, 'admin-user-disable', {
    limit: 20,
    windowMs: 60 * 1000,
  });
  if (rateLimitError) return rateLimitError;

  const authCheck = await requireServerAdmin();
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  const { id: targetUserId } = await params;

  try {
    const body = await request.json();
    const parsed = DisableSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const ip = getClientIp(request);
    await adminService.toggleUserDisabled(
      authCheck.user,
      targetUserId,
      parsed.data.disabled,
      ip
    );

    return NextResponse.json({
      success: true,
      message: parsed.data.disabled
        ? 'User account disabled successfully'
        : 'User account enabled successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Action failed' },
      { status: 400 }
    );
  }
}
