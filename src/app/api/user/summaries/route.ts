import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/server/db';
import { logService } from '@/server/services/log.service';
import { userService } from '@/server/services/user.service';
import { getDhakaDateString, calculateBMR, calculateTDEE, calculateCaloricTarget, calculateMacroSplit } from '@/server/services/calculations';
import { enforceRateLimit } from '@/server/utils/rate-limiter';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: max 60 requests per minute
  const rateLimitError = enforceRateLimit(request, 'user-summaries-get', {
    limit: 60,
    windowMs: 60 * 1000,
    identifier: session.user.id,
  });
  if (rateLimitError) return rateLimitError;

  const { searchParams } = new URL(request.url);
  const rawDays = parseInt(searchParams.get('days') || '30', 10);
  const days = [1, 3, 7, 30].includes(rawDays) ? rawDays : 30;

  const db = await connectToDatabase();
  if (!db) {
    return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
  }

  const userId = session.user.id;
  const todayStr = getDhakaDateString();

  // Compute start date (days - 1 days before today)
  const [y, m, d] = todayStr.split('-').map(Number);
  const cursor = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const startDateObj = new Date(cursor.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
  const startDateStr = startDateObj.toISOString().split('T')[0];

  let summaries = await logService.getPeriodSummaries(userId, startDateStr, todayStr);

  // If no summaries exist, auto-backfill from MealLog and WorkoutLog
  if (summaries.length === 0) {
    await logService.backfillDailySummariesFromLogs(userId);
    summaries = await logService.getPeriodSummaries(userId, startDateStr, todayStr);
  }

  // Fetch weight history
  const weightLogs = await logService.getWeightHistory(userId, 30);

  // Fetch user profile targets
  const user = await userService.getUserById(userId);
  const profile = user?.profile;

  const weightKg = profile?.weightKg || 70;
  const heightCm = profile?.heightCm || 172;
  const age = profile?.age || 26;
  const gender = profile?.gender || 'male';
  const activityLevel = profile?.activityLevel || 'moderate';
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const goal =
    profile?.targetWeightKg && profile.targetWeightKg < weightKg
      ? 'loss'
      : profile?.targetWeightKg && profile.targetWeightKg > weightKg
      ? 'muscle_gain'
      : 'maintain';
  const calorieTarget =
    profile?.calorieTarget && profile.calorieTarget >= 800
      ? profile.calorieTarget
      : calculateCaloricTarget(tdee, goal, gender);
  const macroSplit = calculateMacroSplit(calorieTarget, weightKg, goal);

  return NextResponse.json({
    success: true,
    data: {
      startDate: startDateStr,
      endDate: todayStr,
      periodDays: days,
      summaries,
      weightLogs: weightLogs.map((w) => ({
        date: w.date,
        weightKg: w.weightKg,
      })),
      fallbackTargets: {
        calorieTarget,
        proteinTarget: macroSplit.protein,
        burnTarget: 300,
      },
    },
  });
}
