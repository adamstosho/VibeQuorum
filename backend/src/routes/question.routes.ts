import { Router } from 'express';
import { questionController } from '../controllers/question.controller';
import { authMiddleware, requireSignature } from '../middleware/auth.middleware';
import { generalLimiter, writeLimiter } from '../middleware/rateLimit.middleware';
import { validate, validateParams } from '../middleware/validate.middleware';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createQuestionSchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().min(20).max(10000),
  tags: z.array(z.string().min(1).max(20)).min(1).max(5),
});

const updateQuestionSchema = z.object({
  title: z.string().min(10).max(200).optional(),
  description: z.string().min(20).max(10000).optional(),
  tags: z.array(z.string().min(1).max(20)).min(1).max(5).optional(),
});

const mongoIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
});

/**
 * @route   GET /api/questions
 * @desc    Get questions list
 * @access  Public
 */
router.get('/', generalLimiter, questionController.getQuestions);

/**
 * @route   GET /api/questions/:id
 * @desc    Get question by ID
 * @access  Public
 */
router.get(
  '/:id',
  generalLimiter,
  validateParams(mongoIdSchema),
  questionController.getQuestion
);

/**
 * @route   POST /api/questions
 * @desc    Create question
 * @access  Private
 */
router.post(
  '/',
  authMiddleware,
  requireSignature,
  writeLimiter,
  validate(createQuestionSchema),
  questionController.createQuestion
);

/**
 * @route   PUT /api/questions/:id
 * @desc    Update question
 * @access  Private (owner)
 */
router.put(
  '/:id',
  authMiddleware,
  requireSignature,
  writeLimiter,
  validateParams(mongoIdSchema),
  validate(updateQuestionSchema),
  questionController.updateQuestion
);

/**
 * @route   DELETE /api/questions/:id
 * @desc    Delete question
 * @access  Private (owner)
 */
router.delete(
  '/:id',
  authMiddleware,
  requireSignature,
  writeLimiter,
  validateParams(mongoIdSchema),
  questionController.deleteQuestion
);

/**
 * @route   POST /api/questions/:id/accept/:answerId
 * @desc    Accept answer
 * @access  Private (question owner)
 */
router.post(
  '/:id/accept/:answerId',
  authMiddleware,
  requireSignature,
  writeLimiter,
  validateParams(
    z.object({
      id: z.string().regex(/^[0-9a-fA-F]{24}$/),
      answerId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    })
  ),
  questionController.acceptAnswer
);

export default router;



