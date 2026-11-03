import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminService } from './admin.service';
import { userService } from './user.service';
import { FoodModel } from '../models/food.model';
import { ExerciseModel } from '../models/exercise.model';
import { UserModel } from '../models/user.model';
import { AuditLogModel } from '../models/audit-log.model';

vi.mock('../db', () => ({
  connectToDatabase: vi.fn().mockResolvedValue(true),
}));

vi.mock('../models/audit-log.model', () => ({
  AuditLogModel: {
    create: vi.fn().mockResolvedValue({ _id: 'audit-1' }),
    find: vi.fn().mockReturnValue({
      sort: vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([
            {
              _id: 'audit-1',
              adminEmail: 'admin@zgym.app',
              action: 'USER_DISABLE',
              createdAt: new Date(),
            },
          ]),
        }),
      }),
    }),
  },
}));

vi.mock('../models/food.model', () => ({
  FoodModel: {
    create: vi.fn().mockImplementation((d) => Promise.resolve({ _id: 'food-new-1', ...d })),
    findById: vi.fn().mockImplementation((id) =>
      Promise.resolve({
        _id: id,
        nameEn: 'Old Rice',
        nameBn: 'পুরাতন চাল',
        save: vi.fn().mockResolvedValue(true),
      })
    ),
  },
}));

vi.mock('../models/exercise.model', () => ({
  ExerciseModel: {
    create: vi.fn().mockImplementation((d) => Promise.resolve({ _id: 'ex-new-1', ...d })),
    findById: vi.fn().mockImplementation((id) =>
      Promise.resolve({
        _id: id,
        slug: 'bench-press',
        save: vi.fn().mockResolvedValue(true),
      })
    ),
  },
}));

vi.mock('../models/user.model', () => {
  return {
    UserModel: {
      countDocuments: vi.fn().mockResolvedValue(100),
      find: vi.fn().mockReturnValue({
        sort: vi.fn().mockReturnValue({
          skip: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                lean: vi.fn().mockResolvedValue([
                  {
                    _id: 'user-athlete-1',
                    nickname: 'Athlete_1001',
                    email: 'user1@example.com',
                    role: 'user',
                    disabled: false,
                    createdAt: new Date(),
                    lastActiveAt: new Date(),
                  },
                ]),
              }),
            }),
          }),
          limit: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              lean: vi.fn().mockResolvedValue([
                {
                  _id: 'user-athlete-1',
                  nickname: 'Athlete_1001',
                  email: 'user1@example.com',
                  role: 'user',
                  disabled: false,
                  createdAt: new Date(),
                  lastActiveAt: new Date(),
                },
              ]),
            }),
          }),
        }),
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([]),
        }),
      }),
      findById: vi.fn().mockImplementation((id) => {
        if (id === 'admin-id-1') {
          return Promise.resolve({
            _id: 'admin-id-1',
            email: 'admin1@zgym.app',
            role: 'admin',
            disabled: false,
            save: vi.fn().mockResolvedValue(true),
          });
        }
        if (id === 'admin-id-2') {
          return Promise.resolve({
            _id: 'admin-id-2',
            email: 'admin2@zgym.app',
            role: 'admin',
            disabled: false,
            save: vi.fn().mockResolvedValue(true),
          });
        }
        return Promise.resolve({
          _id: id,
          email: 'regular@zgym.app',
          nickname: 'Regular_User',
          role: 'user',
          disabled: false,
          save: vi.fn().mockResolvedValue(true),
        });
      }),
      updateOne: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
    },
  };
});

