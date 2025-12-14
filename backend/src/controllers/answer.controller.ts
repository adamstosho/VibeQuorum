import { Response } from 'express';
import { AuthRequest, ApiResponse } from '../types';
import { answerService } from '../services/answer.service';

export const answerController = {
  /**
   * Get answers for question
   */
  getAnswers: async (req: AuthRequest, res: Response<ApiResponse>) => {
    const { questionId } = req.params;
    const answers = await answerService.getAnswersByQuestion(questionId);

    res.json({
      success: true,
      data: { answers },
    });
  },

  /**
   * Get answer by ID
   */
  getAnswer: async (req: AuthRequest, res: Response<ApiResponse>) => {
    const { id } = req.params;
    const answer = await answerService.getAnswerById(id);

    res.json({
      success: true,
      data: { answer },
    });
  },

  /**
   * Create answer
   */
  createAnswer: async (req: AuthRequest, res: Response<ApiResponse>) => {
    const walletAddress = req.walletAddress!;
    const { questionId } = req.params;
    const { content, aiGenerated } = req.body;

    const answer = await answerService.createAnswer(questionId, walletAddress, {
      content,
      aiGenerated: aiGenerated || false,
    });

    res.status(201).json({
      success: true,
      data: { answer },
    });
  },

  /**
   * Update answer
   */
  updateAnswer: async (req: AuthRequest, res: Response<ApiResponse>) => {
    const walletAddress = req.walletAddress!;
    const { id } = req.params;
    const { content } = req.body;

    const answer = await answerService.updateAnswer(id, walletAddress, {
      content,
    });

    res.json({
      success: true,
      data: { answer },
    });
  },

  /**
   * Delete answer
   */
  deleteAnswer: async (req: AuthRequest, res: Response<ApiResponse>) => {
    const walletAddress = req.walletAddress!;
    const { id } = req.params;

    await answerService.deleteAnswer(id, walletAddress);

    res.json({
      success: true,
      message: 'Answer deleted successfully',
    });
  },
};





