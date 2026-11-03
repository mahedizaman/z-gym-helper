import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { userService } from '@/server/services/user.service';
import { enforceRateLimit } from '@/server/utils/rate-limiter';
import { z } from 'zod';

const GuestDataMergeSchema = z.object({
  profile: z
    .object({
      gender: z.enum(['male', 'female']).optional(),
      age: z.number().min(10).max(100).optional(),
      heightCm: z.number().min(100).max(250).optional(),
      weightKg: z.number().min(25).max(350).optional(),
      activityLevel: z
        .enum(['sedentary', 'light', 'moderate', 'very_active', 'extra_active'])
        .optional(),
      goal: z.string().max(50).optional(),
      customCalorieTarget: z.number().min(800).max(10000).optional(),
    })
    .optional(),
  meals: z
    .array(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        slots: z.object({
          breakfast: z.array(z.any()).default([]),
          lunch: z.array(z.any()).default([]),
          snack: z.array(z.any()).default([]),
          dinner: z.array(z.any()).default([]),
        }),
      })
    )
    .optional(),
  weights: z
    .array(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        weightKg: z.number().min(25).max(350),
        note: z.string().max(200).optional(),
      })
    )
    .optional(),
  activePlanSlug: z.string().max(50).optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: max 10 sync attempts per 10 minutes
  const rateLimitError = enforceRateLimit(request, 'user-merge', {
    limit: 10,
    windowMs: 10 * 60 * 1000,
    identifier: session.user.id,
  });
  if (rateLimitError) return rateLimitError;

  try {
    const rawBody = await request.json();
    const parsed = GuestDataMergeSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid merge payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const result = await userService.mergeGuestData(session.user.id, parsed.data);

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
