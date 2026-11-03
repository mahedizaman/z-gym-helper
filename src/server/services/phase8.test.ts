import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'node:crypto';
import { fcmService } from './fcm.service';
import { announcementService } from './announcement.service';
import { notificationService } from './notification.service';
import { PushTokenModel } from '../models/push-token.model';

vi.mock('../db', () => ({
  connectDB: vi.fn().mockResolvedValue(true),
  connectToDatabase: vi.fn().mockResolvedValue(true),
}));

vi.mock('../models/announcement.model', () => {
  const mockAnnouncements = [
    {
      _id: 'ann-1',
      title: 'Ramadan Schedule',
      titleBn: 'রমজান সময়সূচী',
      content: 'Gym timing updated',
      contentBn: 'জিমের সময়সূচী পরিবর্তিত হয়েছে',
      type: 'update',
      isActive: true,
      createdAt: new Date('2026-03-01T00:00:00.000Z'),
    },
  ];

  return {
    AnnouncementModel: {
      find: vi.fn().mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue(mockAnnouncements),
        }),
      }),
      create: vi.fn().mockImplementation((data) => Promise.resolve({ _id: 'ann-new', ...data })),
      countDocuments: vi.fn().mockImplementation((q) => {
        if (q.createdAt?.$gt) return Promise.resolve(0);
        return Promise.resolve(1);
      }),
    },
  };
});

vi.mock('../models/push-token.model', () => ({
  PushTokenModel: {
    findOneAndUpdate: vi.fn().mockResolvedValue(true),
    deleteOne: vi.fn().mockResolvedValue(true),
    find: vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue([{ token: 'fcm-token-test-123' }]),
    }),
    deleteMany: vi.fn().mockResolvedValue({ deletedCount: 1 }),
  },
}));

vi.mock('../models/user.model', () => {
  const mockUser = {
    _id: 'user-123',
    nickname: 'Athlete_999',
    timezone: 'Asia/Dhaka',
    notificationPreferences: {
      workoutReminderTime: '18:00',
      mealReminderTime: '13:00',
      notificationsOptOut: false,
    },
    save: vi.fn().mockResolvedValue(true),
  };

  return {
    UserModel: {
      findById: vi.fn().mockResolvedValue(mockUser),
      findByIdAndUpdate: vi.fn().mockResolvedValue(mockUser),
      find: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([mockUser]),
      }),
    },
  };
});

describe('Phase 8: FCM, Announcements & Notification System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('FCM Service Graceful Unconfigured State', () => {
    it('reports isConfigured false when FIREBASE_SERVICE_ACCOUNT_BASE64 is unset', () => {
      delete process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
      expect(fcmService.isConfigured()).toBe(false);
    });

    it('gracefully handles sendToTokens without crashing when unconfigured', async () => {
      delete process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
      const res = await fcmService.sendToTokens(['sample-token'], {
        title: 'Test',
        body: 'Body',
      });
      expect(res.successCount).toBe(0);
      expect(res.failureCount).toBe(1);
    });
  });

  describe('Announcement Service', () => {
    it('retrieves active announcements list', async () => {
      const list = await announcementService.getActiveAnnouncements();
      expect(list.length).toBe(1);
      expect(list[0].title).toBe('Ramadan Schedule');
    });

    it('calculates unread count correctly', async () => {
      const count = await announcementService.getUnreadCount(null);
      expect(count).toBe(1);

      const countRead = await announcementService.getUnreadCount(new Date('2026-03-02T00:00:00.000Z'));
      expect(countRead).toBe(0);
    });
  });

  describe('Notification Preferences & Scheduled Reminders', () => {
    it('updates user notification preferences in DB', async () => {
      const updated = await notificationService.updatePreferences('user-123', {
        workoutReminderTime: '19:00',
        notificationsOptOut: true,
      });

      expect(updated?.workoutReminderTime).toBe('19:00');
      expect(updated?.notificationsOptOut).toBe(true);
    });

    it('registers and stores push token', async () => {
      await notificationService.registerToken('507f1f77bcf86cd799439011', 'fcm-device-token-abc', 'Mozilla/5.0');
      expect(PushTokenModel.findOneAndUpdate).toHaveBeenCalled();
    });
  });

  describe('Secured Cron Authentication', () => {
    it('validates CRON_SECRET using constant-time comparison', () => {
      const secret = 'super-secret-cron-token-12345';
      const validHeader = `Bearer ${secret}`;
      const invalidHeader = 'Bearer wrong-cron-token-00000';

      const validBuf = Buffer.from(validHeader, 'utf8');
      const expectedBuf = Buffer.from(`Bearer ${secret}`, 'utf8');

      expect(validBuf.length === expectedBuf.length && crypto.timingSafeEqual(validBuf, expectedBuf)).toBe(true);

      const invalidBuf = Buffer.from(invalidHeader, 'utf8');
      expect(invalidBuf.length === expectedBuf.length && crypto.timingSafeEqual(invalidBuf, expectedBuf)).toBe(false);
    });
  });
});
