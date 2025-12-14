// Load environment variables FIRST, before any other imports
import dotenv from 'dotenv';
dotenv.config();

// Now import other modules that depend on environment variables
import { createApp } from './app';
import { connectDB } from './config/database';
import { logger } from './utils/logger';

const PORT = Number(process.env.PORT) || 4000;

/**
 * Start server
 */
const startServer = async (): Promise<void> => {
  try {
    logger.info('═══════════════════════════════════════════════════════════');
    logger.info('🚀 Starting VibeQuorum Backend Server...');
    logger.info('═══════════════════════════════════════════════════════════');

    // Connect to MongoDB
    logger.info('📦 Connecting to MongoDB...');
    await connectDB();
    logger.info('✅ MongoDB connected successfully');

    // Create Express app
    logger.info('⚙️  Initializing Express application...');
    const app = createApp();
    logger.info('✅ Express app initialized');

    // Determine server URL
    const environment = process.env.NODE_ENV || 'development';
    const renderUrl = process.env.RENDER_EXTERNAL_URL;
    const baseUrl = renderUrl 
      ? renderUrl 
      : environment === 'production' 
        ? `https://your-render-url.onrender.com`
        : `http://localhost:${PORT}`;

    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      logger.info('');
      logger.info('═══════════════════════════════════════════════════════════');
      logger.info('✅ ✅ ✅  BACKEND SUCCESSFULLY DEPLOYED AND RUNNING  ✅ ✅ ✅');
      logger.info('═══════════════════════════════════════════════════════════');
      logger.info('');
      logger.info(`🌐 Server URL:        ${baseUrl}`);
      logger.info(`🔌 Port:              ${PORT}`);
      logger.info(`🌍 Environment:       ${environment}`);
      logger.info(`📚 API Documentation: ${baseUrl}/api-docs`);
      logger.info(`❤️  Health Check:      ${baseUrl}/health`);
      logger.info(`🔗 API Base:          ${baseUrl}/api`);
      logger.info('');
      logger.info('═══════════════════════════════════════════════════════════');
      logger.info('🎉 VibeQuorum Backend is ready to accept requests! 🎉');
      logger.info('═══════════════════════════════════════════════════════════');
      logger.info('');
      
      // Log important configuration
      if (process.env.MONGODB_URI) {
        logger.info('✅ MongoDB: Configured');
      } else {
        logger.warn('⚠️  MongoDB: Not configured (MONGODB_URI missing)');
      }
      
      if (process.env.VIBE_TOKEN_ADDRESS && process.env.REWARD_MANAGER_ADDRESS) {
        logger.info('✅ Smart Contracts: Configured');
      } else {
        logger.warn('⚠️  Smart Contracts: Not configured (missing contract addresses)');
      }
      
      if (process.env.HUGGINGFACE_API_KEY) {
        logger.info('✅ AI Service: Configured (Hugging Face)');
      } else {
        logger.warn('⚠️  AI Service: Not configured (HUGGINGFACE_API_KEY missing)');
      }
      
      logger.info('');
    });
  } catch (error: any) {
    logger.error('');
    logger.error('═══════════════════════════════════════════════════════════');
    logger.error('❌ ❌ ❌  FAILED TO START SERVER  ❌ ❌ ❌');
    logger.error('═══════════════════════════════════════════════════════════');
    logger.error(`Error: ${error.message}`);
    if (error.stack) {
      logger.error('Stack trace:');
      logger.error(error.stack);
    }
    logger.error('═══════════════════════════════════════════════════════════');
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error(`❌ Unhandled Rejection: ${err.message}`);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error(`❌ Uncaught Exception: ${err.message}`);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('🛑 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('🛑 Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

