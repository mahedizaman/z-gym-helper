import { AnnouncementModel, IAnnouncement } from '../models/announcement.model';
import { UserModel } from '../models/user.model';
import { fcmService } from './fcm.service';
import { connectToDatabase } from '../db';

export interface CreateAnnouncementInput {
  title: string;
  titleBn: string;
  content: string;
  contentBn: string;
  type?: 'info' | 'update' | 'warning' | 'celebration';
  expiresAt?: Date;
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

  async createAnnouncement(data: CreateAnnouncementInput): Promise<IAnnouncement> {
    await connectToDatabase();
    const announcement = await AnnouncementModel.create({
      title: data.title,
      titleBn: data.titleBn,
      content: data.content,
      contentBn: data.contentBn,
      type: data.type || 'info',
      expiresAt: data.expiresAt,
      isActive: true,
    });

    // Send single FCM topic push to /topics/announcements
    await fcmService.sendToTopic('announcements', {
      title: data.titleBn || data.title,
      body: data.contentBn || data.content,
      url: '/dashboard',
    });

    return announcement;
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
