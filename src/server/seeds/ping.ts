import { connectToDatabase, loadEnvLocal, sanitizeDbError } from '../db';
import mongoose from 'mongoose';

async function ping() {
  loadEnvLocal();
  try {
    const db = await connectToDatabase({ throwOnError: true });
    if (!db || !mongoose.connection.db) {
      throw new Error('Database connected but handle is unavailable');
    }

    await mongoose.connection.db.admin().ping();
    console.log('connected');
    process.exit(0);
  } catch (error) {
    const msg = sanitizeDbError(error);
    console.error(msg);
    process.exit(1);
  }
}

ping();
