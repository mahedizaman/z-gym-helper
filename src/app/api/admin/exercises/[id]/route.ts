import { NextRequest, NextResponse } from 'next/server';
import { requireServerAdmin } from '@/server/utils/admin-guard';
import { adminService } from '@/server/services/admin.service';
import { enforceRateLimit, getClientIp } from '@/server/utils/rate-limiter';
import { ExerciseSchema } from '../route';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitError = enforceRateLimit(request, 'admin-exercise-update', {
    limit: 30,
    windowMs: 60 * 1000,
  });
  if (rateLimitError) return rateLimitError;

  const authCheck = await requireServerAdmin();
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  const { id: exerciseId } = await params;

  try {
    const body = await request.json();
    const parsed = ExerciseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const ip = getClientIp(request);
    const exercise = await adminService.saveExercise(authCheck.user, parsed.data, exerciseId, ip);

    return NextResponse.json({ success: true, data: exercise });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update exercise' },
      { status: 400 }
    );
  }
}
