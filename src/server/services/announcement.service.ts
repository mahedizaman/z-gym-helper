import { AnnouncementModel, IAnnouncement, AnnouncementType } from '../models/announcement.model';
import { UserModel } from '../models/user.model';
import { fcmService } from './fcm.service';
import { connectToDatabase } from '../db';

export interface CreateAnnouncementInput {
  title?: string;
  titleBn?: string;
  titleEn?: string;
  content?: string;
  contentBn?: string;
  contentEn?: string;
  bodyEn?: string;
  bodyBn?: string;
  type?: AnnouncementType;
  expiresAt?: Date | null;
  authorEmail: string;
  authorId?: string;
}

export interface CreateAnnouncementResult {
  announcement: IAnnouncement;
  pushSent: boolean;
}

export const announcementService = {
  async getActiveAnnouncements(): Promise<IAnnouncement[]> {
    await connectToDatabase();
    const now = new Date();
    return AnnouncementModel.find({
      isActive: true,
      $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: now } }],
    })
      .sort({ createdAt: -1 })
      .lean();
  },

  async createAnnouncement(data: CreateAnnouncementInput): Promise<CreateAnnouncementResult> {
    await connectToDatabase();

    const effectiveTitle = data.title?.trim() || data.titleEn?.trim() || data.titleBn?.trim() || '';
    const effectiveTitleBn = data.titleBn?.trim() || effectiveTitle;
    const effectiveContent =
      data.content?.trim() ||
      data.contentEn?.trim() ||
      data.bodyEn?.trim() ||
      data.contentBn?.trim() ||
      data.bodyBn?.trim() ||
      '';
    const effectiveContentBn = data.contentBn?.trim() || effectiveContent;

    const announcement = await AnnouncementModel.create({
      title: effectiveTitle,
      titleEn: effectiveTitle,
      titleBn: effectiveTitleBn,
      content: effectiveContent,
      contentEn: effectiveContent,
      bodyEn: effectiveContent,
      contentBn: effectiveContentBn,
      bodyBn: effectiveContentBn,
      type: data.type || 'info',
      expiresAt: data.expiresAt || null,
      authorEmail: data.authorEmail,
      authorId: data.authorId,
      isActive: true,
    });

    // Send single FCM topic push to /topics/announcements without blocking or failing on push errors
    let pushSent = false;
    try {
      pushSent = await fcmService.sendToTopic('announcements', {
        title: effectiveTitleBn || effectiveTitle,
        body: effectiveContentBn || effectiveContent,
        url: '/dashboard',
      });
    } catch (err) {
      console.warn('[Announcement] Push broadcast skipped/failed:', err);
      pushSent = false;
    }

    return { announcement, pushSent };
  },

  async markAnnouncementsSeen(userId: string): Promise<Date> {
    await connectToDatabase();
    const now = new Date();
    await UserModel.findByIdAndUpdate(userId, { lastSeenAnnouncementAt: now });
    return now;
  },

  async getUnreadCount(lastSeenAt?: Date | null): Promise<number> {
    await connectToDatabase();
    const now = new Date();
    const query: Record<string, unknown> = {
      isActive: true,
      $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: now } }],
    };

    if (lastSeenAt) {
      query.createdAt = { $gt: lastSeenAt };
    }

    return AnnouncementModel.countDocuments(query);
  },
};
