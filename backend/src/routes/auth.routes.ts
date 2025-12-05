import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware, requireSignature } from '../middleware/auth.middleware';
import { writeLimiter } from '../middleware/rateLimit.middleware';
import { validate } from '../middleware/validate.middleware';
import { z } from 'zod';

const router = Router();

// Validation schemas
const updateProfileSchema = z.object({
  displayName: z.string().max(50).optional(),
  avatarUrl: z.string().url().optional(),
  profileBio: z.string().max(500).optional(),
});

/**
 * @route   POST /api/auth/connect
 * @desc    Get or create user
 * @access  Public (with wallet address)
 */
router.post('/connect', authMiddleware, authController.connect);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authMiddleware, authController.getMe);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  authMiddleware,
  requireSignature,
  writeLimiter,
  validate(updateProfileSchema),
  authController.updateProfile
);

export default router;

