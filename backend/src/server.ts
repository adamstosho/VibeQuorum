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
        ? `https://vibequorum.onrender.com`
        : `http://localhost:${PORT}`;

    // Start server with error handling for port conflicts
    const server = app.listen(PORT, '0.0.0.0', () => {
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

    // Handle server errors (e.g., port already in use)
    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        logger.error('');
        logger.error('═══════════════════════════════════════════════════════════');
        logger.error('❌ ❌ ❌  PORT ALREADY IN USE  ❌ ❌ ❌');
        logger.error('═══════════════════════════════════════════════════════════');
        logger.error(`Port ${PORT} is already in use by another process.`);
        logger.error('');
        logger.error('To fix this, you can:');
        logger.error(`1. Kill the process using port ${PORT}:`);
        logger.error(`   lsof -ti:${PORT} | xargs kill -9`);
        logger.error(`   OR`);
        logger.error(`   kill -9 $(lsof -ti:${PORT})`);
        logger.error('');
        logger.error(`2. Use a different port by setting PORT environment variable:`);
        logger.error(`   PORT=4001 npm run dev`);
        logger.error('');
        logger.error(`3. Find what's using the port:`);
        logger.error(`   lsof -i:${PORT}`);
        logger.error('═══════════════════════════════════════════════════════════');
        process.exit(1);
      } else {
        logger.error(`❌ Server error: ${err.message}`);
        if (err.stack) {
          logger.error(err.stack);
        }
        process.exit(1);
      }
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

