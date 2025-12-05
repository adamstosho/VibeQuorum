import Redis from 'ioredis';
import { logger } from '../utils/logger';

let redisClient: Redis | null = null;
let redisConnectionAttempted = false;

/**
 * Get Redis client (singleton)
 */
export const getRedisClient = (): Redis | null => {
  // If already attempted and failed, don't try again
  if (redisConnectionAttempted && !redisClient) {
    return null;
  }

  if (redisClient) {
    return redisClient;
  }

  const REDIS_URL = process.env.REDIS_URL;

  if (!REDIS_URL) {
    // Only log once
    if (!redisConnectionAttempted) {
      logger.warn('⚠️  Redis not configured, using in-memory rate limiting');
      redisConnectionAttempted = true;
    }
    return null;
  }

  // Mark as attempted
  redisConnectionAttempted = true;

  try {
    redisClient = new Redis(REDIS_URL, {
      retryStrategy: (times) => {
        // Stop retrying after 1 attempt - fail fast
        if (times > 1) {
          return null; // Stop retrying
        }
        return 100; // Quick retry
      },
      maxRetriesPerRequest: 0, // Don't retry on failed requests
      lazyConnect: false, // Try to connect immediately
      enableOfflineQueue: false, // Don't queue commands when offline
      connectTimeout: 2000, // 2 second timeout
      enableReadyCheck: false, // Skip ready check
    });

    let errorLogged = false;

    redisClient.on('connect', () => {
      logger.info('✅ Redis Connected');
      errorLogged = false; // Reset on successful connection
    });

    redisClient.on('ready', () => {
      logger.info('✅ Redis Ready');
    });

    redisClient.on('error', (error: any) => {
      // Only log once to avoid spam
      if (!errorLogged) {
        if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
          logger.warn('⚠️  Redis not available, using in-memory rate limiting');
          // Set to null so getRedisClient returns null on next call
          redisClient = null;
        } else {
          logger.warn(`⚠️  Redis error: ${error.message}, using in-memory rate limiting`);
        }
        errorLogged = true;
      }
    });

    // If connection fails immediately, mark as unavailable
    redisClient.on('close', () => {
      // Connection closed, will use in-memory fallback
    });

    return redisClient;
  } catch (error: any) {
    logger.warn(`⚠️  Failed to initialize Redis: ${error.message}, using in-memory rate limiting`);
    redisClient = null;
    return null;
  }
};

/**
 * Close Redis connection
 */
export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('🔌 Redis connection closed');
  }
};

