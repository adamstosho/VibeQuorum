// Vercel Serverless Function Handler
// This file exports the Express app as a serverless function for Vercel

import { createApp } from '../src/app';
import { connectDB } from '../src/config/database';
import { logger } from '../src/utils/logger';

// Initialize database connection (cached across invocations)
let dbConnected = false;
let dbConnecting = false;

const connectDatabase = async (): Promise<void> => {
  // Prevent multiple simultaneous connection attempts
  if (dbConnecting) {
    // Wait for ongoing connection
    while (dbConnecting && !dbConnected) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return;
  }

  if (!dbConnected) {
    dbConnecting = true;
    try {
      await connectDB();
      dbConnected = true;
      logger.info('✅ Database connected (serverless)');
    } catch (error: any) {
      logger.error(`❌ Database connection failed: ${error.message}`);
      dbConnecting = false;
      // Don't throw - allow app to start and retry on next request
      // In serverless, connection might fail due to cold starts
    } finally {
      dbConnecting = false;
    }
  }
};

// Create Express app instance (cached - created once per serverless instance)
let appInstance: any = null;

const getApp = async (): Promise<any> => {
  if (!appInstance) {
    // Ensure database is connected before creating app
    await connectDatabase();
    appInstance = createApp();
    logger.info('✅ Express app initialized (serverless)');
  }
  return appInstance;
};

// Vercel serverless function handler
// Vercel's @vercel/node runtime automatically handles Express apps
export default async function handler(req: any, res: any): Promise<any> {
  try {
    // Get Express app instance (will connect DB if needed)
    const app = await getApp();

    // Ensure database is connected (retry if needed)
    if (!dbConnected) {
      await connectDatabase();
    }

    // Return the Express app handler
    // Vercel's runtime will handle the request/response
    return app(req, res);
  } catch (error: any) {
    logger.error(`❌ Serverless function error: ${error.message}`);
    if (error.stack) {
      logger.error(error.stack);
    }
    
    // Send error response if headers not sent
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'SERVERLESS_ERROR',
        },
      });
    }
  }
}
