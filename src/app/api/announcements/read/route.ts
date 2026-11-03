import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { announcementService } from '@/server/services/announcement.service';
import { enforceRateLimit } from '@/server/utils/rate-limiter';

export async function POST(request: NextRequest) {
  const rateLimitError = enforceRateLimit(request, 'announcements-read', {
    limit: 20,
    windowMs: 60 * 1000,
  });
  if (rateLimitError) return rateLimitError;

  const session = await auth();
  if (!session?.user?.id) {
    // For guests, acknowledgment is handled client-side in localStorage
    return NextResponse.json({ success: true, lastSeenAnnouncementAt: new Date() });
  }

  try {
    const lastSeenAnnouncementAt = await announcementService.markAnnouncementsSeen(session.user.id);
    return NextResponse.json({ success: true, lastSeenAnnouncementAt });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to update announcements read status' },
      { status: 500 }
    );
  }
}
