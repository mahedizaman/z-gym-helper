/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireAuthUser } from '../utils/auth-guard';
import { requireServerAdmin } from '../utils/admin-guard';
import { auth } from '@/lib/auth';
import { UserModel } from '../models/user.model';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('../db', () => ({
  connectToDatabase: vi.fn().mockResolvedValue(true),
}));

vi.mock('../models/user.model', () => ({
  UserModel: {
    findById: vi.fn(),
  },
}));

describe('Disabled User Request & Session Enforcement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_EMAILS = 'admin@zgym.app';
  });

  it('rejects unauthenticated requests with 401', async () => {
    (auth as any).mockResolvedValueOnce(null);

    const result = await requireAuthUser();
    expect(result.authorized).toBe(false);
    if (!result.authorized) {
      expect(result.response.status).toBe(401);
    }
  });

  it('blocks active sessions of disabled accounts on request check with 403', async () => {
    (auth as any).mockResolvedValueOnce({
      user: { id: 'disabled-user-123', email: 'banned@example.com', role: 'user' },
      expires: '2099-01-01',
    });

    vi.mocked(UserModel.findById).mockReturnValueOnce({
      _id: 'disabled-user-123',
      email: 'banned@example.com',
      disabled: true, // Account was disabled by admin!
    } as any);

    const result = await requireAuthUser();
    expect(result.authorized).toBe(false);
    if (!result.authorized) {
      expect(result.response.status).toBe(403);
      const json = await result.response.json();
      expect(json.error).toContain('disabled');
    }
  });

  it('allows active sessions of enabled accounts with 200', async () => {
    (auth as any).mockResolvedValueOnce({
      user: { id: 'active-user-123', email: 'active@example.com', role: 'user' },
      expires: '2099-01-01',
    });

    vi.mocked(UserModel.findById).mockReturnValueOnce({
      _id: 'active-user-123',
      email: 'active@example.com',
      disabled: false,
    } as any);

    const result = await requireAuthUser();
    expect(result.authorized).toBe(true);
    if (result.authorized) {
      expect(result.userId).toBe('active-user-123');
    }
  });

  it('blocks disabled administrators from accessing admin endpoints', async () => {
    (auth as any).mockResolvedValueOnce({
      user: { id: 'admin-disabled-id', email: 'admin@zgym.app', role: 'admin' },
      expires: '2099-01-01',
    });

    vi.mocked(UserModel.findById).mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        lean: vi.fn().mockResolvedValueOnce({
          _id: 'admin-disabled-id',
          role: 'admin',
          disabled: true, // Disabled admin!
        }),
      }),
    } as any);

    const adminCheck = await requireServerAdmin();
    expect(adminCheck.authorized).toBe(false);
    if (!adminCheck.authorized) {
      expect(adminCheck.response.status).toBe(403);
    }
  });
});
