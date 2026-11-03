import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { userService } from '@/server/services/user.service';
import { z } from 'zod';

const UpdateProfileSchema = z.object({
  nickname: z.string().min(2).max(50).optional(),
  gender: z.enum(['male', 'female']).optional(),
  age: z.number().int().min(12).max(100).optional(),
  heightCm: z.number().min(100).max(250).optional(),
  weightKg: z.number().min(25).max(350).optional(),
  targetWeightKg: z.number().min(25).max(350).optional().nullable(),
  calorieTarget: z.number().int().min(1000).max(8000).optional().nullable(),
  activityLevel: z
    .enum(['sedentary', 'light', 'moderate', 'very_active', 'extra_active'])
    .optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const user = await userService.getUserById(session.user.id);
  if (!user) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      id: user._id,
      email: user.email,
      role: user.role,
      nickname: user.nickname,
      avatar: user.avatar,
      timezone: user.timezone,
      profile: user.profile,
      createdAt: user.createdAt,
    },
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = UpdateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { nickname, ...profileFields } = parsed.data;
    const cleanProfile = {
      ...profileFields,
      targetWeightKg: profileFields.targetWeightKg ?? undefined,
      calorieTarget: profileFields.calorieTarget ?? undefined,
    };
    const updatedUser = await userService.updateProfile(session.user.id, {
      nickname,
      profile: cleanProfile,
    });

    if (!updatedUser) {
      return NextResponse.json({ success: false, error: 'User update failed' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error('PATCH /api/user error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
