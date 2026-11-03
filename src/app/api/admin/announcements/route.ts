import { NextRequest, NextResponse } from 'next/server';
import { requireServerAdmin } from '@/server/utils/admin-guard';
import { announcementService } from '@/server/services/announcement.service';
import { adminService } from '@/server/services/admin.service';
import { AnnouncementModel } from '@/server/models/announcement.model';
import { connectToDatabase } from '@/server/db';
import { enforceRateLimit, getClientIp } from '@/server/utils/rate-limiter';
import { z } from 'zod';

const CreateAnnouncementSchema = z.object({
  title: z.string().min(3).max(100),
  titleBn: z.string().min(3).max(100),
  content: z.string().min(5).max(500),
  contentBn: z.string().min(5).max(500),
  type: z.enum(['info', 'update', 'warning', 'celebration']).default('info'),
});

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
    const parsed = CreateAnnouncementSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const created = await announcementService.createAnnouncement(parsed.data);

    const ip = getClientIp(request);
    await adminService.logAudit(
      authCheck.user.id,
      authCheck.user.email,
      'ANNOUNCEMENT_CREATE',
      { title: created.title, titleBn: created.titleBn, type: created.type },
      created._id.toString(),
      ip
    );

    return NextResponse.json({ success: true, data: created });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create announcement' },
      { status: 500 }
    );
  }
}
