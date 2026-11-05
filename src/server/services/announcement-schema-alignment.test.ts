import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CreateAnnouncementInputSchema,
} from '@/server/schemas/announcement.schema';
import { announcementService } from '@/server/services/announcement.service';
import { AnnouncementModel, type IAnnouncement } from '@/server/models/announcement.model';
import { fcmService } from '@/server/services/fcm.service';

vi.mock('@/server/db', () => ({
  connectToDatabase: vi.fn().mockResolvedValue(true),
}));

describe('Announcement Schema, Service & Single Source of Truth Alignment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Zod Schema Validation (Client Form Input)', () => {
    it('accepts form with only Bangla title and body', () => {
      const payload = {
        titleBn: 'নতুন রমজান সময়সূচি',
        contentBn: 'রমজানে জিম সকাল ৬টা থেকে রাত ১১টা পর্যন্ত খোলা থাকবে।',
        type: 'info',
      };

      const result = CreateAnnouncementInputSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.titleBn).toBe('নতুন রমজান সময়সূচি');
        expect(result.data.title).toBe('');
        expect(result.data.contentBn).toBe('রমজানে জিম সকাল ৬টা থেকে রাত ১১টা পর্যন্ত খোলা থাকবে।');
        expect(result.data.content).toBe('');
      }
    });

    it('accepts form with only English title and body', () => {
      const payload = {
        title: 'Ramadan Schedule Update',
        content: 'Gym will remain open from 6 AM to 11 PM during Ramadan.',
        type: 'update',
      };

      const result = CreateAnnouncementInputSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Ramadan Schedule Update');
        expect(result.data.titleBn).toBe('');
        expect(result.data.content).toBe('Gym will remain open from 6 AM to 11 PM during Ramadan.');
      }
    });

    it('accepts form with both languages populated', () => {
      const payload = {
        title: 'Ramadan Hours',
        titleBn: 'রমজানের সময়সূচি',
        content: 'Updated hours for Ramadan.',
        contentBn: 'রমজানের জন্য পরিবর্তিত সময়।',
        type: 'info',
      };

      const result = CreateAnnouncementInputSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('fails when no title is provided in either language', () => {
      const payload = {
        title: '',
        titleBn: '',
        contentBn: 'কিছু একটা তথ্য',
      };

      const result = CreateAnnouncementInputSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Title is required in at least one language');
      }
    });

    it('fails when no content is provided in either language', () => {
      const payload = {
        title: 'Title Here',
        content: '',
        contentBn: '',
      };

      const result = CreateAnnouncementInputSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Content is required in at least one language');
      }
    });
  });

  describe('Announcement Service Creation & FCM Graceful Degradation', () => {
    it('creates announcement with Bangla only, mirroring text and using server session author', async () => {
      const mockSaved = {
        _id: 'announcement-1',
        title: 'নতুন ব্যায়াম গাইড',
        titleEn: 'নতুন ব্যায়াম গাইড',
        titleBn: 'নতুন ব্যায়াম গাইড',
        content: 'চেস্ট ওয়ার্কআউট আপডেট করা হয়েছে।',
        contentEn: 'চেস্ট ওয়ার্কআউট আপডেট করা হয়েছে।',
        bodyEn: 'চেস্ট ওয়ার্কআউট আপডেট করা হয়েছে।',
        contentBn: 'চেস্ট ওয়ার্কআউট আপডেট করা হয়েছে।',
        bodyBn: 'চেস্ট ওয়ার্কআউট আপডেট করা হয়েছে।',
        authorEmail: 'admin@zgym.com',
        authorId: 'admin-user-id',
        type: 'info',
        isActive: true,
      } as unknown as IAnnouncement;

      const createSpy = vi.spyOn(AnnouncementModel, 'create').mockResolvedValueOnce(mockSaved as never);

      vi.spyOn(fcmService, 'sendToTopic').mockResolvedValueOnce(false); // FCM skipped/missing

      const res = await announcementService.createAnnouncement({
        titleBn: 'নতুন ব্যায়াম গাইড',
        contentBn: 'চেস্ট ওয়ার্কআউট আপডেট করা হয়েছে।',
        authorEmail: 'admin@zgym.com',
        authorId: 'admin-user-id',
      });

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'নতুন ব্যায়াম গাইড',
          titleBn: 'নতুন ব্যায়াম গাইড',
          content: 'চেস্ট ওয়ার্কআউট আপডেট করা হয়েছে।',
          contentBn: 'চেস্ট ওয়ার্কআউট আপডেট করা হয়েছে।',
          authorEmail: 'admin@zgym.com',
          authorId: 'admin-user-id',
        })
      );

      // Verify request didn't fail even though push was not sent
      expect(res.pushSent).toBe(false);
      expect(res.announcement._id).toBe('announcement-1');
    });

    it('handles FCM push exception without throwing or failing announcement creation', async () => {
      const mockSaved = {
        _id: 'announcement-2',
        title: 'Server Maintenance',
        titleEn: 'Server Maintenance',
        titleBn: 'Server Maintenance',
        content: 'Maintenance at midnight.',
        contentEn: 'Maintenance at midnight.',
        bodyEn: 'Maintenance at midnight.',
        contentBn: 'Maintenance at midnight.',
        bodyBn: 'Maintenance at midnight.',
        authorEmail: 'admin@zgym.com',
        authorId: 'admin-user-id',
        type: 'warning',
        isActive: true,
      } as unknown as IAnnouncement;

      vi.spyOn(AnnouncementModel, 'create').mockResolvedValueOnce(mockSaved as never);

      vi.spyOn(fcmService, 'sendToTopic').mockRejectedValueOnce(new Error('FCM network failure'));

      const res = await announcementService.createAnnouncement({
        title: 'Server Maintenance',
        content: 'Maintenance at midnight.',
        authorEmail: 'admin@zgym.com',
        type: 'warning',
      });

      expect(res.pushSent).toBe(false);
      expect(res.announcement._id).toBe('announcement-2');
    });
  });
});
