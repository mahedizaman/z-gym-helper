import { NextResponse } from 'next/server';

export interface RateLimitRecord {
  timestamps: number[];
}

/**
 * Storage interface for rate limiting.
 * Allows seamless substitution of the in-memory store with Redis (e.g. Upstash),
 * Memcached, or MongoDB in multi-instance or serverless environments.
 */
export interface IRateLimiterStore {
  get(key: string): RateLimitRecord | undefined;
  set(key: string, record: RateLimitRecord): void;
  delete(key: string): void;
  cleanup(cutoff: number): void;
}

/**
 * Default in-memory rate limiter store using JavaScript Map.
 */
export class InMemoryRateLimiterStore implements IRateLimiterStore {
  private store = new Map<string, RateLimitRecord>();

  get(key: string): RateLimitRecord | undefined {
    return this.store.get(key);
  }

  set(key: string, record: RateLimitRecord): void {
    this.store.set(key, record);
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  cleanup(cutoff: number): void {
    for (const [key, record] of this.store.entries()) {
      record.timestamps = record.timestamps.filter((ts) => ts > cutoff);
      if (record.timestamps.length === 0) {
        this.store.delete(key);
      }
    }
  }
}

// Active store singleton
let activeStore: IRateLimiterStore = new InMemoryRateLimiterStore();

/**
 * Replace the active rate limiter store (e.g., in unit tests or with an Upstash Redis adapter).
 */
export function setRateLimiterStore(store: IRateLimiterStore): void {
  activeStore = store;
}

/**
 * Retrieve the current active rate limiter store.
 */
export function getRateLimiterStore(): IRateLimiterStore {
  return activeStore;
}

// Periodic cleanup of stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStale(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  const cutoff = now - windowMs;
  activeStore.cleanup(cutoff);
}

export function getClientIp(request: Request): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip') || request.headers.get('cf-connecting-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

export interface RateLimitOptions {
  limit?: number; // max requests per window (default: 30)
  windowMs?: number; // window size in ms (default: 60,000ms = 1 min)
  identifier?: string; // custom identifier e.g. userId
}

/**
 * Sliding window rate limiter for Next.js App Router route handlers.
 */
export function checkRateLimit(
  request: Request,
  prefix: string,
  options: RateLimitOptions = {}
): {
  success: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
} {
  const limit = options.limit ?? 30;
  const windowMs = options.windowMs ?? 60 * 1000;
  const clientId = options.identifier || getClientIp(request);
  const key = `${prefix}:${clientId}`;

  const now = Date.now();
  cleanupStale(windowMs);

  let record = activeStore.get(key);
  if (!record) {
    record = { timestamps: [] };
    activeStore.set(key, record);
  }

  // Remove timestamps outside current window
  const windowStart = now - windowMs;
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0] || now;
    const resetInSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return {
      success: false,
      limit,
      remaining: 0,
      resetInSeconds,
    };
  }

  record.timestamps.push(now);
  const remaining = Math.max(0, limit - record.timestamps.length);
  const resetInSeconds = Math.ceil(windowMs / 1000);

  return {
    success: true,
    limit,
    remaining,
    resetInSeconds,
  };
}

/**
 * Returns a 429 response if rate limit is exceeded, or null if allowed.
 */
export function enforceRateLimit(
  request: Request,
  prefix: string,
  options: RateLimitOptions = {}
): NextResponse | null {
  const result = checkRateLimit(request, prefix, options);
  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Too many requests. Please wait a moment before trying again.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(result.resetInSeconds),
          'X-RateLimit-Limit': String(result.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(result.resetInSeconds),
        },
      }
    );
  }
  return null;
}
