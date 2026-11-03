import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/server/db';
import { logService } from '@/server/services/log.service';
import { MealLogModel, DailySummaryModel } from '@/server/models/log.model';
import { getDhakaDateString } from '@/server/services/calculations';
import { MealLogCreateSchema, MealLogDeleteSchema } from '@/server/validators';
import { enforceRateLimit } from '@/server/utils/rate-limiter';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || getDhakaDateString();

  const db = await connectToDatabase();
  if (!db) {
    return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
  }

  const userId = session.user.id;
  const meals = await MealLogModel.find({ userId, date }).lean();
  const summary = (await DailySummaryModel.findOne({ userId, date }).lean()) || {
    totalIntakeKcal: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    exerciseBurnKcal: 0,
    netBalanceKcal: 0,
    mealCount: 0,
  };

  return NextResponse.json({
    success: true,
    data: {
      date,
      summary,
      meals,
    },
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: max 60 meal logs per minute
  const rateLimitError = enforceRateLimit(request, 'user-meal-post', {
    limit: 60,
    windowMs: 60 * 1000,
    identifier: session.user.id,
  });
  if (rateLimitError) return rateLimitError;

  try {
    const body = await request.json();
    const parsed = MealLogCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: parsed.error.format() },
        { status: 400 }
      );
    }

    // Always enforce server session userId
    const meal = await logService.logMeal({
      ...parsed.data,
      userId: session.user.id,
    });

    return NextResponse.json({ success: true, data: meal });
  } catch (error) {
    console.error('POST /api/user/logs error:', error);
    return NextResponse.json({ success: false, error: 'Failed to log meal' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: max 60 deletions per minute
  const rateLimitError = enforceRateLimit(request, 'user-meal-delete', {
    limit: 60,
    windowMs: 60 * 1000,
    identifier: session.user.id,
  });
  if (rateLimitError) return rateLimitError;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const parsed = MealLogDeleteSchema.safeParse({ id });
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Valid Item ID required' }, { status: 400 });
  }

  const db = await connectToDatabase();
  if (!db) {
    return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const meal = await MealLogModel.findOne({ _id: parsed.data.id, userId: session.user.id });
    if (!meal) {
      return NextResponse.json({ success: false, error: 'Meal item not found' }, { status: 404 });
    }

    // Decrement from daily summary
    await DailySummaryModel.findOneAndUpdate(
      { userId: session.user.id, date: meal.date },
      {
        $inc: {
          totalIntakeKcal: -meal.macros.kcal,
          totalProtein: -meal.macros.protein,
          totalCarbs: -meal.macros.carbs,
          totalFat: -meal.macros.fat,
          mealCount: -1,
        },
      }
    );

    await MealLogModel.deleteOne({ _id: parsed.data.id });

    return NextResponse.json({ success: true, message: 'Meal item deleted' });
  } catch (error) {
    console.error('DELETE /api/user/logs error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete meal' }, { status: 500 });
  }
}
