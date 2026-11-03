import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/server/db';
import { WeightLogModel } from '@/server/models/log.model';
import { UserModel } from '@/server/models/user.model';
import { getDhakaDateString } from '@/server/services/calculations';
import { enforceRateLimit } from '@/server/utils/rate-limiter';
import { WeightLogDeleteSchema } from '@/server/validators';
import { z } from 'zod';

const AddWeightSchema = z.object({
  weightKg: z.number().min(20).max(350),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  note: z.string().max(200).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const db = await connectToDatabase();
  if (!db) {
    return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
  }

  const logs = await WeightLogModel.find({ userId: session.user.id })
    .sort({ date: 1 })
    .lean();

  const startWeight = logs.length > 0 ? logs[0].weightKg : null;
  const currentWeight = logs.length > 0 ? logs[logs.length - 1].weightKg : null;
  const totalChange =
    startWeight !== null && currentWeight !== null
      ? Number((currentWeight - startWeight).toFixed(2))
      : 0;

  // Month change: find log closest to 30 days ago
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

  const monthLogs = logs.filter((l) => l.date >= thirtyDaysAgoStr);
  const monthStartWeight = monthLogs.length > 0 ? monthLogs[0].weightKg : currentWeight;
  const monthChange =
    monthStartWeight !== null && currentWeight !== null
      ? Number((currentWeight - monthStartWeight).toFixed(2))
      : 0;

  return NextResponse.json({
    success: true,
    data: {
      logs,
      startWeight,
      currentWeight,
      monthChange,
      totalChange,
    },
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: max 30 weight logs per minute
  const rateLimitError = enforceRateLimit(request, 'user-weight-post', {
    limit: 30,
    windowMs: 60 * 1000,
    identifier: session.user.id,
  });
  if (rateLimitError) return rateLimitError;

  const db = await connectToDatabase();
  if (!db) {
    return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const parsed = AddWeightSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { weightKg, note } = parsed.data;
    const date = parsed.data.date || getDhakaDateString();

    // Upsert weight for this date
    const log = await WeightLogModel.findOneAndUpdate(
      { userId: session.user.id, date },
      { $set: { weightKg, note, createdAt: new Date() } },
      { upsert: true, new: true }
    );

    // Update user's latest weight in profile
    await UserModel.findByIdAndUpdate(session.user.id, {
      $set: { 'profile.weightKg': weightKg },
    });

    return NextResponse.json({
      success: true,
      data: log,
    });
  } catch (error) {
    console.error('POST /api/user/weight error:', error);
    return NextResponse.json({ success: false, error: 'Failed to record weight' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: max 30 deletions per minute
  const rateLimitError = enforceRateLimit(request, 'user-weight-delete', {
    limit: 30,
    windowMs: 60 * 1000,
    identifier: session.user.id,
  });
  if (rateLimitError) return rateLimitError;

  const db = await connectToDatabase();
  if (!db) {
    return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const parsed = WeightLogDeleteSchema.safeParse({ id });
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Valid Log ID required' }, { status: 400 });
    }

    // Ensure the log belongs strictly to this user
    await WeightLogModel.findOneAndDelete({ _id: parsed.data.id, userId: session.user.id });

    return NextResponse.json({ success: true, message: 'Weight log deleted' });
  } catch (error) {
    console.error('DELETE /api/user/weight error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete weight log' }, { status: 500 });
  }
}
