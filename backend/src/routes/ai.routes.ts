import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { authMiddleware, requireSignature } from '../middleware/auth.middleware';
import { aiLimiter, aiDailyLimiter } from '../middleware/rateLimit.middleware';
import { validateParams } from '../middleware/validate.middleware';
import { z } from 'zod';

const router = Router();

const mongoIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
});

/**
 * @route   POST /api/questions/:id/ai-draft
 * @desc    Generate AI draft answer
 * @access  Private
 */
router.post(
  '/questions/:id/ai-draft',
  authMiddleware,
  requireSignature,
  aiDailyLimiter,
  aiLimiter,
  validateParams(mongoIdSchema),
  aiController.generateDraft
);

/**
 * @route   GET /api/ai/stats
 * @desc    Get AI usage statistics
 * @access  Private
 */
router.get(
  '/stats',
  authMiddleware,
  aiController.getUsageStats
);

export default router;



