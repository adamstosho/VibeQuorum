import rateLimit from 'express-rate-limit';
import { Request } from 'express';
import { AuthRequest } from '../types';

// Get key generator for rate limiting
const getKeyGenerator = (req: Request) => {
  const authReq = req as AuthRequest;
  return authReq.walletAddress || req.ip || 'unknown';
};

/**
 * General API rate limiter
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getKeyGenerator,
  // Use default in-memory store (no Redis store needed for MVP)
  // express-rate-limit has a built-in memory store that works perfectly
});

/**
 * Write operations rate limiter (more restrictive)
 */
export const writeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 writes per minute
  message: { error: 'Too many write requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getKeyGenerator,
});

/**
 * AI endpoint rate limiter (very restrictive)
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 AI requests per hour
  message: {
    error: 'AI quota exceeded',
    message: 'You can make 10 AI draft requests per hour. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getKeyGenerator,
});

/**
 * Daily AI limit per user
 */
export const aiDailyLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 30, // 30 AI requests per day
  message: {
    error: 'Daily AI quota exceeded',
    message: 'You have reached your daily AI quota. Resets at midnight UTC.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getKeyGenerator,
});

