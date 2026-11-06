import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

/**
 * Global MongoDB Connection Manager with Serverless & Hot-Reload Caching
 */

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Strips connection strings, URIs, and credentials from database errors.
 */
export function sanitizeDbError(error: unknown): string {
  if (!error) return 'Unknown database error';
  const msg = error instanceof Error ? error.message : String(error);
  return msg
    .replace(/mongodb(\+srv)?:\/\/[^\s"'<>]+/gi, '[REDACTED_MONGODB_URI]')
    .replace(/:\/\/[^@\s]+@[^\s"'<>]+/gi, '://[REDACTED_CREDENTIALS]@[REDACTED_HOST]')
    .replace(/(password|pass|pwd)=[^&\s]+/gi, '$1=[REDACTED]');
}

/**
 * Explicitly loads .env.local in CLI environments without external dependencies.
 */
export function loadEnvLocal(): void {
  // Next.js runtime automatically loads .env.local into process.env
  if (process.env.NEXT_RUNTIME || process.env.MONGODB_URI || process.env.DATABASE_URL) return;
  try {
    const cwd = process.cwd();
    const envFiles = ['.env.local', '.env'] as const;
    for (const file of envFiles) {
      const fullPath = path.resolve(/*turbopackIgnore: true*/ cwd, file);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            let val = trimmed.slice(eqIdx + 1).trim();
            if (
              (val.startsWith('"') && val.endsWith('"')) ||
              (val.startsWith("'") && val.endsWith("'"))
            ) {
              val = val.slice(1, -1);
            }
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      }
    }
  } catch {
    // Ignore read errors
  }
}

export async function connectToDatabase(options?: {
  throwOnError?: boolean;
}): Promise<typeof mongoose | null> {
  // During Next.js static prerendering build phase, skip remote database connection
  // to avoid driver heartbeat prerender conflicts and network hangs.
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return null;
  }

  loadEnvLocal();
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;

  if (!uri) {
    if (options?.throwOnError) {
      throw new Error('MONGODB_URI is not set in environment or .env.local');
    }
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        '⚠️ MONGODB_URI is not set. Database operations will be skipped or operate in in-memory mode.'
      );
    }
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(uri, opts).then((m) => {
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    const sanitizedMsg = sanitizeDbError(e);
    if (options?.throwOnError) {
      throw new Error(sanitizedMsg);
    }
    console.error('Failed to connect to MongoDB Atlas:', sanitizedMsg);
    return null;
  }
}
