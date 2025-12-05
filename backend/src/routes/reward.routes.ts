import { Router } from 'express';
import { rewardController } from '../controllers/reward.controller';
import { authMiddleware, adminMiddleware, requireSignature } from '../middleware/auth.middleware';
import { writeLimiter } from '../middleware/rateLimit.middleware';
import { validate } from '../middleware/validate.middleware';
import { z } from 'zod';

const router = Router();

// Validation schemas
const triggerRewardSchema = z.object({
  answerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
});

/**
 * @route   POST /api/rewards/trigger
 * @desc    Trigger reward for accepted answer (Admin only)
 * @access  Private (Admin)
 */
router.post(
  '/trigger',
  authMiddleware,
  requireSignature,
  adminMiddleware,
  writeLimiter,
  validate(triggerRewardSchema),
  rewardController.triggerReward
);

/**
 * @route   GET /api/rewards/balance
 * @desc    Get token balance
 * @access  Private
 */
router.get(
  '/balance',
  authMiddleware,
  rewardController.getBalance
);

/**
 * @route   GET /api/rewards/history
 * @desc    Get reward history
 * @access  Private
 */
router.get(
  '/history',
  authMiddleware,
  rewardController.getHistory
);

export default router;



