import { Router } from 'express';
import { voteController } from '../controllers/vote.controller';
import { authMiddleware, requireSignature } from '../middleware/auth.middleware';
import { writeLimiter } from '../middleware/rateLimit.middleware';
import { validate, validateParams } from '../middleware/validate.middleware';
import { z } from 'zod';

const router = Router();

// Validation schemas
const voteSchema = z.object({
  value: z.union([z.literal(1), z.literal(-1)]),
});

const mongoIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
});

/**
 * @route   POST /api/questions/:id/vote
 * @desc    Vote on question
 * @access  Private
 */
router.post(
  '/questions/:id/vote',
  authMiddleware,
  requireSignature,
  writeLimiter,
  validateParams(mongoIdSchema),
  validate(voteSchema),
  voteController.voteQuestion
);

/**
 * @route   POST /api/answers/:id/vote
 * @desc    Vote on answer
 * @access  Private
 */
router.post(
  '/answers/:id/vote',
  authMiddleware,
  requireSignature,
  writeLimiter,
  validateParams(mongoIdSchema),
  validate(voteSchema),
  voteController.voteAnswer
);

/**
 * @route   DELETE /api/votes/:type/:id
 * @desc    Remove vote
 * @access  Private
 */
router.delete(
  '/:type/:id',
  authMiddleware,
  requireSignature,
  writeLimiter,
  validateParams(
    z.object({
      type: z.enum(['question', 'answer']),
      id: z.string().regex(/^[0-9a-fA-F]{24}$/),
    })
  ),
  voteController.removeVote
);

export default router;

