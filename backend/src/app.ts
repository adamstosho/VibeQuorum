import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { generalLimiter } from './middleware/rateLimit.middleware';

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

  // Security middleware
  app.use(helmet());
  
  // CORS configuration - more permissive in development
  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
      ];
      
      // In development, allow all localhost origins
      if (process.env.NODE_ENV === 'development') {
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
          return callback(null, true);
        }
      }
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-wallet-address',
      'x-signature',
      'x-timestamp',
    ],
    exposedHeaders: ['x-total-count'],
  };
  
  app.use(cors(corsOptions));

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

