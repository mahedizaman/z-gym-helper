import { NextRequest, NextResponse } from 'next/server';
import { requireServerAdmin } from '@/server/utils/admin-guard';
import { adminService } from '@/server/services/admin.service';
import { enforceRateLimit, getClientIp } from '@/server/utils/rate-limiter';
import { z } from 'zod';

export const ExerciseSchema = z.object({
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  nameBn: z.string().min(2).max(100),
  nameEn: z.string().min(2).max(100),
  muscle: z.enum(['chest', 'back', 'shoulders', 'arms', 'legs', 'core']),
  secondaryMuscles: z.array(z.string()).default([]),
  equipment: z.enum(['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight']),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  instructionsBn: z.array(z.string()).default([]),
  instructionsEn: z.array(z.string()).default([]),
  commonMistakesBn: z.array(z.string()).default([]),
  tipsBn: z.string().default(''),
  tipsEn: z.string().default(''),
  youtubeId: z
    .string()
    .regex(/^([a-zA-Z0-9_-]{11})?$/, 'YouTube ID must be an 11-character code or blank')
    .optional(),
  images: z.array(z.string()).default([]),
  reviewed: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  const rateLimitError = enforceRateLimit(request, 'admin-exercise-create', {
    limit: 30,
    windowMs: 60 * 1000,
  });
  if (rateLimitError) return rateLimitError;

  const authCheck = await requireServerAdmin();
  if (!authCheck.authorized) {
    return authCheck.response;
  }

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
    const exercise = await adminService.saveExercise(authCheck.user, parsed.data, undefined, ip);

    return NextResponse.json({ success: true, data: exercise }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to save exercise' },
      { status: 400 }
    );
  }
}
