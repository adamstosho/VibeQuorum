import { Response } from 'express';
import { AuthRequest, ApiResponse, PaginationQuery } from '../types';
import { questionService } from '../services/question.service';

export const questionController = {
  /**
   * Get questions list
   */
  getQuestions: async (
    req: AuthRequest,
    res: Response<ApiResponse>
  ) => {
    const query = req.query as unknown as PaginationQuery;
    const result = await questionService.getQuestions(query);

    res.json({
      success: true,
      data: result.questions,
      pagination: result.pagination,
    });
  },

  /**
   * Get question by ID
   */
  getQuestion: async (req: AuthRequest, res: Response<ApiResponse>) => {
    const { id } = req.params;
    const question = await questionService.getQuestionById(id);

    res.json({
      success: true,
      data: { question },
    });
  },

  /**
   * Create question
   */
  createQuestion: async (req: AuthRequest, res: Response<ApiResponse>) => {
    const walletAddress = req.walletAddress!;
    const { title, description, tags } = req.body;

    const question = await questionService.createQuestion(walletAddress, {
      title,
      description,
      tags,
    });

    res.status(201).json({
      success: true,
      data: { question },
    });
  },

  /**
   * Update question
   */
  updateQuestion: async (req: AuthRequest, res: Response<ApiResponse>) => {
    const walletAddress = req.walletAddress!;
    const { id } = req.params;
    const { title, description, tags } = req.body;

    const question = await questionService.updateQuestion(id, walletAddress, {
      title,
      description,
      tags,
    });

    res.json({
      success: true,
      data: { question },
    });
  },

  /**
   * Delete question
   */
  deleteQuestion: async (req: AuthRequest, res: Response<ApiResponse>) => {
    const walletAddress = req.walletAddress!;
    const { id } = req.params;

    await questionService.deleteQuestion(id, walletAddress);

    res.json({
      success: true,
      message: 'Question deleted successfully',
    });
  },

  /**
   * Accept answer
   */
  acceptAnswer: async (req: AuthRequest, res: Response<ApiResponse>) => {
    const walletAddress = req.walletAddress!;
    const { id: questionId, answerId } = req.params;

    const result = await questionService.acceptAnswer(
      questionId,
      answerId,
      walletAddress
    );

    res.json({
      success: true,
      data: result,
    });
  },
};





