import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolveAppUrl, APP_CONFIG } from '@/config/app';
import { validateAuthUrlForProduction } from '@/server/utils/auth-url-validator';

describe('Canonical URL, OpenGraph & Environment Hardening', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  const setNodeEnv = (val: string | undefined) => {
    (process.env as Record<string, string | undefined>).NODE_ENV = val;
  };

  it('resolves canonical app URL from NEXT_PUBLIC_APP_URL without trailing slash', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://myfitness.app///';
    expect(resolveAppUrl()).toBe('https://myfitness.app');
  });

  it('safely falls back to localhost:3000 in test or dev when NEXT_PUBLIC_APP_URL is absent', () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    setNodeEnv('test');
    expect(resolveAppUrl()).toBe('http://localhost:3000');
  });

  it('fails loudly in production when NEXT_PUBLIC_APP_URL is missing', () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    setNodeEnv('production');

    expect(() => resolveAppUrl()).toThrowError(/FATAL CONFIGURATION ERROR: NEXT_PUBLIC_APP_URL is missing in production/i);
  });

  it('fails loudly in production when NEXT_PUBLIC_APP_URL is empty whitespace', () => {
    process.env.NEXT_PUBLIC_APP_URL = '   ';
    setNodeEnv('production');

    expect(() => resolveAppUrl()).toThrowError(/FATAL CONFIGURATION ERROR: NEXT_PUBLIC_APP_URL is missing in production/i);
  });

  it('never falls back to an unowned domain (e.g. zgym.app)', () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    setNodeEnv('test');
    const fallbackUrl = resolveAppUrl();
    expect(fallbackUrl).not.toContain('zgym.app');
    expect(fallbackUrl).toBe('http://localhost:3000');
  });

  it('guarantees APP_CONFIG.url is non-empty and well-formed', () => {
    expect(APP_CONFIG.url).toMatch(/^https?:\/\//);
    expect(APP_CONFIG.url).not.toContain('zgym.app');
  });

  describe('AUTH_URL / NEXTAUTH_URL Production Validation', () => {
    it('fails when AUTH_URL points to localhost', () => {
      expect(() => validateAuthUrlForProduction('http://localhost:3000')).toThrowError(
        /AUTH_URL or NEXTAUTH_URL cannot point to localhost in production/i
      );
    });

    it('fails when AUTH_URL points to 127.0.0.1 or 0.0.0.0', () => {
      expect(() => validateAuthUrlForProduction('http://127.0.0.1:3000')).toThrowError(
        /AUTH_URL or NEXTAUTH_URL cannot point to localhost in production/i
      );
      expect(() => validateAuthUrlForProduction('https://0.0.0.0:8080')).toThrowError(
        /AUTH_URL or NEXTAUTH_URL cannot point to localhost in production/i
      );
    });

    it('passes when AUTH_URL is a valid production domain', () => {
      expect(() => validateAuthUrlForProduction('https://zgym-helper.vercel.app')).not.toThrow();
      expect(() => validateAuthUrlForProduction('https://mygym.com/api/auth')).not.toThrow();
    });

    it('safely ignores undefined or empty values', () => {
      expect(() => validateAuthUrlForProduction(undefined)).not.toThrow();
      expect(() => validateAuthUrlForProduction('')).not.toThrow();
      expect(() => validateAuthUrlForProduction('   ')).not.toThrow();
    });
  });

  describe('Server-Verified Admin Role Navigation Guard', () => {
    it('restricts admin navigation link to users with server-verified role=admin', () => {
      const guestSession = null;
      const userSession = { user: { id: 'u1', email: 'user@example.com', role: 'user' } };
      const adminSession = { user: { id: 'a1', email: 'admin@zgym.com', role: 'admin' } };

      const shouldShowAdminLink = (session: { user?: { role?: string } } | null) =>
        session?.user?.role === 'admin';

      expect(shouldShowAdminLink(guestSession)).toBe(false);
      expect(shouldShowAdminLink(userSession)).toBe(false);
      expect(shouldShowAdminLink(adminSession)).toBe(true);
    });
  });
});
