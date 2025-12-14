import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { generalLimiter } from './middleware/rateLimit.middleware';
import { logger } from './utils/logger';

// Routes
import authRoutes from './routes/auth.routes';
import questionRoutes from './routes/question.routes';
import answerRoutes from './routes/answer.routes';
import voteRoutes from './routes/vote.routes';
import aiRoutes from './routes/ai.routes';
import rewardRoutes from './routes/reward.routes';

/**
 * Create and configure Express app
 */
export const createApp = (): Express => {
  const app = express();

  // CORS configuration - MUST be before helmet to work properly
  // CORS configuration - allow Vercel deployment and localhost
  const allowedOrigins = [
    'https://vibequorum0.vercel.app',
    'https://vibequorum0.vercel.app/',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ];

  // Add custom frontend URL if provided
  if (process.env.FRONTEND_URL) {
    const customUrl = process.env.FRONTEND_URL.trim();
    if (!allowedOrigins.includes(customUrl)) {
      allowedOrigins.push(customUrl);
      // Also add without trailing slash if it has one
      if (customUrl.endsWith('/')) {
        allowedOrigins.push(customUrl.slice(0, -1));
      } else {
        allowedOrigins.push(customUrl + '/');
      }
    }
  }

  // Allow all origins in development if explicitly set
  const allowAllOrigins = process.env.ALLOW_ALL_ORIGINS === 'true';

  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }

      // Allow all origins if explicitly set
      if (allowAllOrigins) {
        return callback(null, true);
      }

      // In development, allow all localhost origins and 127.0.0.1
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production') {
        if (
          origin.includes('localhost') ||
          origin.includes('127.0.0.1') ||
          origin.startsWith('http://localhost:') ||
          origin.startsWith('http://127.0.0.1:')
        ) {
          return callback(null, true);
        }
      }

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Log the rejected origin for debugging
        logger.warn(`[CORS] Rejected origin: ${origin} (Allowed: ${allowedOrigins.join(', ')})`);
        callback(new Error(`CORS: Origin ${origin} is not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-wallet-address',
      'x-signature',
      'x-timestamp',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    exposedHeaders: ['x-total-count'],
    preflightContinue: false,
    optionsSuccessStatus: 204, // Some legacy browsers (IE11, various SmartTVs) choke on 204
  };

  // Apply CORS middleware
  app.use(cors(corsOptions));

  // Explicitly handle OPTIONS requests for all routes
  app.options('*', cors(corsOptions));

  // Security middleware (after CORS)
  // In development, disable CSP to avoid blocking legitimate requests
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin requests
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false,
  }));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Logging
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
  }

  // Rate limiting
  app.use(generalLimiter);

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({
      success: true,
      message: 'VibeQuorum API is running',
      timestamp: new Date().toISOString(),
    });
  });

  // Swagger documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/questions', questionRoutes);
  app.use('/api', answerRoutes); // Answers routes include /questions/:id/answers
  app.use('/api', voteRoutes);
  app.use('/api', aiRoutes);
  app.use('/api/rewards', rewardRoutes);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
};

