import { NextRequest, NextResponse } from 'next/server';
import { runDatabaseSeed } from '@/server/seeds/seed';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Check authorization in production
    if (process.env.NODE_ENV === 'production') {
      if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
    }

    const result = await runDatabaseSeed();

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Seeding failed';
    console.error('API /api/seed error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
