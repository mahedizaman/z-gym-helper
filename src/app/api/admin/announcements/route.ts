import { NextRequest, NextResponse } from 'next/server';
import { requireServerAdmin } from '@/server/utils/admin-guard';
import { announcementService } from '@/server/services/announcement.service';
import { adminService } from '@/server/services/admin.service';
import { AnnouncementModel } from '@/server/models/announcement.model';
import { CreateAnnouncementInputSchema } from '@/server/schemas/announcement.schema';
import { connectToDatabase } from '@/server/db';
import { enforceRateLimit, getClientIp } from '@/server/utils/rate-limiter';

export async function GET() {
  const authCheck = await requireServerAdmin();
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    await connectToDatabase();
    const announcements = await AnnouncementModel.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: announcements });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const rateLimitError = enforceRateLimit(request, 'admin-announcement-post', {
    limit: 10,
    windowMs: 60 * 1000,
  });
  if (rateLimitError) return rateLimitError;

  const authCheck = await requireServerAdmin();
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const body = await request.json();
    const parsed = CreateAnnouncementInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: parsed.error.issues[0]?.message || 'Invalid announcement data',
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const effectiveTitle = parsed.data.title || parsed.data.titleBn;
    const effectiveTitleBn = parsed.data.titleBn || parsed.data.title;
    const effectiveContent = parsed.data.content || parsed.data.contentBn;
    const effectiveContentBn = parsed.data.contentBn || parsed.data.content;

    // authorEmail and authorId come strictly from the server admin session
    const { announcement, pushSent } = await announcementService.createAnnouncement({
      title: effectiveTitle,
      titleBn: effectiveTitleBn,
      content: effectiveContent,
      contentBn: effectiveContentBn,
      type: parsed.data.type,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      authorEmail: authCheck.user.email,
      authorId: authCheck.user.id,
    });

    const ip = getClientIp(request);
    await adminService.logAudit(
      authCheck.user.id,
      authCheck.user.email,
      'ANNOUNCEMENT_CREATE',
      {
        title: announcement.title,
        titleBn: announcement.titleBn,
        type: announcement.type,
        pushSent,
      },
      announcement._id.toString(),
      ip
    );

    return NextResponse.json({
      success: true,
      data: announcement,
      pushSent,
      message: pushSent
        ? 'Announcement broadcasted successfully'
        : 'Announcement saved successfully (push notification skipped)',
    });
  } catch (error) {
    console.error('[Admin Announcement Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create announcement',
      },
      { status: 500 }
    );
  }
}
