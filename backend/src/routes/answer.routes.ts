import { Router } from 'express';
import { answerController } from '../controllers/answer.controller';
import { authMiddleware, requireSignature } from '../middleware/auth.middleware';
import { generalLimiter, writeLimiter } from '../middleware/rateLimit.middleware';
import { validate, validateParams } from '../middleware/validate.middleware';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createAnswerSchema = z.object({
  content: z.string().min(20).max(30000),
  aiGenerated: z.boolean().optional(),
});

const updateAnswerSchema = z.object({
  content: z.string().min(20).max(30000),
});

const mongoIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
});

const questionIdSchema = z.object({
  questionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
});

/**
 * @route   GET /api/questions/:questionId/answers
 * @desc    Get answers for question
 * @access  Public
 */
router.get(
  '/questions/:questionId/answers',
  generalLimiter,
  validateParams(questionIdSchema),
  answerController.getAnswers
);

/**
 * @route   GET /api/answers/:id
 * @desc    Get answer by ID
 * @access  Public
 */
router.get(
  '/:id',
  generalLimiter,
  validateParams(mongoIdSchema),
  answerController.getAnswer
);

/**
 * @route   POST /api/questions/:questionId/answers
 * @desc    Create answer
 * @access  Private
 */
router.post(
  '/questions/:questionId/answers',
  authMiddleware,
  requireSignature,
  writeLimiter,
  validateParams(questionIdSchema),
  validate(createAnswerSchema),
  answerController.createAnswer
);

/**
 * @route   PUT /api/answers/:id
 * @desc    Update answer
 * @access  Private (owner)
 */
router.put(
  '/:id',
  authMiddleware,
  requireSignature,
  writeLimiter,
  validateParams(mongoIdSchema),
  validate(updateAnswerSchema),
  answerController.updateAnswer
);

/**
 * @route   DELETE /api/answers/:id
 * @desc    Delete answer
 * @access  Private (owner)
 */
router.delete(
  '/:id',
  authMiddleware,
  requireSignature,
  writeLimiter,
  validateParams(mongoIdSchema),
  answerController.deleteAnswer
);

export default router;