describe('Phase 9: Admin Dashboard & Privileged Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_EMAILS = 'admin1@zgym.app,admin2@zgym.app';
  });

  describe('Server-Side Admin Role Verification', () => {
    it('identifies admin email from ADMIN_EMAILS environment variable', () => {
      expect(userService.isAdminEmail('admin1@zgym.app')).toBe(true);
      expect(userService.isAdminEmail('ADMIN2@ZGYM.APP')).toBe(true);
      expect(userService.isAdminEmail('regular@zgym.app')).toBe(false);
      expect(userService.isAdminEmail('')).toBe(false);
    });
  });

  describe('User Disabling & Self-Protection Rules', () => {
    it('prevents an administrator from disabling themselves', async () => {
      await expect(
        adminService.toggleUserDisabled(
          { id: 'admin-id-1', email: 'admin1@zgym.app' },
          'admin-id-1',
          true
        )
      ).rejects.toThrow('Administrators cannot disable their own account');
    });

    it('prevents an administrator from disabling another administrator', async () => {
      await expect(
        adminService.toggleUserDisabled(
          { id: 'admin-id-1', email: 'admin1@zgym.app' },
          'admin-id-2',
          true
        )
      ).rejects.toThrow('Administrators cannot disable another administrator account');
    });

    it('successfully disables a regular member and records audit log', async () => {
      const res = await adminService.toggleUserDisabled(
        { id: 'admin-id-1', email: 'admin1@zgym.app' },
        'regular-user-id',
        true,
        '127.0.0.1'
      );

      expect(res).toBe(true);
      expect(AuditLogModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          adminId: 'admin-id-1',
          action: 'USER_DISABLE',
        })
      );
    });
  });

  describe('Food Verification Rule: Source Mandate', () => {
    it('throws error when setting verified=true without a source filled in', async () => {
      await expect(
        adminService.saveFood(
          { id: 'admin-id-1', email: 'admin1@zgym.app' },
          {
            nameBn: 'লাল চাল',
            nameEn: 'Brown Rice',
            category: 'grains',
            source: '', // Empty source!
            verified: true, // Attempting to verify without source
            per100g: { kcal: 111, protein: 2.6, carbs: 23, fat: 0.9 },
            servings: [{ labelBn: '১ বাটি', labelEn: '1 bowl', grams: 150 }],
          }
        )
      ).rejects.toThrow('Source citation is mandatory when marking a food item as verified');
    });

    it('successfully creates food with verified=true when source is populated', async () => {
      const food = await adminService.saveFood(
        { id: 'admin-id-1', email: 'admin1@zgym.app' },
        {
          nameBn: 'লাল চাল',
          nameEn: 'Brown Rice',
          category: 'grains',
          source: 'USDA FoodData Central #169704',
          verified: true,
          per100g: { kcal: 111, protein: 2.6, carbs: 23, fat: 0.9 },
          servings: [{ labelBn: '১ বাটি', labelEn: '1 bowl', grams: 150 }],
        }
      );

      expect(food).toBeDefined();
      expect(FoodModel.create).toHaveBeenCalled();
    });
  });

  describe('Exercise YouTube ID Validation', () => {
    it('rejects invalid YouTube ID format (not 11 chars)', async () => {
      await expect(
        adminService.saveExercise(
          { id: 'admin-id-1', email: 'admin1@zgym.app' },
          {
            slug: 'incline-press',
            nameBn: 'ইনক্লাইন প্রেস',
            nameEn: 'Incline Press',
            muscle: 'chest',
            equipment: 'dumbbell',
            level: 'intermediate',
            youtubeId: 'invalid-id-too-long-123456789',
          }
        )
      ).rejects.toThrow('Invalid YouTube video ID format');
    });

    it('accepts valid 11-char YouTube ID', async () => {
      const ex = await adminService.saveExercise(
        { id: 'admin-id-1', email: 'admin1@zgym.app' },
        {
          slug: 'incline-press',
          nameBn: 'ইনক্লাইন প্রেস',
          nameEn: 'Incline Press',
          muscle: 'chest',
          equipment: 'dumbbell',
          level: 'intermediate',
          youtubeId: 'rT7DgCr-3pg',
        }
      );

      expect(ex).toBeDefined();
      expect(ExerciseModel.create).toHaveBeenCalled();
    });
  });

  describe('lastActiveAt Update Throttling', () => {
    it('updates lastActiveAt using conditional query older than 1 hour', async () => {
      await userService.touchLastActive('user-123');
      expect(UserModel.updateOne).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: 'user-123',
        }),
        expect.objectContaining({
          $set: expect.objectContaining({ lastActiveAt: expect.any(Date) }),
        })
      );
    });
  });
});
