import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkRateLimit,
  setRateLimiterStore,
  InMemoryRateLimiterStore,
  IRateLimiterStore,
  RateLimitRecord,
} from './rate-limiter';

describe('Rate Limiter Store Interface', () => {
  beforeEach(() => {
    // Reset to fresh in-memory store before each test
    setRateLimiterStore(new InMemoryRateLimiterStore());
  });

  it('enforces limit using default InMemoryRateLimiterStore', () => {
    const req = new Request('http://localhost/api/test', {
      headers: { 'x-forwarded-for': '192.168.1.100' },
    });

    const res1 = checkRateLimit(req, 'test-prefix', { limit: 2, windowMs: 10000 });
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(1);

    const res2 = checkRateLimit(req, 'test-prefix', { limit: 2, windowMs: 10000 });
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(0);

    const res3 = checkRateLimit(req, 'test-prefix', { limit: 2, windowMs: 10000 });
    expect(res3.success).toBe(false);
    expect(res3.remaining).toBe(0);
  });

  it('supports plugging in a custom IRateLimiterStore implementation', () => {
    // Custom store mock simulating a distributed cache or custom store
    const map = new Map<string, RateLimitRecord>();
    const customStore: IRateLimiterStore = {
      get: (k) => map.get(k),
      set: (k, rec) => map.set(k, rec),
      delete: (k) => {
        map.delete(k);
      },
      cleanup: (cutoff) => {
        for (const [k, rec] of map.entries()) {
          rec.timestamps = rec.timestamps.filter((ts) => ts > cutoff);
          if (rec.timestamps.length === 0) map.delete(k);
        }
      },
    };

    setRateLimiterStore(customStore);

    const req = new Request('http://localhost/api/test', {
      headers: { 'x-forwarded-for': '10.0.0.1' },
    });

    const res = checkRateLimit(req, 'custom-test', { limit: 5, windowMs: 5000 });
    expect(res.success).toBe(true);
    expect(map.has('custom-test:10.0.0.1')).toBe(true);
  });
});
