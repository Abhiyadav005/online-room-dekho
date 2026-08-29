import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';

export async function connectDatabase(): Promise<void> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri, {
    autoIndex: env.nodeEnv !== 'production',
    serverSelectionTimeoutMS: 10_000
  });
  logger.info({ host: mongoose.connection.host, database: mongoose.connection.name }, 'MongoDB connected');
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
