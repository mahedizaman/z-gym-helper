import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { notificationService } from '@/server/services/notification.service';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization') || '';
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { success: false, error: 'CRON_SECRET is not configured on this server' },
      { status: 500 }
    );
  }

  const expectedHeader = `Bearer ${cronSecret}`;
  const authBuffer = Buffer.from(authHeader, 'utf8');
  const expectedBuffer = Buffer.from(expectedHeader, 'utf8');

  // Constant-time comparison to prevent timing attacks
  if (
    authBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(authBuffer, expectedBuffer)
  ) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Invalid cron authentication token' },
      { status: 401 }
    );
  }

  try {
    const result = await notificationService.processScheduledReminders();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown cron processing error',
      },
      { status: 500 }
    );
  }
}
