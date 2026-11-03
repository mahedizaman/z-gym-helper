import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { announcementService } from '@/server/services/announcement.service';
import { UserModel } from '@/server/models/user.model';
import { connectToDatabase } from '@/server/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const announcements = await announcementService.getActiveAnnouncements();

    let lastSeenAt: Date | null = null;

    if (session?.user?.id) {
      await connectToDatabase();
      const user = await UserModel.findById(session.user.id).select('lastSeenAnnouncementAt').lean();
      if (user?.lastSeenAnnouncementAt) {
        lastSeenAt = new Date(user.lastSeenAnnouncementAt);
      }
    } else {
      const guestLastSeen = request.nextUrl.searchParams.get('lastSeen');
      if (guestLastSeen) {
        lastSeenAt = new Date(guestLastSeen);
      }
    }

    const unreadCount = await announcementService.getUnreadCount(lastSeenAt);

    return NextResponse.json({
      success: true,
      announcements,
      unreadCount,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve announcements' },
      { status: 500 }
    );
  }
}
