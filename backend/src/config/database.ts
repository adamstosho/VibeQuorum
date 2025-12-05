import mongoose from 'mongoose';
import { logger } from '../utils/logger';

/**
 * Connect to MongoDB
 */
export const connectDB = async (): Promise<void> => {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is required');
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI);
    logger.info(`✅ MongoDB Connected to ${conn.connection.host}`);
  } catch (error: any) {
    logger.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB
 */
export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('🔌 MongoDB Disconnected');
  } catch (error: any) {
    logger.error(`❌ MongoDB disconnection error: ${error.message}`);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  logger.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (error: any) => {
  logger.error(`❌ MongoDB error: ${error.message}`);
});

