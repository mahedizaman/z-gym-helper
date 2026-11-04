import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/server/db';
import { UserModel } from '@/server/models/user.model';
import {
  MealLogModel,
  DailySummaryModel,
  WeightLogModel,
} from '@/server/models/log.model';
import { streakService } from '@/server/services/streak.service';
import {
  calculateBMR,
  calculateTDEE,
  calculateCaloricTarget,
  getDhakaDateString,
} from '@/server/services/calculations';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const db = await connectToDatabase();
  if (!db) {
    return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
  }

  const userId = session.user.id;
  const today = getDhakaDateString();

  const user = await UserModel.findById(userId).lean();
  if (!user) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  }

  // Calculate targets from user profile with safe fallback guards
  const rawProfile = (user.profile || {}) as Record<string, unknown>;
  const profile = {
    gender: rawProfile.gender === 'female' ? ('female' as const) : ('male' as const),
    weightKg:
      typeof rawProfile.weightKg === 'number' && rawProfile.weightKg >= 30 && rawProfile.weightKg <= 300
        ? rawProfile.weightKg
        : 70,
    heightCm:
      typeof rawProfile.heightCm === 'number' && rawProfile.heightCm >= 100 && rawProfile.heightCm <= 250
        ? rawProfile.heightCm
        : 172,
    age:
      typeof rawProfile.age === 'number' && rawProfile.age >= 10 && rawProfile.age <= 100
        ? rawProfile.age
        : 26,
    activityLevel:
      typeof rawProfile.activityLevel === 'string' ? rawProfile.activityLevel : 'moderate',
    calorieTarget:
      typeof rawProfile.calorieTarget === 'number' ? rawProfile.calorieTarget : undefined,
  };

  let bmr = 1600;
  let tdee = 2200;
  let targetCalories = 1700;

  try {
    bmr = calculateBMR({
      weightKg: profile.weightKg,
      heightCm: profile.heightCm,
      age: profile.age,
      gender: profile.gender,
    });
    tdee = calculateTDEE(bmr, profile.activityLevel);
    targetCalories =
      profile.calorieTarget ||
      calculateCaloricTarget(tdee, 'maintain', profile.gender);
  } catch {
    // safe fallback
  }

  // Today's summary & meals
  const todaySummary = (await DailySummaryModel.findOne({ userId, date: today }).lean()) || {
    totalIntakeKcal: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    exerciseBurnKcal: 0,
    netBalanceKcal: 0,
    workoutDone: false,
    mealCount: 0,
  };

  const todayMeals = await MealLogModel.find({ userId, date: today }).lean();

  // Past 7 days summaries for chart
  const pastSevenDays: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    pastSevenDays.push(getDhakaDateString(d));
  }

  const recentSummaries = await DailySummaryModel.find({
    userId,
    date: { $in: pastSevenDays },
  }).lean();

  const weeklyChartData = pastSevenDays.map((dateStr) => {
    const found = recentSummaries.find((s) => s.date === dateStr);
    return {
      date: dateStr.slice(5), // MM-DD
      fullDate: dateStr,
      intake: found ? found.totalIntakeKcal : 0,
      burn: found ? found.exerciseBurnKcal : 0,
      target: targetCalories,
    };
  });

  // Weight statistics
  const weights = await WeightLogModel.find({ userId }).sort({ date: 1 }).lean();
  const currentWeight = weights.length > 0 ? weights[weights.length - 1].weightKg : profile.weightKg;
  const startWeight = weights.length > 0 ? weights[0].weightKg : profile.weightKg;
  const totalWeightChange = Number((currentWeight - startWeight).toFixed(1));

  // Streak
  const streak = await streakService.getUserStreak(userId);

  return NextResponse.json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
        profile,
      },
      targets: {
        bmr,
        tdee,
        calories: targetCalories,
        proteinGrams: Math.round(profile.weightKg * 1.8),
        carbsGrams: Math.round((targetCalories * 0.45) / 4),
        fatGrams: Math.round((targetCalories * 0.25) / 9),
      },
      today: {
        date: today,
        summary: todaySummary,
        meals: todayMeals,
      },
      weeklyChartData,
      weightStats: {
        current: currentWeight,
        start: startWeight,
        totalChange: totalWeightChange,
        history: weights.slice(-10),
      },
      streak,
    },
  });
}
