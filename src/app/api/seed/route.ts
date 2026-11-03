import { NextRequest, NextResponse } from 'next/server';
import { runDatabaseSeed } from '@/server/seeds/seed';

export async function POST(request: NextRequest) {
  // Seeding via HTTP API is permanently disabled in production to prevent accidental data wipes
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      {
        success: false,
        error: 'Database seeding via HTTP API is permanently disabled in production. Seeding should happen only via CLI: npm run db:seed',
      },
      { status: 403 }
    );
  }

  // In non-production environments, require both explicit opt-in and admin secret
  const enableDevApi = process.env.ENABLE_DEV_SEED_API === 'true';
  const seedSecret = process.env.ADMIN_SEED_SECRET;
  const authHeader = request.headers.get('authorization');

  if (!enableDevApi || !seedSecret || authHeader !== `Bearer ${seedSecret}`) {
    return NextResponse.json(
      {
        success: false,
        error: 'Database seeding via HTTP API is restricted. Seeding should happen only via CLI: npm run db:seed',
      },
      { status: 403 }
    );
  }

  try {
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
