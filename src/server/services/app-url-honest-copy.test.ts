import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolveAppUrl, APP_CONFIG } from '@/config/app';

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
});
